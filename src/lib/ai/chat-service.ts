import { AppError } from "@/lib/errors";
import { getServerEnv } from "@/lib/env";
import { fetchDataGovResource } from "@/lib/data-gov-in/client";
import { getDatasetByResourceId } from "@/lib/datasets/service";
import type { CachedDataset } from "@/lib/datasets/types";
import type { DataGovFetchResult } from "@/lib/data-gov-in/types";
import { streamGroqChat, type GroqMessage } from "@/lib/groq/client";
import type { ChatHistoryMessage } from "@/lib/types/chat";
import { buildSystemPrompt } from "./prompts";

const MAX_HISTORY_TURNS = 4;
const MAX_HISTORY_CHARS_PER_MESSAGE = 400;
/** Groq on_demand tier caps total request size (~8000 tokens incl. completion). */
const GROQ_ON_DEMAND_TOTAL_TOKENS = 7900;
const PROMPT_SAFETY_MARGIN = 200;

/** Conservative estimate — JSON and markdown are token-dense. */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 2.5);
}

function slimRecord(
  record: Record<string, unknown>,
  maxCols: number,
  maxValLen: number,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record).slice(0, maxCols)) {
    if (typeof value === "string" && value.length > maxValLen) {
      out[key] = `${value.slice(0, maxValLen)}…`;
    } else {
      out[key] = value;
    }
  }
  return out;
}

function slimRecords(
  records: Record<string, unknown>[],
  maxCols: number,
  maxValLen: number,
): Record<string, unknown>[] {
  return records.map((r) => slimRecord(r, maxCols, maxValLen));
}

function trimRecordsForContext(
  records: Record<string, unknown>[],
  maxChars: number,
  maxCols = 24,
  maxValLen = 120,
): { json: string; rowCount: number; records: Record<string, unknown>[] } {
  let slice = slimRecords(records, maxCols, maxValLen);
  let json = JSON.stringify(slice, null, 0);

  while (json.length > maxChars && slice.length > 1) {
    slice = slice.slice(0, Math.ceil(slice.length * 0.65));
    json = JSON.stringify(slice, null, 0);
  }

  while (json.length > maxChars && maxCols > 8) {
    maxCols = Math.max(8, Math.floor(maxCols * 0.75));
    slice = slimRecords(records.slice(0, slice.length), maxCols, maxValLen);
    json = JSON.stringify(slice, null, 0);
  }

  if (json.length > maxChars) {
    json = json.slice(0, maxChars) + "…(truncated)";
  }

  return { json, rowCount: slice.length, records: slice };
}

function effectivePromptTokenBudget(
  maxPromptTokens: number,
  maxCompletionTokens: number,
): number {
  const groqCap = GROQ_ON_DEMAND_TOTAL_TOKENS - maxCompletionTokens - PROMPT_SAFETY_MARGIN;
  return Math.max(1500, Math.min(maxPromptTokens, groqCap));
}

function fitPromptToTokenBudget(
  records: Record<string, unknown>[],
  dataset: CachedDataset,
  data: DataGovFetchResult,
  history: GroqMessage[],
  userMessage: string,
  maxPromptTokens: number,
  maxRecordChars: number,
): { systemPrompt: string; rowCount: number } {
  const historyTokens = history.reduce(
    (sum, m) => sum + estimateTokens(m.content),
    0,
  );
  const userTokens = estimateTokens(userMessage);
  const reserved = historyTokens + userTokens + 150;

  let { json, rowCount, records: slice } = trimRecordsForContext(
    records,
    maxRecordChars,
  );

  while (slice.length > 0) {
    const systemPrompt = buildSystemPrompt(
      dataset,
      { ...data, count: rowCount },
      json,
    );
    if (estimateTokens(systemPrompt) + reserved <= maxPromptTokens) {
      return { systemPrompt, rowCount };
    }

    if (slice.length <= 1) {
      const shell = buildSystemPrompt(dataset, { ...data, count: 1 }, "");
      const shellTokens = estimateTokens(shell);
      const jsonBudget = Math.max(
        400,
        (maxPromptTokens - reserved - shellTokens) * 3,
      );
      json =
        JSON.stringify(slice[0] ?? {}, null, 0).slice(0, jsonBudget) +
        "…(truncated)";
      return {
        systemPrompt: buildSystemPrompt(
          dataset,
          { ...data, count: 1 },
          json,
        ),
        rowCount: 1,
      };
    }

    slice = slice.slice(0, Math.ceil(slice.length * 0.7));
    json = JSON.stringify(slice, null, 0);
    rowCount = slice.length;
  }

  throw new AppError(
    "This dataset has too many columns or rows to fit in one request. Try asking about a specific state, year, or category.",
    { status: 413, code: "PROMPT_TOO_LARGE" },
  );
}

function truncate(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}…`;
}

function toGroqHistory(history: ChatHistoryMessage[]): GroqMessage[] {
  return history
    .filter((m) => m.content.trim().length > 0 && !m.content.startsWith("**Could not"))
    .slice(-MAX_HISTORY_TURNS)
    .map((m) => ({
      role: m.role,
      content: truncate(m.content, MAX_HISTORY_CHARS_PER_MESSAGE),
    }));
}

export type RunChatOptions = {
  message: string;
  resourceId: string;
  history?: ChatHistoryMessage[];
  signal?: AbortSignal;
};

export type RunChatResult = {
  stream: ReadableStream<Uint8Array>;
  resolvedResourceId: string;
  resolvedDatasetLabel: string;
};

/**
 * Loads government data, builds the LLM prompt, and returns a stream of answer text.
 */
export async function runDatasetChat(
  options: RunChatOptions,
): Promise<RunChatResult> {
  const env = getServerEnv();
  const userMessage = options.message.trim();

  if (!userMessage) {
    throw new AppError("Message cannot be empty.", {
      status: 400,
      code: "VALIDATION",
    });
  }

  const dataset = await getDatasetByResourceId(options.resourceId);
  if (!dataset) {
    throw new AppError(
      "Dataset not found. Add it from the sidebar or run db:init.",
      { status: 404, code: "NOT_FOUND" },
    );
  }

  const fetchLimit = Math.min(env.DATA_GOV_IN_FETCH_LIMIT, 15);
  const data = await fetchDataGovResource(dataset.resourceId, {
    limit: fetchLimit,
  });

  if (data.records.length === 0) {
    throw new AppError(
      "The selected dataset returned no records. Try another dataset or re-resolve it.",
      { status: 404, code: "DATA_EMPTY" },
    );
  }

  const history = toGroqHistory(options.history ?? []);
  const promptBudget = effectivePromptTokenBudget(
    env.GROQ_MAX_PROMPT_TOKENS,
    env.GROQ_MAX_COMPLETION_TOKENS,
  );
  const { systemPrompt } = fitPromptToTokenBudget(
    data.records as Record<string, unknown>[],
    dataset,
    data,
    history,
    userMessage,
    promptBudget,
    env.CHAT_MAX_CONTEXT_CHARS,
  );

  const messages: GroqMessage[] = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: userMessage },
  ];

  const stream = await streamGroqChat({ messages, signal: options.signal });
  return {
    stream,
    resolvedResourceId: dataset.resourceId,
    resolvedDatasetLabel: dataset.title,
  };
}

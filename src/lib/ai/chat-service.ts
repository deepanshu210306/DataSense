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

/** Rough token estimate — Census JSON is token-dense; bias high. */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3);
}

function trimRecordsForContext(
  records: Record<string, unknown>[],
  maxChars: number,
): { json: string; rowCount: number; records: Record<string, unknown>[] } {
  let slice = records;
  let json = JSON.stringify(slice, null, 0);

  while (json.length > maxChars && slice.length > 1) {
    slice = slice.slice(0, Math.ceil(slice.length * 0.7));
    json = JSON.stringify(slice, null, 0);
  }

  if (json.length > maxChars) {
    json = json.slice(0, maxChars) + "…(truncated)";
  }

  return { json, rowCount: slice.length, records: slice };
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
    "Could not fit dataset context within the AI token budget. Try a smaller dataset or adjust GROQ_MAX_PROMPT_TOKENS.",
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

  const fetchLimit = Math.min(env.DATA_GOV_IN_FETCH_LIMIT, 20);
  const data = await fetchDataGovResource(dataset._id, { limit: fetchLimit });

  if (data.records.length === 0) {
    throw new AppError(
      "The selected dataset returned no records. Try another dataset or re-resolve it.",
      { status: 404, code: "DATA_EMPTY" },
    );
  }

  const history = toGroqHistory(options.history ?? []);
  const { systemPrompt } = fitPromptToTokenBudget(
    data.records as Record<string, unknown>[],
    dataset,
    data,
    history,
    userMessage,
    env.GROQ_MAX_PROMPT_TOKENS,
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
    resolvedResourceId: dataset._id,
    resolvedDatasetLabel: dataset.title,
  };
}

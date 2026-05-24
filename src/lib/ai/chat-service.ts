import { AppError } from "@/lib/errors";
import { getServerEnv } from "@/lib/env";
import { fetchDataGovResource } from "@/lib/data-gov-in/client";
import { getDatasetById } from "@/lib/datasets/registry";
import type { DatasetId } from "@/lib/datasets/types";
import { streamGroqChat, type GroqMessage } from "@/lib/groq/client";
import type { ChatHistoryMessage } from "@/lib/types/chat";
import { buildSystemPrompt } from "./prompts";

/** Fewer turns = smaller prompts = less chance of Groq rate limits */
const MAX_HISTORY_TURNS = 6;
const MAX_HISTORY_CHARS_PER_MESSAGE = 600;

function trimRecordsForContext(
  records: Record<string, unknown>[],
  maxChars: number,
): { json: string; rowCount: number } {
  let slice = records;
  let json = JSON.stringify(slice, null, 0);

  while (json.length > maxChars && slice.length > 1) {
    slice = slice.slice(0, Math.ceil(slice.length * 0.7));
    json = JSON.stringify(slice, null, 0);
  }

  if (json.length > maxChars) {
    json = json.slice(0, maxChars) + "…(truncated)";
  }

  return { json, rowCount: slice.length };
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
  datasetId: DatasetId;
  history?: ChatHistoryMessage[];
  signal?: AbortSignal;
};

/**
 * Loads government data, builds the LLM prompt, and returns a stream of answer text.
 */
export async function runDatasetChat(
  options: RunChatOptions,
): Promise<ReadableStream<Uint8Array>> {
  const env = getServerEnv();
  const userMessage = options.message.trim();

  if (!userMessage) {
    throw new AppError("Message cannot be empty.", {
      status: 400,
      code: "VALIDATION",
    });
  }

  const dataset = getDatasetById(options.datasetId);
  const data = await fetchDataGovResource(dataset.resourceId);

  if (data.records.length === 0) {
    throw new AppError(
      "The selected dataset returned no records. Try another dataset or check the resource ID in .env.local.",
      { status: 404, code: "DATA_EMPTY",
      },
    );
  }

  const { json: recordsJson, rowCount } = trimRecordsForContext(
    data.records,
    env.CHAT_MAX_CONTEXT_CHARS,
  );

  const systemPrompt = buildSystemPrompt(
    dataset,
    { ...data, count: rowCount },
    recordsJson,
  );

  const messages: GroqMessage[] = [
    { role: "system", content: systemPrompt },
    ...toGroqHistory(options.history ?? []),
    { role: "user", content: userMessage },
  ];

  return streamGroqChat({ messages, signal: options.signal });
}

import type { DatasetId } from "@/lib/datasets/types";

export type ChatRole = "user" | "assistant";

/** Message shape sent from the browser to /api/chat */
export type ChatHistoryMessage = {
  role: ChatRole;
  content: string;
};

export type ChatRequestBody = {
  message: string;
  datasetId: DatasetId;
  history?: ChatHistoryMessage[];
};

export type ChatApiErrorBody = {
  error: string;
  code?: "GROQ_RATE_LIMIT" | "GROQ_API_ERROR" | "VALIDATION" | string;
};

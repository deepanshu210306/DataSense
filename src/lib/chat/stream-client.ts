import type { ChatApiErrorBody } from "@/lib/types/chat";

export async function readErrorResponse(
  response: Response,
): Promise<ChatApiErrorBody> {
  try {
    const body = (await response.json()) as ChatApiErrorBody;
    if (body.error) return body;
  } catch {
    /* fall through */
  }
  return {
    error: `Request failed (${response.status})`,
    code: undefined,
  };
}

export function formatAssistantError(body: ChatApiErrorBody): string {
  if (body.code === "GROQ_RATE_LIMIT") {
    return `### Service temporarily busy\n\n${body.error}`;
  }
  if (body.code === "DATA_GOV_UNREACHABLE") {
    return `### data.gov.in is not responding\n\n${body.error}`;
  }
  if (
    body.code === "GROQ_REQUEST_TOO_LARGE" ||
    body.code === "PROMPT_TOO_LARGE"
  ) {
    return `### Dataset too large for one answer\n\n${body.error}\n\n**Tips:** ask about one state or group at a time, or start with "What columns are in this dataset?"`;
  }
  return `**Could not get an answer.** ${body.error}`;
}

export async function readTextStream(
  body: ReadableStream<Uint8Array>,
  onChunk: (accumulated: string) => void,
): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let accumulated = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    accumulated += decoder.decode(value, { stream: true });
    onChunk(accumulated);
  }

  return accumulated;
}

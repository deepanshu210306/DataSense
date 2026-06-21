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

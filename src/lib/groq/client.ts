import { AppError } from "@/lib/errors";
import { getServerEnv } from "@/lib/env";
import {
  GROQ_RATE_LIMIT_MESSAGE,
  GROQ_REQUEST_TOO_LARGE_MESSAGE,
  isGroqRateLimit,
  isGroqRequestTooLarge,
  parseRetryAfterMs,
  sleep,
} from "./errors";

const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";

export type GroqMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type StreamChatOptions = {
  messages: GroqMessage[];
  signal?: AbortSignal;
};

async function parseGroqError(response: Response): Promise<string> {
  let detail = response.statusText;
  try {
    const err = (await response.json()) as {
      error?: { message?: string };
    };
    if (err.error?.message) detail = err.error.message;
  } catch {
    /* ignore */
  }
  return detail;
}

function throwGroqHttpError(status: number, detail: string): never {
  if (isGroqRateLimit(status, detail)) {
    throw new AppError(GROQ_RATE_LIMIT_MESSAGE, {
      status: 429,
      code: "GROQ_RATE_LIMIT",
    });
  }
  if (isGroqRequestTooLarge(detail)) {
    throw new AppError(GROQ_REQUEST_TOO_LARGE_MESSAGE, {
      status: 413,
      code: "GROQ_REQUEST_TOO_LARGE",
    });
  }
  throw new AppError(`AI service error: ${detail}`, {
    status: status >= 500 ? 502 : status,
    code: "GROQ_API_ERROR",
  });
}

async function requestGroqCompletion(
  body: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<Response> {
  const env = getServerEnv();
  const maxRetries = env.GROQ_RATE_LIMIT_MAX_RETRIES;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(GROQ_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal,
    });

    if (response.ok) return response;

    const detail = await parseGroqError(response);
    const rateLimited = isGroqRateLimit(response.status, detail);

    if (rateLimited && attempt < maxRetries) {
      const retryAfter =
        parseRetryAfterMs(response.headers.get("retry-after")) ??
        Math.min(1000 * 2 ** attempt, 8000);
      await sleep(retryAfter);
      continue;
    }

    throwGroqHttpError(response.status, detail);
  }

  throw new AppError(GROQ_RATE_LIMIT_MESSAGE, {
    status: 429,
    code: "GROQ_RATE_LIMIT",
  });
}

/**
 * Streams chat completion tokens from Groq (OpenAI-compatible API).
 * Retries automatically on rate limits with exponential backoff.
 */
export async function streamGroqChat(
  options: StreamChatOptions,
): Promise<ReadableStream<Uint8Array>> {
  const env = getServerEnv();

  const response = await requestGroqCompletion(
    {
      model: env.GROQ_MODEL,
      messages: options.messages,
      temperature: env.GROQ_TEMPERATURE,
      max_tokens: env.GROQ_MAX_COMPLETION_TOKENS,
      stream: true,
    },
    options.signal,
  );

  if (!response.body) {
    throw new AppError("AI service returned an empty stream.", {
      status: 502,
      code: "GROQ_EMPTY",
    });
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;

            const data = trimmed.slice(5).trim();
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data) as {
                choices?: Array<{
                  delta?: { content?: string };
                }>;
              };
              const token = parsed.choices?.[0]?.delta?.content;
              if (token) {
                controller.enqueue(encoder.encode(token));
              }
            } catch {
              /* skip malformed SSE chunks */
            }
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      } finally {
        reader.releaseLock();
      }
    },
  });
}

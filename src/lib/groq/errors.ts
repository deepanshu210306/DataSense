/** User-facing copy when Groq returns HTTP 429 or a rate-limit message. */
export const GROQ_RATE_LIMIT_MESSAGE =
  "The AI service is temporarily busy (rate limit reached). Wait about 60 seconds, then try again. Starting a **New chat** or asking a shorter question also helps.";

export const GROQ_REQUEST_TOO_LARGE_MESSAGE =
  "The dataset sample is too large for the AI tier. Try a smaller dataset, ask a narrower question, or lower CHAT_MAX_CONTEXT_CHARS / GROQ_MAX_PROMPT_TOKENS in .env.local.";

export function isGroqRateLimit(status: number, detail: string): boolean {
  return status === 429 || /rate limit/i.test(detail);
}

export function isGroqRequestTooLarge(detail: string): boolean {
  return /request too large|reduce your message size/i.test(detail);
}

export function parseRetryAfterMs(header: string | null): number | null {
  if (!header) return null;
  const seconds = Number(header);
  if (!Number.isNaN(seconds) && seconds >= 0) {
    return Math.min(seconds * 1000, 60_000);
  }
  const date = Date.parse(header);
  if (!Number.isNaN(date)) {
    return Math.min(Math.max(date - Date.now(), 0), 60_000);
  }
  return null;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

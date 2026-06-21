import { z } from "zod";

function emptyToUndefined(value: unknown) {
  if (value === "" || value === undefined || value === null) return undefined;
  return value;
}

/**
 * Server-only environment variables.
 * Never import this module from client components.
 */
const serverEnvSchema = z.object({
  DATA_GOV_IN_API_KEY: z.string().min(1, "DATA_GOV_IN_API_KEY is required"),
  DATA_GOV_IN_BASE_URL: z.preprocess(
    emptyToUndefined,
    z.string().url().default("https://api.data.gov.in/resource"),
  ),
  DATA_GOV_IN_FALLBACK_URL: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .url()
      .default("https://data.gov.in/api/datastore/resource.json"),
  ),
  DATA_GOV_IN_FETCH_LIMIT: z.coerce.number().int().min(1).max(500).default(80),
  DATA_GOV_IN_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .min(5000)
    .max(120000)
    .default(60000),

  GROQ_API_KEY: z.string().min(1, "GROQ_API_KEY is required"),
  GROQ_MODEL: z.preprocess(
    emptyToUndefined,
    z.string().min(1).default("openai/gpt-oss-120b"),
  ),
  GROQ_MAX_COMPLETION_TOKENS: z.coerce
    .number()
    .int()
    .min(256)
    .max(65536)
    .default(1024),
  GROQ_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.3),
  /** Retries when Groq returns HTTP 429 (rate limit) */
  GROQ_RATE_LIMIT_MAX_RETRIES: z.coerce.number().int().min(0).max(5).default(3),
  /**
   * Estimated input-token budget for system prompt + history (Groq on_demand
   * tier caps total request size around 8000 tokens including completion).
   */
  GROQ_MAX_PROMPT_TOKENS: z.coerce
    .number()
    .int()
    .min(1000)
    .max(120000)
    .default(6500),

  /** Max characters of dataset JSON injected into the LLM prompt */
  CHAT_MAX_CONTEXT_CHARS: z.coerce
    .number()
    .int()
    .min(1000)
    .max(100000)
    .default(5000),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cached) return cached;

  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(
      `Invalid server environment. Copy .env.example to .env.local and fill values. (${details})`,
    );
  }

  cached = parsed.data;
  return cached;
}

import { Resend } from "resend";
import { getServerEnv } from "@/lib/env";

let cached: Resend | null = null;

/** Lazily-created, cached Resend client (server-only). */
export function getResend(): Resend {
  if (cached) return cached;
  const { RESEND_API_KEY } = getServerEnv();
  cached = new Resend(RESEND_API_KEY);
  return cached;
}

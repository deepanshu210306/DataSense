import { jsonError } from "@/lib/api-response";
import { issueVerificationCode } from "@/lib/auth/verification";
import { isAppError, toErrorMessage } from "@/lib/errors";
import { resendCodeSchema } from "@/schemas/verifyEmailSchema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const parsed = resendCodeSchema.safeParse(await req.json());
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid email.";
      return jsonError(message, 400, "VALIDATION");
    }

    await issueVerificationCode(parsed.data.email);
    return Response.json({ ok: true }, { status: 200 });
  } catch (error) {
    if (isAppError(error)) {
      return jsonError(error.message, error.status, error.code);
    }
    return jsonError(toErrorMessage(error), 500, "INTERNAL_ERROR");
  }
}

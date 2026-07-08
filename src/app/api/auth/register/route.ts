import { jsonError } from "@/lib/api-response";
import { createPasswordUser, findUserByEmail, updateUnverifiedUser } from "@/lib/auth/users";
import { issueVerificationCode } from "@/lib/auth/verification";
import { isAppError, toErrorMessage } from "@/lib/errors";
import { signUpSchema } from "@/schemas/signUpSchema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const parsed = signUpSchema.safeParse(await req.json());
    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ?? "Invalid registration data.";
      return jsonError(message, 400, "VALIDATION");
    }

    const { name, email, password } = parsed.data;
    const existing = await findUserByEmail(email);

    if (existing) {
      // A verified password account already exists — nothing to do.
      if (existing.password && existing.emailVerified) {
        return jsonError(
          "An account with this email already exists.",
          409,
          "CONFLICT",
        );
      }
      // Registered via Google (no password) — don't overwrite it.
      if (!existing.password) {
        return jsonError(
          "This email is registered without a password. Sign up with a different email or contact support.",
          409,
          "CONFLICT",
        );
      }
      // Password set but never verified — refresh credentials and resend code.
      await updateUnverifiedUser(email, password, name);
      await issueVerificationCode(email);
      return Response.json(
        { ok: true, requiresVerification: true },
        { status: 200 },
      );
    }

    await createPasswordUser(email, password, name);
    await issueVerificationCode(email);
    return Response.json(
      { ok: true, requiresVerification: true },
      { status: 201 },
    );
  } catch (error) {
    if (isAppError(error)) {
      return jsonError(error.message, error.status, error.code);
    }
    return jsonError(toErrorMessage(error), 500, "INTERNAL_ERROR");
  }
}

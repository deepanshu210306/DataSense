import { jsonError } from "@/lib/api-response";
import { createPasswordUser, findUserByEmail } from "@/lib/auth/users";
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
      return jsonError(
        existing.password
          ? "An account with this email already exists."
          : "This email is registered without a password. Sign up with a different email or contact support.",
        409,
        "CONFLICT",
      );
    }

    await createPasswordUser(email, password, name);
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (isAppError(error)) {
      return jsonError(error.message, error.status, error.code);
    }
    return jsonError(toErrorMessage(error), 500, "INTERNAL_ERROR");
  }
}

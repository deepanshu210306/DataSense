import { jsonError } from "@/lib/api-response";
import { createPasswordUser, findUserByEmail } from "@/lib/auth/users";
import { isAppError, toErrorMessage } from "@/lib/errors";
import { registerSchema } from "@/schemas/registerSchema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const parsed = registerSchema.safeParse(await req.json());
    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ?? "Invalid registration data.";
      return jsonError(message, 400, "VALIDATION");
    }

    const { email, password } = parsed.data;
    const existing = await findUserByEmail(email);
    if (existing) {
      return jsonError(
        "An account with this email already exists.",
        409,
        "CONFLICT",
      );
    }

    await createPasswordUser(email, password);
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (isAppError(error)) {
      return jsonError(error.message, error.status, error.code);
    }
    return jsonError(toErrorMessage(error), 500, "INTERNAL_ERROR");
  }
}

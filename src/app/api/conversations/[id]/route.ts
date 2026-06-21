import { auth } from "@/auth";
import { jsonError } from "@/lib/api-response";
import { getConversationMessages } from "@/lib/conversations/service";
import { isAppError, toErrorMessage } from "@/lib/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return jsonError("Sign in required.", 401, "UNAUTHORIZED");
    }

    const { id } = await context.params;
    const messages = await getConversationMessages(id, session.user.id);
    return Response.json({
      messages: messages.map((m) => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    if (isAppError(error)) {
      return jsonError(error.message, error.status, error.code);
    }
    return jsonError(toErrorMessage(error), 500, "INTERNAL_ERROR");
  }
}

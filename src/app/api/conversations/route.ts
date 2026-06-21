import { auth } from "@/auth";
import { jsonError } from "@/lib/api-response";
import {
  createConversation,
  listConversations,
} from "@/lib/conversations/service";
import { isAppError, toErrorMessage } from "@/lib/errors";
import { createConversationSchema } from "@/schemas/createConversationSchema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return jsonError("Sign in required.", 401, "UNAUTHORIZED");
    }

    const conversations = await listConversations(session.user.id);
    return Response.json({
      conversations: conversations.map((c) => ({
        ...c,
        updatedAt: c.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    if (isAppError(error)) {
      return jsonError(error.message, error.status, error.code);
    }
    return jsonError(toErrorMessage(error), 500, "INTERNAL_ERROR");
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return jsonError("Sign in required.", 401, "UNAUTHORIZED");
    }

    const parsed = createConversationSchema.safeParse(await req.json());
    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ?? "Invalid resource ID.";
      return jsonError(message, 400, "VALIDATION");
    }

    const { resourceId } = parsed.data;

    const conversation = await createConversation(
      session.user.id,
      resourceId,
    );

    return Response.json({ conversation }, { status: 201 });
  } catch (error) {
    if (isAppError(error)) {
      return jsonError(error.message, error.status, error.code);
    }
    return jsonError(toErrorMessage(error), 500, "INTERNAL_ERROR");
  }
}

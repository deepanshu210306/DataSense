import { auth } from "@/auth";
import { runDatasetChat } from "@/lib/ai/chat-service";
import {
  ensureConversation,
  getRecentHistory,
  saveChatMessage,
} from "@/lib/conversations/service";
import {
  persistAssistantReply,
  wrapStreamWithPersistence,
} from "@/lib/conversations/stream";
import { jsonError } from "@/lib/api-response";
import { isAppError, toErrorMessage } from "@/lib/errors";
import { encodeHeaderValue } from "@/lib/http-headers";
import { chatRequestSchema } from "@/schemas/chatRequestSchema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return jsonError("Sign in required.", 401, "UNAUTHORIZED");
    }

    const parsed = chatRequestSchema.safeParse(await req.json());
    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ?? "Invalid request body.";
      return jsonError(message, 400, "VALIDATION");
    }

    const { message, conversationId, resourceId } = parsed.data;

    const conversation = await ensureConversation(
      session.user.id,
      conversationId,
      resourceId,
      message,
    );

    const history = conversationId
      ? await getRecentHistory(conversation.id)
      : [];

    await saveChatMessage({
      conversationId: conversation.id,
      role: "user",
      content: message.trim(),
    });

    const { stream, resolvedResourceId, resolvedDatasetLabel } =
      await runDatasetChat({
        message,
        resourceId,
        history,
        signal: req.signal,
      });

    const persistedStream = wrapStreamWithPersistence(stream, (content) =>
      persistAssistantReply({
        conversationId: conversation.id,
        content,
      }),
    );

    return new Response(persistedStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Content-Type-Options": "nosniff",
        "X-Conversation-Id": conversation.id,
        "X-Resolved-Dataset-Id": resolvedResourceId,
        "X-Resolved-Dataset-Label": encodeHeaderValue(resolvedDatasetLabel),
        "X-Dataset-Auto-Detected": "false",
      },
    });
  } catch (error) {
    if (isAppError(error)) {
      return jsonError(error.message, error.status, error.code);
    }

    const message = toErrorMessage(error);
    const isEnv =
      message.includes("environment") ||
      message.includes("DATA_GOV_IN_API_KEY") ||
      message.includes("MONGODB_URI");

    return jsonError(
      isEnv
        ? "Server is not configured. Check .env.local (API keys, AUTH_*, MONGODB_URI)."
        : message.includes("bad auth") || message.includes("MongoServerError")
          ? "Could not connect to MongoDB. Verify MONGODB_URI and MONGODB_DB_NAME in .env.local."
          : message,
      isEnv ? 503 : 500,
      "INTERNAL_ERROR",
    );
  }
}


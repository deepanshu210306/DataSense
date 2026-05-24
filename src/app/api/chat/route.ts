import { runDatasetChat } from "@/lib/ai/chat-service";
import { isDatasetId } from "@/lib/datasets/registry";
import { AppError, isAppError, toErrorMessage } from "@/lib/errors";
import type { ChatRequestBody } from "@/lib/types/chat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message: string, status: number, code?: string) {
  return Response.json({ error: message, code }, { status });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ChatRequestBody;

    if (!body?.message || typeof body.message !== "string") {
      throw new AppError("Missing message in request body.", {
        status: 400,
        code: "VALIDATION",
      });
    }

    if (!body.datasetId || !isDatasetId(body.datasetId)) {
      throw new AppError('Invalid datasetId. Use "sales", "crm", or "ops".', {
        status: 400,
        code: "VALIDATION",
      });
    }

    const stream = await runDatasetChat({
      message: body.message,
      datasetId: body.datasetId,
      history: body.history,
      signal: req.signal,
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (isAppError(error)) {
      return jsonError(error.message, error.status, error.code);
    }

    const message = toErrorMessage(error);
    const isEnv =
      message.includes("environment") || message.includes("DATA_GOV_IN_API_KEY");

    return jsonError(
      isEnv
        ? "Server is not configured. Copy .env.example to .env.local and add your API keys."
        : message,
      isEnv ? 503 : 500,
      "INTERNAL_ERROR",
    );
  }
}

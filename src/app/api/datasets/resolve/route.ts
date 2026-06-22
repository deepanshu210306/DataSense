import { auth } from "@/auth";
import { jsonError } from "@/lib/api-response";
import {
  resolveByResourceId,
  resolveByUrl,
} from "@/lib/data-gov-in/resolve";
import { isAppError, toErrorMessage } from "@/lib/errors";
import { resolveDatasetSchema, type ResolveDatasetInput } from "@/schemas/resolveDatasetSchema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return jsonError("Sign in required.", 401, "UNAUTHORIZED");
    }

    const parsed = resolveDatasetSchema.safeParse(await req.json());
    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ?? "Invalid resolve request.";
      return jsonError(message, 400, "VALIDATION");
    }

    const body = parsed.data as ResolveDatasetInput;
    const dataset =
      "resourceId" in body
        ? await resolveByResourceId(body.resourceId, session.user.id)
        : await resolveByUrl(body.url, session.user.id);

    return Response.json({
      dataset: {
        resourceId: dataset.resourceId,
        title: dataset.title,
        portalUrl: dataset.portalUrl,
        fields: dataset.fields,
      },
    });
  } catch (error) {
    if (isAppError(error)) {
      return jsonError(error.message, error.status, error.code);
    }
    return jsonError(toErrorMessage(error), 500, "INTERNAL_ERROR");
  }
}

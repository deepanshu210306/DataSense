import { auth } from "@/auth";
import { listDatasets } from "@/lib/datasets/service";
import { jsonError } from "@/lib/api-response";
import { isAppError, toErrorMessage } from "@/lib/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Cached dataset metadata for the sidebar picker (auth required). */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return jsonError("Sign in required.", 401, "UNAUTHORIZED");
    }

    const datasets = await listDatasets();
    return Response.json({ datasets });
  } catch (error) {
    if (isAppError(error)) {
      return jsonError(error.message, error.status, error.code);
    }
    return jsonError(toErrorMessage(error), 500, "INTERNAL_ERROR");
  }
}

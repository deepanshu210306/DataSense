import { getDatasetRegistry } from "@/lib/datasets/registry";

export const runtime = "nodejs";

/** Public metadata for sidebar dataset picker (no secrets). */
export async function GET() {
  const datasets = getDatasetRegistry().map(
    ({ id, label, description, portalUrl }) => ({
      id,
      label,
      description,
      portalUrl,
    }),
  );

  return Response.json({ datasets });
}

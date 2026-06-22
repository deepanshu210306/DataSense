import { AppError } from "@/lib/errors";
import { fetchDataGovResource } from "@/lib/data-gov-in/client";
import type { DataGovFetchResult } from "@/lib/data-gov-in/types";
import { upsertDataset } from "@/lib/datasets/service";
import type { CachedDataset } from "@/lib/datasets/types";
import { isResourceId, RESOURCE_ID_REGEX } from "@/schemas/resourceIdSchema";

const UUID_PATTERN = RESOURCE_ID_REGEX;

function fieldsFromResult(data: DataGovFetchResult): string[] {
  if (data.fields?.length) {
    return data.fields
      .map((f) => f.name ?? f.id)
      .filter((name): name is string => Boolean(name));
  }
  const first = data.records[0];
  if (first && typeof first === "object") {
    return Object.keys(first);
  }
  return [];
}

function titleFromPayload(
  data: DataGovFetchResult,
  resourceId: string,
): string {
  const recordTitle = data.records[0];
  if (recordTitle && typeof recordTitle === "object" && "title" in recordTitle) {
    const t = (recordTitle as Record<string, unknown>).title;
    if (typeof t === "string" && t.trim()) return t.trim();
  }
  return `data.gov.in resource ${resourceId.slice(0, 8)}…`;
}

function extractUuidCandidates(html: string): string[] {
  return [
    ...new Set(
      [...html.matchAll(UUID_PATTERN)].map((m) => m[0].toLowerCase()),
    ),
  ];
}

function portalUrlFromInput(url: string, resourceId: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("data.gov.in")) return url;
  } catch {
    /* fall through */
  }
  return `https://www.data.gov.in/resource/${resourceId}`;
}

export async function resolveByResourceId(
  resourceId: string,
  addedByUserId: string,
): Promise<CachedDataset> {
  const id = resourceId.trim().toLowerCase();
  if (!isResourceId(id)) {
    throw new AppError("Invalid resource ID format.", {
      status: 400,
      code: "VALIDATION",
    });
  }

  const data = await fetchDataGovResource(id, { limit: 1 });
  if (data.records.length === 0) {
    throw new AppError(
      "No records returned for this resource ID. Check the ID on data.gov.in.",
      { status: 422, code: "RESOLVE_FAILED",
      },
    );
  }

  const title = data.title ?? titleFromPayload(data, id);

  return upsertDataset({
    resourceId: id,
    title,
    portalUrl: `https://www.data.gov.in/resource/${id}`,
    fields: fieldsFromResult(data),
    addedByUserId,
  });
}

export async function resolveByUrl(
  url: string,
  addedByUserId: string,
): Promise<CachedDataset> {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    throw new AppError("Enter a valid data.gov.in dataset page URL.", {
      status: 400,
      code: "VALIDATION",
    });
  }

  if (!parsed.hostname.includes("data.gov.in")) {
    throw new AppError("URL must be a data.gov.in dataset page.", {
      status: 400,
      code: "VALIDATION",
    });
  }

  const response = await fetch(parsed.toString(), {
    signal: AbortSignal.timeout(30000),
    headers: { Accept: "text/html" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new AppError(
      `Could not fetch dataset page (${response.status}).`,
      { status: 422, code: "RESOLVE_FAILED" },
    );
  }

  const html = await response.text();
  const candidates = extractUuidCandidates(html);

  if (candidates.length === 0) {
    throw new AppError(
      "No resource IDs found on that page. Try pasting the UUID directly.",
      { status: 422, code: "RESOLVE_FAILED",
      },
    );
  }

  let lastError: AppError | null = null;
  for (const candidate of candidates.slice(0, 15)) {
    try {
      const dataset = await resolveByResourceId(candidate, addedByUserId);
      return upsertDataset({
        ...dataset,
        portalUrl: portalUrlFromInput(url, candidate),
        addedByUserId,
      });
    } catch (error) {
      if (error instanceof AppError && error.code === "RESOLVE_FAILED") {
        lastError = error;
        continue;
      }
      throw error;
    }
  }

  throw (
    lastError ??
    new AppError(
      "Could not resolve a working resource ID from that page.",
      { status: 422, code: "RESOLVE_FAILED" },
    )
  );
}

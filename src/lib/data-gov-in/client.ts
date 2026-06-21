import { AppError } from "@/lib/errors";
import { getServerEnv } from "@/lib/env";
import type { DataGovFetchResult, DataGovRecord } from "./types";

type FetchOptions = {
  limit?: number;
  offset?: number;
  filters?: Record<string, string>;
};

function buildSearchParams(
  apiKey: string,
  options: FetchOptions,
): URLSearchParams {
  const params = new URLSearchParams();
  params.set("api-key", apiKey);
  params.set("format", "json");
  if (options.limit != null) params.set("limit", String(options.limit));
  if (options.offset != null) params.set("offset", String(options.offset));
  if (options.filters) {
    for (const [field, value] of Object.entries(options.filters)) {
      params.append(`filters[${field}]`, value);
    }
  }
  return params;
}

function normalizePayload(
  payload: unknown,
  source: "primary" | "fallback",
): DataGovFetchResult {
  if (!payload || typeof payload !== "object") {
    throw new AppError("data.gov.in returned an empty response.", {
      status: 502,
      code: "DATA_GOV_INVALID",
    });
  }

  const body = payload as Record<string, unknown>;

  if (body.status === "error" || body.error) {
    const message =
      typeof body.message === "string"
        ? body.message
        : typeof body.error === "string"
          ? body.error
          : "data.gov.in API error";
    throw new AppError(message, { status: 502, code: "DATA_GOV_API_ERROR" });
  }

  const records = (body.records ?? body.data ?? []) as unknown;
  if (!Array.isArray(records)) {
    throw new AppError("data.gov.in response missing records array.", {
      status: 502,
      code: "DATA_GOV_INVALID",
    });
  }

  const total =
    typeof body.total === "number"
      ? body.total
      : typeof body.count === "number"
        ? body.count
        : undefined;

  const fields = Array.isArray(body.fields)
    ? (body.fields as DataGovFetchResult["fields"])
    : undefined;

  const title =
    typeof body.title === "string" && body.title.trim()
      ? body.title.trim()
      : undefined;

  return {
    records: records as DataGovRecord[],
    total,
    count: records.length,
    title,
    fields,
    source,
  };
}

async function fetchWithTimeout(
  url: string,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchPrimary(
  resourceId: string,
  apiKey: string,
  baseUrl: string,
  options: FetchOptions,
  timeoutMs: number,
): Promise<DataGovFetchResult> {
  const params = buildSearchParams(apiKey, options);
  const url = `${baseUrl.replace(/\/$/, "")}/${resourceId}?${params.toString()}`;
  const response = await fetchWithTimeout(url, timeoutMs);

  if (!response.ok) {
    throw new AppError(
      `data.gov.in request failed (${response.status} ${response.statusText}).`,
      { status: 502, code: "DATA_GOV_HTTP" },
    );
  }

  const json: unknown = await response.json();
  return normalizePayload(json, "primary");
}

async function fetchFallback(
  resourceId: string,
  apiKey: string,
  fallbackUrl: string,
  options: FetchOptions,
  timeoutMs: number,
): Promise<DataGovFetchResult> {
  const params = buildSearchParams(apiKey, options);
  params.set("resource_id", resourceId);
  const url = `${fallbackUrl}?${params.toString()}`;
  const response = await fetchWithTimeout(url, timeoutMs);

  if (!response.ok) {
    throw new AppError(
      `data.gov.in fallback request failed (${response.status}).`,
      { status: 502, code: "DATA_GOV_HTTP" },
    );
  }

  const json: unknown = await response.json();
  return normalizePayload(json, "fallback");
}

/**
 * Fetches rows for a data.gov.in resource. Tries the primary API URL first,
 * then the legacy datastore endpoint if the primary call fails.
 */
export async function fetchDataGovResource(
  resourceId: string,
  options: FetchOptions = {},
): Promise<DataGovFetchResult> {
  const env = getServerEnv();
  const limit = options.limit ?? env.DATA_GOV_IN_FETCH_LIMIT;

  try {
    return await fetchPrimary(
      resourceId,
      env.DATA_GOV_IN_API_KEY,
      env.DATA_GOV_IN_BASE_URL,
      { ...options, limit },
      env.DATA_GOV_IN_TIMEOUT_MS,
    );
  } catch (primaryError) {
    try {
      return await fetchFallback(
        resourceId,
        env.DATA_GOV_IN_API_KEY,
        env.DATA_GOV_IN_FALLBACK_URL,
        { ...options, limit },
        env.DATA_GOV_IN_TIMEOUT_MS,
      );
    } catch (fallbackError) {
      const primaryMsg =
        primaryError instanceof Error
          ? primaryError.message
          : "Primary API failed";
      const fallbackMsg =
        fallbackError instanceof Error
          ? fallbackError.message
          : "Fallback API failed";
      throw new AppError(
        `Could not load dataset from data.gov.in. ${primaryMsg} | ${fallbackMsg}`,
        { status: 502, code: "DATA_GOV_UNAVAILABLE" },
      );
    }
  }
}

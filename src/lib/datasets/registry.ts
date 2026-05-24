import { AppError } from "@/lib/errors";
import type { DatasetConfig, DatasetId } from "./types";

/**
 * Maps sidebar dataset keys to live data.gov.in resources (2011 Census).
 * Override any resource ID via .env.local — see .env.example.
 *
 * Resource IDs were verified against api.data.gov.in (see scripts/find-census-resource.mjs).
 */
const DEFAULT_RESOURCES: Record<DatasetId, Omit<DatasetConfig, "id">> = {
  sales: {
    label: "Census 2011 — Primary Abstract (India)",
    description:
      "Primary Census Abstract 2011 for India: households, population, age 0–6, SC/ST, literacy, and workers at state/district/sub-district and town/village level.",
    resourceId: "0764657f-00ec-4c6b-9ece-2d7b8a7401fa",
    portalUrl:
      "https://www.data.gov.in/resource/primary-census-abstract-2011-india",
  },
  crm: {
    label: "Census 2011 — Population by Age & Sex",
    description:
      "Population in single year of age by residence (rural/urban) and sex, India 2011 — state and district level tables.",
    resourceId: "3fac8061-9b36-418d-a5d5-7cedd300c942",
    portalUrl:
      "https://www.data.gov.in/resource/population-single-year-age-residence-and-sex-2011-india",
  },
  ops: {
    label: "Census 2011 — Literacy & Workers",
    description:
      "Primary Census Abstract 2011 (India): emphasize literacy, main/marginal workers, cultivators, agricultural labourers, and household industry workers.",
    resourceId: "0764657f-00ec-4c6b-9ece-2d7b8a7401fa",
    portalUrl:
      "https://www.data.gov.in/resource/primary-census-abstract-2011-india",
    promptFocus:
      "Prioritize columns about literacy, workers (total/main/marginal), cultivators, agricultural labourers, and household industry. De-emphasize unrelated fields unless the user asks.",
  },
};

function resourceIdFromEnv(key: DatasetId, fallback: string): string {
  const envKey = `DATA_GOV_RESOURCE_${key.toUpperCase()}` as const;
  return process.env[envKey]?.trim() || fallback;
}

export function getDatasetRegistry(): DatasetConfig[] {
  return (Object.keys(DEFAULT_RESOURCES) as DatasetId[]).map((id) => ({
    id,
    ...DEFAULT_RESOURCES[id],
    resourceId: resourceIdFromEnv(
      id,
      DEFAULT_RESOURCES[id].resourceId,
    ),
  }));
}

export function getDatasetById(datasetId: string): DatasetConfig {
  const registry = getDatasetRegistry();
  const found = registry.find((d) => d.id === datasetId);
  if (!found) {
    throw new AppError(
      `Unknown dataset "${datasetId}". Valid ids: ${registry.map((d) => d.id).join(", ")}`,
      { status: 400, code: "VALIDATION" },
    );
  }
  return found;
}

export function isDatasetId(value: string): value is DatasetId {
  return value === "sales" || value === "crm" || value === "ops";
}

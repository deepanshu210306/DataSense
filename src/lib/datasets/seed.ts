import type { CachedDataset } from "./types";

/**
 * Initial Census 2011 datasets for db-init.
 * Literacy & workers shares the Primary Abstract resource_id on data.gov.in.
 */
export const SEED_DATASETS: Omit<CachedDataset, "resolvedAt" | "addedByUserId">[] =
  [
    {
      _id: "0764657f-00ec-4c6b-9ece-2d7b8a7401fa",
      title: "Census 2011 — Primary Abstract (India)",
      portalUrl:
        "https://www.data.gov.in/resource/primary-census-abstract-2011-india",
      fields: [],
    },
    {
      _id: "3fac8061-9b36-418d-a5d5-7cedd300c942",
      title: "Census 2011 — Population by Age & Sex",
      portalUrl:
        "https://www.data.gov.in/resource/population-single-year-age-residence-and-sex-2011-india",
      fields: [],
    },
  ];

/** Portal URL for literacy/workers — resolves to the same resource_id as Primary Abstract. */
export const LITERACY_WORKERS_PORTAL_URL =
  "https://www.data.gov.in/resource/primary-census-abstract-2011-india";

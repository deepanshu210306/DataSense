import type { DatasetId } from "./types";

/** Client-safe dataset list for the sidebar (ids must match server registry). */
export const DATASET_OPTIONS: ReadonlyArray<{
  id: DatasetId;
  label: string;
}> = [
  { id: "sales", label: "Census 2011 — Primary Abstract (India)" },
  { id: "crm", label: "Census 2011 — Population by Age & Sex" },
  { id: "ops", label: "Census 2011 — Literacy & Workers" },
] as const;

export const DEFAULT_DATASET_ID: DatasetId = "sales";

export function getDatasetLabel(id: DatasetId): string {
  return DATASET_OPTIONS.find((d) => d.id === id)?.label ?? id;
}

import { getDb } from "@/lib/mongodb";
import {
  COLLECTIONS,
  type DatasetDocument,
} from "@/lib/mongodb/collections";
import type { CachedDataset, DatasetSummary } from "./types";

function toSummary(doc: DatasetDocument): DatasetSummary {
  return {
    resourceId: doc._id,
    title: doc.title,
    portalUrl: doc.portalUrl,
    fields: doc.fields,
  };
}

export async function listDatasets(): Promise<DatasetSummary[]> {
  const db = await getDb();
  const rows = await db
    .collection<DatasetDocument>(COLLECTIONS.datasets)
    .find({})
    .sort({ title: 1 })
    .toArray();
  return rows.map(toSummary);
}

export async function getDatasetByResourceId(
  resourceId: string,
): Promise<CachedDataset | null> {
  const db = await getDb();
  const row = await db
    .collection<DatasetDocument>(COLLECTIONS.datasets)
    .findOne({ _id: resourceId });
  return row ?? null;
}

export async function upsertDataset(
  input: Omit<CachedDataset, "resolvedAt"> & { resolvedAt?: Date },
): Promise<CachedDataset> {
  const resolvedAt = input.resolvedAt ?? new Date();
  const doc: DatasetDocument = {
    _id: input._id,
    title: input.title,
    portalUrl: input.portalUrl,
    fields: input.fields,
    resolvedAt,
    addedByUserId: input.addedByUserId,
  };

  const db = await getDb();
  await db
    .collection<DatasetDocument>(COLLECTIONS.datasets)
    .updateOne({ _id: doc._id }, { $set: doc }, { upsert: true });

  return doc;
}

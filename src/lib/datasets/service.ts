import { dbConnect } from "@/lib/dbConnect";
import { Dataset, type IDataset } from "@/models/Dataset";
import type { CachedDataset, DatasetSummary } from "./types";

function toSummary(doc: Pick<IDataset, "resourceId" | "title" | "portalUrl" | "fields">): DatasetSummary {
  return {
    resourceId: doc.resourceId,
    title: doc.title,
    portalUrl: doc.portalUrl,
    fields: doc.fields ?? [],
  };
}

function toCached(doc: IDataset): CachedDataset {
  return {
    resourceId: doc.resourceId,
    title: doc.title,
    portalUrl: doc.portalUrl,
    fields: doc.fields ?? [],
    resolvedAt: doc.resolvedAt,
    addedByUserId: doc.addedByUserId ? String(doc.addedByUserId) : undefined,
  };
}

export async function listDatasets(): Promise<DatasetSummary[]> {
  await dbConnect();
  const rows = await Dataset.find({}).sort({ title: 1 }).lean<IDataset[]>().exec();
  return rows.map(toSummary);
}

export async function getDatasetByResourceId(
  resourceId: string,
): Promise<CachedDataset | null> {
  await dbConnect();
  const row = await Dataset.findOne({ resourceId: resourceId.toLowerCase() })
    .lean<IDataset>()
    .exec();
  return row ? toCached(row) : null;
}

export async function upsertDataset(
  input: Omit<CachedDataset, "resolvedAt"> & { resolvedAt?: Date },
): Promise<CachedDataset> {
  await dbConnect();
  const resolvedAt = input.resolvedAt ?? new Date();
  const row = await Dataset.findOneAndUpdate(
    { resourceId: input.resourceId.toLowerCase() },
    {
      $set: {
        resourceId: input.resourceId.toLowerCase(),
        title: input.title,
        portalUrl: input.portalUrl,
        fields: input.fields,
        resolvedAt,
        ...(input.addedByUserId ? { addedByUserId: input.addedByUserId } : {}),
      },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  )
    .lean<IDataset>()
    .exec();

  return toCached(row as IDataset);
}

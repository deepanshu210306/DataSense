export type ResourceId = string;

export type DatasetField = {
  id?: string;
  name?: string;
  type?: string;
};

export type CachedDataset = {
  _id: ResourceId;
  title: string;
  portalUrl: string;
  fields: DatasetField[];
  resolvedAt: Date;
  addedByUserId: string;
};

export type DatasetSummary = {
  resourceId: ResourceId;
  title: string;
  portalUrl: string;
  fields: DatasetField[];
};

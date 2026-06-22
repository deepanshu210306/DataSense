export type ResourceId = string;

export type CachedDataset = {
  resourceId: ResourceId;
  title: string;
  portalUrl: string;
  /** Column / field names from the resource. */
  fields: string[];
  resolvedAt: Date;
  addedByUserId?: string;
};

export type DatasetSummary = {
  resourceId: ResourceId;
  title: string;
  portalUrl: string;
  fields: string[];
};

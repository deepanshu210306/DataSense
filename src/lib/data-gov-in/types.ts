export type DataGovRecord = Record<string, string | number | null>;

export type DataGovFetchResult = {
  records: DataGovRecord[];
  total?: number;
  count: number;
  title?: string;
  fields?: Array<{ id?: string; name?: string; type?: string }>;
  source: "primary" | "fallback";
};

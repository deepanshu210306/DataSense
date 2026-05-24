/** Keys used in the sidebar dataset picker */
export type DatasetId = "sales" | "crm" | "ops";

export type DatasetConfig = {
  id: DatasetId;
  /** Short label shown in the UI */
  label: string;
  /** Human-readable summary for the LLM */
  description: string;
  /** data.gov.in resource UUID */
  resourceId: string;
  /** Public dataset page on data.gov.in */
  portalUrl: string;
  /** Optional extra guidance appended to the system prompt */
  promptFocus?: string;
};

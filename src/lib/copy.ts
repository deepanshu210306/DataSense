/** Shared user-facing copy — keep chat UI text consistent here. */
export const APP_NAME = "DataSense";

export const APP_TAGLINE =
  "AI analyst for Indian government open data on data.gov.in";

export const CHAT = {
  emptyTitle: "Ask your first question",
  emptyDescription:
    "Select a dataset from the sidebar, then ask in plain language. Answers use live rows from data.gov.in.",
  inputPlaceholder: "Ask anything about this dataset…",
  inputHint:
    "Answers use live rows from data.gov.in. Chats sync to your account.",
  datasetNone: "Select a dataset in the sidebar before sending",
  datasetSelected: (label: string) => `Dataset: ${label}`,
  datasetSelectedShort: "Dataset selected",
  loading: "Loading your conversation…",
  newChat: "New chat ready",
  recentsEmpty: "No saved chats yet — ask a question to start.",
  recentsLabel: "Recent chats",
  searchPlaceholder: "Search your saved chats…",
  searchEmpty: "No chats match that search.",
  datasetSearchPlaceholder: "Search datasets by name…",
  datasetSearchEmpty: "No datasets match. Add a new one below.",
  datasetAlreadyExists: "Already in the catalog — select it above.",
  analystRole: "Government data analyst",
  analystUsing: (dataset: string) => `Using ${dataset}`,
  verifyDisclaimer:
    "Verify important figures against the official source on data.gov.in.",
} as const;

export const HOME = {
  heroTitle: "Chat with India's open government data",
  heroDescription:
    "DataSense connects to live datasets on data.gov.in. Sign in, pick a dataset, ask in plain language, and revisit saved conversations anytime.",
} as const;

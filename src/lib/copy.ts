/** Shared user-facing copy — keep chat UI text consistent here. */
export const APP_NAME = "DataSense";

export const APP_TAGLINE =
  "Your AI analyst for India's open government data";

export const CHAT = {
  emptyTitle: "What would you like to explore?",
  emptyDescription:
    "Pick a dataset, then ask in plain language. Every answer is grounded in live rows from data.gov.in.",
  inputPlaceholder: "Ask anything about this dataset…",
  inputHint:
    "Grounded in live data.gov.in rows. Your chats sync automatically.",
  datasetNone: "Choose a dataset to get started",
  datasetSelected: (label: string) => `Dataset: ${label}`,
  datasetSelectedShort: "Dataset ready",
  loading: "Loading your conversation…",
  newChat: "Started a new chat",
  recentsEmpty: "Your chats will appear here once you start one.",
  recentsLabel: "Recent",
  deleteChat: "Delete chat",
  deleteChatTitle: "Delete this chat?",
  deleteChatDescription: (title: string) =>
    `“${title}” and all of its messages will be permanently deleted.`,
  deleteChatCancel: "Cancel",
  deleteChatConfirm: "Delete",
  deleteChatPending: "Deleting…",
  chatDeleted: "Chat deleted",
  deleteChatFailed: "Couldn't delete this chat",
  searchPlaceholder: "Search your chats…",
  searchEmpty: "No chats match that search.",
  datasetSearchPlaceholder: "Search datasets by name…",
  datasetSearchEmpty: "No datasets match. Add a new one below.",
  datasetAlreadyExists: "Already in the catalog — select it above.",
  datasetPickerLabel: "Dataset",
  datasetPickerEmpty: "No datasets yet. Add one from data.gov.in below.",
  datasetPickerNone: "Choose a dataset",
  datasetPickerCount: (n: number) =>
    n === 1 ? "1 dataset available" : `${n} datasets available`,
  analystRole: "Government data analyst",
  analystUsing: (dataset: string) => `Analyzing ${dataset}`,
  verifyDisclaimer:
    "Always verify key figures against the official source on data.gov.in.",
} as const;

export const HOME = {
  badge: "Grounded in live data.gov.in datasets",
  heroTitle: "Understand India's public data in plain language",
  heroDescription:
    "DataSense turns any dataset on data.gov.in into a conversation. Ask questions, get grounded answers with real numbers, and pick up right where you left off.",
  quote:
    "Data is only powerful when everyone can actually read it.",
  quoteAuthor: "The DataSense idea",
  featuresTitle: "Everything you need to make sense of open data",
} as const;

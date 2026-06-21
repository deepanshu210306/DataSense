export const COLLECTIONS = {
  conversations: "conversations",
  chatMessages: "chat_messages",
  datasets: "datasets",
} as const;

export type ConversationDocument = {
  _id: string;
  userId: string;
  title: string;
  resourceId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ChatMessageDocument = {
  _id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  resolvedResourceId?: string | null;
  resolvedDatasetLabel?: string | null;
  createdAt: Date;
};

export type DatasetFieldDocument = {
  id?: string;
  name?: string;
  type?: string;
};

export type DatasetDocument = {
  _id: string;
  title: string;
  portalUrl: string;
  fields: DatasetFieldDocument[];
  resolvedAt: Date;
  addedByUserId: string;
};

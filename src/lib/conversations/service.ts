import { AppError } from "@/lib/errors";
import { getDb } from "@/lib/mongodb";
import {
  COLLECTIONS,
  type ChatMessageDocument,
  type ConversationDocument,
} from "@/lib/mongodb/collections";

export type ConversationSummary = {
  id: string;
  title: string;
  updatedAt: Date;
  resourceId: string;
};

export type StoredChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  resolvedResourceId?: string | null;
  resolvedDatasetLabel?: string | null;
  createdAt: Date;
};

function newId(): string {
  return crypto.randomUUID();
}

function titleFromMessage(message: string): string {
  const trimmed = message.trim().replace(/\s+/g, " ");
  if (trimmed.length <= 60) return trimmed;
  return `${trimmed.slice(0, 57)}…`;
}

export async function listConversations(
  userId: string,
): Promise<ConversationSummary[]> {
  const db = await getDb();
  const rows = await db
    .collection<ConversationDocument>(COLLECTIONS.conversations)
    .find({ userId })
    .sort({ updatedAt: -1 })
    .limit(50)
    .toArray();

  return rows.map((row) => ({
    id: row._id,
    title: row.title,
    updatedAt: row.updatedAt,
    resourceId: row.resourceId,
  }));
}

export async function getConversationForUser(
  conversationId: string,
  userId: string,
): Promise<ConversationDocument> {
  const db = await getDb();
  const row = await db
    .collection<ConversationDocument>(COLLECTIONS.conversations)
    .findOne({ _id: conversationId, userId });

  if (!row) {
    throw new AppError("Conversation not found.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  return row;
}

export async function getConversationMessages(
  conversationId: string,
  userId: string,
): Promise<StoredChatMessage[]> {
  await getConversationForUser(conversationId, userId);
  const db = await getDb();

  const rows = await db
    .collection<ChatMessageDocument>(COLLECTIONS.chatMessages)
    .find({ conversationId })
    .sort({ createdAt: 1 })
    .toArray();

  return rows.map((row) => ({
    id: row._id,
    role: row.role,
    content: row.content,
    resolvedResourceId: row.resolvedResourceId,
    resolvedDatasetLabel: row.resolvedDatasetLabel,
    createdAt: row.createdAt,
  }));
}

export async function createConversation(
  userId: string,
  resourceId: string,
  title = "New chat",
): Promise<ConversationDocument> {
  const now = new Date();
  const doc: ConversationDocument = {
    _id: newId(),
    userId,
    title,
    resourceId,
    createdAt: now,
    updatedAt: now,
  };

  const db = await getDb();
  await db
    .collection<ConversationDocument>(COLLECTIONS.conversations)
    .insertOne(doc as ConversationDocument);
  return doc;
}

export async function ensureConversation(
  userId: string,
  conversationId: string | undefined,
  resourceId: string,
  firstMessage?: string,
): Promise<ConversationDocument> {
  if (conversationId) {
    return getConversationForUser(conversationId, userId);
  }

  const title = firstMessage ? titleFromMessage(firstMessage) : "New chat";
  return createConversation(userId, resourceId, title);
}

export async function touchConversation(conversationId: string) {
  const db = await getDb();
  await db
    .collection<ConversationDocument>(COLLECTIONS.conversations)
    .updateOne({ _id: conversationId }, { $set: { updatedAt: new Date() } });
}

export async function saveChatMessage(input: {
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  resolvedResourceId?: string;
  resolvedDatasetLabel?: string;
}) {
  const doc: ChatMessageDocument = {
    _id: newId(),
    conversationId: input.conversationId,
    role: input.role,
    content: input.content,
    resolvedResourceId: input.resolvedResourceId ?? null,
    resolvedDatasetLabel: input.resolvedDatasetLabel ?? null,
    createdAt: new Date(),
  };

  const db = await getDb();
  await db
    .collection<ChatMessageDocument>(COLLECTIONS.chatMessages)
    .insertOne(doc as ChatMessageDocument);
  await touchConversation(input.conversationId);
  return doc;
}

export async function getRecentHistory(
  conversationId: string,
  limit = 12,
): Promise<Array<{ role: "user" | "assistant"; content: string }>> {
  const db = await getDb();
  const rows = await db
    .collection<ChatMessageDocument>(COLLECTIONS.chatMessages)
    .find({ conversationId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  return rows.reverse().map((row) => ({
    role: row.role,
    content: row.content,
  }));
}

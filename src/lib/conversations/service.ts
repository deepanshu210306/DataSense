import { AppError } from "@/lib/errors";
import { connectDB } from "@/lib/mongoose";
import { Conversation, type IConversation } from "@/models/Conversation";
import { Message, type IMessage } from "@/models/Message";
import { Dataset, type IDataset } from "@/models/Dataset";

function newId(): string {
  return crypto.randomUUID();
}

export type ConversationSummary = {
  id: string;
  title: string;
  updatedAt: Date;
  resourceId: string;
};

export type ConversationRecord = {
  id: string;
  userId: string;
  title: string;
  datasetId: string;
  datasetTitle?: string;
};

export type StoredChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  resolvedResourceId?: string | null;
  resolvedDatasetLabel?: string | null;
  createdAt: Date;
};

function titleFromMessage(message: string): string {
  const trimmed = message.trim().replace(/\s+/g, " ");
  if (trimmed.length <= 60) return trimmed;
  return `${trimmed.slice(0, 57)}…`;
}

function toRecord(doc: IConversation): ConversationRecord {
  return {
    id: String(doc._id),
    userId: String(doc.userId),
    title: doc.title,
    datasetId: doc.datasetId,
    datasetTitle: doc.datasetTitle,
  };
}

export async function listConversations(
  userId: string,
): Promise<ConversationSummary[]> {
  await connectDB();
  const rows = await Conversation.find({ userId })
    .sort({ updatedAt: -1 })
    .limit(50)
    .lean<IConversation[]>()
    .exec();

  return rows.map((row) => ({
    id: String(row._id),
    title: row.title,
    updatedAt: row.updatedAt,
    resourceId:
      row.datasetId ??
      (row as IConversation & { resourceId?: string }).resourceId ??
      "",
  }));
}

export async function getConversationForUser(
  conversationId: string,
  userId: string,
): Promise<ConversationRecord> {
  await connectDB();
  const row = await Conversation.findOne({ _id: conversationId, userId })
    .lean<IConversation>()
    .exec();

  if (!row) {
    throw new AppError("Conversation not found.", {
      status: 404,
      code: "NOT_FOUND",
    });
  }

  return toRecord(row);
}

export async function getConversationMessages(
  conversationId: string,
  userId: string,
): Promise<StoredChatMessage[]> {
  const conversation = await getConversationForUser(conversationId, userId);

  const rows = await Message.find({ conversationId })
    .sort({ createdAt: 1 })
    .lean<IMessage[]>()
    .exec();

  return rows.map((row) => ({
    id: String(row._id),
    role: row.role,
    content: row.content,
    resolvedResourceId:
      row.role === "assistant" ? conversation.datasetId : null,
    resolvedDatasetLabel:
      row.role === "assistant" ? conversation.datasetTitle ?? null : null,
    createdAt: row.createdAt,
  }));
}

export async function createConversation(
  userId: string,
  resourceId: string,
  title = "New chat",
): Promise<ConversationRecord> {
  await connectDB();
  const dataset = await Dataset.findOne({ resourceId: resourceId.toLowerCase() })
    .lean<IDataset>()
    .exec();

  const doc = await Conversation.create({
    _id: newId(),
    userId,
    title,
    datasetId: resourceId,
    datasetTitle: dataset?.title,
  });

  return toRecord(doc.toObject());
}

export async function ensureConversation(
  userId: string,
  conversationId: string | undefined,
  resourceId: string,
  firstMessage?: string,
): Promise<ConversationRecord> {
  if (conversationId) {
    return getConversationForUser(conversationId, userId);
  }

  const title = firstMessage ? titleFromMessage(firstMessage) : "New chat";
  return createConversation(userId, resourceId, title);
}

export async function touchConversation(conversationId: string): Promise<void> {
  await connectDB();
  await Conversation.updateOne(
    { _id: conversationId },
    { $set: { updatedAt: new Date() } },
  ).exec();
}

export async function saveChatMessage(input: {
  conversationId: string;
  role: "user" | "assistant";
  content: string;
}): Promise<void> {
  await connectDB();
  await Message.create({
    _id: newId(),
    conversationId: input.conversationId,
    role: input.role,
    content: input.content,
  });
  await touchConversation(input.conversationId);
}

export async function getRecentHistory(
  conversationId: string,
  limit = 12,
): Promise<Array<{ role: "user" | "assistant"; content: string }>> {
  await connectDB();
  const rows = await Message.find({ conversationId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean<IMessage[]>()
    .exec();

  return rows.reverse().map((row) => ({
    role: row.role,
    content: row.content,
  }));
}

import { Schema, model, models, type Model } from "mongoose";

export type MessageRole = "user" | "assistant";

export interface IMessage {
  _id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    _id: { type: String, required: true },
    conversationId: { type: String, required: true, index: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Message: Model<IMessage> =
  (models.Message as Model<IMessage>) ||
  model<IMessage>("Message", MessageSchema);

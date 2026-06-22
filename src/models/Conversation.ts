import { Schema, model, models, type Model } from "mongoose";

export interface IConversation {
  _id: string;
  userId: string;
  title: string;
  /** data.gov.in resource_id (UUID string) this conversation is tied to. */
  datasetId: string;
  datasetTitle?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, default: "New chat" },
    datasetId: { type: String, required: true },
    datasetTitle: { type: String },
  },
  { timestamps: true },
);

export const Conversation: Model<IConversation> =
  (models.Conversation as Model<IConversation>) ||
  model<IConversation>("Conversation", ConversationSchema);

import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IDataset {
  _id: Types.ObjectId;
  /** The data.gov.in resource_id (UUID) — unique shared cache key. */
  resourceId: string;
  title: string;
  portalUrl: string;
  /** Column / field names from the resource. */
  fields: string[];
  resolvedAt: Date;
  /** User who first resolved this dataset (shared across all users). */
  addedByUserId?: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const DatasetSchema = new Schema<IDataset>(
  {
    resourceId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    title: { type: String, required: true },
    portalUrl: { type: String, required: true },
    fields: { type: [String], default: [] },
    resolvedAt: { type: Date, default: Date.now },
    addedByUserId: { type: Schema.Types.Mixed, ref: "User" },
  },
  { timestamps: true },
);

export const Dataset: Model<IDataset> =
  (models.Dataset as Model<IDataset>) ||
  model<IDataset>("Dataset", DatasetSchema);

import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IUser {
  _id: Types.ObjectId;
  name?: string;
  email: string;
  /** Optional — absent for Google OAuth users who never set a password. */
  password?: string;
  image?: string | null;
  emailVerified?: Date | null;
  /** bcrypt hash of the current 6-digit verification code (select: false). */
  verificationCode?: string | null;
  /** When the current verification code stops being valid. */
  verificationCodeExpires?: Date | null;
  /** Wrong-code attempts on the current code; locks after a threshold. */
  verificationAttempts?: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String },
    image: { type: String, default: null },
    emailVerified: { type: Date, default: null },
    verificationCode: { type: String, default: null, select: false },
    verificationCodeExpires: { type: Date, default: null, select: false },
    verificationAttempts: { type: Number, default: 0, select: false },
  },
  { timestamps: true },
);

export const User: Model<IUser> =
  (models.User as Model<IUser>) || model<IUser>("User", UserSchema);

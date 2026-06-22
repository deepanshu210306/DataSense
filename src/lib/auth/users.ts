import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import { User, type IUser } from "@/models/User";

const BCRYPT_ROUNDS = 12;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findUserByEmail(email: string): Promise<IUser | null> {
  await connectDB();
  return User.findOne({ email: normalizeEmail(email) }).lean<IUser>().exec();
}

export async function createPasswordUser(
  email: string,
  plainPassword: string,
): Promise<IUser> {
  await connectDB();
  const normalized = normalizeEmail(email);
  const password = await bcrypt.hash(plainPassword, BCRYPT_ROUNDS);
  const doc = await User.create({
    email: normalized,
    password,
    name: normalized,
  });
  return doc.toObject();
}

export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

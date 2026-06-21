import bcrypt from "bcryptjs";
import { getDb } from "@/lib/mongodb";

const USERS_COLLECTION = "users";
const BCRYPT_ROUNDS = 12;

export type PasswordUserDocument = {
  _id: string;
  email: string;
  password: string;
  name?: string;
  emailVerified?: Date | null;
  image?: string | null;
  createdAt: Date;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findUserByEmail(
  email: string,
): Promise<PasswordUserDocument | null> {
  const db = await getDb();
  const row = await db
    .collection<PasswordUserDocument>(USERS_COLLECTION)
    .findOne({ email: normalizeEmail(email) });
  return row ?? null;
}

export async function createPasswordUser(
  email: string,
  plainPassword: string,
): Promise<PasswordUserDocument> {
  const normalized = normalizeEmail(email);
  const password = await bcrypt.hash(plainPassword, BCRYPT_ROUNDS);
  const now = new Date();
  const doc: PasswordUserDocument = {
    _id: crypto.randomUUID(),
    email: normalized,
    password,
    name: normalized,
    emailVerified: null,
    image: null,
    createdAt: now,
  };

  const db = await getDb();
  await db.collection(USERS_COLLECTION).insertOne(doc as never);
  return doc;
}

export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

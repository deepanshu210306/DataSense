import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI ?? process.env.DATABASE_URL;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "datasense";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var _mongoose: MongooseCache | undefined;
}

/**
 * Cache the connection across hot reloads in dev and across lambda invocations
 * in prod, so we never open more than one Mongoose connection.
 */
const cached: MongooseCache = global._mongoose ?? { conn: null, promise: null };
global._mongoose = cached;

/** Call `await dbConnect()` at the top of any server code that touches the DB. */
export async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is missing. Add it to .env.local.");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB_NAME });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

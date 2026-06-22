import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI ?? process.env.DATABASE_URL;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "datasense";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var _mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache =
  global._mongooseCache ?? { conn: null, promise: null };

if (!global._mongooseCache) {
  global._mongooseCache = cached;
}

/**
 * Cached Mongoose connection (Next.js hot-reload safe).
 * Call `await connectDB()` at the top of every server-side function that hits the DB.
 */
export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is required. Add your MongoDB connection string to .env.local.",
    );
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB_NAME,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

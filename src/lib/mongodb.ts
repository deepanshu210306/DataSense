import { MongoClient, type Db } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function requireMongoUri(): string {
  const uri = process.env.DATABASE_URL?.trim();
  if (!uri) {
    throw new Error(
      "DATABASE_URL is required. Add your MongoDB connection string to .env.local.",
    );
  }
  if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
    throw new Error(
      "DATABASE_URL must be a MongoDB connection string (mongodb:// or mongodb+srv://).",
    );
  }
  return uri;
}

export function getMongoDbName(): string {
  return process.env.MONGODB_DB_NAME?.trim() || "datasense";
}

function createClientPromise(): Promise<MongoClient> {
  const client = new MongoClient(requireMongoUri());
  return client.connect();
}

export const mongoClientPromise: Promise<MongoClient> =
  global._mongoClientPromise ?? createClientPromise();

if (process.env.NODE_ENV !== "production") {
  global._mongoClientPromise = mongoClientPromise;
}

export default mongoClientPromise;

export async function getDb(): Promise<Db> {
  const connected = await mongoClientPromise;
  return connected.db(getMongoDbName());
}

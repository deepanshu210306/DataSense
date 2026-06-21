/**
 * Deletes all documents from conversations and chat_messages.
 * Usage: node --env-file=.env.local scripts/clear-chat-collections.mjs
 */
import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URL?.trim();
if (!uri) {
  console.error("Set DATABASE_URL in .env.local.");
  process.exit(1);
}

const dbName = process.env.MONGODB_DB_NAME?.trim() || "datasense";
const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db(dbName);

  const conversations = await db.collection("conversations").deleteMany({});
  const messages = await db.collection("chat_messages").deleteMany({});

  console.log(
    `Cleared database "${dbName}": ${conversations.deletedCount} conversations, ${messages.deletedCount} chat messages.`,
  );
} finally {
  await client.close();
}

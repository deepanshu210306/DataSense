/**
 * Deletes all documents from conversations and messages.
 * Usage: node --env-file=.env.local scripts/clear-chat-collections.mjs
 */
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI?.trim() || process.env.DATABASE_URL?.trim();
if (!uri) {
  console.error("Set MONGODB_URI (or DATABASE_URL) in .env.local.");
  process.exit(1);
}

const dbName = process.env.MONGODB_DB_NAME?.trim() || "datasense";

try {
  await mongoose.connect(uri, { dbName });
  const db = mongoose.connection.db;

  const conversations = await db.collection("conversations").deleteMany({});
  const messages = await db.collection("messages").deleteMany({});
  // Clean up the legacy pre-Mongoose collection name too.
  const legacy = await db.collection("chat_messages").deleteMany({});

  console.log(
    `Cleared "${dbName}": ${conversations.deletedCount} conversations, ${messages.deletedCount} messages (+${legacy.deletedCount} legacy).`,
  );
} finally {
  await mongoose.disconnect();
}

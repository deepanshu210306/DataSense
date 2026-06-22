/**
 * Initializes MongoDB: ensures indexes and seeds starter Census datasets.
 * Usage: node --env-file=.env.local scripts/db-init.mjs
 */
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI?.trim() || process.env.DATABASE_URL?.trim();
if (!uri) {
  console.error("Set MONGODB_URI (or DATABASE_URL) in .env.local.");
  process.exit(1);
}

const dbName = process.env.MONGODB_DB_NAME?.trim() || "datasense";

const SEED_DATASETS = [
  {
    resourceId: "0764657f-00ec-4c6b-9ece-2d7b8a7401fa",
    title: "Census 2011 — Primary Abstract (India)",
    portalUrl:
      "https://www.data.gov.in/resource/primary-census-abstract-2011-india",
    fields: [],
  },
  {
    resourceId: "3fac8061-9b36-418d-a5d5-7cedd300c942",
    title: "Census 2011 — Population by Age & Sex",
    portalUrl:
      "https://www.data.gov.in/resource/population-single-year-age-residence-and-sex-2011-india",
    fields: [],
  },
];

try {
  await mongoose.connect(uri, { dbName });
  const db = mongoose.connection.db;
  const now = new Date();

  await db
    .collection("conversations")
    .createIndex({ userId: 1, updatedAt: -1 });
  await db.collection("messages").createIndex({ conversationId: 1, createdAt: 1 });
  await db.collection("datasets").createIndex({ resourceId: 1 }, { unique: true });
  await db.collection("datasets").createIndex({ title: 1 });
  await db.collection("users").createIndex({ email: 1 }, { unique: true });

  for (const seed of SEED_DATASETS) {
    await db.collection("datasets").updateOne(
      { resourceId: seed.resourceId },
      { $set: { ...seed, resolvedAt: now } },
      { upsert: true },
    );
  }

  console.log(
    `MongoDB ready on "${dbName}": indexes ensured, ${SEED_DATASETS.length} datasets seeded.`,
  );
} finally {
  await mongoose.disconnect();
}

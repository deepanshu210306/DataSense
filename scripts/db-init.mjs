import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URL?.trim();
if (!uri) {
  console.error("Set DATABASE_URL in .env.local (MongoDB connection string).");
  process.exit(1);
}

const dbName = process.env.MONGODB_DB_NAME?.trim() || "datasense";
const client = new MongoClient(uri);

const SEED_DATASETS = [
  {
    _id: "0764657f-00ec-4c6b-9ece-2d7b8a7401fa",
    title: "Census 2011 — Primary Abstract (India)",
    portalUrl:
      "https://www.data.gov.in/resource/primary-census-abstract-2011-india",
    fields: [],
  },
  {
    _id: "3fac8061-9b36-418d-a5d5-7cedd300c942",
    title: "Census 2011 — Population by Age & Sex",
    portalUrl:
      "https://www.data.gov.in/resource/population-single-year-age-residence-and-sex-2011-india",
    fields: [],
  },
];

try {
  await client.connect();
  const db = client.db(dbName);
  const now = new Date();

  await db.collection("conversations").createIndexes([
    { key: { userId: 1, updatedAt: -1 } },
  ]);

  await db.collection("chat_messages").createIndexes([
    { key: { conversationId: 1, createdAt: 1 } },
  ]);

  await db.collection("datasets").createIndexes([
    { key: { title: 1 } },
    { key: { resolvedAt: -1 } },
  ]);

  for (const seed of SEED_DATASETS) {
    await db.collection("datasets").updateOne(
      { _id: seed._id },
      {
        $set: {
          ...seed,
          resolvedAt: now,
          addedByUserId: "seed",
        },
      },
      { upsert: true },
    );
  }

  console.log(
    `MongoDB indexes ready and ${SEED_DATASETS.length} datasets seeded on "${dbName}".`,
  );
} finally {
  await client.close();
}

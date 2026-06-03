import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
let client: MongoClient | null = null;
let db: Db | null = null;

async function getDb(): Promise<Db | null> {
  if (!uri) {
    console.warn(
      "MongoDB connection warning: MONGODB_URI is not defined in environment variables.",
    );
    return null;
  }

  if (db) return db;

  try {
    client = new MongoClient(uri, {
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });
    await client.connect();
    db = client.db("chronosai");
    console.log("Successfully connected to MongoDB");
    return db;
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    client = null;
    db = null;
    return null;
  }
}

export async function saveSearch(domain: string, snapshotsCount: number): Promise<boolean> {
  try {
    const database = await getDb();
    if (!database) return false;

    const normalized = domain.trim().toLowerCase();
    if (!normalized) return false;

    await database.collection("searches").updateOne(
      { domain: normalized },
      {
        $set: {
          domain: normalized,
          timestamp: new Date(),
          snapshotsCount,
        },
      },
      { upsert: true },
    );
    return true;
  } catch (err) {
    console.error(`Error saving search for domain ${domain} in MongoDB:`, err);
    return false;
  }
}

export interface RecentSearch {
  domain: string;
  timestamp: string;
  snapshotsCount: number;
}

export async function getRecentSearches(): Promise<RecentSearch[]> {
  try {
    const database = await getDb();
    if (!database) return [];

    const results = await database
      .collection("searches")
      .find()
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();

    return results.map((r) => ({
      domain: String(r.domain),
      timestamp: r.timestamp instanceof Date ? r.timestamp.toISOString() : new Date().toISOString(),
      snapshotsCount: Number(r.snapshotsCount ?? 0),
    }));
  } catch (err) {
    console.error("Error retrieving recent searches from MongoDB:", err);
    return [];
  }
}

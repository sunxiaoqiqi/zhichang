import Database from "better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const databasePath = resolve(process.env.DATABASE_PATH ?? "data/app.db");
mkdirSync(dirname(databasePath), { recursive: true });

const client = new Database(databasePath);
client.pragma("journal_mode = WAL");
client.pragma("foreign_keys = ON");
client.pragma("busy_timeout = 5000");

try {
  migrate(drizzle(client), { migrationsFolder: resolve("drizzle") });
  console.log(`Database migrations completed: ${databasePath}`);
} finally {
  client.close();
}

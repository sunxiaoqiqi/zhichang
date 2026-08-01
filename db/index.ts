import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const databasePath = resolve(
  /* turbopackIgnore: true */ process.env.DATABASE_PATH ?? "data/app.db",
);

function createDatabase() {
  mkdirSync(dirname(databasePath), { recursive: true });
  const client = new Database(databasePath);
  client.pragma("journal_mode = WAL");
  client.pragma("foreign_keys = ON");
  client.pragma("busy_timeout = 5000");
  return drizzle(client, { schema });
}

const globalForDatabase = globalThis as typeof globalThis & {
  __database?: ReturnType<typeof createDatabase>;
};

const database = globalForDatabase.__database ?? createDatabase();

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.__database = database;
}

export function getDb() {
  return database;
}

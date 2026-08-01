import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";

const databasePath = resolve(process.env.DATABASE_PATH ?? "data/app.db");
const backupDirectory = resolve(process.env.BACKUP_DIR ?? "backups");
const stamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
const backupPath = join(backupDirectory, `${basename(databasePath)}.${stamp}.backup`);

mkdirSync(dirname(databasePath), { recursive: true });
mkdirSync(backupDirectory, { recursive: true });

const client = new Database(databasePath);
try {
  await client.backup(backupPath);
  console.log(`Database backup completed: ${backupPath}`);
} finally {
  client.close();
}

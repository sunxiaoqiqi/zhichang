import Database from "better-sqlite3";
import { resolve } from "node:path";

const targetPath = resolve(process.env.DATABASE_PATH ?? "data/app.db");
const sourceInput = process.env.LEGACY_DATABASE_PATH;

if (!sourceInput) throw new Error("LEGACY_DATABASE_PATH is required");
const sourcePath = resolve(sourceInput);
if (sourcePath === targetPath) throw new Error("Legacy and target database paths must be different");

const tables = [
  "users",
  "auth_sessions",
  "devices",
  "login_events",
  "activity_sessions",
  "admin_audit_logs",
  "training_scenes",
  "questions",
  "course_progress",
  "favorites",
  "training_attempts",
];

const database = new Database(targetPath);
database.pragma("journal_mode = WAL");
database.pragma("foreign_keys = ON");
database.pragma("busy_timeout = 5000");
database.prepare("ATTACH DATABASE ? AS legacy").run(sourcePath);

const quote = (name) => `"${name.replaceAll('"', '""')}"`;
const tableExists = (schema, table) => Boolean(database.prepare(`SELECT 1 FROM ${schema}.sqlite_master WHERE type = 'table' AND name = ?`).get(table));
const columns = (schema, table) => database.prepare(`PRAGMA ${schema}.table_info(${quote(table)})`).all().map((row) => row.name);

try {
  const missing = tables.filter((table) => !tableExists("legacy", table) || !tableExists("main", table));
  if (missing.length) throw new Error(`Required tables are missing: ${missing.join(", ")}`);

  const migrate = database.transaction(() => {
    const results = [];
    for (const table of tables) {
      const sourceColumns = new Set(columns("legacy", table));
      const sharedColumns = columns("main", table).filter((column) => sourceColumns.has(column));
      if (!sharedColumns.length) throw new Error(`No shared columns for ${table}`);
      const columnList = sharedColumns.map(quote).join(", ");
      const result = database.prepare(`INSERT OR IGNORE INTO main.${quote(table)} (${columnList}) SELECT ${columnList} FROM legacy.${quote(table)}`).run();
      results.push({ table, imported: result.changes });
    }
    const violations = database.pragma("foreign_key_check");
    if (violations.length) throw new Error(`Foreign key validation failed: ${JSON.stringify(violations)}`);
    return results;
  });

  const results = migrate();
  console.log(JSON.stringify({ sourcePath, targetPath, results }, null, 2));
} finally {
  database.prepare("DETACH DATABASE legacy").run();
  database.pragma("wal_checkpoint(TRUNCATE)");
  database.close();
}

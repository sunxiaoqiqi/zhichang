import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("V1 database migration enforces unique accounts and session tokens", async () => {
  const sql = await read("drizzle/0000_boring_starbolt.sql");
  assert.match(sql, /CREATE UNIQUE INDEX `users_account_unique`/);
  assert.match(sql, /CREATE UNIQUE INDEX `auth_sessions_token_unique`/);
  assert.match(sql, /password_hash/);
  assert.doesNotMatch(sql, /password_plain/);
});

test("production runtime uses persistent local SQLite instead of Cloudflare D1", async () => {
  const database = await read("db/index.ts");
  const packageJson = JSON.parse(await read("package.json"));
  assert.match(database, /drizzle-orm\/better-sqlite3/);
  assert.match(database, /journal_mode = WAL/);
  assert.doesNotMatch(database, /cloudflare:workers|drizzle-orm\/d1/);
  assert.equal(packageJson.scripts.build, "next build");
  assert.equal(packageJson.scripts.start, "next start");
  assert.equal(packageJson.scripts["db:migrate"], "node scripts/migrate.mjs");
});

test("authentication protects the product and admin routes", async () => {
  const proxy = await read("proxy.ts");
  assert.match(proxy, /getUserBySessionToken/);
  assert.match(proxy, /mustChangePassword/);
  assert.match(proxy, /path\.startsWith\("\/admin"\)/);
  assert.match(proxy, /user\.role !== "admin"/);
});

test("V1 provides login, password change, setup, and user administration", async () => {
  for (const path of [
    "app/api/auth/login/route.ts",
    "app/api/auth/logout/route.ts",
    "app/api/auth/change-password/route.ts",
    "app/api/setup/route.ts",
    "app/api/admin/users/route.ts",
    "app/api/admin/users/[id]/route.ts",
  ]) assert.ok((await read(path)).length > 100, `${path} should be implemented`);
});

test("V2 persists questions, favorites, attempts, and course progress", async () => {
  const sql = await read("drizzle/0001_small_guardian.sql");
  for (const table of ["questions", "training_scenes", "training_attempts", "favorites", "course_progress"]) assert.ok(sql.includes(`CREATE TABLE \`${table}\``), `${table} should be migrated`);
  for (const path of ["app/api/admin/questions/route.ts", "app/api/training/questions/route.ts", "app/api/training/favorites/route.ts", "app/api/progress/route.ts"]) assert.ok((await read(path)).length > 100);
});

test("V3 records devices, login events, and effective activity sessions", async () => {
  const sql = await read("drizzle/0002_high_dark_phoenix.sql");
  for (const table of ["devices", "login_events", "activity_sessions"]) assert.ok(sql.includes(`CREATE TABLE \`${table}\``), `${table} should be migrated`);
  assert.match(sql, /devices_user_key_unique/);
  assert.match(sql, /active_seconds/);
  for (const path of [
    "app/api/activity/heartbeat/route.ts",
    "app/api/admin/devices/route.ts",
    "app/api/admin/devices/[id]/route.ts",
    "app/api/admin/analytics/route.ts",
    "app/admin/devices/page.tsx",
    "app/admin/analytics/page.tsx",
  ]) assert.ok((await read(path)).length > 100, `${path} should be implemented`);
});

test("V4 provides operations, exports, bulk management, and production checks", async () => {
  for (const path of [
    "app/admin/audit/page.tsx",
    "app/api/admin/audit/route.ts",
    "app/api/admin/export/route.ts",
    "app/api/admin/users/import/route.ts",
    "app/api/admin/questions/import/route.ts",
    "app/api/auth/account/route.ts",
    "app/account/page.tsx",
    "app/api/health/route.ts",
    "DEPLOYMENT.md",
  ]) assert.ok((await read(path)).length > 100, `${path} should be implemented`);
  const proxy = await read("proxy.ts");
  for (const header of ["x-content-type-options", "x-frame-options", "referrer-policy", "permissions-policy"]) assert.ok(proxy.includes(header), `${header} should be set`);
  const login = await read("app/api/auth/login/route.ts");
  assert.match(login, /failures >= 10/);
  assert.match(login, /retry-after/);
  const exportRoute = await read("app/api/admin/export/route.ts");
  assert.match(exportRoute, /data\.export/);
  assert.match(exportRoute, /text\/csv/);
  assert.match(exportRoute, /用户唯一编号/);
  const userActions = await read("app/api/admin/users/[id]/route.ts");
  assert.match(userActions, /body\.action === "account"/);
  assert.match(userActions, /账号已被其他用户使用/);
  const analytics = await read("app/api/admin/analytics/route.ts");
  assert.match(analytics, /activeUserIds/);
  assert.match(analytics, /accountAtLogin/);
  const accountMigration = await read("drizzle/0003_narrow_madripoor.sql");
  assert.match(accountMigration, /users_account_lower_unique/);
  assert.match(accountMigration, /lower\("account"\)/);
  const selfAccount = await read("app/api/auth/account/route.ts");
  assert.match(selfAccount, /verifyPassword/);
  assert.match(selfAccount, /user\.self_account/);
});

test("V5 enforces free and paid access with resumable training runs", async () => {
  const sql = await read("drizzle/0004_aromatic_misty_knight.sql");
  assert.match(sql, /CREATE TABLE `training_runs`/);
  assert.match(sql, /`access_plan` text DEFAULT 'free' NOT NULL/);
  const proxy = await read("proxy.ts");
  assert.match(proxy, /canAccessLesson/);
  assert.match(proxy, /\/upgrade/);
  const training = await read("app/api/training/questions/route.ts");
  assert.match(training, /FREE_TRAINING_EXHAUSTED/);
  assert.match(training, /answeredQuestionIds/);
  assert.match(training, /trainingRuns/);
  const userActions = await read("app/api/admin/users\/[id]\/route.ts");
  assert.match(userActions, /body\.action === "accessPlan"/);
  assert.match(userActions, /user\.access_plan/);
  const home = await read("app/page.tsx");
  assert.match(home, /delete next\[Number\(key\)\]/);
  for (const path of ["app/api/access/route.ts", "app/auth/access.ts", "app/upgrade/page.tsx"]) assert.ok((await read(path)).length > 100, `${path} should be implemented`);
});

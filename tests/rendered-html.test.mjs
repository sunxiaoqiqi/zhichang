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

import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  account: text("account").notNull(),
  passwordHash: text("password_hash").notNull(),
  passwordSalt: text("password_salt").notNull(),
  role: text("role", { enum: ["user", "admin"] }).notNull().default("user"),
  status: text("status", { enum: ["active", "disabled"] }).notNull().default("active"),
  mustChangePassword: integer("must_change_password", { mode: "boolean" }).notNull().default(true),
  note: text("note").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`),
}, (table) => [
  uniqueIndex("users_account_unique").on(table.account),
  uniqueIndex("users_account_lower_unique").on(sql`lower(${table.account})`),
]);

export const authSessions = sqliteTable("auth_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  deviceId: text("device_id"),
  tokenHash: text("token_hash").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`),
  lastSeenAt: integer("last_seen_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`),
}, (table) => [uniqueIndex("auth_sessions_token_unique").on(table.tokenHash), index("auth_sessions_user_idx").on(table.userId)]);

export const devices = sqliteTable("devices", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  deviceKey: text("device_key").notNull(),
  deviceType: text("device_type").notNull().default("unknown"),
  browser: text("browser").notNull().default("未知浏览器"),
  os: text("os").notNull().default("未知系统"),
  userAgent: text("user_agent").notNull().default(""),
  note: text("note").notNull().default(""),
  firstSeenAt: integer("first_seen_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`),
  lastSeenAt: integer("last_seen_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`),
}, (table) => [
  uniqueIndex("devices_user_key_unique").on(table.userId, table.deviceKey),
  index("devices_user_idx").on(table.userId),
  index("devices_last_seen_idx").on(table.lastSeenAt),
]);

export const loginEvents = sqliteTable("login_events", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  deviceId: text("device_id").references(() => devices.id, { onDelete: "set null" }),
  account: text("account").notNull(),
  deviceKey: text("device_key").notNull().default("unknown"),
  success: integer("success", { mode: "boolean" }).notNull(),
  ip: text("ip").notNull().default(""),
  country: text("country").notNull().default(""),
  region: text("region").notNull().default(""),
  city: text("city").notNull().default(""),
  location: text("location").notNull().default("未知"),
  userAgent: text("user_agent").notNull().default(""),
  occurredAt: integer("occurred_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`),
}, (table) => [
  index("login_events_user_idx").on(table.userId),
  index("login_events_device_idx").on(table.deviceId),
  index("login_events_occurred_idx").on(table.occurredAt),
]);

export const activitySessions = sqliteTable("activity_sessions", {
  id: text("id").primaryKey(),
  authSessionId: text("auth_session_id").notNull(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  deviceId: text("device_id").references(() => devices.id, { onDelete: "set null" }),
  startedAt: integer("started_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`),
  lastHeartbeatAt: integer("last_heartbeat_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`),
  endedAt: integer("ended_at", { mode: "timestamp_ms" }),
  activeSeconds: integer("active_seconds").notNull().default(0),
  wasActive: integer("was_active", { mode: "boolean" }).notNull().default(true),
}, (table) => [
  uniqueIndex("activity_sessions_auth_unique").on(table.authSessionId),
  index("activity_sessions_user_idx").on(table.userId),
  index("activity_sessions_device_idx").on(table.deviceId),
  index("activity_sessions_started_idx").on(table.startedAt),
]);

export const adminAuditLogs = sqliteTable("admin_audit_logs", {
  id: text("id").primaryKey(),
  adminUserId: text("admin_user_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  targetUserId: text("target_user_id").references(() => users.id),
  detail: text("detail").notNull().default("{}"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`),
}, (table) => [index("admin_audit_admin_idx").on(table.adminUserId)]);

export const trainingScenes = sqliteTable("training_scenes", {
  id: text("id").primaryKey(),
  lessonNumber: integer("lesson_number").notNull(),
  title: text("title").notNull(),
  phase: text("phase").notNull(),
}, (table) => [uniqueIndex("training_scenes_lesson_unique").on(table.lessonNumber)]);

export const questions = sqliteTable("questions", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  kind: text("kind", { enum: ["simple", "deep", "branching"] }).notNull(),
  primarySceneId: text("primary_scene_id").notNull(),
  difficulty: text("difficulty", { enum: ["easy", "medium", "hard"] }).notNull(),
  status: text("status", { enum: ["draft", "published", "retired"] }).notNull().default("draft"),
  payload: text("payload").notNull(),
  version: integer("version").notNull().default(1),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`),
}, (table) => [index("questions_scene_idx").on(table.primarySceneId), index("questions_status_idx").on(table.status)]);

export const courseProgress = sqliteTable("course_progress", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  lessonNumber: integer("lesson_number").notNull(),
  completedSteps: text("completed_steps").notNull().default("[]"),
  unlockedStep: integer("unlocked_step").notNull().default(0),
  finished: integer("finished", { mode: "boolean" }).notNull().default(false),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`),
}, (table) => [uniqueIndex("course_progress_user_lesson_unique").on(table.userId, table.lessonNumber)]);

export const favorites = sqliteTable("favorites", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  questionId: text("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`),
}, (table) => [uniqueIndex("favorites_user_question_unique").on(table.userId, table.questionId)]);

export const trainingAttempts = sqliteTable("training_attempts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  questionId: text("question_id").notNull().references(() => questions.id),
  primarySceneId: text("primary_scene_id").notNull(),
  correct: integer("correct", { mode: "boolean" }).notNull(),
  answerPayload: text("answer_payload").notNull().default("{}"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`),
}, (table) => [index("training_attempts_user_idx").on(table.userId), index("training_attempts_question_idx").on(table.questionId)]);

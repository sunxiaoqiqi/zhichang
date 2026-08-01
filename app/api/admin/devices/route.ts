import { count, desc, eq, gt, sql } from "drizzle-orm";
import { getDb } from "../../../../db";
import { activitySessions, authSessions, devices, loginEvents, users } from "../../../../db/schema";
import { getCurrentUser } from "../../../auth/session";

export async function GET() {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") return Response.json({ error: "没有管理员权限" }, { status: 403 });
  const db = getDb();
  const rows = await db.select({
    id: devices.id,
    userId: devices.userId,
    account: users.account,
    deviceKey: devices.deviceKey,
    deviceType: devices.deviceType,
    browser: devices.browser,
    os: devices.os,
    note: devices.note,
    firstSeenAt: devices.firstSeenAt,
    lastSeenAt: devices.lastSeenAt,
  }).from(devices).innerJoin(users, eq(devices.userId, users.id)).orderBy(desc(devices.lastSeenAt));
  const logins = await db.select({ deviceId: loginEvents.deviceId, loginCount: count(), lastLoginAt: sql<number>`max(${loginEvents.occurredAt})` })
    .from(loginEvents).where(eq(loginEvents.success, true)).groupBy(loginEvents.deviceId);
  const activity = await db.select({ deviceId: activitySessions.deviceId, activeSeconds: sql<number>`sum(${activitySessions.activeSeconds})` })
    .from(activitySessions).groupBy(activitySessions.deviceId);
  const online = await db.select({ deviceId: authSessions.deviceId, sessionCount: count() }).from(authSessions)
    .where(gt(authSessions.expiresAt, new Date())).groupBy(authSessions.deviceId);
  const loginMap = new Map(logins.map((row) => [row.deviceId, row]));
  const activityMap = new Map(activity.map((row) => [row.deviceId, Number(row.activeSeconds ?? 0)]));
  const onlineMap = new Map(online.map((row) => [row.deviceId, row.sessionCount]));
  return Response.json({ devices: rows.map((row) => ({
    ...row,
    loginCount: loginMap.get(row.id)?.loginCount ?? 0,
    lastLoginAt: loginMap.get(row.id)?.lastLoginAt ?? null,
    activeSeconds: activityMap.get(row.id) ?? 0,
    sessionCount: onlineMap.get(row.id) ?? 0,
  })) });
}

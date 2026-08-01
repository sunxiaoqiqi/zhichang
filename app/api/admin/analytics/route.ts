import { and, asc, desc, eq, gte, lt } from "drizzle-orm";
import { getDb } from "../../../../db";
import { activitySessions, devices, loginEvents, users } from "../../../../db/schema";
import { getCurrentUser } from "../../../auth/session";

function rangeCondition<T>(column: T, start: Date | null, end: Date | null) {
  if (start && end) return and(gte(column as never, start), lt(column as never, end));
  if (start) return gte(column as never, start);
  if (end) return lt(column as never, end);
  return undefined;
}

export async function GET(request: Request) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") return Response.json({ error: "没有管理员权限" }, { status: 403 });
  const url = new URL(request.url);
  const startValue = Number(url.searchParams.get("start"));
  const endValue = Number(url.searchParams.get("end"));
  const start = Number.isFinite(startValue) && startValue > 0 ? new Date(startValue) : null;
  const end = Number.isFinite(endValue) && endValue > 0 ? new Date(endValue) : null;
  const db = getDb();
  const deviceRows = await db.select({ id: devices.id, userId: devices.userId, account: users.account, browser: devices.browser, os: devices.os, deviceType: devices.deviceType, note: devices.note })
    .from(devices).innerJoin(users, eq(devices.userId, users.id)).orderBy(asc(users.account));
  const eventRows = await db.select({
    id: loginEvents.id, userId: loginEvents.userId, deviceId: loginEvents.deviceId, account: loginEvents.account,
    success: loginEvents.success, location: loginEvents.location, ip: loginEvents.ip, occurredAt: loginEvents.occurredAt,
  }).from(loginEvents).where(rangeCondition(loginEvents.occurredAt, start, end)).orderBy(desc(loginEvents.occurredAt));
  const currentUsers = await db.select({ id: users.id, account: users.account }).from(users);
  const currentAccountMap = new Map(currentUsers.map((user) => [user.id, user.account]));
  const displayEvents = eventRows.map((event) => ({
    ...event,
    accountAtLogin: event.account,
    account: event.userId ? currentAccountMap.get(event.userId) ?? event.account : event.account,
  }));
  const sessionRows = await db.select({
    id: activitySessions.id,
    deviceId: activitySessions.deviceId,
    userId: activitySessions.userId,
    activeSeconds: activitySessions.activeSeconds,
    startedAt: activitySessions.startedAt,
    lastHeartbeatAt: activitySessions.lastHeartbeatAt,
    endedAt: activitySessions.endedAt,
  })
    .from(activitySessions).where(rangeCondition(activitySessions.startedAt, start, end));

  const byDevice = new Map(deviceRows.map((device) => [device.id, { ...device, loginCount: 0, failedCount: 0, activeSeconds: 0, lastLoginAt: null as Date | null }]));
  for (const event of eventRows) {
    if (!event.deviceId) continue;
    const item = byDevice.get(event.deviceId);
    if (!item) continue;
    if (event.success) item.loginCount += 1; else item.failedCount += 1;
    if (!item.lastLoginAt || event.occurredAt > item.lastLoginAt) item.lastLoginAt = event.occurredAt;
  }
  for (const session of sessionRows) {
    if (session.deviceId) {
      const item = byDevice.get(session.deviceId);
      if (item) item.activeSeconds += session.activeSeconds;
    }
  }
  const deviceMap = new Map(deviceRows.map((device) => [device.id, device]));
  const sessionDetails = sessionRows.map((session) => {
    const device = session.deviceId ? deviceMap.get(session.deviceId) : undefined;
    const login = eventRows.find((event) => event.success && event.userId === session.userId && event.deviceId === session.deviceId && Math.abs(event.occurredAt.getTime() - session.startedAt.getTime()) <= 120_000);
    return {
      ...session,
      account: device?.account ?? "未知账户",
      device: device ? `${device.browser} · ${device.os}` : "未知设备",
      location: login?.location ?? "未知",
      ip: login?.ip ?? "",
    };
  }).sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  const rollups = [...byDevice.values()].filter((row) => !start && !end || row.loginCount > 0 || row.activeSeconds > 0);
  const successful = eventRows.filter((event) => event.success);
  const activeUserIds = new Set([...successful.map((event) => event.userId), ...sessionRows.map((session) => session.userId)].filter(Boolean));
  const activeSeconds = sessionRows.reduce((sum, row) => sum + row.activeSeconds, 0);
  const trendMap = new Map<string, { date: string; logins: number; activeSeconds: number }>();
  for (const event of successful) {
    const date = event.occurredAt.toISOString().slice(0, 10);
    const point = trendMap.get(date) ?? { date, logins: 0, activeSeconds: 0 };
    point.logins += 1;
    trendMap.set(date, point);
  }
  for (const session of sessionRows) {
    const date = session.startedAt.toISOString().slice(0, 10);
    const point = trendMap.get(date) ?? { date, logins: 0, activeSeconds: 0 };
    point.activeSeconds += session.activeSeconds;
    trendMap.set(date, point);
  }
  return Response.json({
    summary: { accounts: activeUserIds.size, devices: rollups.length, loginCount: successful.length, failedCount: eventRows.length - successful.length, activeSeconds },
    rollups,
    events: displayEvents.slice(0, 500),
    sessions: sessionDetails.slice(0, 500),
    trend: [...trendMap.values()].sort((a, b) => a.date.localeCompare(b.date)),
  });
}

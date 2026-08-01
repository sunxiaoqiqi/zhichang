import { and, eq, gt, inArray } from "drizzle-orm";
import { cookies } from "next/headers";
import { getDb } from "../../db";
import { activitySessions, authSessions, users } from "../../db/schema";
import { hashToken, randomToken } from "./crypto";

export const SESSION_COOKIE = "zhichang_session";
const SESSION_AGE = 7 * 24 * 60 * 60 * 1000;

export async function createSession(userId: string, deviceId?: string) {
  const token = randomToken();
  const now = Date.now();
  const sessionId = crypto.randomUUID();
  await getDb().insert(authSessions).values({ id: sessionId, userId, deviceId, tokenHash: await hashToken(token), createdAt: new Date(now), lastSeenAt: new Date(now), expiresAt: new Date(now + SESSION_AGE) });
  await getDb().insert(activitySessions).values({ id: crypto.randomUUID(), authSessionId: sessionId, userId, deviceId, startedAt: new Date(now), lastHeartbeatAt: new Date(now), wasActive: true });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_AGE / 1000 });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    const tokenHash = await hashToken(token);
    const [session] = await getDb().select({ id: authSessions.id }).from(authSessions).where(eq(authSessions.tokenHash, tokenHash)).limit(1);
    if (session) await getDb().update(activitySessions).set({ endedAt: new Date(), wasActive: false }).where(eq(activitySessions.authSessionId, session.id));
    await getDb().delete(authSessions).where(eq(authSessions.tokenHash, tokenHash));
  }
  jar.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return getUserBySessionToken(token);
}

export async function getUserBySessionToken(token?: string) {
  if (!token) return null;
  const [row] = await getDb().select({ id: users.id, account: users.account, role: users.role, status: users.status, mustChangePassword: users.mustChangePassword })
    .from(authSessions).innerJoin(users, eq(authSessions.userId, users.id))
    .where(and(eq(authSessions.tokenHash, await hashToken(token)), gt(authSessions.expiresAt, new Date()), eq(users.status, "active"))).limit(1);
  return row ?? null;
}

export async function getCurrentSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const [row] = await getDb().select({
    sessionId: authSessions.id,
    deviceId: authSessions.deviceId,
    id: users.id,
    account: users.account,
    role: users.role,
    status: users.status,
    mustChangePassword: users.mustChangePassword,
  }).from(authSessions).innerJoin(users, eq(authSessions.userId, users.id))
    .where(and(eq(authSessions.tokenHash, await hashToken(token)), gt(authSessions.expiresAt, new Date()), eq(users.status, "active"))).limit(1);
  return row ?? null;
}

export async function terminateSessionsForUser(userId: string) {
  const db = getDb();
  const sessions = await db.select({ id: authSessions.id }).from(authSessions).where(eq(authSessions.userId, userId));
  if (!sessions.length) return;
  const ids = sessions.map((session) => session.id);
  await db.update(activitySessions).set({ endedAt: new Date(), wasActive: false }).where(inArray(activitySessions.authSessionId, ids));
  await db.delete(authSessions).where(eq(authSessions.userId, userId));
}

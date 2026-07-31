import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { getDb } from "../../db";
import { authSessions, users } from "../../db/schema";
import { hashToken, randomToken } from "./crypto";

export const SESSION_COOKIE = "zhichang_session";
const SESSION_AGE = 7 * 24 * 60 * 60 * 1000;

export async function createSession(userId: string) {
  const token = randomToken();
  const now = Date.now();
  await getDb().insert(authSessions).values({ id: crypto.randomUUID(), userId, tokenHash: await hashToken(token), createdAt: new Date(now), lastSeenAt: new Date(now), expiresAt: new Date(now + SESSION_AGE) });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_AGE / 1000 });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await getDb().delete(authSessions).where(eq(authSessions.tokenHash, await hashToken(token)));
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

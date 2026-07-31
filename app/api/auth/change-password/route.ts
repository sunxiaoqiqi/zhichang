import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { authSessions, users } from "../../../../db/schema";
import { hashPassword, validatePassword, verifyPassword } from "../../../auth/crypto";
import { getCurrentUser } from "../../../auth/session";

export async function POST(request: Request) {
  const current = await getCurrentUser();
  if (!current) return Response.json({ error: "请先登录" }, { status: 401 });
  const { oldPassword, newPassword } = await request.json() as { oldPassword?: string; newPassword?: string };
  const validation = validatePassword(newPassword ?? "");
  if (validation) return Response.json({ error: validation }, { status: 400 });
  const [user] = await getDb().select().from(users).where(eq(users.id, current.id)).limit(1);
  if (!oldPassword || !await verifyPassword(oldPassword, user.passwordSalt, user.passwordHash)) return Response.json({ error: "原密码不正确" }, { status: 400 });
  const password = await hashPassword(newPassword!);
  await getDb().update(users).set({ passwordHash: password.hash, passwordSalt: password.salt, mustChangePassword: false, updatedAt: new Date() }).where(eq(users.id, current.id));
  await getDb().delete(authSessions).where(eq(authSessions.userId, current.id));
  await createSessionAgain(current.id);
  return Response.json({ ok: true });
}

async function createSessionAgain(userId: string) {
  const { createSession } = await import("../../../auth/session");
  await createSession(userId);
}

import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { users } from "../../../../db/schema";
import { hashPassword, validatePassword, verifyPassword } from "../../../auth/crypto";
import { createSession, getCurrentSession, terminateSessionsForUser } from "../../../auth/session";

export async function POST(request: Request) {
  const current = await getCurrentSession();
  if (!current) return Response.json({ error: "请先登录" }, { status: 401 });
  const { oldPassword, newPassword } = await request.json() as { oldPassword?: string; newPassword?: string };
  const validation = validatePassword(newPassword ?? "");
  if (validation) return Response.json({ error: validation }, { status: 400 });
  const [user] = await getDb().select().from(users).where(eq(users.id, current.id)).limit(1);
  if (!oldPassword || !await verifyPassword(oldPassword, user.passwordSalt, user.passwordHash)) return Response.json({ error: "原密码不正确" }, { status: 400 });
  const password = await hashPassword(newPassword!);
  await getDb().update(users).set({ passwordHash: password.hash, passwordSalt: password.salt, mustChangePassword: false, updatedAt: new Date() }).where(eq(users.id, current.id));
  await terminateSessionsForUser(current.id);
  await createSession(current.id, current.deviceId ?? undefined);
  return Response.json({ ok: true });
}

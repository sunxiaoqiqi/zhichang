import { eq, sql } from "drizzle-orm";
import { getDb } from "../../../../db";
import { adminAuditLogs, users } from "../../../../db/schema";
import { verifyPassword } from "../../../auth/crypto";
import { getCurrentUser } from "../../../auth/session";

export async function PATCH(request: Request) {
  const current = await getCurrentUser();
  if (!current) return Response.json({ error: "请先登录" }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { account?: string; password?: string };
  const account = body.account?.trim() ?? "";
  if (!/^[A-Za-z0-9_.-]{4,32}$/.test(account)) return Response.json({ error: "账号名需为 4—32 位字母、数字或 ._-" }, { status: 400 });
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, current.id)).limit(1);
  if (!body.password || !await verifyPassword(body.password, user.passwordSalt, user.passwordHash)) return Response.json({ error: "当前密码不正确" }, { status: 400 });
  const [conflict] = await db.select({ id: users.id }).from(users).where(sql`lower(${users.account}) = lower(${account})`).limit(1);
  if (conflict && conflict.id !== current.id) return Response.json({ error: "账号名已被其他用户使用" }, { status: 409 });
  if (account === user.account) return Response.json({ error: "新账号名与当前账号名相同" }, { status: 400 });
  await db.update(users).set({ account, updatedAt: new Date() }).where(eq(users.id, current.id));
  await db.insert(adminAuditLogs).values({ id: crypto.randomUUID(), adminUserId: current.id, action: "user.self_account", targetUserId: current.id, detail: JSON.stringify({ from: user.account, to: account }) });
  return Response.json({ ok: true, user: { id: current.id, account } });
}

import { eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { adminAuditLogs, authSessions, users } from "../../../../../db/schema";
import { hashPassword, randomToken } from "../../../../auth/crypto";
import { getCurrentUser } from "../../../../auth/session";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") return Response.json({ error: "没有管理员权限" }, { status: 403 });
  const { id } = await context.params;
  const body = await request.json() as { action?: "toggle" | "reset" | "note"; note?: string };
  const [target] = await getDb().select().from(users).where(eq(users.id, id)).limit(1);
  if (!target) return Response.json({ error: "用户不存在" }, { status: 404 });
  if (target.id === admin.id && body.action === "toggle") return Response.json({ error: "不能停用当前管理员" }, { status: 400 });
  let temporaryPassword: string | undefined;
  if (body.action === "toggle") {
    const status = target.status === "active" ? "disabled" : "active";
    await getDb().update(users).set({ status, updatedAt: new Date() }).where(eq(users.id, id));
    if (status === "disabled") await getDb().delete(authSessions).where(eq(authSessions.userId, id));
  } else if (body.action === "reset") {
    temporaryPassword = `Zc${randomToken(6)}9`;
    const secured = await hashPassword(temporaryPassword);
    await getDb().update(users).set({ passwordHash: secured.hash, passwordSalt: secured.salt, mustChangePassword: true, updatedAt: new Date() }).where(eq(users.id, id));
    await getDb().delete(authSessions).where(eq(authSessions.userId, id));
  } else if (body.action === "note") await getDb().update(users).set({ note: body.note?.trim() ?? "", updatedAt: new Date() }).where(eq(users.id, id));
  else return Response.json({ error: "无效操作" }, { status: 400 });
  await getDb().insert(adminAuditLogs).values({ id: crypto.randomUUID(), adminUserId: admin.id, action: `user.${body.action}`, targetUserId: id });
  return Response.json({ ok: true, temporaryPassword });
}

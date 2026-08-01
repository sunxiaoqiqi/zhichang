import { eq, sql } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { adminAuditLogs, users } from "../../../../../db/schema";
import { hashPassword, randomToken } from "../../../../auth/crypto";
import { getCurrentUser, terminateSessionsForUser } from "../../../../auth/session";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") return Response.json({ error: "没有管理员权限" }, { status: 403 });
  const { id } = await context.params;
  const body = await request.json() as { action?: "toggle" | "reset" | "note" | "account" | "accessPlan"; note?: string; account?: string; accessPlan?: "free" | "paid" };
  const [target] = await getDb().select().from(users).where(eq(users.id, id)).limit(1);
  if (!target) return Response.json({ error: "用户不存在" }, { status: 404 });
  if (target.id === admin.id && body.action === "toggle") return Response.json({ error: "不能停用当前管理员" }, { status: 400 });
  let temporaryPassword: string | undefined;
  if (body.action === "toggle") {
    const status = target.status === "active" ? "disabled" : "active";
    await getDb().update(users).set({ status, updatedAt: new Date() }).where(eq(users.id, id));
    if (status === "disabled") await terminateSessionsForUser(id);
  } else if (body.action === "reset") {
    temporaryPassword = `Zc${randomToken(6)}9`;
    const secured = await hashPassword(temporaryPassword);
    await getDb().update(users).set({ passwordHash: secured.hash, passwordSalt: secured.salt, mustChangePassword: true, updatedAt: new Date() }).where(eq(users.id, id));
    await terminateSessionsForUser(id);
  } else if (body.action === "note") await getDb().update(users).set({ note: body.note?.trim() ?? "", updatedAt: new Date() }).where(eq(users.id, id));
  else if (body.action === "accessPlan") {
    if (body.accessPlan !== "free" && body.accessPlan !== "paid") return Response.json({ error: "无效的用户版本" }, { status: 400 });
    await getDb().update(users).set({ accessPlan: body.accessPlan, updatedAt: new Date() }).where(eq(users.id, id));
    await getDb().insert(adminAuditLogs).values({ id: crypto.randomUUID(), adminUserId: admin.id, action: "user.access_plan", targetUserId: id, detail: JSON.stringify({ from: target.accessPlan, to: body.accessPlan }) });
    return Response.json({ ok: true, accessPlan: body.accessPlan });
  }
  else if (body.action === "account") {
    const account = body.account?.trim() ?? "";
    if (!/^[A-Za-z0-9_.-]{4,32}$/.test(account)) return Response.json({ error: "账号需为 4—32 位字母、数字或 ._-" }, { status: 400 });
    const [conflict] = await getDb().select({ id: users.id }).from(users).where(sql`lower(${users.account}) = lower(${account})`).limit(1);
    if (conflict && conflict.id !== id) return Response.json({ error: "账号已被其他用户使用" }, { status: 409 });
    await getDb().update(users).set({ account, updatedAt: new Date() }).where(eq(users.id, id));
    await getDb().insert(adminAuditLogs).values({ id: crypto.randomUUID(), adminUserId: admin.id, action: "user.account", targetUserId: id, detail: JSON.stringify({ from: target.account, to: account }) });
    return Response.json({ ok: true, account });
  }
  else return Response.json({ error: "无效操作" }, { status: 400 });
  await getDb().insert(adminAuditLogs).values({ id: crypto.randomUUID(), adminUserId: admin.id, action: `user.${body.action}`, targetUserId: id });
  return Response.json({ ok: true, temporaryPassword });
}

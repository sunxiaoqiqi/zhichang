import { and, count, desc, eq, gte, like, lt, or } from "drizzle-orm";
import { getDb } from "../../../../db";
import { adminAuditLogs, users } from "../../../../db/schema";
import { getCurrentUser } from "../../../auth/session";

export async function GET(request: Request) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") return Response.json({ error: "没有管理员权限" }, { status: 403 });
  const url = new URL(request.url);
  const page = Math.max(1, Number.parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(50, Math.max(10, Number.parseInt(url.searchParams.get("pageSize") ?? "20", 10) || 20));
  const search = url.searchParams.get("search")?.trim() ?? "";
  const category = url.searchParams.get("category")?.trim() ?? "";
  const startValue = Number(url.searchParams.get("start"));
  const endValue = Number(url.searchParams.get("end"));
  const conditions = [];
  if (search) conditions.push(or(like(adminAuditLogs.action, `%${search}%`), like(adminAuditLogs.detail, `%${search}%`))!);
  if (category) conditions.push(like(adminAuditLogs.action, `${category}.%`));
  if (Number.isFinite(startValue) && startValue > 0) conditions.push(gte(adminAuditLogs.createdAt, new Date(startValue)));
  if (Number.isFinite(endValue) && endValue > 0) conditions.push(lt(adminAuditLogs.createdAt, new Date(endValue)));
  const where = conditions.length ? and(...conditions) : undefined;
  const db = getDb();
  const [rows, [{ total }], userRows] = await Promise.all([
    db.select({
      id: adminAuditLogs.id,
      adminUserId: adminAuditLogs.adminUserId,
      actorAccount: users.account,
      action: adminAuditLogs.action,
      targetUserId: adminAuditLogs.targetUserId,
      detail: adminAuditLogs.detail,
      createdAt: adminAuditLogs.createdAt,
    }).from(adminAuditLogs).innerJoin(users, eq(adminAuditLogs.adminUserId, users.id)).where(where).orderBy(desc(adminAuditLogs.createdAt)).limit(pageSize).offset((page - 1) * pageSize),
    db.select({ total: count() }).from(adminAuditLogs).where(where),
    db.select({ id: users.id, account: users.account }).from(users),
  ]);
  const accountMap = new Map(userRows.map((user) => [user.id, user.account]));
  return Response.json({
    logs: rows.map((row) => ({ ...row, targetAccount: row.targetUserId ? accountMap.get(row.targetUserId) ?? "已删除账户" : null })),
    pagination: { page, pageSize, total, pages: Math.max(1, Math.ceil(total / pageSize)) },
  });
}

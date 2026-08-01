import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { adminAuditLogs, devices, loginEvents, questions, users } from "../../../../db/schema";
import { getCurrentUser } from "../../../auth/session";

const cell = (value: unknown) => {
  const raw = String(value ?? "");
  const safe = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replaceAll('"', '""')}"`;
};
const date = (value: Date | null | undefined) => value ? value.toISOString() : "";

function csv(headers: string[], rows: unknown[][]) {
  return `\uFEFF${headers.map(cell).join(",")}\r\n${rows.map((row) => row.map(cell).join(",")).join("\r\n")}`;
}

export async function GET(request: Request) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") return Response.json({ error: "没有管理员权限" }, { status: 403 });
  const type = new URL(request.url).searchParams.get("type") ?? "";
  const db = getDb();
  let content = "";
  let filename = `zhichang-${type}-${new Date().toISOString().slice(0, 10)}.csv`;
  if (type === "users") {
    const rows = await db.select().from(users).orderBy(desc(users.createdAt));
    content = csv(["用户唯一编号", "当前账号名", "角色", "状态", "是否需改密", "备注", "创建时间", "更新时间"], rows.map((row) => [row.id, row.account, row.role, row.status, row.mustChangePassword ? "是" : "否", row.note, date(row.createdAt), date(row.updatedAt)]));
  } else if (type === "devices") {
    const rows = await db.select({ userId: users.id, account: users.account, deviceKey: devices.deviceKey, deviceType: devices.deviceType, browser: devices.browser, os: devices.os, note: devices.note, firstSeenAt: devices.firstSeenAt, lastSeenAt: devices.lastSeenAt })
      .from(devices).innerJoin(users, eq(devices.userId, users.id)).orderBy(desc(devices.lastSeenAt));
    content = csv(["用户唯一编号", "当前账号名", "设备标识", "类型", "浏览器", "系统", "备注", "首次出现", "最近出现"], rows.map((row) => [row.userId, row.account, row.deviceKey, row.deviceType, row.browser, row.os, row.note, date(row.firstSeenAt), date(row.lastSeenAt)]));
  } else if (type === "questions") {
    const rows = await db.select().from(questions).orderBy(desc(questions.updatedAt));
    content = csv(["题目ID", "标题", "题型", "主场景", "难度", "状态", "版本", "完整JSON", "更新时间"], rows.map((row) => [row.id, row.title, row.kind, row.primarySceneId, row.difficulty, row.status, row.version, row.payload, date(row.updatedAt)]));
  } else if (type === "logins") {
    const rows = await db.select().from(loginEvents).orderBy(desc(loginEvents.occurredAt));
    const userRows = await db.select({ id: users.id, account: users.account }).from(users);
    const accountMap = new Map(userRows.map((user) => [user.id, user.account]));
    content = csv(["登录时间", "用户唯一编号", "当前账号名", "登录时账号名", "结果", "设备标识", "登录地", "IP", "国家", "地区", "城市"], rows.map((row) => [date(row.occurredAt), row.userId, row.userId ? accountMap.get(row.userId) ?? row.account : "", row.account, row.success ? "成功" : "失败", row.deviceKey, row.location, row.ip, row.country, row.region, row.city]));
  } else if (type === "audit") {
    const rows = await db.select({ actorId: users.id, actorAccount: users.account, action: adminAuditLogs.action, targetUserId: adminAuditLogs.targetUserId, detail: adminAuditLogs.detail, createdAt: adminAuditLogs.createdAt })
      .from(adminAuditLogs).innerJoin(users, eq(adminAuditLogs.adminUserId, users.id)).orderBy(desc(adminAuditLogs.createdAt));
    content = csv(["操作时间", "操作人编号", "操作人账号名", "操作类型", "目标用户ID", "详情"], rows.map((row) => [date(row.createdAt), row.actorId, row.actorAccount, row.action, row.targetUserId, row.detail]));
  } else return Response.json({ error: "不支持的导出类型" }, { status: 400 });
  await db.insert(adminAuditLogs).values({ id: crypto.randomUUID(), adminUserId: admin.id, action: "data.export", detail: JSON.stringify({ type }) });
  return new Response(content, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="${filename}"`, "cache-control": "no-store" } });
}

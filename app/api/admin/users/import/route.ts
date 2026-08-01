import { getDb } from "../../../../../db";
import { adminAuditLogs, users } from "../../../../../db/schema";
import { hashPassword, randomToken } from "../../../../auth/crypto";
import { getCurrentUser } from "../../../../auth/session";

type ImportRow = { account?: string; note?: string };

export async function POST(request: Request) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") return Response.json({ error: "没有管理员权限" }, { status: 403 });
  const body = await request.json().catch(() => ({})) as { rows?: ImportRow[] };
  if (!Array.isArray(body.rows) || !body.rows.length) return Response.json({ error: "没有可导入的账号" }, { status: 400 });
  if (body.rows.length > 30) return Response.json({ error: "单次最多批量创建 30 个账号" }, { status: 400 });
  const normalized = body.rows.map((row, index) => ({ index: index + 1, account: row.account?.trim() ?? "", note: row.note?.trim().slice(0, 100) ?? "" }));
  const candidates = normalized.filter((row) => /^[A-Za-z0-9_.-]{4,32}$/.test(row.account));
  const existing = await getDb().select({ account: users.account }).from(users);
  const unavailable = new Set(existing.map((row) => row.account.toLowerCase()));
  const created: { account: string; temporaryPassword: string }[] = [];
  const errors: { line: number; account: string; error: string }[] = normalized.filter((row) => !/^[A-Za-z0-9_.-]{4,32}$/.test(row.account)).map((row) => ({ line: row.index, account: row.account, error: "账号格式不正确" }));
  const seen = new Set<string>();
  for (const row of candidates) {
    const accountKey = row.account.toLowerCase();
    if (unavailable.has(accountKey)) { errors.push({ line: row.index, account: row.account, error: "账号已存在" }); continue; }
    if (seen.has(accountKey)) { errors.push({ line: row.index, account: row.account, error: "导入内容中账号重复" }); continue; }
    seen.add(accountKey);
    const temporaryPassword = `Zc${randomToken(6)}9`;
    const secured = await hashPassword(temporaryPassword);
    await getDb().insert(users).values({ id: crypto.randomUUID(), account: row.account, passwordHash: secured.hash, passwordSalt: secured.salt, role: "user", status: "active", mustChangePassword: true, note: row.note });
    created.push({ account: row.account, temporaryPassword });
  }
  await getDb().insert(adminAuditLogs).values({ id: crypto.randomUUID(), adminUserId: admin.id, action: "user.bulk_create", detail: JSON.stringify({ created: created.length, failed: errors.length }) });
  return Response.json({ created, errors });
}

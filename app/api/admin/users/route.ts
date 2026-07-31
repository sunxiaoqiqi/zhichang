import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { adminAuditLogs, users } from "../../../../db/schema";
import { hashPassword, randomToken } from "../../../auth/crypto";
import { getCurrentUser } from "../../../auth/session";

export async function GET() {
  const rows = await getDb().select({ id: users.id, account: users.account, role: users.role, status: users.status, mustChangePassword: users.mustChangePassword, note: users.note, createdAt: users.createdAt, updatedAt: users.updatedAt }).from(users).orderBy(desc(users.createdAt));
  return Response.json({ users: rows });
}

export async function POST(request: Request) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") return Response.json({ error: "没有管理员权限" }, { status: 403 });
  const { account, note = "", role = "user" } = await request.json() as { account?: string; note?: string; role?: "user" | "admin" };
  const normalized = account?.trim() ?? "";
  if (!/^[A-Za-z0-9_.-]{4,32}$/.test(normalized)) return Response.json({ error: "账号需为 4—32 位字母、数字或 ._-" }, { status: 400 });
  const exists = await getDb().select({ id: users.id }).from(users).where(eq(users.account, normalized)).limit(1);
  if (exists.length) return Response.json({ error: "账号已存在" }, { status: 409 });
  const temporaryPassword = `Zc${randomToken(6)}9`;
  const secured = await hashPassword(temporaryPassword);
  const id = crypto.randomUUID();
  await getDb().insert(users).values({ id, account: normalized, passwordHash: secured.hash, passwordSalt: secured.salt, role, status: "active", mustChangePassword: true, note: note.trim() });
  await getDb().insert(adminAuditLogs).values({ id: crypto.randomUUID(), adminUserId: admin.id, action: "user.create", targetUserId: id, detail: JSON.stringify({ account: normalized, role }) });
  return Response.json({ user: { id, account: normalized, role }, temporaryPassword }, { status: 201 });
}

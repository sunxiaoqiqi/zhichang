import { count } from "drizzle-orm";
import { getDb } from "../../../db";
import { users } from "../../../db/schema";
import { hashPassword, validatePassword } from "../../auth/crypto";
import { createSession } from "../../auth/session";

export async function GET() {
  const [{ value }] = await getDb().select({ value: count() }).from(users);
  return Response.json({ available: value === 0 });
}

export async function POST(request: Request) {
  const db = getDb();
  const [{ value }] = await db.select({ value: count() }).from(users);
  if (value !== 0) return Response.json({ error: "系统已经完成初始化" }, { status: 409 });
  const { account, password } = await request.json() as { account?: string; password?: string };
  const normalized = account?.trim() ?? "";
  if (!/^[A-Za-z0-9_.-]{4,32}$/.test(normalized)) return Response.json({ error: "账号需为 4—32 位字母、数字或 ._-" }, { status: 400 });
  const validation = validatePassword(password ?? "");
  if (validation) return Response.json({ error: validation }, { status: 400 });
  const secured = await hashPassword(password!);
  const id = crypto.randomUUID();
  await db.insert(users).values({ id, account: normalized, passwordHash: secured.hash, passwordSalt: secured.salt, role: "admin", status: "active", mustChangePassword: false });
  await createSession(id);
  return Response.json({ ok: true });
}

import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { users } from "../../../../db/schema";
import { verifyPassword } from "../../../auth/crypto";
import { createSession } from "../../../auth/session";

export async function POST(request: Request) {
  const { account, password } = await request.json() as { account?: string; password?: string };
  if (!account?.trim() || !password) return Response.json({ error: "请输入账号和密码" }, { status: 400 });
  const [user] = await getDb().select().from(users).where(eq(users.account, account.trim())).limit(1);
  if (!user || user.status !== "active" || !await verifyPassword(password, user.passwordSalt, user.passwordHash)) return Response.json({ error: "账号或密码错误" }, { status: 401 });
  await createSession(user.id);
  return Response.json({ user: { account: user.account, role: user.role, mustChangePassword: user.mustChangePassword } });
}

import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { users } from "../../../../db/schema";
import { describeRequestDevice, ensureDevice, recordLogin } from "../../../auth/device";
import { verifyPassword } from "../../../auth/crypto";
import { createSession } from "../../../auth/session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { account?: string; password?: string; deviceKey?: string };
  const account = body.account?.trim() ?? "";
  const device = describeRequestDevice(request, body.deviceKey);
  if (!account || !body.password) return Response.json({ error: "请输入账号和密码" }, { status: 400 });

  const [user] = await getDb().select().from(users).where(eq(users.account, account)).limit(1);
  const valid = Boolean(user && user.status === "active" && await verifyPassword(body.password, user.passwordSalt, user.passwordHash));
  if (!valid || !user) {
    await recordLogin(request, { account, success: false, userId: user?.id, device });
    return Response.json({ error: "账号或密码错误" }, { status: 401 });
  }

  const deviceId = await ensureDevice(user.id, device);
  await recordLogin(request, { account, success: true, userId: user.id, deviceId, device });
  await createSession(user.id, deviceId);
  return Response.json({ user: { account: user.account, role: user.role, mustChangePassword: user.mustChangePassword } });
}

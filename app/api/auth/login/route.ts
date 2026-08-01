import { and, count, eq, gte, sql } from "drizzle-orm";
import { getDb } from "../../../../db";
import { loginEvents, users } from "../../../../db/schema";
import { describeRequestDevice, describeRequestLocation, ensureDevice, recordLogin } from "../../../auth/device";
import { verifyPassword } from "../../../auth/crypto";
import { createSession } from "../../../auth/session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { account?: string; password?: string; deviceKey?: string };
  const account = body.account?.trim() ?? "";
  const device = describeRequestDevice(request, body.deviceKey);
  if (!account || !body.password) return Response.json({ error: "请输入账号和密码" }, { status: 400 });

  const location = describeRequestLocation(request);
  const [{ failures }] = await getDb().select({ failures: count() }).from(loginEvents).where(and(
    eq(loginEvents.account, account),
    eq(loginEvents.ip, location.ip),
    eq(loginEvents.success, false),
    gte(loginEvents.occurredAt, new Date(Date.now() - 15 * 60 * 1000)),
  ));
  if (failures >= 10) return Response.json({ error: "尝试次数过多，请 15 分钟后再试" }, { status: 429, headers: { "retry-after": "900" } });

  const [user] = await getDb().select().from(users).where(sql`lower(${users.account}) = lower(${account})`).limit(1);
  const valid = Boolean(user && user.status === "active" && await verifyPassword(body.password, user.passwordSalt, user.passwordHash));
  if (!valid || !user) {
    await recordLogin(request, { account, success: false, userId: user?.id, device });
    return Response.json({ error: "账号或密码错误" }, { status: 401 });
  }

  const deviceId = await ensureDevice(user.id, device);
  await recordLogin(request, { account: user.account, success: true, userId: user.id, deviceId, device });
  await createSession(user.id, deviceId);
  return Response.json({ user: { account: user.account, role: user.role, mustChangePassword: user.mustChangePassword } });
}

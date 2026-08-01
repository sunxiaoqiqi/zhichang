import { eq, inArray } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { activitySessions, adminAuditLogs, authSessions, devices } from "../../../../../db/schema";
import { getCurrentUser } from "../../../../auth/session";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") return Response.json({ error: "没有管理员权限" }, { status: 403 });
  const { id } = await context.params;
  const body = await request.json().catch(() => ({})) as { action?: "note" | "logout"; note?: string };
  const [device] = await getDb().select().from(devices).where(eq(devices.id, id)).limit(1);
  if (!device) return Response.json({ error: "设备不存在" }, { status: 404 });
  if (body.action === "note") {
    await getDb().update(devices).set({ note: body.note?.trim().slice(0, 100) ?? "" }).where(eq(devices.id, id));
  } else if (body.action === "logout") {
    const sessions = await getDb().select({ id: authSessions.id }).from(authSessions).where(eq(authSessions.deviceId, id));
    if (sessions.length) {
      const ids = sessions.map((row) => row.id);
      await getDb().update(activitySessions).set({ endedAt: new Date(), wasActive: false }).where(inArray(activitySessions.authSessionId, ids));
      await getDb().delete(authSessions).where(eq(authSessions.deviceId, id));
    }
  } else return Response.json({ error: "无效操作" }, { status: 400 });
  await getDb().insert(adminAuditLogs).values({ id: crypto.randomUUID(), adminUserId: admin.id, targetUserId: device.userId, action: `device.${body.action}`, detail: JSON.stringify({ deviceId: id }) });
  return Response.json({ ok: true });
}

import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { activitySessions, authSessions, devices } from "../../../../db/schema";
import { describeRequestDevice, ensureDevice } from "../../../auth/device";
import { getCurrentSession } from "../../../auth/session";

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) return Response.json({ error: "请先登录" }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { active?: boolean; deviceKey?: string };
  const active = body.active === true;
  let deviceId = session.deviceId;
  if (!deviceId) {
    deviceId = await ensureDevice(session.id, describeRequestDevice(request, body.deviceKey));
    await getDb().update(authSessions).set({ deviceId }).where(eq(authSessions.id, session.sessionId));
  }

  const now = new Date();
  const [activity] = await getDb().select().from(activitySessions).where(eq(activitySessions.authSessionId, session.sessionId)).limit(1);
  let activeSeconds = activity?.activeSeconds ?? 0;
  if (!activity) {
    await getDb().insert(activitySessions).values({ id: crypto.randomUUID(), authSessionId: session.sessionId, userId: session.id, deviceId, startedAt: now, lastHeartbeatAt: now, wasActive: active });
  } else {
    const gap = Math.max(0, Math.floor((now.getTime() - activity.lastHeartbeatAt.getTime()) / 1000));
    const increment = activity.wasActive && gap <= 90 ? gap : 0;
    activeSeconds += increment;
    await getDb().update(activitySessions).set({ deviceId, activeSeconds, lastHeartbeatAt: now, wasActive: active, endedAt: null }).where(eq(activitySessions.id, activity.id));
  }
  await getDb().update(authSessions).set({ lastSeenAt: now }).where(eq(authSessions.id, session.sessionId));
  if (deviceId) await getDb().update(devices).set({ lastSeenAt: now }).where(eq(devices.id, deviceId));
  return Response.json({ ok: true, activeSeconds });
}

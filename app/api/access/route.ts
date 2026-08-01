import { and, count, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { trainingRuns } from "../../../db/schema";
import { effectiveAccessPlan, FREE_LESSON_LIMIT, FREE_TRAINING_LIMIT } from "../../auth/access";
import { getCurrentUser } from "../../auth/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "请先登录" }, { status: 401 });
  const db = getDb();
  const plan = effectiveAccessPlan(user);
  const [[usage], [active]] = await Promise.all([
    db.select({ value: count() }).from(trainingRuns).where(eq(trainingRuns.userId, user.id)),
    db.select({ id: trainingRuns.id }).from(trainingRuns).where(and(eq(trainingRuns.userId, user.id), eq(trainingRuns.status, "active"))).limit(1),
  ]);
  const limit = plan === "free" ? FREE_TRAINING_LIMIT : null;
  return Response.json({ access: {
    plan,
    storedPlan: user.accessPlan,
    lessonLimit: plan === "free" ? FREE_LESSON_LIMIT : 26,
    training: { limit, used: usage.value, remaining: limit === null ? null : Math.max(0, limit - usage.value), active: Boolean(active) },
  } });
}

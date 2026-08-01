import { and, count, desc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { questions, trainingAttempts, trainingRuns } from "../../../../db/schema";
import { effectiveAccessPlan, FREE_TRAINING_LIMIT } from "../../../auth/access";
import { getCurrentUser } from "../../../auth/session";
import { assembleTrainingSession, type TrainingHistory, type TrainingQuestion } from "../../../training-data";

function parseIds(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

async function historyFor(userId: string): Promise<TrainingHistory> {
  const attempts = await getDb().select().from(trainingAttempts).where(eq(trainingAttempts.userId, userId)).orderBy(desc(trainingAttempts.createdAt));
  const byQuestion = new Map<string, { attempts: number; correct: number; last: number }>();
  const byScene = new Map<string, { assigned: number; completed: number; last: number }>();
  for (const item of attempts) {
    const q = byQuestion.get(item.questionId) ?? { attempts: 0, correct: 0, last: item.createdAt.getTime() };
    q.attempts += 1;
    q.correct += item.correct ? 1 : 0;
    byQuestion.set(item.questionId, q);
    const s = byScene.get(item.primarySceneId) ?? { assigned: 0, completed: 0, last: item.createdAt.getTime() };
    s.assigned += 1;
    s.completed += 1;
    byScene.set(item.primarySceneId, s);
  }
  return {
    questions: [...byQuestion].map(([questionId, value]) => ({ questionId, attempts: value.attempts, correctAttempts: value.correct, lastAttemptedAt: value.last })),
    scenes: [...byScene].map(([sceneId, value]) => ({ sceneId: sceneId as `scene-${number}`, assignedCount: value.assigned, completedCount: value.completed, lastAssignedAt: value.last })),
    recentQuestionIds: attempts.slice(0, 15).map((item) => item.questionId),
  };
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "请先登录" }, { status: 401 });
  const db = getDb();
  const plan = effectiveAccessPlan(user);
  const history = await historyFor(user.id);
  const allRows = await db.select().from(questions);
  const questionMap = new Map(allRows.map((row) => [row.id, JSON.parse(row.payload) as TrainingQuestion]));
  let [run] = await db.select().from(trainingRuns).where(and(eq(trainingRuns.userId, user.id), eq(trainingRuns.status, "active"))).orderBy(desc(trainingRuns.startedAt)).limit(1);

  if (!run) {
    const [usage] = await db.select({ value: count() }).from(trainingRuns).where(eq(trainingRuns.userId, user.id));
    if (plan === "free" && usage.value >= FREE_TRAINING_LIMIT) {
      return Response.json({
        error: "免费版的 1 次训练额度已使用完，请联系管理员开通收费版",
        code: "FREE_TRAINING_EXHAUSTED",
        access: { plan, limit: FREE_TRAINING_LIMIT, used: usage.value, remaining: 0 },
      }, { status: 403 });
    }
    const published = allRows.filter((row) => row.status === "published").map((row) => questionMap.get(row.id)!).filter(Boolean);
    const selected = assembleTrainingSession(history, Math.random, published);
    if (!selected.length) return Response.json({ error: "题库暂无可用题目，请联系管理员" }, { status: 503 });
    const id = crypto.randomUUID();
    await db.insert(trainingRuns).values({ id, userId: user.id, questionIds: JSON.stringify(selected.map((question) => question.id)) });
    [run] = await db.select().from(trainingRuns).where(eq(trainingRuns.id, id)).limit(1);
  }

  const questionIds = parseIds(run.questionIds);
  const answeredQuestionIds = parseIds(run.answeredQuestionIds);
  return Response.json({
    questions: questionIds.map((id) => questionMap.get(id)).filter((question): question is TrainingQuestion => Boolean(question)),
    history,
    run: { id: run.id, answeredQuestionIds },
    access: { plan, limit: plan === "free" ? FREE_TRAINING_LIMIT : null },
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "请先登录" }, { status: 401 });
  const body = await request.json() as { runId?: string; questionId?: string; correct?: boolean; answerPayload?: unknown };
  if (!body.runId || !body.questionId) return Response.json({ error: "答题记录不完整" }, { status: 400 });
  const db = getDb();
  const [run] = await db.select().from(trainingRuns).where(and(eq(trainingRuns.id, body.runId), eq(trainingRuns.userId, user.id))).limit(1);
  if (!run || run.status !== "active") return Response.json({ error: "本次训练已结束，请重新进入训练", code: "TRAINING_RUN_CLOSED" }, { status: 409 });
  const questionIds = parseIds(run.questionIds);
  const answeredQuestionIds = parseIds(run.answeredQuestionIds);
  if (!questionIds.includes(body.questionId)) return Response.json({ error: "题目不属于本次训练" }, { status: 400 });
  if (answeredQuestionIds.includes(body.questionId)) return Response.json({ ok: true, completed: answeredQuestionIds.length >= questionIds.length });
  const [questionRow] = await db.select({ payload: questions.payload }).from(questions).where(eq(questions.id, body.questionId)).limit(1);
  if (!questionRow) return Response.json({ error: "题目不存在" }, { status: 404 });
  const question = JSON.parse(questionRow.payload) as TrainingQuestion;
  const nextAnswered = [...answeredQuestionIds, body.questionId];
  const completed = nextAnswered.length >= questionIds.length;
  await db.insert(trainingAttempts).values({ id: crypto.randomUUID(), userId: user.id, questionId: body.questionId, primarySceneId: question.primarySceneId, correct: Boolean(body.correct), answerPayload: JSON.stringify(body.answerPayload ?? {}) });
  await db.update(trainingRuns).set({ answeredQuestionIds: JSON.stringify(nextAnswered), status: completed ? "completed" : "active", completedAt: completed ? new Date() : null }).where(eq(trainingRuns.id, run.id));
  return Response.json({ ok: true, completed });
}

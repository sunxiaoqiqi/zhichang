import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { questions, trainingAttempts } from "../../../../db/schema";
import { getCurrentUser } from "../../../auth/session";
import type { TrainingHistory, TrainingQuestion } from "../../../training-data";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "请先登录" }, { status: 401 });
  const rows = await getDb().select().from(questions).where(eq(questions.status, "published"));
  const attempts = await getDb().select().from(trainingAttempts).where(eq(trainingAttempts.userId, user.id)).orderBy(desc(trainingAttempts.createdAt));
  const byQuestion = new Map<string, { attempts: number; correct: number; last: number }>();
  const byScene = new Map<string, { assigned: number; completed: number; last: number }>();
  for (const item of attempts) {
    const q = byQuestion.get(item.questionId) ?? { attempts: 0, correct: 0, last: item.createdAt.getTime() };
    q.attempts += 1; q.correct += item.correct ? 1 : 0; byQuestion.set(item.questionId, q);
    const s = byScene.get(item.primarySceneId) ?? { assigned: 0, completed: 0, last: item.createdAt.getTime() };
    s.assigned += 1; s.completed += 1; byScene.set(item.primarySceneId, s);
  }
  const history: TrainingHistory = { questions: [...byQuestion].map(([questionId,v])=>({questionId,attempts:v.attempts,correctAttempts:v.correct,lastAttemptedAt:v.last})), scenes: [...byScene].map(([sceneId,v])=>({sceneId:sceneId as `scene-${number}`,assignedCount:v.assigned,completedCount:v.completed,lastAssignedAt:v.last})), recentQuestionIds: attempts.slice(0,15).map(item=>item.questionId) };
  return Response.json({ questions: rows.map(row=>JSON.parse(row.payload) as TrainingQuestion), history });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "请先登录" }, { status: 401 });
  const body = await request.json() as { questionId?: string; primarySceneId?: string; correct?: boolean; answerPayload?: unknown };
  if (!body.questionId || !body.primarySceneId) return Response.json({ error: "答题记录不完整" }, { status: 400 });
  await getDb().insert(trainingAttempts).values({ id: crypto.randomUUID(), userId: user.id, questionId: body.questionId, primarySceneId: body.primarySceneId, correct: Boolean(body.correct), answerPayload: JSON.stringify(body.answerPayload ?? {}) });
  return Response.json({ ok: true });
}

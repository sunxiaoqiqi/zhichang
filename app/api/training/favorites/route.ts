import { and, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { favorites, questions } from "../../../../db/schema";
import { getCurrentUser } from "../../../auth/session";
import type { TrainingQuestion } from "../../../training-data";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "请先登录" }, { status: 401 });
  const rows = await getDb()
    .select({ questionId: favorites.questionId, payload: questions.payload })
    .from(favorites)
    .innerJoin(questions, eq(favorites.questionId, questions.id))
    .where(and(eq(favorites.userId, user.id), eq(questions.status, "published")));
  return Response.json({ favorites: rows.map((row) => row.questionId), questions: rows.map((row) => JSON.parse(row.payload) as TrainingQuestion) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "请先登录" }, { status: 401 });
  const { questionId, favorite } = await request.json() as { questionId?: string; favorite?: boolean };
  if (!questionId) return Response.json({ error: "缺少题目" }, { status: 400 });
  if (favorite) await getDb().insert(favorites).values({ id: crypto.randomUUID(), userId: user.id, questionId }).onConflictDoNothing();
  else await getDb().delete(favorites).where(and(eq(favorites.userId, user.id), eq(favorites.questionId, questionId)));
  return Response.json({ ok: true });
}

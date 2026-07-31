import { and, eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { favorites, questions } from "../../../../../db/schema";
import { getCurrentUser } from "../../../../auth/session";
import type { TrainingQuestion } from "../../../../training-data";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "请先登录" }, { status: 401 });
  const { id } = await context.params;
  const [row] = await getDb().select().from(questions).where(and(eq(questions.id, id), eq(questions.status, "published"))).limit(1);
  if (!row) return Response.json({ error: "题目不存在或已下线" }, { status: 404 });
  const [favorite] = await getDb().select({ id: favorites.id }).from(favorites).where(and(eq(favorites.userId, user.id), eq(favorites.questionId, id))).limit(1);
  return Response.json({ question: JSON.parse(row.payload) as TrainingQuestion, favorite: Boolean(favorite) });
}

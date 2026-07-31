import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { adminAuditLogs, questions } from "../../../../db/schema";
import { getCurrentUser } from "../../../auth/session";
import type { TrainingQuestion } from "../../../training-data";

export async function GET() {
  const rows = await getDb().select().from(questions).orderBy(desc(questions.updatedAt));
  return Response.json({ questions: rows.map((row) => ({ ...row, payload: JSON.parse(row.payload) })) });
}

export async function POST(request: Request) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") return Response.json({ error: "没有管理员权限" }, { status: 403 });
  const item = await request.json() as TrainingQuestion;
  if (!item.id?.trim() || !item.title?.trim()) return Response.json({ error: "题目 ID 和标题不能为空" }, { status: 400 });
  const exists = await getDb().select({ id: questions.id }).from(questions).where(eq(questions.id, item.id)).limit(1);
  if (exists.length) return Response.json({ error: "题目 ID 已存在" }, { status: 409 });
  await getDb().insert(questions).values({ id: item.id, title: item.title, kind: item.kind, primarySceneId: item.primarySceneId, difficulty: item.difficulty, status: item.status, payload: JSON.stringify(item), version: item.version });
  await getDb().insert(adminAuditLogs).values({ id: crypto.randomUUID(), adminUserId: admin.id, action: "question.create", detail: JSON.stringify({ questionId: item.id }) });
  return Response.json({ question: item }, { status: 201 });
}

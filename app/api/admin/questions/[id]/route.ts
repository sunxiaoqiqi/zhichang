import { eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { adminAuditLogs, questions } from "../../../../../db/schema";
import { getCurrentUser } from "../../../../auth/session";
import type { TrainingQuestion } from "../../../../training-data";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") return Response.json({ error: "没有管理员权限" }, { status: 403 });
  const { id } = await context.params;
  const item = await request.json() as TrainingQuestion;
  await getDb().update(questions).set({ title: item.title, kind: item.kind, primarySceneId: item.primarySceneId, difficulty: item.difficulty, status: item.status, payload: JSON.stringify({ ...item, id }), version: item.version + 1, updatedAt: new Date() }).where(eq(questions.id, id));
  await getDb().insert(adminAuditLogs).values({ id: crypto.randomUUID(), adminUserId: admin.id, action: "question.update", detail: JSON.stringify({ questionId: id }) });
  return Response.json({ ok: true });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") return Response.json({ error: "没有管理员权限" }, { status: 403 });
  const { id } = await context.params;
  const [item] = await getDb().select({ id: questions.id }).from(questions).where(eq(questions.id, id)).limit(1);
  if (!item) return Response.json({ error: "题目不存在" }, { status: 404 });
  await getDb().update(questions).set({ status: "retired", updatedAt: new Date() }).where(eq(questions.id, id));
  await getDb().insert(adminAuditLogs).values({ id: crypto.randomUUID(), adminUserId: admin.id, action: "question.delete", detail: JSON.stringify({ questionId: id, mode: "soft-delete" }) });
  return Response.json({ ok: true });
}

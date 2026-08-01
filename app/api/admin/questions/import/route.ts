import { inArray } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { adminAuditLogs, questions } from "../../../../../db/schema";
import { getCurrentUser } from "../../../../auth/session";
import type { TrainingQuestion } from "../../../../training-data";

function valid(item: TrainingQuestion) {
  return Boolean(item?.id?.trim() && item?.title?.trim()
    && ["simple", "deep", "branching"].includes(item.kind)
    && /^scene-(?:[1-9]|1\d|2[0-6])$/.test(item.primarySceneId)
    && ["easy", "medium", "hard"].includes(item.difficulty)
    && ["draft", "published", "retired"].includes(item.status));
}

export async function POST(request: Request) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") return Response.json({ error: "没有管理员权限" }, { status: 403 });
  const body = await request.json().catch(() => null) as TrainingQuestion[] | { questions?: TrainingQuestion[] } | null;
  const items = Array.isArray(body) ? body : body?.questions;
  if (!Array.isArray(items) || !items.length) return Response.json({ error: "JSON 中没有题目数组" }, { status: 400 });
  if (items.length > 100) return Response.json({ error: "单次最多导入 100 道题" }, { status: 400 });
  const ids = items.map((item) => item?.id?.trim()).filter(Boolean) as string[];
  const existing = ids.length ? await getDb().select({ id: questions.id }).from(questions).where(inArray(questions.id, [...new Set(ids)])) : [];
  const unavailable = new Set(existing.map((row) => row.id));
  const seen = new Set<string>();
  const imported: string[] = [];
  const errors: { index: number; id: string; error: string }[] = [];
  for (const [index, item] of items.entries()) {
    const id = item?.id?.trim() ?? "";
    if (!valid(item)) { errors.push({ index: index + 1, id, error: "题目结构或枚举值不正确" }); continue; }
    if (unavailable.has(id)) { errors.push({ index: index + 1, id, error: "题目 ID 已存在" }); continue; }
    if (seen.has(id)) { errors.push({ index: index + 1, id, error: "导入内容中 ID 重复" }); continue; }
    seen.add(id);
    const payload = { ...item, id, version: item.version || 1 } as TrainingQuestion;
    await getDb().insert(questions).values({ id, title: item.title.trim(), kind: item.kind, primarySceneId: item.primarySceneId, difficulty: item.difficulty, status: item.status, payload: JSON.stringify(payload), version: payload.version });
    imported.push(id);
  }
  await getDb().insert(adminAuditLogs).values({ id: crypto.randomUUID(), adminUserId: admin.id, action: "question.bulk_import", detail: JSON.stringify({ imported: imported.length, failed: errors.length }) });
  return Response.json({ imported, errors });
}

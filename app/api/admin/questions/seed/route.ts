import { getDb } from "../../../../../db";
import { adminAuditLogs, questions, trainingScenes as sceneTable } from "../../../../../db/schema";
import { getCurrentUser } from "../../../../auth/session";
import { trainingQuestions, trainingScenes } from "../../../../training-data";

export async function POST() {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "admin") return Response.json({ error: "没有管理员权限" }, { status: 403 });
    for (const scene of trainingScenes) await getDb().insert(sceneTable).values({ id: scene.id, lessonNumber: scene.lessonNumber, title: scene.title, phase: scene.phase }).onConflictDoNothing();
    let imported = 0;
    for (const item of trainingQuestions) {
      const result = await getDb().insert(questions).values({ id: item.id, title: item.title, kind: item.kind, primarySceneId: item.primarySceneId, difficulty: item.difficulty, status: item.status, payload: JSON.stringify(item), version: item.version }).onConflictDoNothing();
      imported += result.meta.changes;
    }
    const skipped = trainingQuestions.length - imported;
    await getDb().insert(adminAuditLogs).values({ id: crypto.randomUUID(), adminUserId: admin.id, action: "question.seed", detail: JSON.stringify({ imported, skipped }) });
    return Response.json({ imported, skipped });
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知数据库错误";
    return Response.json({ error: `导入失败：${message}` }, { status: 500 });
  }
}

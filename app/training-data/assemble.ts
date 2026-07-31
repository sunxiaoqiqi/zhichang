import { trainingQuestions } from "./questions";
import { trainingScenes } from "./scenes";
import type { QuestionKind, SceneId, TrainingHistory, TrainingQuestion } from "./types";

export const SESSION_MIX: Record<QuestionKind, number> = { simple: 3, deep: 1, branching: 1 };

type Random = () => number;

const emptyHistory: TrainingHistory = { questions: [], scenes: [], recentQuestionIds: [] };

export function assembleTrainingSession(
  history: TrainingHistory = emptyHistory,
  random: Random = Math.random,
): TrainingQuestion[] {
  const questionHistory = new Map(history.questions.map((item) => [item.questionId, item]));
  const sceneHistory = new Map(history.scenes.map((item) => [item.sceneId, item]));
  const recent = new Set(history.recentQuestionIds.slice(0, 15));
  const selected: TrainingQuestion[] = [];
  const selectedScenes = new Set<SceneId>();

  const score = (question: TrainingQuestion) => {
    const qh = questionHistory.get(question.id);
    const sh = sceneHistory.get(question.primarySceneId);
    const unseenBonus = qh ? 0 : 1_000;
    const sceneDebt = 500 - (sh?.assignedCount ?? 0) * 40;
    const weakness = qh && qh.attempts > 0 ? (1 - qh.correctAttempts / qh.attempts) * 180 : 0;
    const recencyPenalty = recent.has(question.id) ? 600 : 0;
    const duplicateScenePenalty = selectedScenes.has(question.primarySceneId) ? 800 : 0;
    return unseenBonus + sceneDebt + weakness - recencyPenalty - duplicateScenePenalty + random();
  };

  for (const [kind, count] of Object.entries(SESSION_MIX) as Array<[QuestionKind, number]>) {
    const candidates = trainingQuestions
      .filter((question) => question.status === "published" && question.kind === kind)
      .sort((a, b) => score(b) - score(a));
    for (const question of candidates.slice(0, count)) {
      selected.push(question);
      selectedScenes.add(question.primarySceneId);
    }
  }

  return selected.sort(() => random() - 0.5);
}

export function getCoverageReport(questions: TrainingQuestion[] = trainingQuestions) {
  return trainingScenes.map((scene) => {
    const primary = questions.filter((question) => question.primarySceneId === scene.id);
    return {
      sceneId: scene.id,
      lessonNumber: scene.lessonNumber,
      title: scene.title,
      total: primary.length,
      simple: primary.filter((question) => question.kind === "simple").length,
      deep: primary.filter((question) => question.kind === "deep").length,
      branching: primary.filter((question) => question.kind === "branching").length,
    };
  });
}

export function validateQuestionBank(questions: TrainingQuestion[] = trainingQuestions): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const sceneIds = new Set(trainingScenes.map((scene) => scene.id));

  for (const question of questions) {
    if (ids.has(question.id)) errors.push(`重复题目 ID：${question.id}`);
    ids.add(question.id);
    if (!sceneIds.has(question.primarySceneId)) errors.push(`${question.id} 的主场景不存在`);
    if (question.courseReference.lessonNumber < 1 || question.courseReference.lessonNumber > 26) errors.push(`${question.id} 的课程链接无效`);
    if (question.kind === "simple" && question.choices.filter((choice) => choice.correct).length !== 1) errors.push(`${question.id} 必须且只能有一个正确答案`);
    if (question.kind === "branching") {
      const nodeIds = new Set(question.nodes.map((node) => node.id));
      if (!nodeIds.has(question.startNodeId)) errors.push(`${question.id} 的起始节点不存在`);
      for (const node of question.nodes) for (const choice of node.choices) {
        if (choice.nextNodeId && !nodeIds.has(choice.nextNodeId)) errors.push(`${question.id} 存在无效分支 ${choice.nextNodeId}`);
      }
    }
  }
  return errors;
}

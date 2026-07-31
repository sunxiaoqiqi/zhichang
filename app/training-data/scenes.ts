import type { SceneId } from "./types";

export type TrainingScene = {
  id: SceneId;
  lessonNumber: number;
  title: string;
  phase: "敢沟通" | "会协作" | "能向上表达" | "守住边界" | "处理冲突" | "建立影响力";
  href: `/lesson-${number}`;
};

const titles = [
  "新人如何自然开口", "如何加入同事的话题", "不知道说什么时怎么办", "如何判断自己是否被排挤",
  "如何确认任务要求", "如何正确接收任务", "如何催促同事", "工作出错后如何汇报", "如何应对临时任务",
  "被领导批评时怎么回应", "被领导误会时如何澄清", "如何向领导提出不同意见", "如何回应加班要求", "如何看待领导的口头承诺",
  "如何拒绝同事帮忙", "如何回应隐私问题", "如何制止反复占便宜", "如何应对越级派活",
  "被同事甩锅怎么办", "被公开批评怎么办", "如何回应阴阳怪气", "开会被反驳怎么办",
  "如何让成果被看见", "功劳被抢怎么办", "如何在会议中影响决策", "如何争取资源和机会",
] as const;

function phaseFor(lessonNumber: number): TrainingScene["phase"] {
  if (lessonNumber <= 4) return "敢沟通";
  if (lessonNumber <= 9) return "会协作";
  if (lessonNumber <= 14) return "能向上表达";
  if (lessonNumber <= 18) return "守住边界";
  if (lessonNumber <= 22) return "处理冲突";
  return "建立影响力";
}

export const trainingScenes: TrainingScene[] = titles.map((title, index) => {
  const lessonNumber = index + 1;
  return {
    id: `scene-${lessonNumber}`,
    lessonNumber,
    title,
    phase: phaseFor(lessonNumber),
    href: `/lesson-${lessonNumber}`,
  } as TrainingScene;
});

export const sceneById = Object.fromEntries(trainingScenes.map((scene) => [scene.id, scene])) as Record<SceneId, TrainingScene>;

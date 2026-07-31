export type SceneId = `scene-${number}`;

export type QuestionKind = "simple" | "deep" | "branching";
export type Difficulty = "easy" | "medium" | "hard";

export type CourseReference = {
  lessonNumber: number;
  lessonTitle: string;
  section: string;
  href: `/lesson-${number}`;
};

export type Choice = {
  id: string;
  text: string;
  correct: boolean;
  feedback: string;
  nextNodeId?: string;
};

type QuestionBase = {
  id: string;
  title: string;
  kind: QuestionKind;
  primarySceneId: SceneId;
  relatedSceneIds: SceneId[];
  difficulty: Difficulty;
  knowledgePoints: string[];
  courseReference: CourseReference;
  status: "draft" | "published" | "retired";
  version: number;
};

export type SimpleQuestion = QuestionBase & {
  kind: "simple";
  prompt: string;
  choices: Choice[];
};

export type DeepQuestion = QuestionBase & {
  kind: "deep";
  caseBackground: string;
  scenes: Array<{
    id: string;
    context: string;
    prompt: string;
    choices: Choice[];
  }>;
  summary: string;
};

export type BranchingQuestion = QuestionBase & {
  kind: "branching";
  caseBackground: string;
  startNodeId: string;
  nodes: Array<{
    id: string;
    context: string;
    prompt: string;
    choices: Choice[];
    terminal?: boolean;
  }>;
  pathSummary: string;
};

export type TrainingQuestion = SimpleQuestion | DeepQuestion | BranchingQuestion;

export type UserQuestionHistory = {
  questionId: string;
  attempts: number;
  correctAttempts: number;
  lastAttemptedAt: number;
};

export type UserSceneHistory = {
  sceneId: SceneId;
  assignedCount: number;
  completedCount: number;
  lastAssignedAt?: number;
};

export type TrainingHistory = {
  questions: UserQuestionHistory[];
  scenes: UserSceneHistory[];
  recentQuestionIds: string[];
};

import type { BranchingQuestion, DeepQuestion, SimpleQuestion, TrainingQuestion } from "./types";
import { batch01Questions } from "./questions-batch-01";
import { remainingQuestions } from "./questions-remaining";

const course = (lessonNumber: number, lessonTitle: string, section: string) => ({
  lessonNumber, lessonTitle, section, href: `/lesson-${lessonNumber}` as `/lesson-${number}`,
});

const simpleQuestions: SimpleQuestion[] = [
  {
    id: "simple-005-01", title: "模糊任务能直接开工吗", kind: "simple", primarySceneId: "scene-5", relatedSceneIds: ["scene-6"], difficulty: "easy",
    knowledgePoints: ["任务清晰度三检"], courseReference: course(5, "如何确认任务要求", "任务清晰度三检"), status: "published", version: 1,
    prompt: "领导说：‘把最近客户反馈整理一下，尽快给我。’你最应该先做什么？",
    choices: [
      { id: "a", text: "按自己的理解先整理", correct: false, feedback: "用途、范围、形式和时间都不清楚，直接开工容易返工。" },
      { id: "b", text: "确认用途、客户范围、交付形式和截止时间", correct: true, feedback: "这些信息会直接改变任务方向和工作量。" },
      { id: "c", text: "让领导写出全部操作步骤", correct: false, feedback: "确认关键变量不等于把执行思考全部推回给领导。" },
    ],
  },
  {
    id: "simple-007-01", title: "怎样催办更有效", kind: "simple", primarySceneId: "scene-7", relatedSceneIds: ["scene-6"], difficulty: "easy",
    knowledgePoints: ["催办三点法"], courseReference: course(7, "如何催促同事", "催办三点法"), status: "published", version: 1,
    prompt: "同事承诺上午给你的数据到下午还没有发，哪种表达更合适？",
    choices: [
      { id: "a", text: "数据好了吗？我都等半天了。", correct: false, feedback: "没有说明影响，也没有形成新的行动节点。" },
      { id: "b", text: "报告 4 点要汇总，目前还缺你的数据。你能在 3 点前发吗？如有困难请告诉我。", correct: true, feedback: "说明了事项、影响、时间，也为困难留出了沟通入口。" },
      { id: "c", text: "算了，我自己想办法。", correct: false, feedback: "这会掩盖依赖问题，并把责任转移到自己身上。" },
    ],
  },
  {
    id: "simple-008-01", title: "错误正在扩散时先做什么", kind: "simple", primarySceneId: "scene-8", relatedSceneIds: [], difficulty: "medium",
    knowledgePoints: ["止损式汇报"], courseReference: course(8, "工作出错后如何汇报", "止损四动作"), status: "published", version: 1,
    prompt: "你发现刚发出的客户数据有误，而且仍在被团队引用。第一步应该是什么？",
    choices: [
      { id: "a", text: "先查清全部责任再汇报", correct: false, feedback: "等待会让错误继续扩散。" },
      { id: "b", text: "立即暂停使用并通知相关人员当前版本有误", correct: true, feedback: "先停、隔、保、通，控制损失后再完整复盘。" },
      { id: "c", text: "悄悄替换文件", correct: false, feedback: "无法保证所有人更新，也破坏了问题记录。" },
    ],
  },
  {
    id: "simple-013-01", title: "临时加班要求怎么回应", kind: "simple", primarySceneId: "scene-13", relatedSceneIds: ["scene-9"], difficulty: "medium",
    knowledgePoints: ["任务交换"], courseReference: course(13, "如何回应加班要求", "确认必要性与替代方案"), status: "published", version: 1,
    prompt: "下班前领导临时要求今晚完成一份并非紧急的完整报告，你已有明早交付的关键任务。最合适的回应是？",
    choices: [
      { id: "a", text: "直接说今晚不加班", correct: false, feedback: "只表达拒绝，没有处理业务目标和任务冲突。" },
      { id: "b", text: "说明现有任务和冲突，确认今晚最小交付，并请领导确定优先级", correct: true, feedback: "把加班问题转化为时间、范围和优先级的明确交换。" },
      { id: "c", text: "全部答应，今晚再想办法", correct: false, feedback: "隐藏冲突会让两个任务都面临质量和延期风险。" },
    ],
  },
  {
    id: "simple-016-01", title: "同事追问工资怎么回应", kind: "simple", primarySceneId: "scene-16", relatedSceneIds: [], difficulty: "easy",
    knowledgePoints: ["隐私三级回应"], courseReference: course(16, "如何回应隐私问题", "隐私三级回应"), status: "published", version: 1,
    prompt: "同事在午餐时追问你的具体工资，哪种回应最稳妥？",
    choices: [
      { id: "a", text: "编一个数字尽快结束话题", correct: false, feedback: "编造内容会带来后续一致性风险。" },
      { id: "b", text: "我不太讨论具体数字，我们聊聊岗位发展吧。", correct: true, feedback: "简短划界并自然转移话题，不需要为边界做长篇解释。" },
      { id: "c", text: "先反问对方工资", correct: false, feedback: "这会把边界问题变成相互冒犯。" },
    ],
  },
  {
    id: "simple-022-01", title: "会议分歧先定位什么", kind: "simple", primarySceneId: "scene-22", relatedSceneIds: ["scene-25"], difficulty: "medium",
    knowledgePoints: ["会议分歧五类"], courseReference: course(22, "开会被反驳怎么办", "会议分歧五类"), status: "published", version: 1,
    prompt: "同事反对你的方案，但双方使用的数据口径不同。你应该先做什么？",
    choices: [
      { id: "a", text: "继续证明自己的结论", correct: false, feedback: "口径未统一时，更多论证只会放大伪分歧。" },
      { id: "b", text: "确认双方数据范围、时间和计算口径", correct: true, feedback: "先定位事实分歧，再讨论方案取舍。" },
      { id: "c", text: "请领导判断谁更专业", correct: false, feedback: "可以先通过可验证事实缩小分歧。" },
    ],
  },
];

const deepQuestions: DeepQuestion[] = [
  {
    id: "deep-006-01", title: "跨部门客户反馈项目", kind: "deep", primarySceneId: "scene-6", relatedSceneIds: ["scene-5", "scene-7", "scene-9"], difficulty: "hard",
    knowledgePoints: ["任务确认", "依赖管理", "风险预警"], courseReference: course(6, "如何正确接收任务", "任务闭环六步法"), status: "published", version: 1,
    caseBackground: "周一，领导要求你周五前完成客户反馈报告。报告依赖销售、客服两部门的数据，同时你还承担周四上线项目。",
    scenes: [
      { id: "node-1", context: "领导只说报告要‘有洞察’，没有说明使用对象和交付形式。", prompt: "你首先怎么做？", choices: [
        { id: "a", text: "先收集全部数据再决定结构", correct: false, feedback: "方向未确认就大量投入，返工风险很高。" },
        { id: "b", text: "确认报告用途、决策对象、范围、形式和截止节点", correct: true, feedback: "先建立可执行和可验收的共同理解。" },
      ] },
      { id: "node-2", context: "周三下午，销售数据仍未提供，已经可能影响周五交付。", prompt: "此时怎样处理？", choices: [
        { id: "a", text: "继续等，周四拿不到再说", correct: false, feedback: "风险已经出现，应在还有调整空间时预警。" },
        { id: "b", text: "说明缺失数据、交付影响和备选方案，请负责人确认节点", correct: true, feedback: "有效预警同时包含事实、影响、动作和请求。" },
      ] },
    ],
    summary: "复杂任务要形成从要求确认、依赖节点到风险预警的完整闭环。",
  },
  {
    id: "deep-019-01", title: "项目延期后的责任争议", kind: "deep", primarySceneId: "scene-19", relatedSceneIds: ["scene-20", "scene-21"], difficulty: "hard",
    knowledgePoints: ["责任时间线", "公开止损"], courseReference: course(19, "被同事甩锅怎么办", "责任时间线"), status: "published", version: 1,
    caseBackground: "跨部门项目延期。复盘会上，同事说延期是因为你没有及时交付，但你保存的记录显示需求曾被对方临时变更。",
    scenes: [
      { id: "node-1", context: "领导正在询问当前业务影响，同事突然把责任推给你。", prompt: "你应该如何回应？", choices: [
        { id: "a", text: "立刻展示全部聊天记录证明对方撒谎", correct: false, feedback: "信息过载会让会议从业务恢复转向人际冲突。" },
        { id: "b", text: "先补充会影响决策的关键时间点，并把话题拉回恢复计划", correct: true, feedback: "先控制业务风险，再用完整记录还原责任。" },
      ] },
      { id: "node-2", context: "业务恢复后，领导要求明确问题原因。", prompt: "哪种材料最有效？", choices: [
        { id: "a", text: "按任务、负责人、节点和变更记录整理时间线", correct: true, feedback: "结构化事实比情绪化自证更能支持定责和改进。" },
        { id: "b", text: "列出对方过去所有让你不满的事情", correct: false, feedback: "无关历史会削弱当前证据的可信度。" },
      ] },
    ],
    summary: "被推责时先恢复业务，再以任务、节点、变更和确认结果还原责任。",
  },
];

const branchingQuestions: BranchingQuestion[] = [
  {
    id: "branching-018-01", title: "更高层临时派活", kind: "branching", primarySceneId: "scene-18", relatedSceneIds: ["scene-6", "scene-9"], difficulty: "hard",
    knowledgePoints: ["接事不接权", "优先级确认"], courseReference: course(18, "如何应对越级派活", "越级任务确认单"), status: "published", version: 1,
    caseBackground: "公司高层直接让你今天完成一份分析，但这会影响直属领导安排的重点项目。", startNodeId: "start",
    nodes: [
      { id: "start", context: "高层问你今天是否能完成。", prompt: "你怎么回答？", choices: [
        { id: "a", text: "没问题，我今天一定交。", correct: false, feedback: "你替管理者做了优先级决定。", nextNodeId: "overcommit" },
        { id: "b", text: "我先确认目标和截止要求，同时同步直属领导协调排期。", correct: true, feedback: "接收任务信息，但不私自改写团队优先级。", nextNodeId: "align" },
      ] },
      { id: "overcommit", context: "直属领导发现重点项目将延期，要求你解释。", prompt: "现在怎么补救？", choices: [
        { id: "a", text: "说明两个任务的投入和影响，请两位负责人确认优先级", correct: true, feedback: "透明呈现冲突，尽快恢复正确决策链。", nextNodeId: "end" },
        { id: "b", text: "两个都继续承诺，自己加班解决", correct: false, feedback: "隐藏冲突可能造成双重违约。", nextNodeId: "end" },
      ] },
      { id: "align", context: "直属领导认为重点项目优先，但高层确实需要部分数据。", prompt: "你提出什么方案？", choices: [
        { id: "a", text: "今天先交关键数据，完整分析另约时间，并同步双方", correct: true, feedback: "通过范围交换兼顾真实需求和既有优先级。", nextNodeId: "end" },
        { id: "b", text: "让直属领导自己去拒绝高层", correct: false, feedback: "可以带着具体方案协助完成协调。", nextNodeId: "end" },
      ] },
      { id: "end", context: "优先级和交付范围已经确认。", prompt: "本次训练完成。", choices: [], terminal: true },
    ],
    pathSummary: "越级任务的关键不是简单接受或拒绝，而是确认要求、暴露冲突并恢复正确的优先级决策链。",
  },
  {
    id: "branching-024-01", title: "汇报会上功劳被省略", kind: "branching", primarySceneId: "scene-24", relatedSceneIds: ["scene-23", "scene-20"], difficulty: "hard",
    knowledgePoints: ["贡献三证法", "成果可见化"], courseReference: course(24, "功劳被抢怎么办", "贡献三证法"), status: "published", version: 1,
    caseBackground: "项目汇报会上，同事介绍成果时没有提到你负责的关键分析，领导因此以为工作主要由对方完成。", startNodeId: "start",
    nodes: [
      { id: "start", context: "同事刚汇报完，主持人准备进入下一项。", prompt: "你怎么做？", choices: [
        { id: "a", text: "当众质问为什么抢你的功劳", correct: false, feedback: "动机指控会让事实问题迅速变成人际冲突。", nextNodeId: "conflict" },
        { id: "b", text: "补充团队成果，并说明自己负责的分析及其对结果的作用", correct: true, feedback: "用事实校准贡献，不否定团队协作。", nextNodeId: "followup" },
      ] },
      { id: "conflict", context: "同事否认有意省略，会议气氛紧张。", prompt: "怎样止损？", choices: [
        { id: "a", text: "回到分工和交付记录，建议会后共同核对", correct: true, feedback: "停止动机争论，把讨论拉回可验证事实。", nextNodeId: "end" },
        { id: "b", text: "继续列举对方以前的问题", correct: false, feedback: "扩大冲突不能修正本次贡献认知。", nextNodeId: "end" },
      ] },
      { id: "followup", context: "领导认可了你的补充，会后你准备减少类似问题。", prompt: "最有效的长期动作是什么？", choices: [
        { id: "a", text: "建立共同汇报、署名和阶段交付记录", correct: true, feedback: "让贡献归属在过程中持续可见。", nextNodeId: "end" },
        { id: "b", text: "以后只做自己的部分，不再主动协作", correct: false, feedback: "这会损害项目，也不能建立准确的贡献机制。", nextNodeId: "end" },
      ] },
      { id: "end", context: "贡献事实和后续规则已经明确。", prompt: "本次训练完成。", choices: [], terminal: true },
    ],
    pathSummary: "贡献归属要通过当场事实补充与长期过程留痕共同建立。",
  },
];

export const trainingQuestions: TrainingQuestion[] = [...simpleQuestions, ...deepQuestions, ...branchingQuestions, ...batch01Questions, ...remainingQuestions];

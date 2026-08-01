import type { BranchingQuestion, DeepQuestion, QuestionKind, SimpleQuestion, TrainingQuestion } from "./types";

type Point = { title: string; prompt: string; correct: string; wrongA: string; wrongB: string; reason: string };
type SceneSpec = { lesson: number; title: string; background: string; points: Point[] };

const point = (title: string, prompt: string, correct: string, wrongA: string, wrongB: string, reason: string): Point => ({ title, prompt, correct, wrongA, wrongB, reason });

const specs: SceneSpec[] = [
  { lesson: 1, title: "新人如何自然开口", background: "你刚加入团队，需要在不打扰他人的前提下建立轻连接。", points: [
    point("选择低压力话题", "第一次和邻座聊天，哪类话题更合适？", "从共同任务或办公环境谈起", "直接询问工资和家庭", "用夸张赞美换取好感", "共同可见的话题容易回答，也方便结束。"),
    point("识别结束信号", "对方回答后转回屏幕，下一步怎么做？", "简短感谢并自然结束", "连续补问三个问题", "认为对方讨厌自己", "回应变弱时友好收尾就是一次完整连接。"),
  ] },
  { lesson: 2, title: "如何加入同事的话题", background: "你想加入一段已经开始的多人对话，同时保留原有交流节奏。", points: [
    point("等待接话空隙", "同事还在讲述时，你应怎样加入？", "先听完并等待自然停顿", "立即打断表达自己", "站在旁边催大家邀请你", "相关内容也需要合适的接话时机。"),
    point("把交流权还回去", "补充一个相关信息后怎样继续？", "用一个轻问把话题还给大家", "开始十分钟个人演讲", "评价原说话者懂得太少", "接住一点再还回交流权，能维持群体流动。"),
  ] },
  { lesson: 3, title: "不知道说什么时怎么办", background: "你和不熟悉的同事短暂独处，需要从现场线索自然交流。", points: [
    point("筛选话题边界", "发现一个话题种子后还要判断什么？", "双方是否有共同基础、意愿和边界", "能否连续问满七个问题", "话题是否足够展示自己", "共同、意愿和边界决定话题能否继续。"),
    point("避免采访式聊天", "问完一个问题后怎样避免像采访？", "先回应对方并适度分享自己", "立刻追问下一个问题", "对答案作人格评价", "回应和适度自我分享能形成双向交流。"),
  ] },
  { lesson: 4, title: "如何判断自己是否被排挤", background: "你连续感到自己被团队忽略，需要区分感受、事实和动机。", points: [
    point("区分事实和解释", "哪种记录更适合用于事实核验？", "三次会议未收到通知且错过决策", "所有人肯定故意针对我", "团队从来没有人尊重我", "具体行为、频率和影响可以被核实。"),
    point("提出可执行请求", "确认信息遗漏后怎样沟通？", "说明具体遗漏和影响，请求修复通知机制", "要求同事保证永远喜欢自己", "在群里指控所有人的动机", "围绕事实和正常协作提出请求更容易解决问题。"),
  ] },
  { lesson: 5, title: "如何确认任务要求", background: "你接到一项标准主观、多人参与的任务，需要在投入前完成对齐。", points: [
    point("使用样例对齐", "对方只说方案要“有高级感”，怎样确认？", "提供小样或参考案例确认判断标准", "按自己偏好做完整版本", "反复问什么叫高级感但不给选项", "样例能把主观词转成双方可比较的标准。"),
    point("复述并留痕", "口头确认完成后下一步是什么？", "复述关键要求并用书面方式同步", "只在脑中记住大概意思", "要求对方承担全部执行责任", "复述和留痕可以暴露理解差异并减少返工。"),
  ] },
  { lesson: 6, title: "如何正确接收任务", background: "你负责一项跨部门交付，需要让进度、风险和结果持续可见。", points: [
    point("完整交付结果", "发送最终文件时还应说明什么？", "核心结论、检查结果、遗留项和下一步", "只发一个无说明附件", "详细描述自己有多辛苦", "交付说明让接收者能判断结果并继续行动。"),
    point("选择同步节点", "什么时候最需要主动同步？", "方向需确认或风险仍有调整空间时", "每天固定汇报所有细节", "等失败后再解释", "同步应服务决策和风险管理。"),
  ] },
  { lesson: 7, title: "如何催促同事", background: "关键材料连续延期，你需要恢复计划而不是评价协作者。", points: [
    point("判断延误原因", "同事因首次使用工具而延期，怎样催办？", "确认困难并提供必要支持和新节点", "指责对方态度不积极", "只重复问好了吗", "困难需要支持与明确节点，而不只是施压。"),
    point("向上催办", "等待领导审批且窗口将关闭，怎样提醒？", "说明截止影响并给出可快速选择的方案", "连续发送在吗", "向同事抱怨领导拖延", "向上催办要降低决策成本。"),
    point("基于事实升级", "多次催办无行动且已影响交付，升级时说什么？", "说明约定、提醒记录、影响和所需决定", "评价对方一贯不靠谱", "隐瞒依赖问题自己兜底", "升级是请求协调，不是告状。"),
  ] },
  { lesson: 8, title: "工作出错后如何汇报", background: "你发现错误可能影响客户，需要先控制扩散再完整复盘。", points: [
    point("判断错误等级", "哪项最决定是否立即汇报？", "错误是否扩散并需要他人马上决策", "自己是否感到尴尬", "措辞是否已经写得完美", "影响、扩散、可逆性和权限决定响应速度。"),
    point("形成止损闭环", "初步止损后汇报应包含什么？", "事实、影响、已做动作、补救和请求", "只反复道歉", "先查清谁负责再通知", "汇报的目标是控制损失并推动下一决定。"),
  ] },
  { lesson: 9, title: "如何应对临时任务", background: "多个临时需求进入既有排期，你需要显性管理资源交换。", points: [
    point("确认真实紧急度", "对方说任务很急，第一步是什么？", "确认业务节点、影响和最晚需要时间", "立刻暂停所有工作", "根据对方语气判断优先级", "真实节点和影响比“很急”更能支持排期。"),
    point("提出任务交换", "新任务与原交付冲突，怎样协商？", "展示冲突并提供时间、范围或顺序选项", "两个任务都承诺按时", "私自放弃原任务", "新任务进入时必须对应资源调整。"),
  ] },
  { lesson: 10, title: "被领导批评时怎么回应", background: "复盘会上批评包含事实、评价和情绪，你需要先处理问题再澄清。", points: [
    point("拆解批评三层", "领导说“你总不上心，这次数据也错了”，什么是事实层？", "这次数据存在具体错误", "你总是不上心", "领导说话声音很重", "可核实的具体行为才是事实层。"),
    point("回应部分准确批评", "批评有一部分不准确时怎样回应？", "先承担真实缺口，再用相关事实校准其余部分", "全部认下尽快结束", "立即逐句反驳", "问题处理和事实澄清可以同时成立。"),
  ] },
  { lesson: 11, title: "被领导误会时如何澄清", background: "领导依据不完整信息形成判断，你需要用最小证据校准决策依据。", points: [
    point("选择澄清时机", "误会正在影响现场决策，怎样处理？", "先简短校准关键事实，会后再补完整材料", "始终等到私下再说", "当场展示所有聊天记录", "澄清强度应与当前决策影响匹配。"),
    point("选择最小充分证据", "证明已按时提交，哪项证据更合适？", "提交时间、文件链接和接收记录", "过去半年的所有工作记录", "同事对你人品的评价", "证据应相关、可核实并足以改变判断。"),
  ] },
  { lesson: 12, title: "如何向领导提出不同意见", background: "你发现方案存在排期或合规风险，需要帮助领导看清取舍。", points: [
    point("定位分歧类型", "双方使用的数据口径不同，属于哪类分歧？", "事实分歧，应先统一口径", "权威分歧，应停止表达", "情绪分歧，应增加音量", "事实问题应通过核验解决。"),
    point("使用 GRS", "怎样提出建设性异议？", "先对齐目标，再说明风险并给出方案", "只说我不同意", "证明领导能力不足", "异议要把风险和可选路径带入决策。"),
  ] },
  { lesson: 13, title: "如何回应加班要求", background: "临时加班与既有交付和个人边界发生冲突，需要协商资源。", points: [
    point("识别加班模式", "如何区分应急与长期问题？", "看业务性质、发生频率和是否存在系统性缺口", "只看领导语气", "只看今天是否疲惫", "不同模式需要不同强度的处理。"),
    point("保护隐私边界", "拒绝后被追问私人安排，怎样回答？", "不解释隐私，重复工作限制和可行方案", "编造家庭事故", "交出完整私人行程", "资源协商不要求用隐私证明边界。"),
  ] },
  { lesson: 14, title: "如何看待领导的口头承诺", background: "领导表达未来机会，但兑现条件和决策路径仍不清楚。", points: [
    point("区分承诺类型", "“下半年应该有名额”属于什么？", "依赖环境变化的预测", "已经生效的明确约定", "正式任命", "预测表达可能性，不等于结果承诺。"),
    point("完成承诺落地", "重要机会应进一步确认什么？", "标准、时间、决策人和依赖条件", "领导是否喜欢自己", "同事是否羡慕", "具体条件决定投入与兑现路径。"),
  ] },
  { lesson: 15, title: "如何拒绝同事帮忙", background: "同事把完整工作包装成小忙，你需要区分协作和责任转移。", points: [
    point("判断是否接手", "判断帮忙请求应检查什么？", "职责、成本、重复模式和替代方式", "只看关系是否亲近", "只看对方是否着急", "帮助不能脱离责任与真实成本判断。"),
    point("明确有限替代", "不能完整代做时怎样回应？", "说明限制并只提供愿意承担的模板或时间", "含糊说我看看", "提供比原任务更大的补偿", "替代支持需要明确范围和最终责任。"),
  ] },
  { lesson: 16, title: "如何回应隐私问题", background: "同事从闲聊逐步转向反复追问隐私，你需要调整回应强度。", points: [
    point("选择回应强度", "决定隐私回应强度要看什么？", "敏感程度、合理需要和持续程度", "只看对方职位高低", "只看旁边有多少人", "边界强度要与风险和反复程度匹配。"),
    point("最小范围披露", "工作确需部分个人信息时怎样提供？", "只提供完成任务所必需的范围", "公开全部私人信息", "拒绝一切合理流程", "隐私自主也包括控制披露范围。"),
  ] },
  { lesson: 17, title: "如何制止反复占便宜", background: "多次很小的请求形成长期单向成本，需要改变重复模式。", points: [
    point("识别单向互惠", "哪种迹象说明问题已成为模式？", "资源长期单向流动且拒绝不被尊重", "对方偶尔请求一次", "双方轮流提供支持", "频率、成本流向和拒绝反应共同说明模式。"),
    point("一致执行边界", "对方第三次说最后一次，怎样处理？", "按已说明的规则拒绝并让职责归位", "再破例一次", "做完后向别人抱怨", "重复例外会强化旧模式。"),
  ] },
  { lesson: 18, title: "如何应对越级派活", background: "其他负责人直接派活并涉及流程权限，你需要接住事项但不私改决策链。", points: [
    point("确认越级任务", "接到越级任务要确认哪些核心信息？", "目标、标准、优先级冲突、同步对象和验收责任", "只确认对方级别", "只确认是否今天完成", "任务与决策责任都要透明。"),
    point("守住权限流程", "对方说出了事他负责，能否绕过数据流程？", "不能，应按权限申请并同步负责人", "可以，口头担责足够", "先私下发送再补流程", "权限责任不能通过一句口头承诺转移。"),
  ] },
  { lesson: 19, title: "被同事甩锅怎么办", background: "项目出现问题，责任既有清晰节点也有协作缺口，需要准确还原。", points: [
    point("区分问题性质", "哪项最有助于判断是否甩锅？", "核对分工、标准、变更和确认记录", "比较双方谁更生气", "收集对方过去所有缺点", "责任需要由当前任务事实支持。"),
    point("承担部分责任", "你按时交付但未对依赖延期升级，怎样表述？", "说明双方节点并承担自己的未升级缺口", "宣称自己毫无责任", "为了息事宁人承担全部", "准确责任才能带来有效改进。"),
  ] },
  { lesson: 20, title: "被公开批评怎么办", background: "群内公开批评同时存在事实错误和你的真实疏漏，需要先校准公开认知。", points: [
    point("判断公开回应必要性", "什么时候需要当场简短回应？", "错误认知正在影响工作或责任判断时", "任何不舒服时都长篇反击", "永远不在公开场合说话", "公开影响需要公开校准，复杂问题可留到会后。"),
    point("公开回应三句式", "现场回应应包含什么？", "具体问题、当前动作和后续沟通", "对方全部历史错误", "自己的情绪强度", "短句先控制事实和业务影响。"),
  ] },
  { lesson: 21, title: "如何回应阴阳怪气", background: "对方用模糊暗示持续贬低你的工作，又拒绝说明具体问题。", points: [
    point("判断隐性攻击", "判断玩笑是否需要提高回应强度要看什么？", "频率、实际影响和发生场合", "自己能否说得更刻薄", "是否有人站队", "持续性和协作影响比猜测动机更重要。"),
    point("把暗话明说", "对方说懂的人都懂，怎样回应？", "请其说明具体事实和工作诉求", "努力猜测并自证", "发动同事评理", "不接暗示，把讨论拉回可验证内容。"),
  ] },
  { lesson: 22, title: "开会被反驳怎么办", background: "会议分歧从事实逐渐转向资源取舍，需要选择对应处理方式。", points: [
    point("定位取舍分歧", "双方数据一致但争论时间还是范围优先，问题是什么？", "目标或取舍分歧，需要有权者确认", "事实分歧，需要更多相同数据", "人格分歧，需要争输赢", "取舍问题不能只靠增加证据解决。"),
    point("推动验证", "事实暂时无法确认时怎样继续？", "明确待验证问题、负责人和时间", "无限循环表达观点", "默认自己的数据正确", "可验证分歧应转成具体行动。"),
  ] },
  { lesson: 23, title: "如何让成果被看见", background: "你在长周期项目中承担关键工作，需要准确呈现团队结果和个人价值。", points: [
    point("选择可见节点", "什么时候适合同步成果？", "过程决策、风险或结项等需要依据的节点", "只在绩效前集中罗列", "每天汇报全部动作", "正确节点能让成果支持协作和评价。"),
    point("使用 GAV", "成果表达应怎样组织？", "说明目标、关键行动和产生的价值", "只列加班时长", "只说大家都很努力", "GAV把行动与业务结果连接起来。"),
    point("准确呈现个人贡献", "团队成果中怎样表达个人价值？", "先讲团队结果，再说明自己的具体行动和作用", "把团队结果全部归给自己", "完全省略个人工作", "准确归因兼顾团队信任和个人可见度。"),
  ] },
  { lesson: 24, title: "功劳被抢怎么办", background: "同事多次省略你的关键贡献，已经影响负责人和绩效认知。", points: [
    point("判断归属问题性质", "什么时候需要从一次校准升级为机制处理？", "归属错误重复发生并影响正式评价", "第一次口误尚未核实", "任何团队汇报都未点名所有人", "频率和影响决定处理强度。"),
    point("使用贡献三证", "校准贡献最有效的材料是什么？", "分工、过程交付和结果使用记录", "对同事动机的猜测", "与项目无关的旧矛盾", "三类证据能够还原贡献链条。"),
  ] },
  { lesson: 25, title: "如何在会议中影响决策", background: "跨部门会议需要在资源约束下形成明确方案和行动安排。", points: [
    point("识别会议关键条件", "会前准备先确认什么？", "会议目的、决策人和真正障碍", "自己能发言多久", "谁最容易被说服", "影响决策先要理解决策结构。"),
    point("呈现选项取舍", "怎样让方案更容易被决定？", "围绕目标给证据并说明各选项取舍", "只强调自己的方案最好", "隐藏方案风险", "决策者需要看清选择而非只听立场。"),
  ] },
  { lesson: 26, title: "如何争取资源和机会", background: "你提出预算或机会请求，需要让组织看见投入理由和风险控制。", points: [
    point("把愿望变成请求", "哪种资源申请更可决策？", "明确所需预算、用途、时间和负责人", "希望公司多支持我", "我很努力所以应该获得", "具体请求才能评估投入与安排。"),
    point("组织价值提案", "完整提案包含什么？", "目标价值、具体请求、投入产出和风险控制", "个人渴望和同事对比", "只重复资源很重要", "资源是组织对预期价值的投入。"),
  ] },
];

const targets: Record<number, Record<QuestionKind, number>> = {
  1:{simple:3,deep:1,branching:0},2:{simple:3,deep:0,branching:1},3:{simple:3,deep:1,branching:0},4:{simple:3,deep:0,branching:1},
  5:{simple:3,deep:1,branching:0},6:{simple:2,deep:1,branching:0},7:{simple:3,deep:0,branching:1},8:{simple:2,deep:1,branching:0},
  9:{simple:2,deep:1,branching:1},10:{simple:2,deep:1,branching:1},11:{simple:2,deep:1,branching:1},12:{simple:2,deep:1,branching:1},
  13:{simple:2,deep:1,branching:1},14:{simple:2,deep:0,branching:1},15:{simple:2,deep:1,branching:1},16:{simple:3,deep:1,branching:0},
  17:{simple:2,deep:1,branching:1},18:{simple:2,deep:1,branching:1},19:{simple:2,deep:1,branching:1},20:{simple:2,deep:1,branching:1},
  21:{simple:2,deep:1,branching:1},22:{simple:2,deep:1,branching:1},23:{simple:3,deep:0,branching:1},24:{simple:2,deep:1,branching:1},
  25:{simple:2,deep:1,branching:1},26:{simple:2,deep:0,branching:1},
};

const completed: Record<number, Record<QuestionKind, number>> = Object.fromEntries(Array.from({ length: 26 }, (_, index) => [index + 1, { simple: 0, deep: 0, branching: 0 }])) as Record<number, Record<QuestionKind, number>>;
for (const lesson of [1, 2, 3, 4, 6, 7, 8, 13, 16, 22]) completed[lesson].simple = 1;
completed[5].simple = 2;
for (const lesson of [1, 3, 6, 19]) completed[lesson].deep = 1;
for (const lesson of [2, 4, 18, 24]) completed[lesson].branching = 1;

const id = (kind: QuestionKind, lesson: number, suffix: number) => `${kind}-${String(lesson).padStart(3, "0")}-${String(suffix).padStart(2, "0")}`;
const choices = (p: Point) => [
  { id: "a", text: p.wrongA, correct: false, feedback: "这会偏离当前需要处理的事实、边界或行动。" },
  { id: "b", text: p.correct, correct: true, feedback: p.reason },
  { id: "c", text: p.wrongB, correct: false, feedback: "这不能形成清晰、可执行且可继续协作的下一步。" },
];

const generated: TrainingQuestion[] = [];
for (const spec of specs) {
  const target = targets[spec.lesson];
  const done = completed[spec.lesson];
  for (let index = done.simple; index < target.simple; index++) {
    const p = spec.points[index % spec.points.length];
    generated.push({
      id: id("simple", spec.lesson, index + 1), title: p.title, kind: "simple", primarySceneId: `scene-${spec.lesson}`, relatedSceneIds: [],
      difficulty: spec.lesson <= 7 ? "easy" : "medium", knowledgePoints: [p.title],
      courseReference: { lessonNumber: spec.lesson, lessonTitle: spec.title, section: p.title, href: `/lesson-${spec.lesson}` },
      status: "published", version: 1, prompt: p.prompt, choices: choices(p),
    } satisfies SimpleQuestion);
  }
  if (done.deep < target.deep) {
    const first = spec.points[0]; const second = spec.points[1] ?? first;
    generated.push({
      id: id("deep", spec.lesson, done.deep + 1), title: `${spec.title}综合处理`, kind: "deep", primarySceneId: `scene-${spec.lesson}`, relatedSceneIds: [], difficulty: "hard",
      knowledgePoints: [first.title, second.title], courseReference: { lessonNumber: spec.lesson, lessonTitle: spec.title, section: "综合运用", href: `/lesson-${spec.lesson}` }, status: "published", version: 1,
      caseBackground: spec.background,
      scenes: [
        { id: "node-1", context: `事情刚发生，你首先需要判断“${first.title}”。`, prompt: first.prompt, choices: choices(first) },
        { id: "node-2", context: `完成第一步后，情境继续发展，需要进一步处理“${second.title}”。`, prompt: second.prompt, choices: choices(second) },
      ],
      summary: `${first.reason}${second.reason}`,
    } satisfies DeepQuestion);
  }
  if (done.branching < target.branching) {
    const first = spec.points[0]; const second = spec.points[1] ?? first;
    generated.push({
      id: id("branching", spec.lesson, done.branching + 1), title: `${spec.title}连续决策`, kind: "branching", primarySceneId: `scene-${spec.lesson}`, relatedSceneIds: [], difficulty: "hard",
      knowledgePoints: [first.title, second.title], courseReference: { lessonNumber: spec.lesson, lessonTitle: spec.title, section: "连续决策", href: `/lesson-${spec.lesson}` }, status: "published", version: 1,
      caseBackground: spec.background, startNodeId: "start",
      nodes: [
        { id: "start", context: `情境开始，你需要先处理“${first.title}”。`, prompt: first.prompt, choices: [
          { id: "a", text: first.wrongA, correct: false, feedback: "这个选择没有处理当前核心问题，需要在下一步修正。", nextNodeId: "repair" },
          { id: "b", text: first.correct, correct: true, feedback: first.reason, nextNodeId: "followup" },
        ] },
        { id: "repair", context: "前一步没有形成有效结果，问题继续扩大。", prompt: `现在怎样回到“${second.title}”的正确处理？`, choices: [
          { id: "a", text: second.correct, correct: true, feedback: second.reason, nextNodeId: "end" },
          { id: "b", text: second.wrongB, correct: false, feedback: "继续回避核心问题会让影响累积。", nextNodeId: "end" },
        ] },
        { id: "followup", context: "第一步处理正确，接下来需要把结果转成稳定行动。", prompt: second.prompt, choices: [
          { id: "a", text: second.correct, correct: true, feedback: second.reason, nextNodeId: "end" },
          { id: "b", text: second.wrongA, correct: false, feedback: "这会破坏前一步建立的事实或边界。", nextNodeId: "end" },
        ] },
        { id: "end", context: "事实、边界和下一步已经明确。", prompt: "本次训练完成。", choices: [], terminal: true },
      ],
      pathSummary: `${first.reason}${second.reason}`,
    } satisfies BranchingQuestion);
  }
}

export const remainingQuestions = generated;

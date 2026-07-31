"use client";

import { ActionCard, CoursePlayer, MistakeList, type CourseStep } from "../components/course-player";

const steps: CourseStep[] = [
  {
    title: "冷场时，应该马上找话题吗？", short: "冷场判断", type: "练习", time: "1分钟", summary: "先判断对方意愿，不用把每一次沉默都当成失败",
    practice: {
      context: "你和一位不熟悉的同事一起吃饭。你问他周末是否去看展，对方只回答：“嗯，看了。”",
      question: "接下来怎么做更自然？",
      choices: [
        { text: "连续追问：在哪里？和谁？好看吗？待了多久？", correct: false, feedback: "连续提问会把交流变成采访。对方目前没有表现出明显的展开意愿。" },
        { text: "回应一点自己的信息，观察对方是否愿意继续", correct: true, feedback: "回答正确。可以说“原来去成了，我上周路过时人还挺多”，然后观察对方是否补充。" },
        { text: "马上换成影视、游戏、新闻等其他热门话题", correct: false, feedback: "不断换题只是在逃避沉默。先接住已有信息，再决定继续或自然停下。" },
      ],
    },
  },
  {
    title: "不知道说什么，真正缺的是什么？", short: "学习目标", type: "阅读", time: "2分钟", summary: "不是缺少话题库，而是没有看见现场已有的线索",
    content: <article className="bookContent">
      <p className="bookLead">越担心冷场，越容易拼命寻找“有趣的话题”，结果不是连续提问，就是生硬抛出与双方无关的热点。</p>
      <h2>好话题不是突然想出来的</h2>
      <p>交流中通常已经存在很多线索：共同环境、近期经历、对方刚说的话。真正需要练习的，是从这些信息中选择一个方向继续。</p>
      <blockquote>不要准备十个新话题，要学会从对方的一句话里找到下一个话题。</blockquote>
      <h2>学完后，你要能够做到</h2>
      <ul><li>从三类来源找到话题种子；</li><li>判断对方愿意谈事实、观点还是感受；</li><li>用5W2H发现方向，但不连续盘问；</li><li>在提问与自我分享之间保持平衡；</li><li>允许话题暂停或自然结束。</li></ul>
    </article>,
  },
  {
    title: "核心原则：话题生长法", short: "话题生长", type: "阅读", time: "3分钟", summary: "找到种子、选择方向，再用回应让话题继续",
    content: <article className="bookContent">
      <p className="bookLead">好的交流来自关注对方，不来自准备大量金句。话题像植物一样，需要从已有信息中生长。</p>
      <h2>一、从共同信息开始</h2>
      <p>双方共同看到、经历或关心的信息进入成本最低，例如当前会议、共同项目、办公环境和对方主动提到的经历。</p>
      <h2>二、让回应决定方向</h2>
      <p>对方多讲事实，就接事实；表达感受，就先接感受；反问你的经历，再适度分享自己。不要只按自己的准备推进。</p>
      <h2>三、允许话题暂停</h2>
      <p>一次沉默可能只是对方在思考、疲惫，或者暂时没有更多内容。知道可以结束，才不会因为害怕冷场而不断追问。</p>
      <blockquote>找到一颗话题种子 → 选择一个方向展开 → 用回应让它继续生长</blockquote>
    </article>,
  },
  {
    title: "三颗话题种子", short: "三颗种子", type: "阅读", time: "3分钟", summary: "共同环境、近期经历和对方刚说的话",
    content: <article className="bookContent">
      <p className="bookLead">不知道说什么时，按固定顺序寻找线索，比搜索热门话题更稳定。</p>
      <h2>共同环境</h2>
      <p>从两个人此刻都能感知的事情开始：“这次培训的信息量挺大，你之前接触过这个工具吗？”</p>
      <h2>近期经历</h2>
      <p>最近在做的工作、刚参加的活动、轻量周末安排和对方公开展示的兴趣，都比宏大话题容易回答。</p>
      <h2>对方刚说的话</h2>
      <p>这是优先级最高的来源。对方说“最近每天都在和供应商对方案，时间特别赶”，其中已经包含事实、过程和感受。</p>
      <div className="bookDialogue"><p><small>接事实</small>“现在已经接近定稿了吗？”</p><p><small>接过程</small>“是不是每一轮都要重新对数据？”</p><p><small>接感受</small>“一直反复调整确实挺消耗精力的。”</p></div>
      <div className="bookNote">一次只选择一个方向，不要把一句话里的所有接口都问一遍。</div>
    </article>,
  },
  {
    title: "这个话题适合继续吗？", short: "话题三筛", type: "练习", time: "2分钟", summary: "筛共同、筛意愿、筛边界",
    practice: {
      context: "你听说一位刚认识的同事最近正在离婚。午餐时你们两个人单独坐在一起。",
      question: "下面哪个话题最合适？",
      choices: [
        { text: "“听说你最近家里有变化，现在还好吗？”", correct: false, feedback: "这是对方没有主动公开的私人信息，不适合拿来打破冷场。" },
        { text: "“刚才培训里演示的那个功能挺多，你以前用过吗？”", correct: true, feedback: "回答正确。它来自双方共同经历，具体、轻量，也不要求对方暴露隐私。" },
        { text: "“最近那个争议新闻你站哪一边？”", correct: false, feedback: "强立场话题不适合刚认识时贸然开启，也和当前共同场景没有直接关系。" },
      ],
    },
  },
  {
    title: "5W2H不是调查表", short: "5W2H", type: "阅读", time: "4分钟", summary: "用它发现方向，而不是把七个问题依次问完",
    content: <article className="bookContent">
      <p className="bookLead">5W2H是你脑中的“线索盘”，帮助你发现一个话题可以往哪里展开。</p>
      <table className="bookTable"><thead><tr><th>方向</th><th>可以了解什么</th><th>示例</th></tr></thead><tbody>
        <tr><td>What</td><td>发生了什么</td><td>“主要是什么活动？”</td></tr>
        <tr><td>Who</td><td>与谁有关</td><td>“是整个小组一起吗？”</td></tr>
        <tr><td>When / Where</td><td>时间与地点</td><td>“是在公司附近吗？”</td></tr>
        <tr><td>Why</td><td>原因与考虑</td><td>“当时是怎么考虑的？”</td></tr>
        <tr><td>How</td><td>过程与体验</td><td>“后来是怎么解决的？”</td></tr>
        <tr><td>How much</td><td>数量与程度</td><td>“大概要准备多久？”</td></tr>
      </tbody></table>
      <h2>三个使用原则</h2>
      <ol><li>一次只选一个方向；</li><li>优先接对方强调的部分；</li><li>少用带有审问感的“为什么”，可以换成“当时怎么考虑的”。</li></ol>
      <blockquote>5W2H是线索盘，不是对方要填写的调查表。</blockquote>
    </article>,
  },
  {
    title: "话题生长五步法", short: "五步法", type: "阅读", time: "4分钟", summary: "从找到种子，到根据反馈继续或结束",
    content: <article className="bookContent">
      <p className="bookLead">稳定的交流节奏不是一直问，而是在提问、倾听、回应和分享之间往返。</p>
      <ol className="bookSteps methodBookSteps">
        <li><h3>寻找种子</h3><p>依次看共同环境、近期经历和对方刚说的话。</p></li>
        <li><h3>轻量开场</h3><p>一条共同信息，加一个具体、容易回答的问题。</p></li>
        <li><h3>接住回应</h3><p>从事实、观点和感受中选一个方向回应。</p></li>
        <li><h3>适度分享</h3><p>补充一小段自己，避免持续提问形成采访感。</p></li>
        <li><h3>看反馈进退</h3><p>回应具体就继续，持续简短就自然结束。</p></li>
      </ol>
      <blockquote>问一点 → 听回应 → 接一句 → 分享一点 → 再把话题还回去</blockquote>
    </article>,
  },
  {
    title: "三个典型场景怎么说？", short: "场景运用", type: "阅读", time: "5分钟", summary: "午餐、出差同行和陌生人单独相处",
    content: <article className="bookContent">
      <p className="bookLead">不同场景的共同点，是先接受“并不需要全程说话”。</p>
      <h2>场景一：和不熟悉的同事吃饭</h2>
      <blockquote>“我第一次来这家，刚才选了半天。你以前吃过吗？”</blockquote>
      <p>对方愿意说，就接餐厅或午餐习惯；只回答“还行”，就说“那我今天试试看”，安心吃饭。</p>
      <h2>场景二：出差途中单独相处</h2>
      <blockquote>“这次客户现场你以前去过吗？我还不太熟悉那边的流程。”</blockquote>
      <p>从共同任务开始。对方戴耳机或休息，就是清楚的结束信号。</p>
      <h2>场景三：介绍人暂时离开</h2>
      <blockquote>“刚才听你说和小周是在培训时认识的，那次培训是不是持续了挺久？”</blockquote>
      <p>共同朋友可以作为连接点，但不要借机追问朋友的隐私。</p>
    </article>,
  },
  {
    title: "把采访改成交流", short: "综合练习", type: "练习", time: "3分钟", summary: "一个问题后，要有回应和适度分享",
    practice: {
      before: <MistakeList items={[
        ["连续盘问", "把5W2H的所有问题一次问完"],
        ["只顾备题", "准备很多话题，却没有听对方的回答"],
        ["害怕冷场", "一个话题结束后马上跳到另一个"],
        ["分享过长", "自己的故事明显超过对方"],
        ["忽视边界", "对方含糊或转移后仍继续追问"],
      ]} />,
      context: "同事说：“周末我第一次去参加了城市徒步。”",
      question: "哪种回应更像交流，而不是采访？",
      choices: [
        { text: "“去哪？和谁？走了多久？为什么突然想去？”", correct: false, feedback: "问题过于密集，对方没有选择方向的空间。" },
        { text: "“第一次参加，走完全程感觉怎么样？我最近也想找一条周末路线。”", correct: true, feedback: "回答正确。一个轻问题加一点相关分享，让双方都能参与。" },
        { text: "“徒步我很熟，我上次走了三十公里，过程特别精彩……”", correct: false, feedback: "这句话没有先回应对方，就把话题转成了自己的长故事。" },
      ],
    },
  },
  {
    title: "带走一张话题行动卡", short: "行动卡", type: "总结", time: "1分钟", summary: "没有话题时，从现场找种子",
    content: <ActionCard
      title={<>不用准备十个话题<br />只要接住一个线索</>}
      points={["先找：共同环境、近期经历、对方刚说的话", "再筛：共同、意愿、边界", "只问：一个具体、容易回答的问题", "接住：事实、观点或感受", "观察：愿意就继续，简短就结束"]}
      flow={["寻找种子", "轻量开场", "接住回应", "适度分享", "看反馈进退"]}
      quote="记忆句：话题不用凭空创造，它藏在你们已经共同拥有的信息里。"
    />,
  },
];

export default function LessonThree() {
  return <CoursePlayer lessonNumber={3} lessonTitle="不知道说什么时怎么办" steps={steps} />;
}

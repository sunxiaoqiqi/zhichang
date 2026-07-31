"use client";

import { ActionCard, CoursePlayer, MistakeList, type CourseStep } from "../components/course-player";

const steps: CourseStep[] = [
  {
    title: "一次没被邀请，就是被排挤吗？", short: "初步判断", type: "练习", time: "1分钟", summary: "不要根据一次体验给关系下结论",
    practice: {
      context: "整个团队临时聚餐，你因为外出见客户没有被通知。第二天同事解释以为你赶不回来，并把聚餐中提到的工作信息发给了你。",
      question: "现在能判断自己被排挤吗？",
      choices: [
        { text: "能，团队活动没有通知我就是排挤", correct: false, feedback: "一次事件不足以下结论。对方给出合理解释，也主动补齐了工作信息。" },
        { text: "暂时不能，需要继续观察是否形成持续、针对且有影响的模式", correct: true, feedback: "回答正确。直觉可以提醒你注意，但结论需要持续性、针对性和影响性共同支持。" },
        { text: "不能，公司里的排挤根本不存在", correct: false, feedback: "这也过于绝对。真实的信息隔离和不当行为可能存在，需要基于事实判断。" },
      ],
    },
  },
  {
    title: "为什么不能只相信一次感受？", short: "学习目标", type: "阅读", time: "2分钟", summary: "既不把普通疏忽理解成恶意，也不忽略真实影响",
    content: <article className="bookContent">
      <p className="bookLead">聚餐没叫自己、群里没人接话、项目消息最后才知道，都可能触发“他们是不是在排挤我”的判断。</p>
      <h2>过早下结论会发生什么</h2>
      <ul><li>反复猜测和自我否定；</li><li>为了被接纳而过度讨好；</li><li>证据不足时质问同事，使关系进一步恶化。</li></ul>
      <h2>但也不能只告诉自己“别敏感”</h2>
      <p>如果关键信息隔离已经持续影响工作，或者出现羞辱、歧视和威胁，就需要及时处理。</p>
      <blockquote>先判断发生了什么、造成什么影响，再判断别人为什么这样做。</blockquote>
    </article>,
  },
  {
    title: "核心原则：排挤三性判断法", short: "三性判断", type: "阅读", time: "3分钟", summary: "持续性、针对性和影响性",
    content: <article className="bookContent">
      <p className="bookLead">判断排挤，不看一次冷淡，而看三个特征是否共同出现。</p>
      <h2>持续性：是否反复发生？</h2>
      <p>一次聚餐没邀请、一次文件漏发、一次意见没人回应，都不足以直接说明被排挤。要看是否在一段时间内形成稳定模式。</p>
      <h2>针对性：是否主要发生在自己身上？</h2>
      <p>对比同角色同事、团队惯例和相同规则。有些团队本身信息混乱，有些行为则明显只针对一个人。</p>
      <h2>影响性：是否影响工作和基本尊重？</h2>
      <p>关系不亲近不一定需要解决。关键信息、必要资源、正常协作和免受羞辱的权利，则必须得到保障。</p>
      <blockquote>持续性 + 针对性 + 影响性，三者共同决定处理等级。</blockquote>
    </article>,
  },
  {
    title: "先区分四种情况", short: "四类情况", type: "阅读", time: "3分钟", summary: "社交距离、偶发遗漏、流程问题和持续排挤",
    content: <article className="bookContent">
      <p className="bookLead">“感觉被排挤”背后，可能是四种完全不同的问题，解决方式也不同。</p>
      <table className="bookTable"><thead><tr><th>情况</th><th>典型表现</th><th>处理方向</th></tr></thead><tbody>
        <tr><td>普通社交距离</td><td>没有私人邀约，但工作正常</td><td>接受边界，建立其他连接</td></tr>
        <tr><td>偶发沟通遗漏</td><td>一次漏拉会议，提醒后补齐</td><td>正常确认，继续观察</td></tr>
        <tr><td>团队流程问题</td><td>多人经常拿不到最新资料</td><td>推动统一同步机制</td></tr>
        <tr><td>持续排挤或不当对待</td><td>关键资料反复只漏掉你，或出现羞辱</td><td>记录、沟通并按等级反馈</td></tr>
      </tbody></table>
      <div className="bookNote">公司需要保证正常协作和基本尊重，但不要求每位同事都成为朋友。</div>
    </article>,
  },
  {
    title: "事实和解释，能分开吗？", short: "事实练习", type: "练习", time: "2分钟", summary: "把“大家故意无视我”改成可以核实的行为",
    practice: {
      context: "你在项目群里发了一个问题，两小时没有人回复。你心里想：“大家在故意无视我。”",
      question: "哪种记录方式最有助于后续判断？",
      choices: [
        { text: "“所有人一直都针对我。”", correct: false, feedback: "这是概括和解释，没有说明具体时间、事件和影响。" },
        { text: "“周二10点在项目群询问接口确认，截至12点未回复；交付节点是当天17点。”", correct: true, feedback: "回答正确。它保留了可核实的时间、行为和任务背景，没有先推断动机。" },
        { text: "“他们肯定在另一个群里商量不理我。”", correct: false, feedback: "这是无法证实的推测，会放大焦虑，却不能帮助解决问题。" },
      ],
    },
  },
  {
    title: "判断工具：事实四问", short: "事实四问", type: "阅读", time: "4分钟", summary: "具体事件、发生频率、对比情况和实际影响",
    content: <article className="bookContent">
      <p className="bookLead">当“我被排挤了”的想法出现时，用四个问题把感受与证据分开。</p>
      <ol className="bookSteps">
        <li><h3>具体发生了什么？</h3><p>写可观察行为，不写“大家都不理我”这样的结论。</p></li>
        <li><h3>发生多少次、持续多久？</h3><p>区分一次、偶尔和反复，记录时间和场景。</p></li>
        <li><h3>同样情况也发生在别人身上吗？</h3><p>对比流程、名单和同角色，不通过拉人站队核实。</p></li>
        <li><h3>对工作造成了什么影响？</h3><p>说明延期、返工、旧版本、职责受阻或评价偏差。</p></li>
      </ol>
      <h2>事实—解释分栏</h2>
      <div className="bookCompare"><div><small>事实</small><p>三位同事周五一起吃饭，没有邀请我。</p></div><div><small>待核实</small><p>是临时朋友约饭，还是整个团队活动只漏掉我？</p></div></div>
    </article>,
  },
  {
    title: "事实核验五步法", short: "五步法", type: "阅读", time: "4分钟", summary: "从记录和核实，到沟通与必要升级",
    content: <article className="bookContent">
      <p className="bookLead">处理问题的目标不是证明“谁不喜欢我”，而是恢复正常协作和基本尊重。</p>
      <ol className="bookSteps methodBookSteps">
        <li><h3>记录事实</h3><p>记录时间、事件、任务、已采取行动和实际影响。</p></li>
        <li><h3>多渠道核实</h3><p>检查群组、名单、权限、职责和版本记录。</p></li>
        <li><h3>主动建立连接</h3><p>通过进度同步和具体协作，让工作路径更清楚。</p></li>
        <li><h3>沟通具体影响</h3><p>使用“事实—影响—请求”，不要求对方承认动机。</p></li>
        <li><h3>必要时向上反馈</h3><p>重复发生、直接沟通无效或存在严重不当行为时升级。</p></li>
      </ol>
      <blockquote>“两次变更我都没有收到，导致使用旧版本返工半天。后续能否统一在项目群留痕并@负责人？”</blockquote>
    </article>,
  },
  {
    title: "三个典型场景怎么处理？", short: "场景运用", type: "阅读", time: "5分钟", summary: "聚餐未邀请、信息遗漏和会议忽视",
    content: <article className="bookContent">
      <p className="bookLead">先判断属于哪一层，再选择相称的处理动作。</p>
      <h2>场景一：同事聚餐没有邀请</h2>
      <p>区分私人约饭与团队活动。私人关系可以有选择；如果聚餐中形成工作决定，应要求结论回到正式渠道。</p>
      <h2>场景二：项目变更多次没有同步</h2>
      <blockquote>“周二和周四的变更我都没有收到，导致周五使用了旧版本。请问正式变更渠道是哪一个？”</blockquote>
      <p>沟通后仍重复发生，再带着记录请项目负责人明确机制。</p>
      <h2>场景三：会议中意见长期被忽略</h2>
      <p>先检查表达和议程，再书面呈现观点并向主持人获取反馈。如果长期存在明显双重标准，再进一步处理。</p>
      <div className="bookNote">出现明确羞辱、威胁、歧视或骚扰时，不必把它降级成普通关系问题，应保存必要信息并及时使用正式渠道。</div>
    </article>,
  },
  {
    title: "哪种沟通更有效？", short: "处理练习", type: "练习", time: "3分钟", summary: "说事实、影响和请求，不直接判断动机",
    practice: {
      before: <MistakeList items={[
        ["单次定性", "用一次事件证明所有人都排挤自己"],
        ["只猜动机", "不检查群组、职责和通知流程"],
        ["过度讨好", "牺牲边界换取接纳"],
        ["直接质问", "开口就问“是不是故意的”"],
        ["归咎自己", "为他人的羞辱和歧视承担责任"],
      ]} />,
      context: "你连续两次没有收到测试环境开放通知，分别导致测试晚开始半天和一天。",
      question: "哪种沟通最可能推动问题解决？",
      choices: [
        { text: "“你们是不是故意不告诉我？”", correct: false, feedback: "这要求对方承认动机，容易引发防御，也没有提出具体解决办法。" },
        { text: "“最近两次开放我都未收到通知，导致测试延期。后续能否统一在项目群通知并@测试负责人？”", correct: true, feedback: "回答正确。事实、影响和请求都很明确，可以直接推动机制改变。" },
        { text: "什么都不说，以后自己每天去环境里检查", correct: false, feedback: "这把流程问题转化成了你的额外负担，也不能防止问题继续影响其他人。" },
      ],
    },
  },
  {
    title: "带走一张事实判断卡", short: "行动卡", type: "总结", time: "1分钟", summary: "争取正常协作与尊重，不追求所有人的喜欢",
    content: <ActionCard
      title={<>不靠一次冷淡定性<br />用事实决定行动</>}
      points={["看持续：是一次，还是反复发生？", "看针对：别人也一样，还是主要针对我？", "看影响：社交失落，还是工作与尊重受损？", "先核实：名单、流程、权限和业务记录", "再沟通：事实、影响、请求，必要时升级"]}
      flow={["记录事实", "多方核实", "建立连接", "沟通影响", "必要升级"]}
      quote="记忆句：先处理事实和影响，再判断动机。"
    />,
  },
];

export default function LessonFour() {
  return <CoursePlayer lessonNumber={4} lessonTitle="如何判断自己是否被排挤" steps={steps} />;
}

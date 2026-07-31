"use client";

import { ActionCard, CoursePlayer, MistakeList, type CourseStep } from "../components/course-player";

const steps: CourseStep[] = [
  {
    title: "这项任务现在能直接开工吗？", short: "任务判断", type: "练习", time: "1分钟", summary: "模糊要求不等于可以凭习惯补全",
    practice: {
      context: "领导在走廊里说：“把最近客户反馈整理一下，尽快给我。”",
      question: "最合适的第一步是什么？",
      choices: [
        { text: "先按自己理解整理，做完后再看领导是否满意", correct: false, feedback: "目的、范围、交付形式和时间都不明确，直接开工很可能整体返工。" },
        { text: "确认用途、客户范围、交付形式和具体截止时间", correct: true, feedback: "回答正确。这四项会直接改变任务方向和工作量，应在正式投入前确认。" },
        { text: "要求领导把全部操作步骤写清楚后再开始", correct: false, feedback: "确认要求不等于把所有思考推回给安排者。你可以确认关键变量，再自己设计执行方案。" },
      ],
    },
  },
  {
    title: "很多返工，为什么不是能力问题？", short: "学习目标", type: "阅读", time: "2分钟", summary: "双方从一开始就在做不同的任务",
    content: <article className="bookContent">
      <p className="bookLead">“整理一下”“尽快给我”“做得高级一点”，听起来像任务，实际上缺少可执行标准。</p>
      <h2>新人为什么不敢问</h2>
      <p>担心追问显得理解力差，于是用自己的经验补全要求。但领导想看3页结论，你写了20页报告；材料要发客户，你却按内部讨论制作。</p>
      <blockquote>确认要求不是质疑安排者，而是在任务开始前消除返工。</blockquote>
      <h2>本课与第6课的边界</h2>
      <p>本课只解决“如何把任务问清楚”。确认后的计划、同步、预警、自检和交付闭环，属于第6课“如何正确接收任务”。</p>
    </article>,
  },
  {
    title: "核心原则：对齐先行原则", short: "对齐先行", type: "阅读", time: "3分钟", summary: "不猜测、不空问、不裸奔",
    content: <article className="bookContent">
      <p className="bookLead">模糊任务到来时，先让双方形成一致理解，再投入正式执行。</p>
      <h2>不猜测</h2>
      <p>会改变方向、工作量和最终结果的信息，不能按自己的习惯补全。“详细”“高级”“重点客户”都需要转化成具体标准。</p>
      <h2>不空问</h2>
      <p>不要把所有决定推回给安排者。指出关键缺口，并带着具体问题、默认方案或选项确认。</p>
      <h2>不裸奔</h2>
      <p>复杂、多人、高风险或容易变化的要求，要复述并留下双方可回看的记录。</p>
      <blockquote>记住三个“不”：不猜测、不空问、不裸奔。先对齐，再开工。</blockquote>
    </article>,
  },
  {
    title: "任务清晰度三检", short: "清晰三检", type: "阅读", time: "3分钟", summary: "检查目标、交付和约束",
    content: <article className="bookContent">
      <p className="bookLead">不是每项任务都要问七个问题。先判断哪个关键部分存在缺口。</p>
      <ol className="bookSteps">
        <li><h3>检查目标</h3><p>为什么做、给谁使用、希望促成什么决定或行动？</p></li>
        <li><h3>检查交付</h3><p>到底交什么、范围多大、什么标准算完成、由谁验收？</p></li>
        <li><h3>检查约束</h3><p>截止时间、优先级、资源、权限、流程和禁区是什么？</p></li>
      </ol>
      <table className="bookTable"><thead><tr><th>检查结果</th><th>行动</th></tr></thead><tbody>
        <tr><td>目标、交付、约束都清楚</td><td>复述后开始</td></tr>
        <tr><td>缺少会改变方向的信息</td><td>立即确认</td></tr>
        <tr><td>细节暂时未知但不影响第一步</td><td>记录并约定补充节点</td></tr>
        <tr><td>负责人也在探索</td><td>先做小样或给选项</td></tr>
      </tbody></table>
    </article>,
  },
  {
    title: "哪些问题必须马上问？", short: "优先判断", type: "练习", time: "2分钟", summary: "区分开工条件与推进细节",
    practice: {
      context: "你要制作一份周五会议使用的竞品分析。目前只知道比较三家公司，其他要求尚不明确。",
      question: "下面哪个问题最应该在开工前确认？",
      choices: [
        { text: "最终材料帮助会议决定什么，以及交付形式和截止时间", correct: true, feedback: "回答正确。用途、交付和时间会改变整体方向，属于开工条件。" },
        { text: "正文用14号还是16号字体", correct: false, feedback: "这是可在推进中补齐的非关键细节，不应优先于任务目标和交付标准。" },
        { text: "每一页使用什么图标", correct: false, feedback: "这是后续呈现细节。方向尚未明确时讨论它，容易造成低价值投入。" },
      ],
    },
  },
  {
    title: "追问工具：5W2H任务确认表", short: "5W2H", type: "阅读", time: "4分钟", summary: "把发现的缺口转化成具体问题",
    content: <article className="bookContent">
      <p className="bookLead">任务清晰度三检找到“哪里不清楚”，5W2H帮助你决定“具体怎么问”。</p>
      <table className="bookTable"><thead><tr><th>维度</th><th>需要确认</th><th>示例</th></tr></thead><tbody>
        <tr><td>Why</td><td>目的</td><td>“看完后希望决定什么？”</td></tr>
        <tr><td>What</td><td>交付与范围</td><td>“最终要PPT还是明细表？”</td></tr>
        <tr><td>Who</td><td>使用、负责、验收</td><td>“以谁的最终意见为准？”</td></tr>
        <tr><td>When</td><td>截止与节点</td><td>“周三先看框架吗？”</td></tr>
        <tr><td>Where</td><td>提交与使用场景</td><td>“会在客户会议展示吗？”</td></tr>
        <tr><td>How</td><td>形式与标准</td><td>“更看重完整还是简洁？”</td></tr>
        <tr><td>How much</td><td>数量、预算、资源</td><td>“预计分析几家？”</td></tr>
      </tbody></table>
      <div className="bookNote">5W2H是追问工具，不是必须逐项询问的固定流程。只问会影响结果的缺口。</div>
    </article>,
  },
  {
    title: "任务确认五步法", short: "五步法", type: "阅读", time: "4分钟", summary: "完整听取、追问、复述、样例和留痕",
    content: <article className="bookContent">
      <p className="bookLead">从听到安排到形成共同标准，需要完成五个动作。</p>
      <ol className="bookSteps methodBookSteps">
        <li><h3>完整听取</h3><p>先听完背景，记录关键词和模糊词。</p></li>
        <li><h3>结构化追问</h3><p>按目标、交付、约束顺序确认关键缺口。</p></li>
        <li><h3>复述理解</h3><p>用自己的话概括目的、成果和时间。</p></li>
        <li><h3>对齐样例</h3><p>风格与深度不清时，先交目录、小样或A/B方案。</p></li>
        <li><h3>书面确认</h3><p>把关键要求和当前假设留在可回看的渠道。</p></li>
      </ol>
      <blockquote>“我确认一下：材料用于周五定价讨论，最终5页以内，对比三家企业版；周三先看框架，周四下班前交最终版。我的理解对吗？”</blockquote>
    </article>,
  },
  {
    title: "三个典型任务怎么确认？", short: "场景运用", type: "阅读", time: "5分钟", summary: "模糊口头任务、主观标准和多人协作",
    content: <article className="bookContent">
      <p className="bookLead">不同任务的确认重点不同，但都要形成可验收的共同标准。</p>
      <h2>场景一：领导口头说“尽快整理”</h2>
      <blockquote>“这次主要想看产品还是服务问题？客户范围看本月全部客户吗？最终给你一页结论还是明细表？最晚什么时候要用？”</blockquote>
      <h2>场景二：客户说“做得高级一点”</h2>
      <p>确认是视觉风格还是内容深度，并让客户从具体参考中选择，不要围绕抽象形容词反复修改。</p>
      <h2>场景三：多部门共同交付</h2>
      <p>明确总负责人、各自范围、数据口径、节点、版本管理和最终确认人。“大家一起负责”通常等于没有负责人。</p>
      <div className="bookNote">要求互相冲突时，展示取舍：“今天可以交核心结论；完整数据和案例需要到周三。你希望优先时间还是完整度？”</div>
    </article>,
  },
  {
    title: "这段确认哪里更专业？", short: "确认练习", type: "练习", time: "3分钟", summary: "带着缺口和方案确认，不机械提问",
    practice: {
      before: <MistakeList items={[
        ["直接开工", "只回复“好的”，凭感觉补全要求"],
        ["机械发问", "不分重点地问完全部5W2H"],
        ["只问动作", "不确认为什么做、给谁使用"],
        ["接受模糊词", "不把“尽快”“高级”转成标准"],
        ["不留记录", "复杂任务口头说完就开始"],
      ]} />,
      context: "领导要求今天交一份“完整报告”，但按现有资源至少需要三天。",
      question: "怎样回应最符合对齐先行原则？",
      choices: [
        { text: "“好的，我尽量今天全部完成。”", correct: false, feedback: "这隐藏了时间与质量冲突，最终很可能同时失去进度和质量。" },
        { text: "“今天可先交核心结论，完整报告周三完成。你希望今天用于临时讨论，还是等完整版本？”", correct: true, feedback: "回答正确。它展示限制、可交付方案和清楚取舍，帮助安排者做决定。" },
        { text: "“今天肯定做不了，你还是找别人吧。”", correct: false, feedback: "它只拒绝，没有说明可行范围，也没有帮助解决任务需求。" },
      ],
    },
  },
  {
    title: "带走一张任务确认卡", short: "行动卡", type: "总结", time: "1分钟", summary: "先对齐，再开工",
    content: <ActionCard
      title={<>模糊任务不靠猜<br />开工之前先对齐</>}
      points={["原则：不猜测、不空问、不裸奔", "三检：目标、交付、约束", "追问：用5W2H找到具体问题", "验证：通过复述、样例确认理解", "留痕：让关键要求和变化可回看"]}
      flow={["完整听取", "结构追问", "复述理解", "对齐样例", "书面确认"]}
      quote="记忆句：先用三检发现缺口，再用5W2H把缺口问清楚。"
    />,
  },
];

export default function LessonFive() {
  return <CoursePlayer lessonNumber={5} lessonTitle="如何确认任务要求" steps={steps} />;
}

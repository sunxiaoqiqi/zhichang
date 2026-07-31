"use client";

import { useLayoutEffect, useRef, useState } from "react";

type StepType = "阅读" | "练习" | "总结";
type Choice = { text: string; correct: boolean; feedback: string };

const steps: Array<{
  title: string;
  short: string;
  type: StepType;
  time: string;
  summary: string;
  required?: boolean;
}> = [
  { title: "现在适合加入吗？", short: "边界判断", type: "练习", time: "1分钟", summary: "先判断话题边界，再决定是否开口", required: true },
  { title: "加入话题真正难在哪里？", short: "学习目标", type: "阅读", time: "2分钟", summary: "不是强行融入，而是自然进入一段正在发生的对话" },
  { title: "核心原则：听—接—还模型", short: "听接还", type: "阅读", time: "3分钟", summary: "听懂原话题、接住一个点、还回交流权" },
  { title: "入圈三判：开口前先判断", short: "入圈三判", type: "阅读", time: "3分钟", summary: "边界、切口和开放度" },
  { title: "一句话里有哪些接口？", short: "拆话练习", type: "练习", time: "2分钟", summary: "从人物、事情、感受中选一个点承接", required: true },
  { title: "五种接话工具", short: "接话工具", type: "阅读", time: "4分钟", summary: "接关键词、事实、问句、情绪和经历" },
  { title: "加入话题五步法", short: "五步法", type: "阅读", time: "4分钟", summary: "旁听、等空隙、接话、还回去、看反馈" },
  { title: "三个典型场景怎么用？", short: "场景运用", type: "阅读", time: "5分钟", summary: "兴趣闲聊、项目讨论和陌生话题" },
  { title: "没人接话时怎么办？", short: "回应练习", type: "练习", time: "3分钟", summary: "识别回应强度，不用追加解释挽救场面", required: true },
  { title: "带走一张行动卡", short: "行动卡", type: "总结", time: "1分钟", summary: "下次加入多人谈话时直接照着做" },
];

const boundaryChoices: Choice[] = [
  { text: "走过去问：“你们在聊什么？也告诉我一下。”", correct: false, feedback: "话题涉及个人绩效，而且双方刻意压低声音，属于较私密的交流，不适合主动加入。" },
  { text: "不加入，也不在旁边继续听，给他们保留空间", correct: true, feedback: "回答正确。认识谈话者不等于自动拥有参与资格。先尊重边界，比证明自己合群更重要。" },
  { text: "先在旁边听清楚，再找认识的同事单独打听", correct: false, feedback: "这仍然是在追问私人信息。判断不适合加入后，也不应通过其他方式继续打听。" },
];

const interfaceChoices: Choice[] = [
  { text: "接活动：“密室逃脱是哪一家？难度怎么样？”", correct: false, feedback: "这句话其实接住了。它抓住具体活动，问题明确，也能让原话题继续。再找找没有接住的一项。" },
  { text: "接感受：“回来那么晚，今天上班一定很累吧。”", correct: false, feedback: "这句话其实接住了。它回应了对方透露的疲惫，属于接情绪。再找找把中心转走的一项。" },
  { text: "抢话题：“这不算晚，我上次团建凌晨两点才到家。”", correct: true, feedback: "回答正确。这句话用比较把中心转到了自己身上，没有先接住对方的经历。" },
];

const responseChoices: Choice[] = [
  { text: "马上补充：“我的意思是那家真的很好，我再详细讲讲……”", correct: false, feedback: "连续解释会延长尴尬。一次话没有被接住很正常，不需要强行挽救。" },
  { text: "保持自然，把目光还给原来的说话者，等待对话继续", correct: true, feedback: "回答正确。停下来也是成熟的交流动作。没人承接，只表示这一句暂时没有接口。" },
  { text: "直接说：“看来你们不欢迎我，那我走了。”", correct: false, feedback: "一次短暂停顿不能说明自己被排挤。公开表达受伤会给所有人增加压力。" },
];

export default function LessonTwo() {
  const [active, setActive] = useState(0);
  const [unlocked, setUnlocked] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [message, setMessage] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollPositions = useRef<Record<number, number>>({});
  const pendingScroll = useRef(0);

  const ready = !steps[active].required || answers[active] !== undefined;
  const progress = Math.round((completed.length / steps.length) * 100);

  useLayoutEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = pendingScroll.current;
  }, [active]);

  const remember = () => {
    if (contentRef.current) scrollPositions.current[active] = contentRef.current.scrollTop;
  };

  const openStep = (index: number) => {
    if (index > unlocked) {
      setMessage(`请先完成第 ${unlocked + 1} 步，再进入后面的内容。`);
      return;
    }
    remember();
    pendingScroll.current = scrollPositions.current[index] ?? 0;
    setActive(index);
    setMessage("");
  };

  const next = () => {
    if (!ready) {
      setMessage("请先做出选择并查看反馈，再进入下一步。");
      return;
    }
    setCompleted((value) => value.includes(active) ? value : [...value, active]);
    if (active < steps.length - 1) {
      const target = active + 1;
      remember();
      pendingScroll.current = 0;
      setUnlocked((value) => Math.max(value, target));
      setActive(target);
      setMessage("");
      window.scrollTo({ top: 0, behavior: "auto" });
    } else {
      window.localStorage.setItem("course-lesson-2", JSON.stringify({ completed: Array.from({ length: steps.length }, (_, index) => index), unlocked: steps.length - 1, finished: true, updatedAt: Date.now() }));
      window.location.href = "/lesson-3";
    }
  };

  return (
    <main className="fixedCourse">
      <header className="learningHeader">
        <div className="headerMeta">
          <a className="brand" href="/"><span className="brandMark">61</span><span>职场沟通训练营</span></a>
          <div className="lessonIdentity"><small>第一阶段 · 敢沟通</small><strong>第2课：如何加入同事的话题</strong></div>
          <div className="headerProgress"><span>{progress}%</span><div><i style={{ width: `${progress}%` }} /></div></div>
        </div>
        <nav className="learningMap learningMapTen" aria-label="学习地图">
          {steps.map((step, index) => {
            const done = completed.includes(index);
            const locked = index > unlocked;
            return <button key={step.title} type="button"
              className={`${active === index ? "active" : ""} ${done ? "done" : ""} ${locked ? "locked" : ""} type-${step.type}`}
              onClick={() => openStep(index)} aria-current={active === index ? "step" : undefined}>
              <span>{done ? "✓" : index + 1}</span><span><small>{step.type}</small><strong>{step.short}</strong></span>
            </button>;
          })}
        </nav>
      </header>

      <section className={`stagePage stage-${steps[active].type}`} id="course-stage">
        <div className="stageFrame">
          <header className="stageHeading">
            <div><span className="stageType">{steps[active].type} · {steps[active].required ? "需要完成选择" : "阅读理解"}</span><small>步骤 {active + 1} / {steps.length} · 预计 {steps[active].time}</small></div>
            <div><h1>{steps[active].title}</h1><p>{steps[active].summary}</p></div>
          </header>

          <div className="stageContent" ref={contentRef}>
            {active === 0 && <Practice context="午休时，两位同事靠得很近，小声讨论其中一人的绩效反馈。你刚好认识他们。" question="现在，怎样做更合适？" choices={boundaryChoices} selected={answers[0]} onSelect={(i) => { setAnswers({ ...answers, 0: i }); setMessage(""); }} />}
            {active === 1 && <GoalChapter />}
            {active === 2 && <PrincipleChapter />}
            {active === 3 && <JudgmentChapter />}
            {active === 4 && <Practice context="同事说：“昨天团建回来太晚了，不过密室逃脱那一场特别好玩。”" question="下面哪句话没有接住原话题？" choices={interfaceChoices} selected={answers[4]} onSelect={(i) => { setAnswers({ ...answers, 4: i }); setMessage(""); }} multipleCorrect />}
            {active === 5 && <ToolsChapter />}
            {active === 6 && <MethodChapter />}
            {active === 7 && <ScenesChapter />}
            {active === 8 && <Practice context="你接着同事的旅行话题分享了一句相关经历，但大家没有接话，现场停了两秒。" question="接下来怎么做更自然？" choices={responseChoices} selected={answers[8]} onSelect={(i) => { setAnswers({ ...answers, 8: i }); setMessage(""); }}><Mistakes /></Practice>}
            {active === 9 && <ActionCard />}
          </div>

          {message && <p className="stageMessage" role="alert">{message}</p>}
          <footer className="stageFooter">
            <button type="button" className="previousStage" disabled={active === 0} onClick={() => openStep(active - 1)}>← 上一步<small>{active ? steps[active - 1].short : "已经是第一步"}</small></button>
            <span className="stagePosition">{active + 1} / {steps.length}</span>
            <div className="nextStageArea">
              {active === steps.length - 1 && <a href="/" className="homeReturnLink">回到首页</a>}
              <button type="button" className={`nextStage ${ready ? "" : "waiting"}`} onClick={next}>
                {active === steps.length - 1 ? "完成并进入下一课 →" : ready ? "下一步 →" : "请先完成选择"}
                <small>{active < steps.length - 1 ? steps[active + 1].short : "第3课"}</small>
              </button>
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
}

function Practice({ context, question, choices, selected, onSelect, children, multipleCorrect }: {
  context: string; question: string; choices: Choice[]; selected?: number; onSelect: (index: number) => void; children?: React.ReactNode; multipleCorrect?: boolean;
}) {
  return <div className="practiceStack">
    {children}
    <div className="practiceLayout">
      <div className="scenarioPanel"><span>情境练习</span><p>{context}</p><h3>{question}</h3></div>
      <div className="choicePanel">
        <p className="instruction">请选择一个答案。{multipleCorrect ? "注意题目问的是“没有接住”的表达。" : "选择后会立即显示分析。"}</p>
        <div className="answerList">{choices.map((choice, index) =>
          <button type="button" key={choice.text} onClick={() => onSelect(index)}
            className={`answerButton ${selected === index ? choice.correct ? "correct" : "incorrect" : ""}`}>
            <span>{String.fromCharCode(65 + index)}</span>
            <div className="answerCopy"><strong>{choice.text}</strong>{selected === index &&
              <div className="inlineFeedback"><b>{choice.correct ? "回答正确" : "再想一想"}</b><p>{choice.feedback}</p></div>}
            </div>
          </button>)}
        </div>
      </div>
    </div>
  </div>;
}

function GoalChapter() {
  return <article className="bookContent">
    <p className="bookLead">看到几位同事聊得正热闹，自己站在旁边却不知道何时插话，是新人最常见的社交困境之一。</p>
    <h2>本课不是教你“强行融入”</h2>
    <p>加入话题不等于参与每一次聊天。真正要学的是：<strong>先判断这个话题是否欢迎自己进入，再用一句与原话题相关的话参与，并把交流空间还给原来的谈话者。</strong></p>
    <blockquote>好的加入，是让原来的对话多一个连接点，而不是突然多一个中心人物。</blockquote>
    <h2>学完后，你要能够做到</h2>
    <ul><li>区分开放闲聊与私人谈话；</li><li>等待合适空隙，不靠提高音量抢话；</li><li>从别人刚说的话里找到一个接口；</li><li>简短表达后，把话题还给大家；</li><li>没人回应时，不急着解释或否定自己。</li></ul>
    <div className="bookNote"><strong>课程边界：</strong>本课解决“进入已经发生的多人对话”。两个人都不知道说什么时如何产生新话题，属于第3课。</div>
  </article>;
}

function PrincipleChapter() {
  return <article className="bookContent">
    <p className="bookLead">加入别人正在进行的对话时，记住三个字：听、接、还。</p>
    <h2>一、听：先进入语境</h2>
    <p>刚走到旁边时先听几句话，弄清大家在谈什么、是什么情绪、属于公开闲聊还是私人交流。没有上下文就贸然插话，很容易答非所问。</p>
    <h2>二、接：接原来的话</h2>
    <p>从别人刚说的话中找到一个连接点，补充回应、信息、经历或问题。你不是要证明“我也有故事”，而是帮助原话题向前走。</p>
    <h2>三、还：还回交流权</h2>
    <p>第一次加入先说短一点，再通过一个轻问题、一个停顿或目光交流，把表达机会交回去。有人承接再继续，没人承接就停止追加。</p>
    <div className="bookCompare"><div><small>抢走话题</small><p>“这算什么，我上次遇到的情况更夸张……”</p></div><div><small>听—接—还</small><p>“听起来确实挺赶的。你们后来怎么解决的？”</p></div></div>
  </article>;
}

function JudgmentChapter() {
  return <article className="bookContent">
    <p className="bookLead">开口前先做“入圈三判”。它回答三个问题：能不能进、从哪里进、进来后要不要继续。</p>
    <ol className="bookSteps">
      <li><h3>判断边界</h3><p>公开区域、轻松语气、共同兴趣通常较开放；压低声音、绩效工资、家庭矛盾和他人隐私通常不适合加入。</p><p className="bookHint">边界不清楚时，不加入更稳妥。</p></li>
      <li><h3>判断切口</h3><p>你是否有共同经历、有效信息、真诚问题或情绪回应？如果只是希望别人注意自己，可以先继续听。</p><p className="bookHint">切口必须与大家正在说的内容有关。</p></li>
      <li><h3>判断开放度</h3><p>有人转向你、追问或解释背景，说明可以继续；只是礼貌点头后回到原话题，说明这次加入已完成。</p><p className="bookHint">反馈决定深度，不靠自己的热情决定。</p></li>
    </ol>
    <table className="bookTable"><thead><tr><th>观察</th><th>判断</th><th>行动</th></tr></thead><tbody>
      <tr><td>公共区域闲聊，有人看向你</td><td>开放</td><td>等停顿后简短接话</td></tr>
      <tr><td>只听到最后半句</td><td>上下文不足</td><td>先旁听</td></tr>
      <tr><td>加入后有人追问</td><td>愿意继续</td><td>适度补充</td></tr>
      <tr><td>压低声音谈个人情况</td><td>私人边界</td><td>不加入、不打听</td></tr>
    </tbody></table>
  </article>;
}

function ToolsChapter() {
  return <article className="bookContent">
    <p className="bookLead">一句话里通常有多个接口。先拆出人物、事情、地点和感受，再选择一个最容易接住的点。</p>
    <h2>五种常用接口</h2>
    <ul>
      <li><strong>接关键词：</strong>顺着对方刚提到的人、事、地点继续。“你们去了哪些地方？”</li>
      <li><strong>接事实：</strong>补充一条直接相关、对大家有用的信息，但不要变成纠正。</li>
      <li><strong>接问句：</strong>把简单认同变成一个容易回答的问题，一次只问一个。</li>
      <li><strong>接情绪：</strong>先回应开心、意外、无奈或辛苦，不急着分析和建议。</li>
      <li><strong>接经历：</strong>分享一小段相关经历，再把话题还回去。</li>
    </ul>
    <h2>分享经历的稳妥结构</h2>
    <blockquote>回应对方 → 分享一小段自己 → 用问题还回话题</blockquote>
    <div className="bookDialogue">
      <p><small>对方</small>“过节时亲戚来上海，我带他们转了好几个地方，累得不行。”</p>
      <p><small>回应情绪</small>“带一大家人到处玩确实很费体力，听着就累。”</p>
      <p><small>轻量追问</small>“你们最后去了哪些地方？”</p>
    </div>
    <div className="bookNote">不需要同时接住所有接口。选一个最自然的点，比连续追问更容易让人回应。</div>
  </article>;
}

function MethodChapter() {
  return <article className="bookContent">
    <p className="bookLead">“加入话题五步法”控制的是进入对话的节奏，而不是要求你背固定台词。</p>
    <ol className="bookSteps methodBookSteps">
      <li><h3>旁听定位</h3><p>先听两三句话，确认内容、情绪和边界。</p></li>
      <li><h3>等待空隙</h3><p>等别人说完、大家笑完或话题自然切换，不在句子中间抢话。</p></li>
      <li><h3>简短接话</h3><p>第一次控制在一两句话内，少用“不是”“其实”“你们错了”开头。</p></li>
      <li><h3>把话题还回去</h3><p>留一个轻问题，或说完自然停顿，看向原来的谈话者。</p></li>
      <li><h3>根据反馈进退</h3><p>有人追问就继续；只是礼貌回应，就让对话回到原来的节奏。</p></li>
    </ol>
    <h2>三个好用的开头</h2>
    <ul><li>“你们刚才说到这个，我也遇到过一次……”</li><li>“原来你们也在聊这部剧，我刚看到第二集。”</li><li>“这个我不太了解，不过你刚说的那个变化听起来挺明显的。”</li></ul>
  </article>;
}

function ScenesChapter() {
  return <article className="bookContent">
    <p className="bookLead">同一套“听—接—还”，在兴趣闲聊、工作讨论和陌生话题中，切口不同。</p>
    <h2>场景一：午餐时讨论影视或游戏</h2>
    <p><strong>先听清进度和对象：</strong>“你们也在看这部剧呀？刚才说的那一段我也觉得挺意外。你们看到第几集了？我怕剧透。”</p>
    <p>这句话回应了当前内容，也主动确认边界。大家愿意继续时，只围绕一个角色或情节分享。</p>
    <h2>场景二：讨论你参与过的项目</h2>
    <p><strong>先确认，再补充：</strong>“对，那次上线前确实改了好几轮。我当时负责数据检查，还记得最后一天大家一起对到很晚。后来又改一次，是客户有新反馈吗？”</p>
    <p>如果记忆不同，不要说“不是这样的”，可以说：“我记得的版本有一点不同，可能是我参与的阶段不一样。”</p>
    <h2>场景三：出现自己不熟悉的话题</h2>
    <p><strong>承认不了解，接具体信息：</strong>“这个游戏我还没玩过。你刚才说它适合几个人一起，是因为合作比较多吗？”</p>
    <p>不熟悉不等于不能加入，但不要不断提问让所有人给你补课。听懂一点后可以说：“明白一些了，听起来挺有意思，你们继续。”</p>
  </article>;
}

function Mistakes() {
  return <article className="mistakeIntro">
    <h2>作答前，先看常见错误</h2>
    <ul><li><strong>没听懂就表达：</strong>只抓到关键词，容易答非所问。</li><li><strong>提高音量抢话：</strong>加入靠时机，不靠音量。</li><li><strong>把话题变成长故事：</strong>自己的经历超过原话题。</li><li><strong>连续提问：</strong>参与感变成采访感。</li><li><strong>用反驳开场：</strong>第一句话就改变气氛。</li><li><strong>没人回应仍追加：</strong>越解释，尴尬越长。</li></ul>
  </article>;
}

function ActionCard() {
  return <div className="actionCard expandedAction">
    <div><span>随身行动卡</span><h3>不抢着成为中心<br />只为对话增加连接</h3></div>
    <ul><li>先听：我听懂上下文了吗？</li><li>再判：话题开放吗？我有切口吗？</li><li>等候：在完整句子之后进入</li><li>接话：只接一个点，先说一两句</li><li>还回：留问题或停顿，看反馈进退</li></ul>
    <div className="actionFlow"><span>旁听定位</span><i>→</i><span>等待空隙</span><i>→</i><span>简短接话</span><i>→</i><span>还回话题</span><i>→</i><span>根据反馈进退</span></div>
    <blockquote>记忆句：先听懂，再接住，说完以后还回去。</blockquote>
  </div>;
}

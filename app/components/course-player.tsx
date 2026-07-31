"use client";

import { Fragment, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

export type Choice = { text: string; correct: boolean; feedback: string };
export type CourseStep = {
  title: string;
  short: string;
  type: "阅读" | "练习" | "总结";
  time: string;
  summary: string;
  content?: ReactNode;
  practice?: {
    context: string;
    question: string;
    instruction?: string;
    choices: Choice[];
    before?: ReactNode;
  };
};

const lessonCatalog = [
  "新人如何自然开口","如何加入同事的话题","不知道说什么时怎么办","如何判断自己是否被排挤",
  "如何正确接收任务","如何确认任务要求","如何催促同事","工作出错后如何汇报","如何应对临时任务",
  "被领导批评时怎么回应","被领导误会时如何澄清","如何向领导提出不同意见","如何回应加班要求","如何看待领导的口头承诺",
  "如何拒绝同事帮忙","如何回应隐私问题","如何制止反复占便宜","如何应对越级派活",
  "被同事甩锅怎么办","被公开批评怎么办","如何回应阴阳怪气","开会被反驳怎么办",
  "如何让成果被看见","功劳被抢怎么办","如何在会议中影响决策","如何争取资源和机会",
];

export function CoursePlayer({
  lessonNumber,
  lessonTitle,
  steps,
}: {
  lessonNumber: number;
  lessonTitle: string;
  steps: CourseStep[];
}) {
  const [active, setActive] = useState(0);
  const [unlocked, setUnlocked] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [message, setMessage] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollPositions = useRef<Record<number, number>>({});
  const pendingScroll = useRef(0);
  const step = steps[active];
  const ready = !step.practice || answers[active] !== undefined;
  const progress = Math.round((completed.length / steps.length) * 100);
  const phase = lessonNumber <= 4
    ? "第一阶段 · 敢沟通"
    : lessonNumber <= 9
      ? "第二阶段 · 会协作"
      : lessonNumber <= 14
        ? "第三阶段 · 能向上表达"
        : lessonNumber <= 18
          ? "第四阶段 · 守住边界"
          : lessonNumber <= 22
            ? "第五阶段 · 处理冲突"
            : "第六阶段 · 建立影响力";

  useEffect(() => {
    const saved = window.localStorage.getItem(`course-lesson-${lessonNumber}`);
    try {
      if (!saved) throw new Error("no local progress");
      const state = JSON.parse(saved) as { completed?: number[]; unlocked?: number };
      if (Array.isArray(state.completed)) setCompleted(state.completed);
      if (typeof state.unlocked === "number") setUnlocked(Math.min(state.unlocked, steps.length - 1));
    } catch {
      if (!saved) { /* continue with remote progress */ }
      else
      window.localStorage.removeItem(`course-lesson-${lessonNumber}`);
    }
    fetch("/api/progress").then(async response => response.ok ? response.json() : null).then((data: { progress?: Array<{ lessonNumber: number; completed: number[]; unlocked: number }> } | null) => {
      const remote = data?.progress?.find((item) => item.lessonNumber === lessonNumber);
      if (remote) { setCompleted(remote.completed); setUnlocked(Math.min(remote.unlocked, steps.length - 1)); }
    }).finally(() => setHydrated(true));
  }, [lessonNumber, steps.length]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(`course-lesson-${lessonNumber}`, JSON.stringify({
      completed,
      unlocked,
      finished: completed.length === steps.length,
      updatedAt: Date.now(),
    }));
    window.dispatchEvent(new Event("course-progress"));
    void fetch("/api/progress", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ lessonNumber, completed, unlocked, finished: completed.length === steps.length }) });
  }, [completed, hydrated, lessonNumber, steps.length, unlocked]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setSidebarOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [sidebarOpen]);

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
      const allCompleted = Array.from({ length: steps.length }, (_, index) => index);
      window.localStorage.setItem(`course-lesson-${lessonNumber}`, JSON.stringify({ completed: allCompleted, unlocked: steps.length - 1, finished: true, updatedAt: Date.now() }));
      window.location.href = lessonNumber < 26 ? `/lesson-${lessonNumber + 1}` : "/";
    }
  };

  return (
    <main className="fixedCourse">
      <header className="learningHeader">
        <div className="headerMeta">
          <button className="courseSidebarToggle" type="button" onClick={() => setSidebarOpen(true)} aria-label="打开课程导航"><span>☰</span><small>课程</small></button>
          <a className="brand" href="/"><span className="brandMark">61</span><span>职场沟通训练营</span></a>
          <div className="lessonIdentity"><small>{phase}</small><strong>第{lessonNumber}课：{lessonTitle}</strong></div>
          <div className="headerProgress"><span>{progress}%</span><div><i style={{ width: `${progress}%` }} /></div></div>
        </div>
        <nav className="learningMap learningMapTen" aria-label="学习地图">
          {steps.map((item, index) => {
            const done = completed.includes(index);
            const locked = index > unlocked;
            return <button key={item.title} type="button"
              className={`${active === index ? "active" : ""} ${done ? "done" : ""} ${locked ? "locked" : ""} type-${item.type}`}
              onClick={() => openStep(index)} aria-current={active === index ? "step" : undefined}>
              <span>{done ? "✓" : index + 1}</span><span><small>{item.type}</small><strong>{item.short}</strong></span>
            </button>;
          })}
        </nav>
      </header>

      <section className={`stagePage stage-${step.type}`} id="course-stage">
        <div className="stageFrame">
          <header className="stageHeading">
            <div><span className="stageType">{step.type} · {step.practice ? "需要完成选择" : "阅读理解"}</span><small>步骤 {active + 1} / {steps.length} · 预计 {step.time}</small></div>
            <div><h1>{step.title}</h1><p>{step.summary}</p></div>
          </header>
          <div className="stageContent" ref={contentRef}>
            {step.practice
              ? <Practice {...step.practice} selected={answers[active]} onSelect={(index) => {
                  setAnswers((value) => ({ ...value, [active]: index }));
                  setMessage("");
                }} />
              : step.content}
          </div>
          {message && <p className="stageMessage" role="alert">{message}</p>}
          <footer className="stageFooter">
            <button type="button" className="previousStage" disabled={active === 0} onClick={() => openStep(active - 1)}>← 上一步<small>{active ? steps[active - 1].short : "已经是第一步"}</small></button>
            <span className="stagePosition">{active + 1} / {steps.length}</span>
            <div className="nextStageArea">
              {active === steps.length - 1 && <a href="/" className="homeReturnLink">回到首页</a>}
              <button type="button" className={`nextStage ${ready ? "" : "waiting"}`} onClick={next}>
                {active === steps.length - 1 ? lessonNumber < 26 ? "完成并进入下一课 →" : "完成全部课程" : ready ? "下一步 →" : "请先完成选择"}
                <small>{active < steps.length - 1 ? steps[active + 1].short : lessonNumber < 26 ? `第${lessonNumber + 1}课` : "返回课程首页"}</small>
              </button>
            </div>
          </footer>
        </div>
      </section>

      {sidebarOpen && <div className="courseSidebarBackdrop" onMouseDown={(event) => { if (event.currentTarget === event.target) setSidebarOpen(false); }}>
        <aside className="courseSidebar" aria-label="课程导航">
          <header><div><small>{phase}</small><strong>课程导航</strong></div><button type="button" onClick={() => setSidebarOpen(false)} aria-label="关闭课程导航">×</button></header>
          <div className="sidebarLessonTitle"><span>当前学习 · 第{lessonNumber}课</span><h2>{lessonTitle}</h2><p>{progress}% 已完成</p></div>
          <nav className="sidebarAllLessons">
            {lessonCatalog.map((title, index) => {
              const number = index + 1;
              return <a href={`/lesson-${number}`} key={title} className={number === lessonNumber ? "active" : ""}><span>{String(number).padStart(2, "0")}</span><div><small>{number === lessonNumber ? "当前课程" : number <= 4 ? "敢沟通" : number <= 9 ? "会协作" : number <= 14 ? "向上表达" : number <= 18 ? "守住边界" : number <= 22 ? "处理冲突" : "建立影响力"}</small><strong>{title}</strong></div></a>;
            })}
          </nav>
          <footer><a href="/">返回首页</a><button type="button" onClick={() => setSidebarOpen(false)}>继续学习</button></footer>
        </aside>
      </div>}
    </main>
  );
}

function Practice({
  context,
  question,
  instruction,
  choices,
  before,
  selected,
  onSelect,
}: {
  context: string;
  question: string;
  instruction?: string;
  choices: Choice[];
  before?: ReactNode;
  selected?: number;
  onSelect: (index: number) => void;
}) {
  return <div className="practiceStack">
    {before}
    <div className="practiceLayout">
      <div className="scenarioPanel"><span>情境练习</span><p>{context}</p><h3>{question}</h3></div>
      <div className="choicePanel">
        <p className="instruction">{instruction ?? "请选择一个答案。选择后会立即显示分析。"}</p>
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

export function MistakeList({ items }: { items: Array<[string, string]> }) {
  return <article className="mistakeIntro"><h2>作答前，先看常见错误</h2><ul>{items.map(([title, text]) => <li key={title}><strong>{title}：</strong>{text}</li>)}</ul></article>;
}

export function ReadingChapter({
  lead,
  sections,
  quote,
  note,
}: {
  lead: string;
  sections: Array<{ title: string; text?: string; items?: string[] }>;
  quote?: string;
  note?: string;
}) {
  return <article className="bookContent">
    <p className="bookLead">{lead}</p>
    {sections.map((section) => <Fragment key={section.title}>
      <h2>{section.title}</h2>
      {section.text && <p>{section.text}</p>}
      {section.items && <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul>}
    </Fragment>)}
    {quote && <blockquote>{quote}</blockquote>}
    {note && <div className="bookNote">{note}</div>}
  </article>;
}

export function ActionCard({ title, points, flow, quote }: {
  title: ReactNode;
  points: string[];
  flow: string[];
  quote: string;
}) {
  return <div className="actionCard expandedAction">
    <div><span>随身行动卡</span><h3>{title}</h3></div>
    <ul>{points.map((point) => <li key={point}>{point}</li>)}</ul>
    <div className="actionFlow">{flow.map((item, index) => <Fragment key={item}>{index > 0 && <i>→</i>}<span>{item}</span></Fragment>)}</div>
    <blockquote>{quote}</blockquote>
  </div>;
}

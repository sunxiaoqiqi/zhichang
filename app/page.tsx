"use client";

import { useEffect, useMemo, useState } from "react";

const phases = [
  { name: "敢沟通", range: "1—4", goal: "从敢开口开始，建立自然、低压力的连接", lessons: ["新人如何自然开口","如何加入同事的话题","不知道说什么时怎么办","如何判断自己是否被排挤"] },
  { name: "会协作", range: "5—9", goal: "把任务听懂、说清、推动到结果", lessons: ["如何正确接收任务","如何确认任务要求","如何催促同事","工作出错后如何汇报","如何应对临时任务"] },
  { name: "能向上表达", range: "10—14", goal: "面对权力差也能准确表达事实与意见", lessons: ["被领导批评时怎么回应","被领导误会时如何澄清","如何向领导提出不同意见","如何回应加班要求","如何看待领导的口头承诺"] },
  { name: "守住边界", range: "15—18", goal: "在不破坏协作的前提下保护时间、隐私与流程", lessons: ["如何拒绝同事帮忙","如何回应隐私问题","如何制止反复占便宜","如何应对越级派活"] },
  { name: "处理冲突", range: "19—22", goal: "在压力下回到事实、责任和解决方案", lessons: ["被同事甩锅怎么办","被公开批评怎么办","如何回应阴阳怪气","开会被反驳怎么办"] },
  { name: "建立影响力", range: "23—26", goal: "让贡献被看见，并推动决策与资源流动", lessons: ["如何让成果被看见","功劳被抢怎么办","如何在会议中影响决策","如何争取资源和机会"] },
];

const allLessons = phases.flatMap((phase, phaseIndex) => phase.lessons.map((title, index) => ({
  number: phases.slice(0, phaseIndex).reduce((sum, item) => sum + item.lessons.length, 0) + index + 1,
  title,
  phase: phase.name,
})));

type ProgressState = { completed?: number[]; finished?: boolean; updatedAt?: number };

export default function Home() {
  const [progress, setProgress] = useState<Record<number, ProgressState>>({});
  const [ready, setReady] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  const readProgress = async () => {
    const next: Record<number, ProgressState> = {};
    for (let number = 1; number <= 26; number += 1) {
      try {
        const saved = window.localStorage.getItem(`course-lesson-${number}`);
        if (saved) next[number] = JSON.parse(saved) as ProgressState;
      } catch { /* ignore damaged local progress */ }
    }
    try {
      const response = await fetch("/api/progress");
      if (response.ok) {
        const data = await response.json() as { progress: Array<{ lessonNumber: number; completed: number[]; finished: boolean; updatedAt: string }> };
        for (const item of data.progress) next[item.lessonNumber] = { completed: item.completed, finished: item.finished, updatedAt: new Date(item.updatedAt).getTime() };
      }
    } catch { /* local progress remains available offline */ }
    setProgress(next);
    setReady(true);
  };

  useEffect(() => {
    readProgress();
    window.addEventListener("course-progress", readProgress);
    return () => window.removeEventListener("course-progress", readProgress);
  }, []);

  useEffect(() => {
    if (!mapOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setMapOpen(false); };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", close);
    };
  }, [mapOpen]);

  const completedCount = Object.values(progress).filter((item) => item.finished).length;
  const percent = Math.round((completedCount / 26) * 100);
  const continueLesson = useMemo(() => {
    const unfinishedStarted = allLessons.find((lesson) => progress[lesson.number] && !progress[lesson.number].finished);
    if (unfinishedStarted) return unfinishedStarted;
    return allLessons.find((lesson) => !progress[lesson.number]?.finished) ?? allLessons[25];
  }, [progress]);

  return <main className="courseHome oneScreenHome">
    <header className="homeTopbar">
      <a className="brand homeBrand" href="/"><span className="brandMark">61</span><span>职场沟通训练营</span></a>
      <nav><span>26课 · 6阶段</span><button type="button" onClick={() => setMapOpen(true)}>查看全部课程</button></nav>
    </header>

    <section className="modeOnlyHero">
      <div className="coursePanel">
        <div className="courseIntro">
        <span>职场沟通 · 情境训练专项课程</span>
        <h1>从敢开口，<br />到影响决策</h1>
        <p className="courseLead">很多职场沟通问题，并不是“不会说话”，而是没有先看清情境、关系和目标。这套课程从26个高频难题出发，帮你建立可重复使用的判断与表达系统。</p>
        <div className="courseIntroDetails">
          <section><b>课程逻辑</b><p>从敢沟通、会协作，到向上表达、守住边界、处理冲突，最后建立影响力；能力按真实职场难度逐级推进。</p></section>
          <section><b>学习方法</b><p>先进入情境作判断，再阅读原则与方法，通过即时反馈修正理解，最后带走一张可以直接使用的行动卡。</p></section>
        </div>
        <div className="courseFacts"><div><b>26</b><small>节场景课程</small></div><div><b>6</b><small>个能力阶段</small></div><div><b>20—30分钟</b><small>完成一课</small></div><div><b>情境＋反馈</b><small>无需基础</small></div></div>
        <span className="srOnly">课程阶段：1—4 敢沟通；5—9 会协作；10—14 能向上表达；15—18 守住边界；19—22 处理冲突；23—26 建立影响力。</span>
        </div>

        <div className="modeArea">
          <div className="modeAreaHeading"><span>选择学习方式</span><p>系统学习课程，或按问题类型集中训练</p></div>
          <div className="modeOnlyCards">
            <a className="learningModeCard" href={`/lesson-${continueLesson.number}`}>
          <header><span>01</span><small>{completedCount ? "继续上次进度" : "从第一课开始"}</small></header>
          <h1>学习模式</h1>
          <p>按课程路径学习判断原则、表达方法和真实场景。</p>
          <div className="modeProgress"><span><b>{ready ? `${percent}%` : "—"}</b> · 已完成{completedCount}/26课</span><i><em style={{ width: `${percent}%` }} /></i></div>
          <footer><div><small>接下来</small><b>第{continueLesson.number}课 · {continueLesson.title}</b></div><strong>继续学习 →</strong></footer>
            </a>
            <a className="trainingModeCard" href="/training">
          <header><span>02</span><small>每次随机 5 题</small></header>
          <h1>训练模式</h1>
          <p>快速判断、深度场景与连续套题，集中训练真实职场决策。</p>
          <footer><span>系统智能组卷</span><strong>开始训练 →</strong></footer>
            </a>
          </div>
        </div>
      </div>
    </section>

    {mapOpen && <div className="courseMapModal" role="dialog" aria-modal="true" aria-label="完整课程地图" onMouseDown={(event) => { if (event.currentTarget === event.target) setMapOpen(false); }}>
      <div className="courseMapDialog">
        <header><div><span>26课 · 6个阶段</span><h2>选择要学习的课程</h2><p>绿色表示已完成，橙色标记建议继续的位置。</p></div><button type="button" onClick={() => setMapOpen(false)} aria-label="关闭课程地图">×</button></header>
        <div className="modalPhaseList">
          {phases.map((phase, phaseIndex) => {
            const offset = phases.slice(0, phaseIndex).reduce((sum, item) => sum + item.lessons.length, 0);
            return <section key={phase.name}><div className="modalPhaseTitle"><span>{phaseIndex + 1}</span><div><b>{phase.name}</b><small>第{phase.range}课</small></div></div><div className="modalLessons">
              {phase.lessons.map((title, index) => {
                const number = offset + index + 1;
                const done = progress[number]?.finished;
                const current = number === continueLesson.number;
                return <a href={`/lesson-${number}`} key={title} className={`${done ? "lessonDone" : ""} ${current ? "lessonCurrent" : ""}`}><span>{done ? "✓" : number}</span><div><strong>{title}</strong><small>{done ? "已完成" : current ? "建议继续" : `第${number}课`}</small></div></a>;
              })}
            </div></section>;
          })}
        </div>
      </div>
    </div>}
  </main>;
}

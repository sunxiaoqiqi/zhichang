"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { sceneById, type BranchingQuestion, type DeepQuestion, type SimpleQuestion, type TrainingHistory, type TrainingQuestion } from "../training-data";

type AnswerRecord = Record<string, string>;

const kindLabel = { simple: "快速判断", deep: "深度场景", branching: "连续套题" } as const;

export default function TrainingPage() {
  const [questions, setQuestions] = useState<TrainingQuestion[]>([]);
  const [active, setActive] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sessionDone, setSessionDone] = useState(false);
  const [runId, setRunId] = useState("");
  const [plan, setPlan] = useState<"free" | "paid">("free");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<{ message: string; upgrade: boolean }>();
  const submitting = useRef(new Set<string>());

  useEffect(() => {
    Promise.all([fetch("/api/training/questions"),fetch("/api/training/favorites")]).then(async ([questionResponse,favoriteResponse])=>{
      const data=await questionResponse.json() as {questions?:TrainingQuestion[];history?:TrainingHistory;run?:{id:string;answeredQuestionIds:string[]};access?:{plan:"free"|"paid"};error?:string;code?:string};
      if(!questionResponse.ok) throw Object.assign(new Error(data.error ?? "训练加载失败"), { code: data.code });
      const favoriteData=await favoriteResponse.json() as {favorites:string[]};
      const assigned = data.questions ?? [];
      const answered = data.run?.answeredQuestionIds ?? [];
      setQuestions(assigned);
      setCompleted(answered);
      setRunId(data.run?.id ?? "");
      setPlan(data.access?.plan ?? "free");
      const firstUnanswered = assigned.findIndex((question) => !answered.includes(question.id));
      setActive(firstUnanswered >= 0 ? firstUnanswered : Math.max(0, assigned.length - 1));
      setFavorites(favoriteData.favorites??[]);
    }).catch((reason: Error & {code?:string})=>setLoadError({message:reason.message,upgrade:reason.code==="FREE_TRAINING_EXHAUSTED"})).finally(()=>setLoading(false));
  }, []);

  const question = questions[active];
  const progress = questions.length ? Math.round((completed.length / questions.length) * 100) : 0;

  const toggleFavorite = () => {
    if (!question) return;
    const next = favorites.includes(question.id) ? favorites.filter((id) => id !== question.id) : [...favorites, question.id];
    setFavorites(next);
    window.localStorage.setItem("training-favorites", JSON.stringify(next));
    void fetch("/api/training/favorites",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({questionId:question.id,favorite:!favorites.includes(question.id)})});
  };

  const markComplete = async (correct = true) => {
    if (!question || completed.includes(question.id) || submitting.current.has(question.id)) return;
    submitting.current.add(question.id);
    const response = await fetch("/api/training/questions",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({runId,questionId:question.id,correct})});
    const result = await response.json() as {error?:string};
    submitting.current.delete(question.id);
    if (!response.ok) { setLoadError({ message: result.error ?? "答题记录保存失败，请稍后重试", upgrade: response.status === 403 }); return; }
    setCompleted((value) => value.includes(question.id) ? value : [...value, question.id]);
    try {
      const now = Date.now();
      const history = JSON.parse(window.localStorage.getItem("training-history") ?? "null") as TrainingHistory | null;
      const previous: TrainingHistory = history ?? { questions: [], scenes: [], recentQuestionIds: [] };
      const oldQuestion = previous.questions.find((item) => item.questionId === question.id);
      const oldScene = previous.scenes.find((item) => item.sceneId === question.primarySceneId);
      const next: TrainingHistory = {
        questions: [...previous.questions.filter((item) => item.questionId !== question.id), {
          questionId: question.id,
          attempts: (oldQuestion?.attempts ?? 0) + 1,
          correctAttempts: (oldQuestion?.correctAttempts ?? 0) + (correct ? 1 : 0),
          lastAttemptedAt: now,
        }],
        scenes: [...previous.scenes.filter((item) => item.sceneId !== question.primarySceneId), {
          sceneId: question.primarySceneId,
          assignedCount: (oldScene?.assignedCount ?? 0) + 1,
          completedCount: (oldScene?.completedCount ?? 0) + 1,
          lastAssignedAt: now,
        }],
        recentQuestionIds: [question.id, ...previous.recentQuestionIds.filter((id) => id !== question.id)].slice(0, 15),
      };
      window.localStorage.setItem("training-history", JSON.stringify(next));
    } catch { /* damaged local history should not block training */ }
  };

  const next = () => {
    if (!question || !completed.includes(question.id)) return;
    if (active < questions.length - 1) setActive((value) => value + 1);
    else setSessionDone(true);
  };

  if (loadError) return <AccessPrompt message={loadError.message} upgrade={loadError.upgrade} />;
  if (loading || !question) return <main className="trainingShell"><div className="trainingLoading">正在为你分配本次训练…</div></main>;

  if (sessionDone) return <TrainingResult questions={questions} favorites={favorites} plan={plan} />;

  const scene = sceneById[question.primarySceneId];
  const isFavorite = favorites.includes(question.id);
  const isComplete = completed.includes(question.id);

  return <main className="trainingShell">
    <header className="trainingHeader">
      <a className="brand" href="/"><span className="brandMark">61</span><span>职场沟通训练营</span></a>
      <div className="trainingHeaderTitle"><small>系统组卷 · 每次 5 题</small><strong>训练模式</strong></div>
      <div className="trainingHeaderActions"><a href="/training/favorites">★ 我的收藏 <b>{favorites.length}</b></a><div className="trainingProgress"><span>{progress}%</span><div><i style={{ width: `${progress}%` }} /></div></div></div>
    </header>

    <nav className="trainingMap" aria-label="本次训练进度">
      {questions.map((item, index) => <button type="button" key={item.id} onClick={() => index <= active && setActive(index)} className={`${index === active ? "active" : ""} ${completed.includes(item.id) ? "done" : ""}`}>
        <span>{completed.includes(item.id) ? "✓" : index + 1}</span>
        <div><small>{kindLabel[item.kind]}</small><strong>{sceneById[item.primarySceneId].title}</strong></div>
      </button>)}
    </nav>

    <section className="trainingStage">
      <div className="trainingFrame">
        <header className="trainingQuestionHead">
          <div className="trainingQuestionMeta"><span>{kindLabel[question.kind]}</span><small>第 {active + 1} / {questions.length} 题 · {scene.phase}</small></div>
          <div className="trainingQuestionTitle"><div><h1>{question.title}</h1><p>主场景：第 {scene.lessonNumber} 课 · {scene.title}</p></div><button type="button" className={isFavorite ? "favorited" : ""} onClick={toggleFavorite} aria-pressed={isFavorite}>{isFavorite ? "★ 已收藏" : "☆ 收藏本题"}</button></div>
        </header>

        <div className="trainingQuestionBody" key={question.id}>
          {question.kind === "simple" && <SimpleQuestionView question={question} onComplete={markComplete} />}
          {question.kind === "deep" && <DeepQuestionView question={question} onComplete={markComplete} />}
          {question.kind === "branching" && <BranchingQuestionView question={question} onComplete={markComplete} />}
        </div>

        <footer className="trainingFooter">
          <button type="button" className="trainingPrevious" disabled={active === 0} onClick={() => setActive((value) => value - 1)}>← 上一题<small>{active ? kindLabel[questions[active - 1].kind] : "已经是第一题"}</small></button>
          <span>{active + 1} / {questions.length}</span>
          <button type="button" className={`trainingNext ${isComplete ? "" : "waiting"}`} disabled={!isComplete} onClick={next}>{active === questions.length - 1 ? "完成训练 →" : "下一题 →"}<small>{isComplete ? active === questions.length - 1 ? "查看训练结果" : kindLabel[questions[active + 1].kind] : "请先完成本题"}</small></button>
        </footer>
      </div>
    </section>
  </main>;
}

function SimpleQuestionView({ question, onComplete }: { question: SimpleQuestion; onComplete: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<string>();
  const choice = question.choices.find((item) => item.id === selected);
  return <div className="trainingPractice">
    <QuestionScenario eyebrow="快速判断" context="根据当前信息，选择最合适的第一步。" prompt={question.prompt} />
    <div className="trainingAnswers"><p>选择后立即查看分析。</p>{question.choices.map((item, index) => <AnswerButton key={item.id} choice={item} index={index} selected={selected === item.id} onClick={() => { setSelected(item.id); onComplete(item.correct); }} />)}{choice && <CourseFeedback question={question} correct={choice.correct} />}</div>
  </div>;
}

function DeepQuestionView({ question, onComplete }: { question: DeepQuestion; onComplete: (correct: boolean) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord>({});
  const current = question.scenes[step];
  const selected = answers[current.id];
  const finished = Object.keys(answers).length === question.scenes.length;
  return <div className="deepQuestion">
    <div className="caseBrief"><span>完整案例</span><p>{question.caseBackground}</p><div>{question.scenes.map((item, index) => <i key={item.id} className={index === step ? "active" : answers[item.id] ? "done" : ""}>{answers[item.id] ? "✓" : index + 1}</i>)}</div></div>
    <div className="trainingPractice">
      <QuestionScenario eyebrow={`关键节点 ${step + 1}`} context={current.context} prompt={current.prompt} />
      <div className="trainingAnswers"><p>完成当前判断后进入下一个关键节点。</p>{current.choices.map((item, index) => <AnswerButton key={item.id} choice={item} index={index} selected={selected === item.id} onClick={() => setAnswers((value) => ({ ...value, [current.id]: item.id }))} />)}
        {selected && !finished && <button className="nodeNext" type="button" onClick={() => setStep((value) => value + 1)}>进入下一个节点 →</button>}
        {finished && <><CourseFeedback question={question} correct={question.scenes.every((item) => item.choices.find((choice) => choice.id === answers[item.id])?.correct)} summary={question.summary} /><button className="nodeNext" type="button" onClick={() => onComplete(question.scenes.every((item) => item.choices.find((choice) => choice.id === answers[item.id])?.correct))}>完成这道深度题</button></>}
      </div>
    </div>
  </div>;
}

function BranchingQuestionView({ question, onComplete }: { question: BranchingQuestion; onComplete: (correct: boolean) => void }) {
  const [nodeId, setNodeId] = useState(question.startNodeId);
  const [selected, setSelected] = useState<string>();
  const [path, setPath] = useState<string[]>([]);
  const [allCorrect, setAllCorrect] = useState(true);
  const node = question.nodes.find((item) => item.id === nodeId)!;
  const choice = node.choices.find((item) => item.id === selected);
  const move = () => {
    if (!choice?.nextNodeId) return;
    if (!choice.correct) setAllCorrect(false);
    setPath((value) => [...value, `${node.id}:${choice.id}`]);
    setNodeId(choice.nextNodeId);
    setSelected(undefined);
  };
  if (node.terminal) return <div className="branchResult"><span>路径完成</span><h2>你完成了 {path.length} 轮连续判断</h2><p>{question.pathSummary}</p><CourseFeedback question={question} correct={allCorrect} /><button className="nodeNext" type="button" onClick={() => onComplete(allCorrect)}>完成这道套题</button></div>;
  return <div className="deepQuestion">
    <div className="caseBrief branchingBrief"><span>连续套题</span><p>{question.caseBackground}</p><small>你的选择会改变下一轮情境 · 当前第 {path.length + 1} 轮</small></div>
    <div className="trainingPractice">
      <QuestionScenario eyebrow={`第 ${path.length + 1} 轮`} context={node.context} prompt={node.prompt} />
      <div className="trainingAnswers"><p>请选择一个行动，系统会根据选择继续情境。</p>{node.choices.map((item, index) => <AnswerButton key={item.id} choice={item} index={index} selected={selected === item.id} onClick={() => setSelected(item.id)} />)}{choice && <button className="nodeNext" type="button" onClick={move}>看看接下来发生什么 →</button>}</div>
    </div>
  </div>;
}

function QuestionScenario({ eyebrow, context, prompt }: { eyebrow: string; context: string; prompt: string }) {
  return <div className="trainingScenario"><span>{eyebrow}</span><p>{context}</p><h2>{prompt}</h2></div>;
}

function AnswerButton({ choice, index, selected, onClick }: { choice: { text: string; correct: boolean; feedback: string }; index: number; selected: boolean; onClick: () => void }) {
  return <button type="button" className={`trainingAnswer ${selected ? choice.correct ? "correct" : "incorrect" : ""}`} onClick={onClick}><span>{String.fromCharCode(65 + index)}</span><div><strong>{choice.text}</strong>{selected && <aside><b>{choice.correct ? "判断准确" : "再想一想"}</b><p>{choice.feedback}</p></aside>}</div></button>;
}

function CourseFeedback({ question, correct, summary }: { question: TrainingQuestion; correct: boolean; summary?: string }) {
  return <div className="courseFeedback"><span>{correct ? "本题完成" : "参考答案已解锁"}</span>{summary && <p>{summary}</p>}<div><small>对应知识点</small><strong>{question.courseReference.section}</strong><a href={question.courseReference.href}>查看第 {question.courseReference.lessonNumber} 课 →</a></div></div>;
}

function AccessPrompt({ message, upgrade }: { message: string; upgrade: boolean }) {
  return <main className="accessPromptPage"><section className="accessPromptCard"><span>{upgrade ? "FREE PLAN LIMIT" : "TRAINING UNAVAILABLE"}</span><h1>{upgrade ? "免费训练额度已用完" : "暂时无法开始训练"}</h1><p>{message}</p><div>{upgrade && <a className="primary" href="/upgrade?reason=training">联系管理员开通收费版 →</a>}<a href="/">返回首页</a></div></section></main>;
}

function TrainingResult({ questions, favorites, plan }: { questions: TrainingQuestion[]; favorites: string[]; plan: "free" | "paid" }) {
  const scenes = useMemo(() => Array.from(new Set(questions.map((question) => question.primarySceneId))).map((id) => sceneById[id]), [questions]);
  return <main className="trainingShell resultShell"><section className="trainingResult"><span>TRAINING COMPLETE</span><h1>本次 5 道训练已完成</h1><p>你覆盖了 {scenes.length} 个职场沟通场景。{plan === "paid" ? "系统下次会优先分配未覆盖和薄弱场景。" : "免费版体验已完成，开通收费版后可无限次训练。"}</p><div>{scenes.map((scene) => <article key={scene.id}><small>第 {scene.lessonNumber} 课</small><strong>{scene.title}</strong></article>)}</div><footer><span>本次收藏 {questions.filter((question) => favorites.includes(question.id)).length} 道</span>{plan === "paid" ? <a href="/training">再练一次</a> : <a href="/upgrade?reason=training">开通无限训练</a>}<a href="/">返回首页</a></footer></section></main>;
}

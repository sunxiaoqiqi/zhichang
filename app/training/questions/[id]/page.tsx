"use client";

import { use, useEffect, useState } from "react";
import { sceneById, type Choice, type TrainingQuestion } from "../../../training-data";

export default function QuestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [question, setQuestion] = useState<TrainingQuestion>();
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Record<string, string>>({});

  useEffect(() => { fetch(`/api/training/questions/${id}`).then(async (response) => { const data = await response.json() as { question?: TrainingQuestion; error?: string }; if (!response.ok) throw new Error(data.error); setQuestion(data.question); }).catch((reason: Error) => setError(reason.message)); }, [id]);
  if (error) return <main className="questionDetailPage"><section className="favoriteEmpty"><strong>{error}</strong><a href="/training/favorites">返回我的收藏</a></section></main>;
  if (!question) return <main className="questionDetailPage"><div className="favoriteEmpty">正在读取题目…</div></main>;
  const scene = sceneById[question.primarySceneId];
  return <main className="questionDetailPage"><header className="questionDetailHeader"><a href="/training/favorites">← 我的收藏</a><div><small>{question.kind === "simple" ? "快速判断" : question.kind === "deep" ? "深度场景" : "连续套题"}</small><h1>{question.title}</h1><p>第 {scene.lessonNumber} 课 · {scene.title}</p></div><a href={question.courseReference.href}>查看相关课程 →</a></header><section className="questionDetailBody">
    {question.kind === "simple" && <DetailBlock id="simple" context="收藏题目回顾" prompt={question.prompt} choices={question.choices} selected={selected.simple} onSelect={(choice) => setSelected({ simple: choice })} />}
    {question.kind === "deep" && <><article className="detailCase"><span>案例背景</span><p>{question.caseBackground}</p></article>{question.scenes.map((item, index) => <DetailBlock key={item.id} id={item.id} context={`关键节点 ${index + 1} · ${item.context}`} prompt={item.prompt} choices={item.choices} selected={selected[item.id]} onSelect={(choice) => setSelected((value) => ({ ...value, [item.id]: choice }))} />)}</>}
    {question.kind === "branching" && <><article className="detailCase"><span>案例背景</span><p>{question.caseBackground}</p></article>{question.nodes.filter((node) => !node.terminal).map((node, index) => <DetailBlock key={node.id} id={node.id} context={`分支节点 ${index + 1} · ${node.context}`} prompt={node.prompt} choices={node.choices} selected={selected[node.id]} onSelect={(choice) => setSelected((value) => ({ ...value, [node.id]: choice }))} />)}</>}
  </section></main>;
}

function DetailBlock({ context, prompt, choices, selected, onSelect }: { id: string; context: string; prompt: string; choices: Choice[]; selected?: string; onSelect: (choice: string) => void }) {
  return <article className="detailQuestion"><div><span>情境</span><p>{context}</p><h2>{prompt}</h2></div><section>{choices.map((choice, index) => <button key={choice.id} className={selected === choice.id ? choice.correct ? "correct" : "incorrect" : ""} onClick={() => onSelect(choice.id)}><i>{String.fromCharCode(65 + index)}</i><strong>{choice.text}</strong>{selected === choice.id && <p>{choice.feedback}</p>}</button>)}</section></article>;
}

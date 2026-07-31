"use client";

import { useEffect, useMemo, useState } from "react";
import { sceneById, trainingScenes, type TrainingQuestion } from "../../training-data";

const labels = { simple: "快速判断", deep: "深度场景", branching: "连续套题" } as const;
const PAGE_SIZE = 6;

export default function FavoriteQuestionsPage() {
  const [questions, setQuestions] = useState<TrainingQuestion[]>();
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("all");
  const [sceneId, setSceneId] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => { fetch("/api/training/favorites").then((response) => response.json()).then((data: { questions?: TrainingQuestion[] }) => setQuestions(data.questions ?? [])); }, []);
  useEffect(() => { setPage(1); }, [search, kind, sceneId]);

  const filtered = useMemo(() => (questions ?? []).filter((question) => {
    const scene = sceneById[question.primarySceneId];
    const preview = question.kind === "simple" ? question.prompt : question.caseBackground;
    const keyword = search.trim().toLowerCase();
    return (kind === "all" || question.kind === kind)
      && (sceneId === "all" || question.primarySceneId === sceneId)
      && (!keyword || `${question.title} ${preview} ${scene.title} ${question.knowledgePoints.join(" ")}`.toLowerCase().includes(keyword));
  }), [questions, search, kind, sceneId]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function remove(questionId: string) {
    await fetch("/api/training/favorites", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ questionId, favorite: false }) });
    setQuestions((value) => value?.filter((question) => question.id !== questionId));
  }

  return <main className="favoritePage">
    <header className="favoriteHeader">
      <a className="brand" href="/"><span className="brandMark">61</span><span>职场沟通训练营</span></a>
      <div><small>MY COLLECTION</small><h1>我的收藏题目</h1><p>点击题目进入详情，重新查看完整情境、选项和解析。</p></div>
      <a href="/training">开始新训练 →</a>
    </header>
    <section className="favoriteFilters">
      <label><span>搜索</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索题目、场景或知识点" /></label>
      <label><span>题型</span><select value={kind} onChange={(event) => setKind(event.target.value)}><option value="all">全部题型</option><option value="simple">快速判断</option><option value="deep">深度场景</option><option value="branching">连续套题</option></select></label>
      <label><span>场景</span><select value={sceneId} onChange={(event) => setSceneId(event.target.value)}><option value="all">全部场景</option>{trainingScenes.map((scene) => <option key={scene.id} value={scene.id}>第{scene.lessonNumber}课 · {scene.title}</option>)}</select></label>
      <strong>{filtered.length} 道收藏</strong>
    </section>
    {!questions ? <div className="favoriteEmpty">正在读取收藏…</div> : questions.length === 0 ? <Empty /> : filtered.length === 0 ? <section className="favoriteEmpty"><strong>没有匹配的题目</strong><p>请调整搜索词或筛选条件。</p></section> : <>
      <section className="favoriteGrid">{visible.map((question) => {
        const scene = sceneById[question.primarySceneId];
        const preview = question.kind === "simple" ? question.prompt : question.caseBackground;
        return <article key={question.id} className="favoriteCard">
          <header><span>{labels[question.kind]}</span><button onClick={() => remove(question.id)}>取消收藏</button></header>
          <h2><a href={`/training/questions/${question.id}`}>{question.title}</a></h2><p>{preview}</p>
          <div><small>主场景</small><strong>第 {scene.lessonNumber} 课 · {scene.title}</strong></div>
          <div><small>核心知识点</small><strong>{question.knowledgePoints.join(" · ")}</strong></div>
          <footer><a href={`/training/questions/${question.id}`}>查看题目详情 →</a><a href={question.courseReference.href}>相关课程</a></footer>
        </article>;
      })}</section>
      <nav className="favoritePagination"><button disabled={page === 1} onClick={() => setPage((value) => value - 1)}>← 上一页</button><span>{page} / {pageCount}</span><button disabled={page === pageCount} onClick={() => setPage((value) => value + 1)}>下一页 →</button></nav>
    </>}
  </main>;
}

function Empty() { return <section className="favoriteEmpty"><strong>还没有收藏题目</strong><p>训练时点击“收藏本题”，它就会出现在这里。</p><a href="/training">去完成一次训练</a></section>; }

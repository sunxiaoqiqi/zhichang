"use client";
import { useEffect, useMemo, useState } from "react";
import {
  sceneById,
  trainingScenes,
  type TrainingQuestion,
} from "../../training-data";
type Row = {
  id: string;
  title: string;
  kind: TrainingQuestion["kind"];
  primarySceneId: TrainingQuestion["primarySceneId"];
  difficulty: TrainingQuestion["difficulty"];
  status: TrainingQuestion["status"];
  payload: TrainingQuestion;
};
const labels = { simple: "简单题", deep: "深度场景", branching: "连续套题" };
export default function QuestionsAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState("all");
  const [showDeleted, setShowDeleted] = useState(false);
  const [editing, setEditing] = useState<Row>();
  const [json, setJson] = useState("");
  const [message, setMessage] = useState("");
  async function load() {
    const r = await fetch("/api/admin/questions");
    const v = (await r.json()) as { questions: Row[] };
    setRows(v.questions);
  }
  useEffect(() => {
    load();
  }, []);
  const shown = rows.filter((r) =>
    showDeleted
      ? r.status === "retired"
      : r.status !== "retired" && (filter === "all" || r.kind === filter),
  );
  const coverage = useMemo(
    () =>
      trainingScenes.map((s) => ({
        scene: s,
        count: rows.filter((r) => r.primarySceneId === s.id && r.status !== "retired").length,
      })),
    [rows],
  );
  async function seed() {
    const r = await fetch("/api/admin/questions/seed", { method: "POST" });
    const v = (await r.json()) as { error?: string; imported?: number };
    setMessage(v.error ?? `已导入 ${v.imported} 道样题`);
    await load();
  }
  async function save() {
    if (!editing) return;
    try {
      const payload = JSON.parse(json) as TrainingQuestion;
      const r = await fetch(`/api/admin/questions/${editing.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const v = (await r.json()) as { error?: string };
      if (!r.ok) {
        setMessage(v.error ?? "保存失败");
        return;
      }
      setMessage("题目已保存");
      setEditing(undefined);
      await load();
    } catch {
      setMessage("JSON 格式不正确");
    }
  }
  async function remove(row: Row) {
    if (!window.confirm(`确认删除“${row.title}”吗？历史作答将保留。`)) return;
    const response = await fetch(`/api/admin/questions/${row.id}`, { method: "DELETE" });
    const result = (await response.json()) as { error?: string };
    setMessage(result.error ?? "题目已删除，可在“已删除”中恢复");
    if (response.ok) await load();
  }
  async function restore(row: Row) {
    const payload = { ...row.payload, status: "draft" as const };
    const response = await fetch(`/api/admin/questions/${row.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = (await response.json()) as { error?: string };
    setMessage(result.error ?? "题目已恢复为草稿");
    if (response.ok) await load();
  }
  return (
    <main className="adminShell">
      <aside className="adminNav">
        <a className="brand" href="/">
          <span className="brandMark">61</span>
          <span>管理后台</span>
        </a>
        <nav>
          <a href="/admin">用户管理</a>
          <a className="active" href="/admin/questions">
            训练题管理
          </a>
          <span>设备管理 · V3</span>
          <span>数据分析 · V3</span>
        </nav>
      </aside>
      <section className="adminMain">
        <header>
          <div>
            <small>VERSION 2</small>
            <h1>训练题管理</h1>
            <p>管理发布状态、题目内容与 26 个场景覆盖。</p>
          </div>
          <strong>{rows.length} 道题</strong>
        </header>
        {message && (
          <div className="adminMessage">
            <span>{message}</span>
            <button onClick={() => setMessage("")}>关闭</button>
          </div>
        )}
        <div className="questionToolbar">
          <div>
            {["all", "simple", "deep", "branching"].map((k) => (
              <button
                className={filter === k ? "active" : ""}
                onClick={() => setFilter(k)}
                key={k}
              >
                {k === "all" ? "全部" : labels[k as keyof typeof labels]}
              </button>
            ))}
          </div>
          <div className="questionToolbarActions">
            <button className={showDeleted ? "active" : ""} onClick={() => setShowDeleted((value) => !value)}>
              {showDeleted ? "返回题库" : `已删除 ${rows.filter((row) => row.status === "retired").length}`}
            </button>
            <a href="/admin/questions/new">新建题目</a>
            <button onClick={seed}>导入现有样题</button>
          </div>
        </div>
        <section className="coverageStrip">
          {coverage.map((c) => (
            <div className={c.count ? "covered" : ""} key={c.scene.id}>
              <span>{c.scene.lessonNumber}</span>
              <small>{c.count}题</small>
            </div>
          ))}
        </section>
        <div className="adminTable">
          <table>
            <thead>
              <tr>
                <th>题目</th>
                <th>题型</th>
                <th>主场景</th>
                <th>难度</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.title}</strong>
                    <small>{row.id}</small>
                  </td>
                  <td>{labels[row.kind]}</td>
                  <td>{sceneById[row.primarySceneId]?.title}</td>
                  <td>{row.difficulty}</td>
                  <td>{row.status}</td>
                  <td>
                    {row.status === "retired" ? <button onClick={() => restore(row)}>恢复</button> : <><button
                      onClick={() => {
                        setEditing(row);
                        setJson(JSON.stringify(row.payload, null, 2));
                      }}
                    >
                      编辑
                    </button><button className="dangerAction" onClick={() => remove(row)}>删除</button></>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {editing && (
          <div className="questionEditorBackdrop">
            <section className="questionEditor">
              <header>
                <div>
                  <small>{editing.id}</small>
                  <h2>{editing.title}</h2>
                </div>
                <button onClick={() => setEditing(undefined)}>×</button>
              </header>
              <p>编辑完整题目结构。保存时系统会自动增加版本号。</p>
              <textarea
                value={json}
                onChange={(e) => setJson(e.target.value)}
                spellCheck={false}
              />
              <footer>
                <button onClick={() => setEditing(undefined)}>取消</button>
                <button onClick={save}>保存题目</button>
              </footer>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "../../components/admin-nav";

type AuditRow = { id: string; actorAccount: string; action: string; targetAccount: string | null; detail: string; createdAt: string };
type Pagination = { page: number; pageSize: number; total: number; pages: number };
const actionLabels: Record<string, string> = {
  "user.create": "创建用户", "user.reset": "重置密码", "user.toggle": "切换用户状态", "user.note": "修改用户备注", "user.account": "管理员修改账号名", "user.self_account": "用户修改账号名",
  "question.create": "创建题目", "question.update": "修改题目", "question.delete": "删除题目", "question.seed": "导入样题", "question.bulk_import": "批量导入题目",
  "user.bulk_create": "批量创建用户",
  "device.note": "修改设备备注", "device.logout": "设备强制下线", "data.export": "导出数据",
};
const formatTime = (value: string) => new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(value));
function readableDetail(value: string) {
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    return Object.entries(parsed).map(([key, item]) => `${key}: ${typeof item === "object" ? JSON.stringify(item) : String(item)}`).join(" · ") || "—";
  } catch { return value || "—"; }
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pageSize: 20, total: 0, pages: 1 });
  const [category, setCategory] = useState("");
  const [draftSearch, setDraftSearch] = useState("");
  const [search, setSearch] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [message, setMessage] = useState("");
  async function load(page = 1) {
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    if (start) params.set("start", String(new Date(`${start}T00:00:00`).getTime()));
    if (end) { const endDate = new Date(`${end}T00:00:00`); endDate.setDate(endDate.getDate() + 1); params.set("end", String(endDate.getTime())); }
    const response = await fetch(`/api/admin/audit?${params}`);
    const result = await response.json() as { logs?: AuditRow[]; pagination?: Pagination; error?: string };
    if (!response.ok) { setMessage(result.error ?? "审计日志加载失败"); return; }
    setLogs(result.logs ?? []); setPagination(result.pagination ?? { page, pageSize: 20, total: 0, pages: 1 });
  }
  useEffect(() => { void load(1); }, [category, search, start, end]);
  return <main className="adminShell">
    <AdminNav active="audit" />
    <section className="adminMain">
      <header><div><small>VERSION 4 · AUDIT</small><h1>操作审计</h1><p>追踪用户账号变更及管理员对账户、设备和题库的关键操作。</p></div><strong>{pagination.total} 条记录</strong></header>
      {message && <div className="adminMessage"><span>{message}</span><button onClick={() => setMessage("")}>关闭</button></div>}
      <section className="auditToolbar">
        <form onSubmit={(event) => { event.preventDefault(); setSearch(draftSearch.trim()); }}><label><span>搜索操作或详情</span><input value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} placeholder="例如 question.update" /></label><button>搜索</button></form>
        <label><span>操作分类</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">全部分类</option><option value="user">用户</option><option value="device">设备</option><option value="question">题库</option><option value="data">数据导出</option></select></label>
        <label><span>开始日期</span><input type="date" value={start} onChange={(event) => setStart(event.target.value)} /></label>
        <label><span>结束日期</span><input type="date" value={end} onChange={(event) => setEnd(event.target.value)} /></label>
        <a href="/api/admin/export?type=audit">导出 CSV</a>
      </section>
      <div className="adminTable auditTable"><table><thead><tr><th>操作时间</th><th>操作人</th><th>操作</th><th>目标账户</th><th>操作详情</th></tr></thead><tbody>{logs.map((row) => <tr key={row.id}><td>{formatTime(row.createdAt)}</td><td><strong>{row.actorAccount}</strong></td><td><i className="active">{actionLabels[row.action] ?? row.action}</i><small>{row.action}</small></td><td>{row.targetAccount ?? "—"}</td><td><code title={row.detail}>{readableDetail(row.detail)}</code></td></tr>)}{!logs.length && <tr><td className="tableEmpty" colSpan={5}>没有符合条件的审计记录</td></tr>}</tbody></table></div>
      {pagination.pages > 1 && <footer className="tablePagination"><button disabled={pagination.page === 1} onClick={() => void load(pagination.page - 1)}>上一页</button><span>{pagination.page} / {pagination.pages}</span><button disabled={pagination.page === pagination.pages} onClick={() => void load(pagination.page + 1)}>下一页</button></footer>}
    </section>
  </main>;
}

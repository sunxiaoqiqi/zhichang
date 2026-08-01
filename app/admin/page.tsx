"use client";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AdminNav } from "../components/admin-nav";
type UserRow = {
  id: string;
  account: string;
  role: "user" | "admin";
  accessPlan: "free" | "paid";
  status: "active" | "disabled";
  mustChangePassword: boolean;
  note: string;
  createdAt: string;
};
export default function AdminPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [accessPlan, setAccessPlan] = useState("all");
  const [page, setPage] = useState(1);
  const [credential, setCredential] = useState<{ account: string; password: string }>();
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ created: { account: string; temporaryPassword: string }[]; errors: { line: number; account: string; error: string }[] }>();
  const [accountEditor, setAccountEditor] = useState<{ id: string; original: string; account: string }>();
  async function load() {
    const r = await fetch("/api/admin/users");
    const v = (await r.json()) as { users: UserRow[] };
    setUsers(v.users);
  }
  useEffect(() => {
    load();
  }, []);
  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const r = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ account: d.get("account"), note: d.get("note") }),
    });
    const v = (await r.json()) as {
      error?: string;
      user?: { account: string };
      temporaryPassword?: string;
    };
    if (!r.ok) {
      setMessage(v.error ?? "创建失败");
      return;
    }
    setMessage(
      `账号：${v.user?.account}  临时密码：${v.temporaryPassword}（仅本次显示）`,
    );
    if (v.user?.account && v.temporaryPassword) setCredential({ account: v.user.account, password: v.temporaryPassword });
    e.currentTarget.reset();
    await load();
  }
  async function action(id: string, action: "toggle" | "reset", account: string) {
    const r = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const v = (await r.json()) as {
      error?: string;
      temporaryPassword?: string;
    };
    setMessage(
      v.error ??
        (v.temporaryPassword
          ? `新临时密码：${v.temporaryPassword}（仅本次显示）`
          : "操作成功"),
    );
    if (v.temporaryPassword) setCredential({ account, password: v.temporaryPassword });
    await load();
  }
  async function saveNote(id: string, note: string) {
    const response = await fetch(`/api/admin/users/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "note", note }) });
    const result = await response.json() as { error?: string };
    setMessage(result.error ?? "用户备注已保存");
    if (response.ok) await load();
  }
  async function changeAccessPlan(user: UserRow) {
    const nextPlan = user.accessPlan === "paid" ? "free" : "paid";
    const response = await fetch(`/api/admin/users/${user.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "accessPlan", accessPlan: nextPlan }) });
    const result = await response.json() as { error?: string };
    setMessage(result.error ?? `${user.account} 已切换为${nextPlan === "paid" ? "收费版" : "免费版"}`);
    if (response.ok) await load();
  }
  async function bulkCreate() {
    const rows = bulkText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => { const [account, ...note] = line.split(","); return { account: account.trim(), note: note.join(",").trim() }; });
    setBulkBusy(true);
    const response = await fetch("/api/admin/users/import", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ rows }) });
    const result = await response.json() as { created?: { account: string; temporaryPassword: string }[]; errors?: { line: number; account: string; error: string }[]; error?: string };
    setBulkBusy(false);
    if (!response.ok) { setMessage(result.error ?? "批量创建失败"); return; }
    setBulkResult({ created: result.created ?? [], errors: result.errors ?? [] });
    await load();
  }
  async function renameAccount() {
    if (!accountEditor) return;
    const response = await fetch(`/api/admin/users/${accountEditor.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "account", account: accountEditor.account }) });
    const result = await response.json() as { error?: string };
    if (!response.ok) { setMessage(result.error ?? "账号修改失败"); return; }
    setMessage(`账号已由 ${accountEditor.original} 修改为 ${accountEditor.account.trim()}`);
    setAccountEditor(undefined);
    await load();
  }
  const filtered = useMemo(() => users.filter((user) => {
    const keyword = search.trim().toLowerCase();
    return (!keyword || `${user.account} ${user.note}`.toLowerCase().includes(keyword)) && (status === "all" || user.status === status) && (accessPlan === "all" || (user.role === "admin" ? "paid" : user.accessPlan) === accessPlan);
  }), [users, search, status, accessPlan]);
  const pageSize = 10;
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const shown = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => { setPage(1); }, [search, status, accessPlan]);
  return (
    <main className="adminShell">
      <AdminNav active="users" />
      <section className="adminMain">
        <header>
          <div>
            <small>ACCESS & ACCOUNT MANAGEMENT</small>
            <h1>用户管理</h1>
            <p>创建账号、管理免费版与收费版权限，或生成一次性临时密码。</p>
          </div>
          <div className="adminPageHeaderActions"><button className="adminHeaderAction" onClick={() => { setBulkOpen(true); setBulkResult(undefined); }}>批量创建</button><a className="adminHeaderAction" href="/api/admin/export?type=users">导出用户 CSV</a><strong>{users.length} 个账号</strong></div>
        </header>
        <form className="adminCreate" onSubmit={create}>
          <label>
            新账号名
            <input name="account" placeholder="例如 trainee001" required />
          </label>
          <label>
            备注
            <input name="note" placeholder="选填" />
          </label>
          <button>创建用户</button>
        </form>
        {message && (
          <div className="adminMessage">
            <span>{message}</span>
            <button onClick={() => navigator.clipboard.writeText(message)}>
              复制
            </button>
          </div>
        )}
        <section className="adminListToolbar userListToolbar"><label><span>搜索账号名</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="账号名或备注" /></label><label><span>用户版本</span><select value={accessPlan} onChange={(event) => setAccessPlan(event.target.value)}><option value="all">全部版本</option><option value="free">免费版</option><option value="paid">收费版</option></select></label><label><span>账号状态</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">全部状态</option><option value="active">正常</option><option value="disabled">已停用</option></select></label><b>{filtered.length} 条结果</b></section>
        <div className="adminTable">
          <table>
            <thead>
              <tr>
                <th>账号名 / 用户编号</th>
                <th>用户版本</th>
                <th>角色</th>
                <th>状态</th>
                <th>密码状态</th>
                <th>备注</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.account}</strong>
                    <small title={u.id}>用户编号 {u.id.slice(0, 8)}…</small>
                  </td>
                  <td><i className={u.role === "admin" || u.accessPlan === "paid" ? "active" : "freePlan"}>{u.role === "admin" ? "管理权限" : u.accessPlan === "paid" ? "收费版" : "免费版"}</i></td>
                  <td>{u.role === "admin" ? "管理员" : "用户"}</td>
                  <td>
                    <i className={u.status}>
                      {u.status === "active" ? "正常" : "已停用"}
                    </i>
                  </td>
                  <td>{u.mustChangePassword ? "等待首次改密" : "已设置"}</td>
                  <td><input className="deviceNote" defaultValue={u.note} placeholder="添加备注" onBlur={(event) => { if (event.target.value !== u.note) void saveNote(u.id, event.target.value); }} /></td>
                  <td>
                    {u.role !== "admin" && <button className={u.accessPlan === "paid" ? "" : "planAction"} onClick={() => void changeAccessPlan(u)}>{u.accessPlan === "paid" ? "设为免费版" : "开通收费版"}</button>}
                    <button onClick={() => setAccountEditor({ id: u.id, original: u.account, account: u.account })}>修改账号</button>
                    <button onClick={() => action(u.id, "reset", u.account)}>
                      重置密码
                    </button>
                    <button onClick={() => action(u.id, "toggle", u.account)}>
                      {u.status === "active" ? "停用" : "启用"}
                    </button>
                  </td>
                </tr>
              ))}
              {!shown.length && <tr><td className="tableEmpty" colSpan={7}>没有符合条件的用户</td></tr>}
            </tbody>
          </table>
        </div>
        {pages > 1 && <footer className="tablePagination"><button disabled={page === 1} onClick={() => setPage((value) => value - 1)}>上一页</button><span>{page} / {pages}</span><button disabled={page === pages} onClick={() => setPage((value) => value + 1)}>下一页</button></footer>}
        {credential && <div className="credentialBackdrop"><section className="credentialCard" role="dialog" aria-modal="true" aria-label="临时登录凭据"><small>仅本次显示</small><h2>临时登录凭据</h2><p>关闭后无法再次查看原密码，需要时只能重新生成。</p><dl><div><dt>账号</dt><dd>{credential.account}</dd></div><div><dt>临时密码</dt><dd>{credential.password}</dd></div></dl><footer><button onClick={() => setCredential(undefined)}>关闭</button><button onClick={() => navigator.clipboard.writeText(`账号：${credential.account}\n临时密码：${credential.password}`)}>复制账号密码</button></footer></section></div>}
        {bulkOpen && <div className="credentialBackdrop"><section className="credentialCard bulkAccountCard" role="dialog" aria-modal="true" aria-label="批量创建账号"><small>BULK ACCOUNT CREATOR</small><h2>批量创建账号</h2>{!bulkResult ? <><p>每行填写一个账号，可在逗号后添加备注；单次最多 30 个。</p><textarea value={bulkText} onChange={(event) => setBulkText(event.target.value)} placeholder={"trainee001,华东一组\ntrainee002,华南一组"} /><footer><button onClick={() => setBulkOpen(false)}>取消</button><button disabled={bulkBusy || !bulkText.trim()} onClick={() => void bulkCreate()}>{bulkBusy ? "正在创建…" : "开始创建"}</button></footer></> : <><p>成功 {bulkResult.created.length} 个，失败 {bulkResult.errors.length} 个。临时密码只在本次显示。</p><div className="bulkCredentialList">{bulkResult.created.map((item) => <div key={item.account}><strong>{item.account}</strong><code>{item.temporaryPassword}</code></div>)}{bulkResult.errors.map((item) => <div className="error" key={`${item.line}-${item.account}`}><strong>第 {item.line} 行 · {item.account || "空账号"}</strong><span>{item.error}</span></div>)}</div><footer><button onClick={() => { setBulkOpen(false); setBulkText(""); }}>关闭</button><button disabled={!bulkResult.created.length} onClick={() => navigator.clipboard.writeText(bulkResult.created.map((item) => `${item.account},${item.temporaryPassword}`).join("\n"))}>复制全部凭据</button></footer></>}</section></div>}
        {accountEditor && <div className="credentialBackdrop"><section className="credentialCard accountRenameCard" role="dialog" aria-modal="true" aria-label="修改账号名"><small>STABLE USER ID · {accountEditor.id}</small><h2>修改账号名</h2><p>用户编号不会变化，设备、训练记录和统计数据仍归属于同一个用户。</p><label><span>新账号名</span><input value={accountEditor.account} onChange={(event) => setAccountEditor({ ...accountEditor, account: event.target.value })} autoFocus /></label><footer><button onClick={() => setAccountEditor(undefined)}>取消</button><button disabled={accountEditor.account.trim() === accountEditor.original || !/^[A-Za-z0-9_.-]{4,32}$/.test(accountEditor.account.trim())} onClick={() => void renameAccount()}>确认修改</button></footer></section></div>}
      </section>
    </main>
  );
}

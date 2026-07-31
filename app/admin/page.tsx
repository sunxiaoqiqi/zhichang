"use client";
import { useEffect, useState, type FormEvent } from "react";
type UserRow = {
  id: string;
  account: string;
  role: "user" | "admin";
  status: "active" | "disabled";
  mustChangePassword: boolean;
  note: string;
  createdAt: string;
};
export default function AdminPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [message, setMessage] = useState("");
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
    e.currentTarget.reset();
    await load();
  }
  async function action(id: string, action: "toggle" | "reset") {
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
    await load();
  }
  return (
    <main className="adminShell">
      <aside className="adminNav">
        <a className="brand" href="/">
          <span className="brandMark">61</span>
          <span>管理后台</span>
        </a>
        <nav>
          <a className="active" href="/admin">
            用户管理
          </a>
          <span>设备管理 · V3</span>
          <span>数据分析 · V3</span>
          <span>训练题管理 · V2</span>
        </nav>
        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            location.href = "/login";
          }}
        >
          退出登录
        </button>
      </aside>
      <section className="adminMain">
        <header>
          <div>
            <small>VERSION 1</small>
            <h1>用户管理</h1>
            <p>创建账号、停用账号或生成一次性临时密码。</p>
          </div>
          <strong>{users.length} 个账号</strong>
        </header>
        <form className="adminCreate" onSubmit={create}>
          <label>
            新账号
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
        <div className="adminTable">
          <table>
            <thead>
              <tr>
                <th>账号</th>
                <th>角色</th>
                <th>状态</th>
                <th>密码状态</th>
                <th>备注</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.account}</strong>
                  </td>
                  <td>{u.role === "admin" ? "管理员" : "用户"}</td>
                  <td>
                    <i className={u.status}>
                      {u.status === "active" ? "正常" : "已停用"}
                    </i>
                  </td>
                  <td>{u.mustChangePassword ? "等待首次改密" : "已设置"}</td>
                  <td>{u.note || "—"}</td>
                  <td>
                    <button onClick={() => action(u.id, "reset")}>
                      重置密码
                    </button>
                    <button onClick={() => action(u.id, "toggle")}>
                      {u.status === "active" ? "停用" : "启用"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

"use client";

import { useEffect, useState, type FormEvent } from "react";

export default function AccountPage() {
  const [user, setUser] = useState<{ id: string; account: string; role: string; accessPlan: "free" | "paid" }>();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { fetch("/api/auth/me").then((response) => response.json()).then((result: { user?: { id: string; account: string; role: string; accessPlan: "free" | "paid" } }) => setUser(result.user)); }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/account", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ account: data.get("account"), password: data.get("password") }) });
    const result = await response.json() as { error?: string };
    setBusy(false);
    if (!response.ok) { setMessage(result.error ?? "修改失败"); return; }
    window.location.href = "/";
  }
  return <main className="authPage"><form className="authCard accountSettingsCard" onSubmit={submit}>
    <a className="brand" href="/"><span className="brandMark">61</span><span>职场沟通训练营</span></a>
    <span className="eyebrow">ACCOUNT SETTINGS</span><h1>账号设置</h1>
    <p>账号名用于登录，可以修改；用户编号永久不变，所有学习数据和统计会继续保留。</p>
    <div className={`accountPlanCard ${user?.role === "admin" || user?.accessPlan === "paid" ? "paid" : "free"}`}><span>当前版本</span><strong>{user?.role === "admin" ? "管理员完整权限" : user?.accessPlan === "paid" ? "收费版 · 全部课程与无限训练" : "免费版 · 第一课与 1 次训练"}</strong>{user?.role !== "admin" && user?.accessPlan !== "paid" && <a href="/upgrade">查看开通方式 →</a>}</div>
    <div className="identityBadge"><span>用户唯一编号</span><code>{user?.id ?? "正在读取…"}</code></div>
    <label>新账号名<input name="account" defaultValue={user?.account ?? ""} key={user?.account} pattern="[A-Za-z0-9_.-]{4,32}" minLength={4} maxLength={32} autoComplete="username" required /></label>
    <label>当前密码<input name="password" type="password" autoComplete="current-password" required /></label>
    {message && <div className="authError">{message}</div>}
    <button type="submit" disabled={busy}>{busy ? "正在保存…" : "保存账号名 →"}</button>
    <footer><a href="/">返回首页</a><a href="/change-password">修改密码</a></footer>
  </form></main>;
}

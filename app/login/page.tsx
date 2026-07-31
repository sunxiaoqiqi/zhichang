"use client";
import { useState, type FormEvent } from "react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ account: data.get("account"), password: data.get("password") }) });
    const result = await response.json() as { error?: string; user?: { role: string; mustChangePassword: boolean } };
    if (!response.ok) { setError(result.error ?? "登录失败"); setBusy(false); return; }
    window.location.href = result.user?.mustChangePassword ? "/change-password" : result.user?.role === "admin" ? "/admin" : "/";
  }
  return <main className="authPage"><form className="authCard" onSubmit={submit}><a className="brand" href="/"><span className="brandMark">61</span><span>职场沟通训练营</span></a><span className="eyebrow">ACCOUNT ACCESS</span><h1>登录训练营</h1><p>使用管理员分配的账号和密码进入课程。</p><label>账号<input name="account" autoComplete="username" required /></label><label>密码<input name="password" type="password" autoComplete="current-password" required /></label>{error && <div className="authError">{error}</div>}<button type="submit" disabled={busy}>{busy ? "正在登录…" : "登录 →"}</button></form></main>;
}

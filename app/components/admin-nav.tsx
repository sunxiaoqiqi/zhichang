"use client";

type AdminSection = "users" | "devices" | "analytics" | "questions";

export function AdminNav({ active }: { active: AdminSection }) {
  return <aside className="adminNav">
    <a className="brand" href="/">
      <span className="brandMark">61</span>
      <span>管理后台</span>
    </a>
    <nav>
      <a className={active === "users" ? "active" : ""} href="/admin">用户管理</a>
      <a className={active === "devices" ? "active" : ""} href="/admin/devices">设备管理</a>
      <a className={active === "analytics" ? "active" : ""} href="/admin/analytics">数据分析</a>
      <a className={active === "questions" ? "active" : ""} href="/admin/questions">训练题管理</a>
    </nav>
    <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); location.href = "/login"; }}>退出登录</button>
  </aside>;
}

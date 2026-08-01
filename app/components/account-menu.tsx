"use client";

import { useEffect, useState } from "react";

export function AccountMenu() {
  const [user, setUser] = useState<{ account: string; role: string } | null>();

  useEffect(() => {
    if (location.pathname === "/login" || location.pathname === "/setup") return;
    fetch("/api/auth/me")
      .then(async (response) => response.ok ? (await response.json()).user : null)
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  if (!user) return null;
  return <div className="accountMenu">
    <span>{user.account}</span>
    {user.role === "admin" && <><a href="/admin">用户后台</a><a href="/admin/devices">设备管理</a><a href="/admin/analytics">数据分析</a><a href="/admin/questions">题库后台</a></>}
    <a href="/change-password">修改密码</a>
    <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); location.href = "/login"; }}>退出</button>
  </div>;
}

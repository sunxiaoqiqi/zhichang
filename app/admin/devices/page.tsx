"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminNav } from "../../components/admin-nav";

type DeviceRow = {
  id: string; account: string; deviceKey: string; deviceType: string; browser: string; os: string; note: string;
  firstSeenAt: string; lastSeenAt: string; lastLoginAt: string | null; loginCount: number; activeSeconds: number; sessionCount: number;
};

const typeLabel: Record<string, string> = { desktop: "电脑", mobile: "手机", tablet: "平板", unknown: "未知" };
const formatTime = (value: string | null) => value ? new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "—";
const formatDuration = (seconds: number) => seconds < 60 ? `${seconds} 秒` : seconds < 3600 ? `${Math.round(seconds / 60)} 分钟` : `${(seconds / 3600).toFixed(1)} 小时`;

export default function DevicesPage() {
  const [rows, setRows] = useState<DeviceRow[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [message, setMessage] = useState("");
  async function load() {
    const response = await fetch("/api/admin/devices");
    const result = await response.json() as { devices?: DeviceRow[]; error?: string };
    if (!response.ok) { setMessage(result.error ?? "设备数据加载失败"); return; }
    setRows(result.devices ?? []);
  }
  useEffect(() => { void load(); }, []);
  const shown = useMemo(() => rows.filter((row) => {
    const keyword = search.trim().toLowerCase();
    const online = row.sessionCount > 0 && Date.now() - new Date(row.lastSeenAt).getTime() < 2 * 60 * 1000;
    return (!keyword || `${row.account} ${row.browser} ${row.os} ${row.note} ${row.deviceKey}`.toLowerCase().includes(keyword))
      && (type === "all" || row.deviceType === type)
      && (status === "all" || (status === "online" ? online : !online));
  }), [rows, search, type, status]);
  async function update(id: string, action: "note" | "logout", note?: string) {
    const response = await fetch(`/api/admin/devices/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, note }) });
    const result = await response.json() as { error?: string };
    setMessage(result.error ?? (action === "logout" ? "该设备已强制下线" : "设备备注已保存"));
    if (response.ok) await load();
  }
  const accountCount = new Set(rows.map((row) => row.account)).size;
  const onlineCount = rows.filter((row) => row.sessionCount > 0 && Date.now() - new Date(row.lastSeenAt).getTime() < 2 * 60 * 1000).length;
  return <main className="adminShell">
    <AdminNav active="devices" />
    <section className="adminMain">
      <header><div><small>VERSION 3 · DEVICES</small><h1>设备管理</h1><p>按“账户 + 设备”识别使用终端，支持备注与强制下线。</p></div><strong>{rows.length} 台设备</strong></header>
      <section className="adminMetrics compact">
        <article><small>覆盖账户</small><strong>{accountCount}</strong><span>已有设备记录的账户</span></article>
        <article><small>当前活跃</small><strong>{onlineCount}</strong><span>近 2 分钟收到心跳</span></article>
        <article><small>累计登录</small><strong>{rows.reduce((sum, row) => sum + row.loginCount, 0)}</strong><span>成功登录次数</span></article>
      </section>
      {message && <div className="adminMessage"><span>{message}</span><button onClick={() => setMessage("")}>关闭</button></div>}
      <section className="adminFilters">
        <label><span>搜索账户或设备</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="账号、系统、浏览器、备注" /></label>
        <label><span>设备类型</span><select value={type} onChange={(event) => setType(event.target.value)}><option value="all">全部类型</option><option value="desktop">电脑</option><option value="mobile">手机</option><option value="tablet">平板</option><option value="unknown">未知</option></select></label>
        <label><span>设备状态</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">全部状态</option><option value="online">当前活跃</option><option value="offline">当前离线</option></select></label>
        <b>{shown.length} 条结果</b>
      </section>
      <div className="adminTable deviceTable"><table><thead><tr><th>账户 / 设备</th><th>使用情况</th><th>最近活动</th><th>设备备注</th><th>操作</th></tr></thead><tbody>
        {shown.map((row) => {
          const online = row.sessionCount > 0 && Date.now() - new Date(row.lastSeenAt).getTime() < 2 * 60 * 1000;
          return <tr key={row.id}>
            <td><strong>{row.account}</strong><small><i className={`deviceDot ${online ? "online" : ""}`} />{typeLabel[row.deviceType] ?? "未知"} · {row.browser} · {row.os}</small><small title={row.deviceKey}>ID {row.deviceKey.slice(0, 8)}…</small></td>
            <td><strong>{row.loginCount} 次登录</strong><small>有效使用 {formatDuration(row.activeSeconds)}</small></td>
            <td><strong>{online ? "当前活跃" : formatTime(row.lastSeenAt)}</strong><small>首次：{formatTime(row.firstSeenAt)}</small></td>
            <td><input className="deviceNote" defaultValue={row.note} placeholder="例如：公司电脑" onBlur={(event) => { if (event.target.value !== row.note) void update(row.id, "note", event.target.value); }} /></td>
            <td><button disabled={!row.sessionCount} onClick={() => { if (confirm(`确认让 ${row.account} 的这台设备退出登录吗？`)) void update(row.id, "logout"); }}>强制下线</button></td>
          </tr>;
        })}
        {!shown.length && <tr><td colSpan={5} className="tableEmpty">没有符合条件的设备</td></tr>}
      </tbody></table></div>
    </section>
  </main>;
}

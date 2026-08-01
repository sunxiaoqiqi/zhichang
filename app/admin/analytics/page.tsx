"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminNav } from "../../components/admin-nav";

type AnalyticsData = {
  summary: { accounts: number; devices: number; loginCount: number; failedCount: number; activeSeconds: number };
  rollups: { id: string; account: string; browser: string; os: string; deviceType: string; note: string; loginCount: number; activeSeconds: number; lastLoginAt: string | null }[];
  events: { id: string; account: string; success: boolean; location: string; ip: string; occurredAt: string; deviceId: string | null }[];
  sessions: { id: string; account: string; device: string; location: string; ip: string; startedAt: string; lastHeartbeatAt: string; endedAt: string | null; activeSeconds: number }[];
  trend: { date: string; logins: number; activeSeconds: number }[];
};
type Period = "day" | "month" | "year" | "all" | "custom";
const empty: AnalyticsData = { summary: { accounts: 0, devices: 0, loginCount: 0, failedCount: 0, activeSeconds: 0 }, rollups: [], events: [], sessions: [], trend: [] };
const formatDuration = (seconds: number) => seconds < 60 ? `${seconds} 秒` : seconds < 3600 ? `${Math.round(seconds / 60)} 分钟` : `${(seconds / 3600).toFixed(1)} 小时`;
const formatDateTime = (value: string | null) => value ? new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "—";
const inputDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

function getRange(period: Period, customStart: string, customEnd: string) {
  if (period === "all") return "";
  if (period === "custom") {
    const start = customStart ? new Date(`${customStart}T00:00:00`).getTime() : 0;
    const endDate = customEnd ? new Date(`${customEnd}T00:00:00`) : null;
    if (endDate) endDate.setDate(endDate.getDate() + 1);
    return `?start=${start}&end=${endDate?.getTime() ?? ""}`;
  }
  const now = new Date();
  const start = new Date(now);
  if (period === "day") start.setHours(0, 0, 0, 0);
  if (period === "month") { start.setDate(1); start.setHours(0, 0, 0, 0); }
  if (period === "year") { start.setMonth(0, 1); start.setHours(0, 0, 0, 0); }
  return `?start=${start.getTime()}&end=${now.getTime() + 1000}`;
}

export default function AnalyticsPage() {
  const now = new Date();
  const [period, setPeriod] = useState<Period>("month");
  const [customStart, setCustomStart] = useState(inputDate(new Date(now.getFullYear(), now.getMonth(), 1)));
  const [customEnd, setCustomEnd] = useState(inputDate(now));
  const [data, setData] = useState<AnalyticsData>(empty);
  const [sort, setSort] = useState<"logins" | "duration">("logins");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [eventPage, setEventPage] = useState(1);
  const [sessionPage, setSessionPage] = useState(1);
  async function load(nextPeriod = period) {
    const response = await fetch(`/api/admin/analytics${getRange(nextPeriod, customStart, customEnd)}`);
    const result = await response.json() as AnalyticsData & { error?: string };
    if (!response.ok) { setMessage(result.error ?? "分析数据加载失败"); return; }
    setData(result); setEventPage(1); setSessionPage(1);
  }
  useEffect(() => { void load(period); }, [period]);
  const rollups = useMemo(() => data.rollups.filter((row) => `${row.account} ${row.browser} ${row.os} ${row.note}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => sort === "logins" ? b.loginCount - a.loginCount : b.activeSeconds - a.activeSeconds), [data.rollups, search, sort]);
  const maxTrend = Math.max(1, ...data.trend.map((item) => item.logins));
  const eventPages = Math.max(1, Math.ceil(data.events.length / 12));
  const events = data.events.slice((eventPage - 1) * 12, eventPage * 12);
  const sessionPages = Math.max(1, Math.ceil(data.sessions.length / 12));
  const sessions = data.sessions.slice((sessionPage - 1) * 12, sessionPage * 12);
  return <main className="adminShell">
    <AdminNav active="analytics" />
    <section className="adminMain analyticsMain">
      <header><div><small>VERSION 3 · INSIGHTS</small><h1>数据分析</h1><p>以“账户 + 设备”为唯一口径，查看登录、地域与有效使用时长。</p></div><strong>最近更新 {new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</strong></header>
      <section className="periodBar">
        <div>{(["day", "month", "year", "all", "custom"] as Period[]).map((item) => <button className={period === item ? "active" : ""} key={item} onClick={() => setPeriod(item)}>{{ day: "今天", month: "本月", year: "今年", all: "全部", custom: "自定义" }[item]}</button>)}</div>
        {period === "custom" && <label><input type="date" value={customStart} onChange={(event) => setCustomStart(event.target.value)} /><span>至</span><input type="date" value={customEnd} onChange={(event) => setCustomEnd(event.target.value)} /><button onClick={() => void load("custom")}>应用</button></label>}
      </section>
      {message && <div className="adminMessage"><span>{message}</span><button onClick={() => setMessage("")}>关闭</button></div>}
      <section className="adminMetrics">
        <article><small>活跃账户</small><strong>{data.summary.accounts}</strong><span>选定时段内有记录</span></article>
        <article><small>账户设备</small><strong>{data.summary.devices}</strong><span>账户 + 设备唯一值</span></article>
        <article><small>成功登录</small><strong>{data.summary.loginCount}</strong><span>失败 {data.summary.failedCount} 次</span></article>
        <article><small>有效时长</small><strong>{formatDuration(data.summary.activeSeconds)}</strong><span>剔除隐藏与空闲时间</span></article>
      </section>
      <section className="analyticsGrid">
        <article className="analyticsPanel trendPanel"><header><div><small>LOGIN TREND</small><h2>登录趋势</h2></div><span>按天汇总</span></header>
          {data.trend.length ? <div className="trendChart">{data.trend.slice(-18).map((point) => <div key={point.date} title={`${point.date}：${point.logins} 次，${formatDuration(point.activeSeconds)}`}><i style={{ height: `${Math.max(8, point.logins / maxTrend * 100)}%` }} /><small>{point.date.slice(5)}</small></div>)}</div> : <p className="panelEmpty">当前时段还没有数据</p>}
        </article>
        <article className="analyticsPanel locationPanel"><header><div><small>LOGIN LOCATION</small><h2>登录地点</h2></div><span>最近记录</span></header>
          <div>{Object.entries(data.events.filter((event) => event.success).reduce<Record<string, number>>((map, event) => { map[event.location] = (map[event.location] ?? 0) + 1; return map; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([location, count]) => <p key={location}><span>{location}</span><strong>{count} 次</strong></p>)}</div>
        </article>
      </section>
      <section className="analyticsSection"><header><div><small>ACCOUNT + DEVICE</small><h2>账户设备汇总</h2></div><div className="sectionActions"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索账户或设备" /><button className={sort === "logins" ? "active" : ""} onClick={() => setSort("logins")}>按次数</button><button className={sort === "duration" ? "active" : ""} onClick={() => setSort("duration")}>按时长</button></div></header>
        <div className="adminTable"><table><thead><tr><th>账户</th><th>设备</th><th>成功登录</th><th>有效时长</th><th>最后登录</th></tr></thead><tbody>{rollups.map((row) => <tr key={row.id}><td><strong>{row.account}</strong><small>{row.note || "未备注"}</small></td><td>{row.browser} · {row.os}</td><td><strong>{row.loginCount} 次</strong></td><td>{formatDuration(row.activeSeconds)}</td><td>{formatDateTime(row.lastLoginAt)}</td></tr>)}{!rollups.length && <tr><td className="tableEmpty" colSpan={5}>当前时段没有账户设备数据</td></tr>}</tbody></table></div>
      </section>
      <section className="analyticsSection"><header><div><small>LOGIN DETAILS</small><h2>登录明细</h2></div><span>最多展示最近 500 条</span></header>
        <div className="adminTable"><table><thead><tr><th>登录时间</th><th>账户</th><th>结果</th><th>登录地</th><th>IP</th></tr></thead><tbody>{events.map((event) => <tr key={event.id}><td>{formatDateTime(event.occurredAt)}</td><td><strong>{event.account}</strong></td><td><i className={event.success ? "active" : "disabled"}>{event.success ? "成功" : "失败"}</i></td><td>{event.location}</td><td><code>{event.ip || "—"}</code></td></tr>)}{!events.length && <tr><td className="tableEmpty" colSpan={5}>当前时段没有登录明细</td></tr>}</tbody></table></div>
        {eventPages > 1 && <footer className="tablePagination"><button disabled={eventPage === 1} onClick={() => setEventPage((page) => page - 1)}>上一页</button><span>{eventPage} / {eventPages}</span><button disabled={eventPage === eventPages} onClick={() => setEventPage((page) => page + 1)}>下一页</button></footer>}
      </section>
      <section className="analyticsSection"><header><div><small>SESSION DETAILS</small><h2>每次使用时长</h2></div><span>登录后每个会话单独记录</span></header>
        <div className="adminTable"><table><thead><tr><th>登录时间</th><th>账户 / 设备</th><th>登录地</th><th>有效时长</th><th>会话状态</th></tr></thead><tbody>{sessions.map((session) => <tr key={session.id}><td>{formatDateTime(session.startedAt)}</td><td><strong>{session.account}</strong><small>{session.device}</small></td><td>{session.location}</td><td><strong>{formatDuration(session.activeSeconds)}</strong></td><td><i className={session.endedAt ? "disabled" : "active"}>{session.endedAt ? `结束于 ${formatDateTime(session.endedAt)}` : "进行中"}</i></td></tr>)}{!sessions.length && <tr><td className="tableEmpty" colSpan={5}>当前时段没有使用会话</td></tr>}</tbody></table></div>
        {sessionPages > 1 && <footer className="tablePagination"><button disabled={sessionPage === 1} onClick={() => setSessionPage((page) => page - 1)}>上一页</button><span>{sessionPage} / {sessionPages}</span><button disabled={sessionPage === sessionPages} onClick={() => setSessionPage((page) => page + 1)}>下一页</button></footer>}
      </section>
    </section>
  </main>;
}

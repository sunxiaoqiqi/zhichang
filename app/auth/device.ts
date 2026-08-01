import { and, eq } from "drizzle-orm";
import { getDb } from "../../db";
import { devices, loginEvents } from "../../db/schema";

export type RequestDevice = {
  deviceKey: string;
  deviceType: string;
  browser: string;
  os: string;
  userAgent: string;
};

export function normalizeDeviceKey(value: unknown) {
  const key = typeof value === "string" ? value.trim() : "";
  return /^[A-Za-z0-9_-]{16,80}$/.test(key) ? key : "unknown";
}

export function describeRequestDevice(request: Request, rawKey: unknown): RequestDevice {
  const userAgent = request.headers.get("user-agent")?.slice(0, 500) ?? "";
  const browser = /Edg\//.test(userAgent) ? "Edge" : /Firefox\//.test(userAgent) ? "Firefox" : /Chrome\//.test(userAgent) ? "Chrome" : /Safari\//.test(userAgent) ? "Safari" : "未知浏览器";
  const os = /Windows NT/.test(userAgent) ? "Windows" : /Android/.test(userAgent) ? "Android" : /iPhone|iPad|iPod/.test(userAgent) ? "iOS / iPadOS" : /Mac OS X/.test(userAgent) ? "macOS" : /Linux/.test(userAgent) ? "Linux" : "未知系统";
  const deviceType = /iPad|Tablet/.test(userAgent) ? "tablet" : /Mobile|Android|iPhone|iPod/.test(userAgent) ? "mobile" : "desktop";
  return { deviceKey: normalizeDeviceKey(rawKey), deviceType, browser, os, userAgent };
}

export function describeRequestLocation(request: Request) {
  const ip = (request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0] ?? request.headers.get("x-real-ip") ?? "").trim();
  const country = request.headers.get("cf-ipcountry") ?? "";
  const region = request.headers.get("cf-region") ?? "";
  const city = request.headers.get("cf-ipcity") ?? "";
  const local = !ip || ip === "::1" || ip === "127.0.0.1" || ip.startsWith("192.168.") || ip.startsWith("10.");
  const location = local ? "本地开发环境" : [country, region, city].filter(Boolean).join(" · ") || "未知";
  return { ip, country, region, city, location };
}

export async function ensureDevice(userId: string, input: RequestDevice) {
  const now = new Date();
  const db = getDb();
  const existing = await db.select({ id: devices.id }).from(devices).where(and(eq(devices.userId, userId), eq(devices.deviceKey, input.deviceKey))).limit(1);
  if (existing[0]) {
    await db.update(devices).set({ deviceType: input.deviceType, browser: input.browser, os: input.os, userAgent: input.userAgent, lastSeenAt: now }).where(eq(devices.id, existing[0].id));
    return existing[0].id;
  }
  const id = crypto.randomUUID();
  await db.insert(devices).values({ id, userId, ...input, firstSeenAt: now, lastSeenAt: now });
  return id;
}

export async function recordLogin(request: Request, input: { account: string; success: boolean; userId?: string; deviceId?: string; device: RequestDevice }) {
  const location = describeRequestLocation(request);
  await getDb().insert(loginEvents).values({
    id: crypto.randomUUID(),
    userId: input.userId,
    deviceId: input.deviceId,
    account: input.account,
    deviceKey: input.device.deviceKey,
    success: input.success,
    userAgent: input.device.userAgent,
    ...location,
  });
}

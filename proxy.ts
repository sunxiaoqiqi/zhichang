import { NextRequest, NextResponse } from "next/server";
import { getUserBySessionToken, SESSION_COOKIE } from "./app/auth/session";

const publicPaths = ["/login", "/setup", "/api/auth/login", "/api/setup", "/api/health"];

function secured(response: NextResponse) {
  response.headers.set("x-content-type-options", "nosniff");
  response.headers.set("x-frame-options", "DENY");
  response.headers.set("referrer-policy", "strict-origin-when-cross-origin");
  response.headers.set("permissions-policy", "camera=(), microphone=(), geolocation=()");
  return response;
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (publicPaths.includes(path)) return secured(NextResponse.next());
  const user = await getUserBySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!user) {
    if (path.startsWith("/api/")) return secured(NextResponse.json({ error: "请先登录" }, { status: 401 }));
    const target = new URL("/login", request.url); target.searchParams.set("returnTo", path);
    return secured(NextResponse.redirect(target));
  }
  if (user.mustChangePassword && path !== "/change-password" && path !== "/api/auth/change-password" && path !== "/api/auth/logout") return secured(NextResponse.redirect(new URL("/change-password", request.url)));
  if (path.startsWith("/admin") || path.startsWith("/api/admin")) {
    if (user.role !== "admin") return path.startsWith("/api/") ? secured(NextResponse.json({ error: "没有管理员权限" }, { status: 403 })) : secured(NextResponse.redirect(new URL("/", request.url)));
  }
  return secured(NextResponse.next());
}

export const config = { matcher: ["/((?!_next|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)"] };

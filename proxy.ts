import { NextRequest, NextResponse } from "next/server";
import { PRODUCAO_COOKIE, validProducaoSession } from "@/lib/producao-session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authDashboard =
    request.cookies.get("anest_dashboard_auth")?.value === "ok";

  const authProducao =
    validProducaoSession(request.cookies.get(PRODUCAO_COOKIE)?.value);

  const isDashboardPage = pathname.startsWith("/dashboard");
  const isProducaoPage = pathname.startsWith("/producao");

  const isDashboardApi = pathname === "/api/fichas/listar";
  const isProducaoApi = pathname === "/api/fichas/producao";

  const isSharedDownloadApi = pathname === "/api/fichas/download";

  if (isDashboardPage || isDashboardApi) {
    if (authDashboard) {
      return NextResponse.next();
    }

    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isProducaoPage || isProducaoApi) {
    if (authProducao) {
      return NextResponse.next();
    }

    if (isProducaoApi && request.method === "PATCH") {
      return NextResponse.json({ error: "Entre novamente na Produção." }, { status: 401 });
    }

    const loginUrl = new URL("/producao-login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isSharedDownloadApi) {
    if (authDashboard || authProducao) {
      return NextResponse.next();
    }

    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/producao/:path*",
    "/api/fichas/listar",
    "/api/fichas/producao",
    "/api/fichas/download",
  ],
};

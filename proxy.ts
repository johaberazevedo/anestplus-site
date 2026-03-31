import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname === "/api/fichas/listar" ||
    pathname === "/api/fichas/download";

  if (!isProtected) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get("anest_dashboard_auth")?.value;

  if (authCookie === "ok") {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/fichas/listar", "/api/fichas/download"],
};
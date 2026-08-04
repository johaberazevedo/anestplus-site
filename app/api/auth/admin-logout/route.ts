import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  isTrustedAdminMutationRequest,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!isTrustedAdminMutationRequest(request)) {
    return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  return response;
}

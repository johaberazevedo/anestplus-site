import { NextResponse } from "next/server";
import { createProducaoSession, PRODUCAO_COOKIE, PRODUCAO_SESSION_SECONDS } from "@/lib/producao-session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body ?? {};

    const expectedUsername = process.env.PRODUCAO_USERNAME;
    const expectedPassword = process.env.PRODUCAO_PASSWORD;

    if (!expectedUsername || !expectedPassword) {
      return NextResponse.json(
        { error: "Login de produção não configurado." },
        { status: 500 }
      );
    }

    if (username !== expectedUsername || password !== expectedPassword) {
      return NextResponse.json(
        { error: "Usuário ou senha inválidos." },
        { status: 401 }
      );
    }

    const session = createProducaoSession();
    if (!session) {
      return NextResponse.json(
        { error: "Sessão de produção não configurada." },
        { status: 500 }
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(PRODUCAO_COOKIE, session, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: PRODUCAO_SESSION_SECONDS,
    });

    return response;
  } catch (error) {
    console.error("Erro no login de produção:", error);
    return NextResponse.json(
      { error: "Erro interno ao entrar." },
      { status: 500 }
    );
  }
}

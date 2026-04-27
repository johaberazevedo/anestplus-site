import { NextResponse } from "next/server";

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

    const response = NextResponse.json({ ok: true });

    response.cookies.set("anest_producao_auth", "ok", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
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
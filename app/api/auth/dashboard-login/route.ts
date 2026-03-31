import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const validUser = process.env.DASHBOARD_USER;
    const validPassword = process.env.DASHBOARD_PASSWORD;

    if (!validUser || !validPassword) {
      return NextResponse.json(
        { error: "Configuração de autenticação ausente." },
        { status: 500 }
      );
    }

    if (username !== validUser || password !== validPassword) {
      return NextResponse.json(
        { error: "Usuário ou senha incorretos." },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
cookieStore.set("anest_dashboard_auth", "ok", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 12, // 12 horas
});

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível entrar." },
      { status: 500 }
    );
  }
}
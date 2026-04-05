import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

function getBearerToken(request: Request) {
  const authHeader =
    request.headers.get("authorization") ||
    request.headers.get("Authorization");

  if (!authHeader) return null;

  const [type, token] = authHeader.split(" ");
  if (type !== "Bearer" || !token) return null;

  return token.trim();
}

function isNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(request: Request) {
  try {
    const token = getBearerToken(request);

    if (!token) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Sessão inválida." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    const fichaId = body?.fichaId;

    if (!isNonEmptyString(fichaId)) {
      return NextResponse.json(
        { error: "fichaId é obrigatório." },
        { status: 400 }
      );
    }

    const { data: ficha, error: fichaError } = await supabaseAdmin
      .from("pro_fichas_uploads")
      .select("id, user_id, file_key, deleted_at")
      .eq("id", fichaId.trim())
      .single();

    if (fichaError || !ficha) {
      return NextResponse.json(
        { error: "Ficha não encontrada." },
        { status: 404 }
      );
    }

    if (ficha.user_id !== user.id) {
      return NextResponse.json(
        { error: "Você não tem permissão para excluir esta ficha." },
        { status: 403 }
      );
    }

    if (ficha.deleted_at) {
      return NextResponse.json(
        { error: "Esta ficha já foi excluída." },
        { status: 409 }
      );
    }

    const deletedAt = new Date().toISOString();

    const { error: updateError } = await supabaseAdmin
      .from("pro_fichas_uploads")
      .update({ deleted_at: deletedAt })
      .eq("id", ficha.id)
      .eq("user_id", user.id)
      .is("deleted_at", null);

    if (updateError) {
      console.error("Erro ao excluir ficha do Pro:", updateError);
      return NextResponse.json(
        { error: "Erro ao excluir ficha." },
        { status: 500 }
      );
    }

    const { error: auditError } = await supabaseAdmin
      .from("pro_fichas_audit_logs")
      .insert({
        event_type: "user_deleted",
        user_id: user.id,
        ficha_id: ficha.id,
        file_key: ficha.file_key,
        metadata: {
          deleted_at: deletedAt,
        },
      });

    if (auditError) {
      console.error("Erro ao registrar auditoria de exclusão:", auditError);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro na exclusão da ficha do Pro:", error);
    return NextResponse.json(
      { error: "Erro interno ao excluir ficha." },
      { status: 500 }
    );
  }
}
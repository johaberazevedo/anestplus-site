import { NextResponse } from "next/server";
import {
  hasValidAdminSession,
  isTrustedAdminMutationRequest,
  isUuid,
} from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  if (!isTrustedAdminMutationRequest(request)) {
    return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as { userId?: unknown };
    if (!isUuid(body.userId)) {
      return NextResponse.json({ error: "Usuário inválido." }, { status: 400 });
    }

    const { data: hospital, error: hospitalError } = await supabaseAdmin
      .from("resident_hospitals")
      .select("id, is_archived, replacement_allowed")
      .eq("user_id", body.userId)
      .maybeSingle();

    if (hospitalError) {
      console.error("Erro ao consultar hospital acadêmico:", hospitalError);
      return NextResponse.json(
        { error: "Não foi possível consultar o hospital acadêmico." },
        { status: 500 },
      );
    }

    if (!hospital) {
      return NextResponse.json(
        { error: "Hospital acadêmico não encontrado." },
        { status: 404 },
      );
    }

    if (!hospital.is_archived) {
      return NextResponse.json(
        {
          error:
            "O hospital acadêmico precisa estar arquivado antes da substituição.",
        },
        { status: 409 },
      );
    }

    if (hospital.replacement_allowed) {
      return NextResponse.json(
        { error: "A substituição deste hospital já está autorizada." },
        { status: 409 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("resident_hospitals")
      .update({
        replacement_allowed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", hospital.id)
      .eq("is_archived", true)
      .eq("replacement_allowed", false)
      .select("id, replacement_allowed")
      .maybeSingle();

    if (error) {
      console.error("Erro ao autorizar substituição de hospital:", error);
      return NextResponse.json(
        { error: "Não foi possível autorizar a substituição." },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "A situação do hospital mudou. Atualize o painel e tente novamente." },
        { status: 409 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro interno ao autorizar substituição:", error);
    return NextResponse.json(
      { error: "Erro interno ao autorizar a substituição." },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import {
  hasValidAdminSession,
  isTrustedAdminMutationRequest,
  isUuid,
} from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

const FEATURE = "pre_anesthetic";
const INSTITUTION_CODE_PATTERN = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;

export async function POST(request: Request) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  if (!isTrustedAdminMutationRequest(request)) {
    return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as {
      userId?: unknown;
      institutionCode?: unknown;
    };
    if (!isUuid(body.userId)) {
      return NextResponse.json({ error: "Usuário inválido." }, { status: 400 });
    }
    if (
      typeof body.institutionCode !== "string" ||
      body.institutionCode.length > 80 ||
      !INSTITUTION_CODE_PATTERN.test(body.institutionCode)
    ) {
      return NextResponse.json(
        { error: "Identificador da instituição inválido." },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("institutional_entitlements")
      .update({ status: "revoked", updated_at: new Date().toISOString() })
      .eq("user_id", body.userId)
      .eq("institution_code", body.institutionCode)
      .eq("feature", FEATURE)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("Erro ao revogar acesso residencial:", error);
      return NextResponse.json(
        { error: "Não foi possível revogar o acesso." },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "A concessão residencial não foi encontrada." },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro interno ao revogar acesso residencial:", error);
    return NextResponse.json(
      { error: "Erro interno ao revogar o acesso." },
      { status: 500 },
    );
  }
}

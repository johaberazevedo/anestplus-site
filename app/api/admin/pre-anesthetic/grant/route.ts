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
      expiresAt?: unknown;
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
        {
          error:
            "Informe um identificador válido, usando letras minúsculas, números e sublinhados.",
        },
        { status: 400 },
      );
    }
    const institutionCode = body.institutionCode;

    let expiresAt: string | null = null;
    if (body.expiresAt !== undefined && body.expiresAt !== null) {
      if (typeof body.expiresAt !== "string") {
        return NextResponse.json(
          { error: "Data de expiração inválida." },
          { status: 400 },
        );
      }

      const parsedExpiration = new Date(body.expiresAt);
      if (
        Number.isNaN(parsedExpiration.getTime()) ||
        parsedExpiration.getTime() <= Date.now()
      ) {
        return NextResponse.json(
          { error: "A expiração deve estar no futuro." },
          { status: 400 },
        );
      }

      expiresAt = parsedExpiration.toISOString();
    }

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.getUserById(body.userId);

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 },
      );
    }

    const { data: existingEntitlement, error: existingError } =
      await supabaseAdmin
        .from("institutional_entitlements")
        .select("status, starts_at, expires_at")
        .eq("user_id", body.userId)
        .eq("institution_code", institutionCode)
        .eq("feature", FEATURE)
        .maybeSingle();

    if (existingError) {
      console.error("Erro ao consultar acesso residencial:", existingError);
      return NextResponse.json(
        { error: "Não foi possível consultar o acesso atual." },
        { status: 500 },
      );
    }

    const nowDate = new Date();
    const now = nowDate.toISOString();
    const existingStartsAt = existingEntitlement
      ? new Date(existingEntitlement.starts_at)
      : null;
    const existingExpiresAt = existingEntitlement?.expires_at
      ? new Date(existingEntitlement.expires_at)
      : null;
    const existingAccessIsCurrentlyActive =
      existingEntitlement?.status === "active" &&
      existingStartsAt !== null &&
      !Number.isNaN(existingStartsAt.getTime()) &&
      existingStartsAt <= nowDate &&
      (existingExpiresAt === null || existingExpiresAt > nowDate);

    const { error } = await supabaseAdmin
      .from("institutional_entitlements")
      .upsert(
        {
          user_id: body.userId,
          institution_code: institutionCode,
          feature: FEATURE,
          status: "active",
          starts_at: existingAccessIsCurrentlyActive
            ? (existingEntitlement?.starts_at ?? now)
            : now,
          expires_at: expiresAt,
          approved_at: now,
          approved_by: null,
          updated_at: now,
        },
        { onConflict: "user_id,institution_code,feature" },
      );

    if (error) {
      console.error("Erro ao liberar acesso residencial:", error);
      return NextResponse.json(
        { error: "Não foi possível liberar o acesso." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro interno ao liberar acesso residencial:", error);
    return NextResponse.json(
      { error: "Erro interno ao liberar o acesso." },
      { status: 500 },
    );
  }
}

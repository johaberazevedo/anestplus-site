import { NextResponse } from "next/server";
import { hasValidAdminSession, isTrustedAdminMutationRequest, isUuid } from "@/lib/admin-auth";
import { HOSPITAL_ACCESS_FEATURE, HOSPITAL_BILLING_FEATURE, HOSPITAL_COORDINATION_FEATURE,
  HOSPITAL_PRE_ANESTHETIC_FEATURE, isHospitalCode,
  type HospitalAccessFeature } from "@/lib/institutional-hospitals";
import { supabaseAdmin } from "@/lib/supabase-admin";

function accessFeature(accessType: unknown): HospitalAccessFeature | null {
  if (accessType === undefined || accessType === "app") return HOSPITAL_ACCESS_FEATURE;
  if (accessType === "pre_anesthetic") return HOSPITAL_PRE_ANESTHETIC_FEATURE;
  if (accessType === "coordination") return HOSPITAL_COORDINATION_FEATURE;
  if (accessType === "billing") return HOSPITAL_BILLING_FEATURE;
  return null;
}

function accessFor(userId: string, hospitalCode: string, feature: HospitalAccessFeature) {
  return supabaseAdmin.from("institutional_entitlements")
    .select("status,starts_at,expires_at")
    .eq("user_id", userId)
    .eq("institution_code", hospitalCode)
    .eq("feature", feature)
    .maybeSingle();
}

export async function GET(request: Request) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const params = new URL(request.url).searchParams;
  const userId = params.get("userId");
  const hospitalCode = params.get("hospitalCode");
  const feature = accessFeature(params.get("accessType") ?? undefined);
  if (!feature) return NextResponse.json({ error: "Tipo de acesso inválido." }, { status: 400 });
  if (!isUuid(userId) || !isHospitalCode(hospitalCode)) {
    return NextResponse.json({ error: "Conta ou hospital inválido." }, { status: 400 });
  }
  const { data, error } = await accessFor(userId, hospitalCode, feature);
  if (error) {
    return NextResponse.json({ error: "Não foi possível consultar o vínculo." }, { status: 500 });
  }
  const now = Date.now();
  const active = data?.status === "active" && Date.parse(data.starts_at) <= now
    && (data.expires_at === null || Date.parse(data.expires_at) > now);
  return NextResponse.json({ status: data?.status ?? null, active }, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  if (!isTrustedAdminMutationRequest(request)) {
    return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
  }
  const { userId, hospitalCode, action, accessType } = (await request.json().catch(() => null)) ?? {};
  const feature = accessFeature(accessType);
  if (!feature) return NextResponse.json({ error: "Tipo de acesso inválido." }, { status: 400 });
  if (!isUuid(userId) || !isHospitalCode(hospitalCode) || (action !== "grant" && action !== "revoke")) {
    return NextResponse.json({ error: "Conta, hospital ou operação inválida." }, { status: 400 });
  }

  const now = new Date().toISOString();
  const table = supabaseAdmin.from("institutional_entitlements");
  if (action === "revoke") {
    const { data, error } = await table.update({ status: "revoked", updated_at: now })
      .eq("user_id", userId).eq("institution_code", hospitalCode)
      .eq("feature", feature).select("id").maybeSingle();
    if (error) {
      return NextResponse.json({ error: "Não foi possível revogar o vínculo." }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "Vínculo não encontrado." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  }

  const { data: hospital, error: hospitalError } = await supabaseAdmin.from("institutional_hospitals")
    .select("code").eq("code", hospitalCode).maybeSingle();
  if (hospitalError) {
    return NextResponse.json({ error: "Não foi possível verificar o hospital." }, { status: 500 });
  }
  if (!hospital) {
    return NextResponse.json({ error: "Hospital não encontrado." }, { status: 404 });
  }
  const { error } = await table.upsert({
    user_id: userId, institution_code: hospitalCode, feature,
    status: "active", starts_at: now, expires_at: null, approved_at: now, updated_at: now,
  }, { onConflict: "user_id,institution_code,feature" });
  if (error?.code === "23503") {
    return NextResponse.json({ error: "Conta não encontrada." }, { status: 404 });
  }
  if (error) {
    return NextResponse.json({ error: "Não foi possível conceder o vínculo." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

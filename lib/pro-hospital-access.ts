import { NextResponse } from "next/server";
import { HOSPITAL_ACCESS_FEATURE, HOSPITAL_PRE_ANESTHETIC_FEATURE, isHospitalCode,
  type HospitalAccessFeature, type HospitalModules } from "@/lib/institutional-hospitals";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function requestOwner(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!token) return NextResponse.json({ error: "Não autenticado." }, { status: 401, headers });

  const userId = await authenticateProHospitalToken(token);
  if (!userId) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 401, headers });
  }
  return userId;
}

export async function getProHospitalLinks(
  request: Request, hospitalCode?: string, feature: HospitalAccessFeature = HOSPITAL_ACCESS_FEATURE,
) {
  const userId = await requestOwner(request);
  if (typeof userId !== "string") return userId;

  try {
    return await getProHospitalLinksForUser(userId, hospitalCode, feature);
  } catch {
    return NextResponse.json({ error: "Não foi possível verificar os vínculos." }, {
      status: 500, headers: { "Cache-Control": "no-store" },
    });
  }
}

// Disponível apenas para clientes que solicitam explicitamente os módulos.
export async function getProHospitalModuleLinks(request: Request, hospitalCode?: string) {
  const userId = await requestOwner(request);
  if (typeof userId !== "string") return userId;
  try {
    const now = new Date().toISOString();
    const query = supabaseAdmin.from("institutional_entitlements")
      .select("institution_code,feature").eq("user_id", userId)
      .in("feature", [HOSPITAL_ACCESS_FEATURE, HOSPITAL_PRE_ANESTHETIC_FEATURE])
      .eq("status", "active").lte("starts_at", now)
      .or(`expires_at.is.null,expires_at.gt.${now}`);
    if (hospitalCode !== undefined) query.eq("institution_code", hospitalCode);
    const { data, error } = await query;
    if (error) throw error;
    const hospitals = new Map<string, HospitalModules>();
    for (const link of data) {
      if (!isHospitalCode(link.institution_code)) continue;
      const modules = hospitals.get(link.institution_code) ?? { anesthetic_record: false, pre_anesthetic: false };
      if (link.feature === HOSPITAL_ACCESS_FEATURE) modules.anesthetic_record = true;
      if (link.feature === HOSPITAL_PRE_ANESTHETIC_FEATURE) modules.pre_anesthetic = true;
      hospitals.set(link.institution_code, modules);
    }
    return [...hospitals].map(([code, modules]) => ({ code, modules }));
  } catch {
    return NextResponse.json({ error: "Não foi possível verificar os vínculos." }, {
      status: 500, headers: { "Cache-Control": "no-store" },
    });
  }
}

export async function authenticateProHospitalToken(token: string) {
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  return error ? null : user?.id ?? null;
}

export async function getProHospitalLinksForUser(
  userId: string, hospitalCode?: string, feature: HospitalAccessFeature = HOSPITAL_ACCESS_FEATURE,
) {
  const now = new Date().toISOString();
  const query = supabaseAdmin.from("institutional_entitlements")
    .select("institution_code")
    .eq("user_id", userId)
    .eq("feature", feature)
    .eq("status", "active")
    .lte("starts_at", now)
    .or(`expires_at.is.null,expires_at.gt.${now}`);
  if (hospitalCode !== undefined) query.eq("institution_code", hospitalCode);

  const { data, error } = await query;
  if (error) throw error;
  return [...new Set(data.map((link) => link.institution_code).filter(isHospitalCode))];
}

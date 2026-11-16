import { NextResponse } from "next/server";
import { HOSPITAL_ACCESS_FEATURE, isHospitalCode, type HospitalAccessFeature } from "@/lib/institutional-hospitals";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function getProHospitalLinks(
  request: Request, hospitalCode?: string, feature: HospitalAccessFeature = HOSPITAL_ACCESS_FEATURE,
) {
  const headers = { "Cache-Control": "no-store" };
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!token) return NextResponse.json({ error: "Não autenticado." }, { status: 401, headers });

  const userId = await authenticateProHospitalToken(token);
  if (!userId) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 401, headers });
  }

  try {
    return await getProHospitalLinksForUser(userId, hospitalCode, feature);
  } catch {
    return NextResponse.json({ error: "Não foi possível verificar os vínculos." }, { status: 500, headers });
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

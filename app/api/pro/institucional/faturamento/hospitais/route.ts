import { HOSPITAL_BILLING_FEATURE } from "@/lib/institutional-hospitals";
import { getProHospitalLinks } from "@/lib/pro-hospital-access";
import { supabaseAdmin } from "@/lib/supabase-admin";

const headers = { "Cache-Control": "private, no-store" };

export async function GET(request: Request) {
  try {
    const codes = await getProHospitalLinks(request, undefined, HOSPITAL_BILLING_FEATURE);
    if (!Array.isArray(codes)) return codes;
    if (codes.length === 0) return Response.json({ hospitals: [] }, { headers });

    const { data, error } = await supabaseAdmin.from("institutional_hospitals")
      .select("code,name").eq("is_active", true).in("code", codes).order("name");
    if (error) throw error;
    return Response.json({ hospitals: data ?? [] }, { headers });
  } catch {
    return Response.json({ error: "Não foi possível carregar os hospitais do faturamento." }, { status: 503, headers });
  }
}

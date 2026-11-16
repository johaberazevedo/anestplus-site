import { HOSPITAL_BILLING_FEATURE, isHospitalCode } from "@/lib/institutional-hospitals";
import { getProHospitalLinks } from "@/lib/pro-hospital-access";
import { supabaseAdmin } from "@/lib/supabase-admin";

export function billingReply(data: object, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "private, no-store" } });
}

export async function getBillingHospital(request: Request, hospitalCode: string) {
  if (!isHospitalCode(hospitalCode)) return billingReply({ error: "Hospital inválido." }, 400);
  const denied = () => billingReply({ error: "Acesso ao faturamento não autorizado." }, 403);
  const links = await getProHospitalLinks(request, hospitalCode, HOSPITAL_BILLING_FEATURE);
  if (!Array.isArray(links)) return links;
  if (!links.includes(hospitalCode)) return denied();

  const { data, error } = await supabaseAdmin.from("institutional_hospitals")
    .select("code,name").eq("code", hospitalCode).eq("is_active", true).maybeSingle();
  if (error) return billingReply({ error: "Não foi possível verificar o hospital." }, 500);
  return data ?? denied();
}

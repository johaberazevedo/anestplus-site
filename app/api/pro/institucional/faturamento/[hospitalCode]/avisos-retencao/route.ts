import { billingReply, getBillingHospital } from "@/lib/institutional-billing-access";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type BillingRetentionNotice = {
  month: string;
  expiresAt: string;
  stage: 1 | 7 | 30;
} & ({ state: "open" } | { state: "closed"; version: number });

export async function GET(request: Request, { params }: { params: Promise<{ hospitalCode: string }> }) {
  try {
    const { hospitalCode } = await params;
    const hospital = await getBillingHospital(request, hospitalCode);
    if (hospital instanceof Response) return hospital;

    const { data: candidates, error: noticeError } = await supabaseAdmin
      .from("institutional_billing_retention_notices")
      .select("competence_month,expires_at,notice_stage_days")
      .eq("hospital_code", hospital.code)
      .order("expires_at").order("competence_month");
    if (noticeError) throw noticeError;
    if (!candidates?.length) return billingReply({ notices: [] });

    const { data: periods, error: periodError } = await supabaseAdmin
      .from("institutional_billing_periods")
      .select("competence_month,state,latest_version")
      .eq("hospital_code", hospital.code)
      .in("competence_month", candidates.map(({ competence_month }) => competence_month))
      .in("state", ["open", "closed"])
      .gt("expires_at", new Date().toISOString());
    if (periodError) throw periodError;

    const byMonth = new Map((periods ?? []).map((period) => [period.competence_month, period]));
    const notices: BillingRetentionNotice[] = [];
    const now = Date.now();
    for (const { competence_month: month, expires_at: expiresAt, notice_stage_days: stage } of candidates) {
      const period = byMonth.get(month);
      if (!period || !(Date.parse(expiresAt) > now) || (stage !== 1 && stage !== 7 && stage !== 30)) continue;
      if (period.state === "open") notices.push({ month, expiresAt, stage, state: "open" });
      if (period.state === "closed" && Number.isSafeInteger(period.latest_version) && period.latest_version > 0) {
        notices.push({ month, expiresAt, stage, state: "closed", version: period.latest_version });
      }
    }
    return billingReply({ notices });
  } catch {
    return billingReply({ error: "Não foi possível carregar os avisos de retenção." }, 503);
  }
}

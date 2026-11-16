import { billingNameKey, isBillingDate, type BillingPlan } from "@/lib/institutional-billing";
import { billingReply as reply, getBillingHospital } from "@/lib/institutional-billing-access";
import { calculateProduction, summarizeProduction, type BillingSource } from "@/lib/institutional-billing-production";
import { institutionalRetentionMs, institutionalUploads } from "@/lib/pro-institutional-submission";
import { supabaseAdmin } from "@/lib/supabase-admin";

const pageSize = 50;
const batchSize = 500;

function isSearch(value: unknown): value is string {
  return typeof value === "string" && value.length <= 120 && !value.includes("\0");
}

async function listCases(hospitalCode: string, from: string, to: string) {
  const now = new Date();
  const cutoff = new Date(now.getTime() - institutionalRetentionMs).toISOString();
  const cases: BillingSource[] = [];
  let count: number | null = null;
  // PostgREST limita linhas por consulta. O resumo usa o período inteiro, inclusive se houver várias páginas.
  while (count === null || cases.length < count) {
    const offset = cases.length;
    const { data, count: available, error } = await supabaseAdmin.from(institutionalUploads)
      .select("document_id,record_number,procedure_date,procedure_name,plan_name,anesthesiologist_name,crm,start_date_time,end_date_time",
        offset === 0 ? { count: "exact" } : undefined)
      .eq("hospital_code", hospitalCode).gt("uploaded_at", cutoff).lte("uploaded_at", now.toISOString())
      .gte("procedure_date", from).lte("procedure_date", to)
      .order("procedure_date", { ascending: false }).order("document_id").order("user_id")
      .range(offset, offset + batchSize - 1).returns<BillingSource[]>();
    if (error) throw error;
    if (!data?.length) break;
    if (offset === 0) count = available;
    cases.push(...data);
  }
  return cases;
}

export async function POST(request: Request, { params }: { params: Promise<{ hospitalCode: string }> }) {
  const { hospitalCode } = await params;
  try {
    const hospital = await getBillingHospital(request, hospitalCode);
    if (hospital instanceof Response) return hospital;

    const body = await request.json().catch(() => null);
    const { from, to, plan, professional, page = 1 } = body ?? {};
    if (!isBillingDate(from) || !isBillingDate(to) || from > to || !isSearch(plan) || !isSearch(professional)
        || !Number.isSafeInteger(page) || page < 1) {
      return reply({ error: "Confira o período e os filtros." }, 400);
    }

    const [cases, plans] = await Promise.all([
      listCases(hospital.code, from, to),
      supabaseAdmin.from("institutional_billing_plans")
        .select("id,plan_name,insurer_name,tables:institutional_billing_tables(starts_on,configuration)")
        .eq("hospital_code", hospital.code).lte("tables.starts_on", to)
        .order("starts_on", { referencedTable: "tables", ascending: false }).returns<BillingPlan[]>(),
    ]);
    if (plans.error) throw plans.error;
    const planKey = billingNameKey(plan);
    const professionalKey = billingNameKey(professional);
    const filtered = cases.filter((ficha) => (
      (!planKey || billingNameKey(ficha.plan_name) === planKey)
      && (!professionalKey || billingNameKey(ficha.anesthesiologist_name).includes(professionalKey)
        || billingNameKey(ficha.crm).includes(professionalKey))
    ));
    const calculated = calculateProduction(filtered, plans.data ?? []);
    const lastPage = Math.max(1, Math.ceil(calculated.length / pageSize));
    const currentPage = Math.min(page, lastPage);
    const offset = (currentPage - 1) * pageSize;
    return reply({
      hospitalName: hospital.name,
      cases: calculated.slice(offset, offset + pageSize),
      summary: summarizeProduction(calculated),
      page: currentPage,
      lastPage,
    });
  } catch {
    return reply({ error: "Não foi possível consultar a produção agora." }, 503);
  }
}

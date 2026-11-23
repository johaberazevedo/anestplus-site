import { billingNameKey, isBillingDate, type BillingPlan } from "@/lib/institutional-billing";
import { billingReply as reply, billingTiming, getBillingHospital } from "@/lib/institutional-billing-access";
import { calculateProduction, productionSpreadsheet, summarizeProduction, type BillingSource } from "@/lib/institutional-billing-production";
import { cycleTables, activeBillingMonthCutoff } from "@/lib/pro-institutional-cycles";
import { supabaseAdmin } from "@/lib/supabase-admin";

const pageSize = 50;
const batchSize = 500;

function isSearch(value: unknown): value is string {
  return typeof value === "string" && value.length <= 120 && !value.includes("\0");
}

async function listCases(hospitalCode: string, from: string, to: string) {
  const now = new Date();
  const cutoff = activeBillingMonthCutoff(now);
  const cases: BillingSource[] = [];
  let count: number | null = null;
  // PostgREST limita linhas por consulta. O resumo usa o período inteiro, inclusive se houver várias páginas.
  while (count === null || cases.length < count) {
    const offset = cases.length;
    const { data, count: available, error } = await supabaseAdmin.from(cycleTables.production)
      .select("document_id,patient_name,anesthesia_type,record_number,procedure_date,procedure_name,plan_name,anesthesiologist_name,crm,start_date_time,end_date_time,period:institutional_billing_periods!inner(state,expires_at)",
        offset === 0 ? { count: "exact" } : undefined)
      .eq("hospital_code", hospitalCode).gte("competence_month", cutoff)
      .neq("period.state", "expired").gt("period.expires_at", now.toISOString())
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
  const timing = billingTiming("producao");
  const respond = (data: object, status = 200, records?: number) => timing.finish(reply(data, status), records);
  const { hospitalCode } = await params;
  try {
    const hospital = await getBillingHospital(request, hospitalCode, timing);
    if (hospital instanceof Response) return timing.finish(hospital);

    const body = await request.json().catch(() => null);
    const { from, to, plan, professional, page = 1, exportAll = false } = body ?? {};
    if (!isBillingDate(from) || !isBillingDate(to) || from > to || !isSearch(plan) || !isSearch(professional)
        || !Number.isSafeInteger(page) || page < 1 || typeof exportAll !== "boolean") {
      return respond({ error: "Confira o período e os filtros." }, 400);
    }

    const [cases, plans] = await Promise.all([
      timing.measure("fichas", () => listCases(hospital.code, from, to)),
      timing.measure("tabelas", () => supabaseAdmin.from("institutional_billing_plans")
        .select("id,plan_name,insurer_name,tables:institutional_billing_tables(starts_on,configuration)")
        .eq("hospital_code", hospital.code).lte("tables.starts_on", to)
        .order("starts_on", { referencedTable: "tables", ascending: false }).returns<BillingPlan[]>()),
    ]);
    if (plans.error) throw plans.error;
    const planKey = billingNameKey(plan);
    const professionalKey = billingNameKey(professional);
    const filtered = cases.filter((ficha) => (
      (!planKey || billingNameKey(ficha.plan_name) === planKey)
      && (!professionalKey || billingNameKey(ficha.anesthesiologist_name).includes(professionalKey)
        || billingNameKey(ficha.crm).includes(professionalKey))
    ));
    const calculated = await timing.measure("calculo", () => calculateProduction(filtered, plans.data ?? []));
    if (exportAll) {
      const spreadsheet = await timing.measure("planilha", () => productionSpreadsheet(calculated));
      return respond({ spreadsheet, count: calculated.length }, 200, cases.length);
    }
    const lastPage = Math.max(1, Math.ceil(calculated.length / pageSize));
    const currentPage = Math.min(page, lastPage);
    const offset = (currentPage - 1) * pageSize;
    return respond({
      hospitalName: hospital.name,
      cases: calculated.slice(offset, offset + pageSize),
      summary: summarizeProduction(calculated),
      page: currentPage,
      lastPage,
    }, 200, cases.length);
  } catch {
    return respond({ error: "Não foi possível consultar a produção agora." }, 503);
  }
}

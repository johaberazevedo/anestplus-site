import { isUuid } from "@/lib/admin-auth";
import { billingText, isBillingDate, parseBillingConfiguration } from "@/lib/institutional-billing";
import { billingReply as reply, billingTiming, getBillingHospital } from "@/lib/institutional-billing-access";
import { supabaseAdmin } from "@/lib/supabase-admin";

type Context = { params: Promise<{ hospitalCode: string }> };
const plans = "institutional_billing_plans";
const tables = "institutional_billing_tables";
const planFields = "id,plan_name,insurer_name";
const tableFields = "starts_on,configuration";

export async function GET(request: Request, context: Context) {
  const timing = billingTiming("configuracao");
  const respond = (data: object, status = 200) => timing.finish(reply(data, status));
  try {
    const { hospitalCode } = await context.params;
    const hospital = await getBillingHospital(request, hospitalCode, timing);
    if (hospital instanceof Response) return timing.finish(hospital);
    const { data, error } = await timing.measure("tabelas", () => supabaseAdmin.from(plans)
      .select(`${planFields},tables:${tables}(${tableFields})`)
      .eq("hospital_code", hospital.code).order("plan_name").order("starts_on", { referencedTable: "tables", ascending: false }));
    if (error) return respond({ error: "Não foi possível carregar o faturamento." }, 500);
    return respond({ hospitalName: hospital.name, plans: data ?? [] });
  } catch {
    return respond({ error: "Não foi possível carregar o faturamento agora." }, 503);
  }
}

async function save(request: Request, context: Context, create: boolean) {
  const timing = billingTiming("configuracao");
  const respond = (data: object, status = 200) => timing.finish(reply(data, status));
  try {
    const { hospitalCode } = await context.params;
    const hospital = await getBillingHospital(request, hospitalCode, timing);
    if (hospital instanceof Response) return timing.finish(hospital);
    const body = await request.json().catch(() => null);
    if (body?.type === "plan") {
      const planName = billingText(body.plan_name);
      const insurerName = billingText(body.insurer_name) || null;
      if (!planName || (!create && !isUuid(body.planId))) return respond({ error: "Confira o nome e o plano." }, 400);
      const fields = { plan_name: planName, insurer_name: insurerName };
      const plan = create
        ? supabaseAdmin.from(plans).insert({ hospital_code: hospital.code, ...fields })
        : supabaseAdmin.from(plans).update(fields).eq("hospital_code", hospital.code).eq("id", body.planId);
      const { data, error } = await timing.measure("gravacao", () => plan.select(planFields).maybeSingle());
      if (error?.code === "23505") return respond({ error: "Já existe um plano com esse nome no hospital." }, 409);
      if (error?.code === "23503") return respond({ error: "Hospital não encontrado." }, 404);
      if (error) return respond({ error: "Não foi possível salvar o plano." }, 500);
      if (!data) return respond({ error: "Plano não encontrado neste hospital." }, 404);
      return respond({ plan: data }, create ? 201 : 200);
    }

    if (body?.type !== "table" || !isUuid(body.planId) || !isBillingDate(body.starts_on)) {
      return respond({ error: "Confira o plano e o início da vigência." }, 400);
    }
    const configuration = parseBillingConfiguration(body.configuration);
    if ("error" in configuration) return respond(configuration, 400);
    const plan = await timing.measure("plano", () => supabaseAdmin.from(plans).select("id")
      .eq("hospital_code", hospital.code).eq("id", body.planId).maybeSingle());
    if (plan.error) return respond({ error: "Não foi possível verificar o plano." }, 500);
    if (!plan.data) return respond({ error: "Plano não encontrado neste hospital." }, 404);

    const query = create
      ? supabaseAdmin.from(tables).insert({ plan_id: plan.data.id, starts_on: body.starts_on, configuration })
      : supabaseAdmin.from(tables).update({ configuration })
        .eq("plan_id", plan.data.id).eq("starts_on", body.starts_on);
    const { data, error } = await timing.measure("gravacao", () => query.select(tableFields).maybeSingle());
    if (error?.code === "23505") return respond({ error: "Já existe uma tabela com esse início de vigência." }, 409);
    if (error) return respond({ error: "Não foi possível salvar a tabela de valores." }, 500);
    if (!data) return respond({ error: "Tabela de valores não encontrada neste plano." }, 404);
    return respond({ table: data }, create ? 201 : 200);
  } catch {
    return respond({ error: "Não foi possível salvar a configuração agora." }, 503);
  }
}

export function POST(request: Request, context: Context) {
  return save(request, context, true);
}

export function PATCH(request: Request, context: Context) {
  return save(request, context, false);
}

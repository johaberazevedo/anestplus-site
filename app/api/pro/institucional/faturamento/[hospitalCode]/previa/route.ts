import { isUuid } from "@/lib/admin-auth";
import { billingText, isBillingDate } from "@/lib/institutional-billing";
import { billingPublicationEnabled, billingReply, getBillingHospital } from "@/lib/institutional-billing-access";
import { billingPublishedScopes, calculateOfficialBilling, officialBillingContext, type BillingScopedRevision } from "@/lib/institutional-billing-calculation";
import { previewBillingV2, type BillingPreviewSourceV2, type BillingPreviewV2 } from "@/lib/institutional-billing-preview-v2";
import type { ProductionCase } from "@/lib/institutional-billing-production";
import { publicationUnavailable, readBillingCalculationContext, readPublicationPage } from "@/lib/institutional-billing-publication-rpc";
import { validateBillingRevisionV2, type BillingRevisionV2 } from "@/lib/institutional-billing-rules-v2";
import { activeBillingMonthCutoff, cycleTables } from "@/lib/pro-institutional-cycles";
import { supabaseAdmin } from "@/lib/supabase-admin";

const sampleLimit = 20;
const invalid = () => billingReply({ error: "Confira os dados da simulação." }, 400);
const changed = () => billingReply({ error: "Outra revisão foi publicada. Atualize a prévia.", code: "stale" }, 409);
type Evaluation = Extract<BillingPreviewV2, { items: object[] }>;
type PreviewItem = Evaluation["items"][number];
type Sample = { mode: "example"; date: string; procedure: string | null; plan: string | null;
  technique: string | null; start: string | null; duration: number | null } | { mode: "production"; month: string };
type DraftRequest = { configuration?: unknown; planId?: unknown; sample?: unknown };

function readSample(raw: unknown): Sample | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const input = raw as Record<string, unknown>;
  if (input.mode === "production") return isBillingDate(input.month) && input.month.endsWith("-01")
    ? { mode: "production", month: input.month } : null;
  if (input.mode !== "example" || !isBillingDate(input.date)) return null;
  const { duration } = input;
  if (duration !== null && (typeof duration !== "number" || !Number.isFinite(duration) || duration <= 0)) return null;
  if (![input.procedure, input.plan, input.technique, input.start].every((field) =>
    field === null || (typeof field === "string" && field.length <= 160 && !field.includes("\0")))) return null;
  const start = billingText(input.start) || null;
  if ((start && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(start)) || (duration !== null && !start)) return null;
  return { mode: "example", date: input.date, procedure: billingText(input.procedure) || null, plan: billingText(input.plan) || null,
    technique: billingText(input.technique) || null, start, duration };
}

function exampleSource(hospitalCode: string, sample: Extract<Sample, { mode: "example" }>): BillingPreviewSourceV2 {
  // Os campos da ficha simulada usam o horário institucional. A regra pode usar outro fuso.
  const start = sample.start ? `${sample.date}T${sample.start}:00-03:00` : null;
  const end = start && sample.duration !== null ? new Date(Date.parse(start) + sample.duration * 60000) : null;
  if (end && !Number.isFinite(end.getTime())) throw invalid();
  return { hospital_code: hospitalCode, user_id: "exemplo", document_id: "exemplo", procedure_date: sample.date,
    procedure_name: sample.procedure, plan_name: sample.plan, anesthesia_type: sample.technique,
    start_date_time: start, end_date_time: end?.toISOString() ?? null };
}

async function openPeriod(hospitalCode: string, month: string) {
  if (month < activeBillingMonthCutoff()) throw billingReply({ error: "A competência expirou." }, 410);
  const { data, error } = await supabaseAdmin.from("institutional_billing_periods").select("state,expires_at")
    .eq("hospital_code", hospitalCode).eq("competence_month", month).maybeSingle();
  if (error) throw error;
  if (!data) throw billingReply({ error: "Competência indisponível para simulação." }, 404);
  if (data.state === "expired" || Date.parse(data.expires_at) <= Date.now()) throw billingReply({ error: "A competência expirou." }, 410);
  if (data.state !== "open") throw billingReply({ error: "A prévia usa apenas competências abertas." }, 409);
}

async function sampleProduction(hospitalCode: string, month: string) {
  await openPeriod(hospitalCode, month);
  const { data, error } = await supabaseAdmin.from(cycleTables.production)
    .select("hospital_code,user_id,document_id,procedure_date,procedure_name,plan_name,anesthesia_type,start_date_time,end_date_time,period:institutional_billing_periods!inner(state,expires_at)")
    .eq("hospital_code", hospitalCode).eq("competence_month", month)
    .eq("period.state", "open").gt("period.expires_at", new Date().toISOString())
    .order("procedure_date", { ascending: false }).order("document_id").order("user_id")
    .limit(sampleLimit + 1).returns<BillingPreviewSourceV2[]>();
  if (error) throw error;
  return data ?? [];
}

async function publicationProjection(request: Request, hospitalCode: string, planId: string | null, draft: BillingRevisionV2,
  firstPublicationVersion: number | null) {
  const effective = new Map<string, BillingScopedRevision>([[JSON.stringify([planId, draft.startsOn]),
    { plan_id: planId, configuration_after: draft }]]);
  let page = await readPublicationPage(request, hospitalCode, null, 100);
  const latest = page.latest_version;
  while (true) {
    for (const item of page.publications) {
      if (firstPublicationVersion !== null && item.version < firstPublicationVersion) continue;
      const scope = JSON.stringify([item.plan_id, item.starts_on]);
      if (!effective.has(scope)) effective.set(scope, item);
    }
    if (page.next_before_version === null) return { latest, revisions: [...effective.values()] };
    page = await readPublicationPage(request, hospitalCode, page.next_before_version, 100);
    if (page.latest_version !== latest) throw changed();
  }
}

function viewItem(item: PreviewItem, current: ProductionCase) {
  const { facts, revision, marks, tier, classification, rules, priceRule, baseAmountCents, additions, amountCents, pending } = item;
  return { facts: { procedureDate: facts.procedureDate, procedure: facts.procedure, plan: facts.plan, technique: facts.technique,
    billedMinutes: facts.billedMinutes, shift: facts.shift, weekday: facts.weekday, timeZone: facts.timeZone },
    revision, marks, tier, classification, rules, priceRule, baseAmountCents, additions, amountCents, pending,
    currentAmountCents: current.amountCents, currentPending: current.pending };
}

export type BillingDraftPreview = {
  expectedVersion: number;
  sampleLimited: boolean;
  sampleMode: Sample["mode"];
  summary: Evaluation["summary"];
  items: ReturnType<typeof viewItem>[];
};

export async function POST(request: Request, { params }: { params: Promise<{ hospitalCode: string }> }) {
  const { hospitalCode } = await params;
  if (!billingPublicationEnabled(hospitalCode)) return billingReply({ error: "Prévia indisponível para este hospital." }, 404);
  try {
    const hospital = await getBillingHospital(request, hospitalCode);
    if (hospital instanceof Response) return hospital;
    const input = await request.json().catch(() => null) as DraftRequest | null;
    const sample = readSample(input?.sample);
    const planId = input?.planId;
    if (!sample || (planId !== null && !isUuid(planId))) return invalid();
    const validated = validateBillingRevisionV2(input?.configuration);
    if (!validated.revision) return billingReply({ error: "Confira as regras da configuração.", issues: validated.issues }, 400);
    const draft = validated.revision;
    if (draft.hospitalCode !== hospital.code || !isUuid(draft.revisionId) || (draft.planName === null) !== (planId === null)) return invalid();
    const lastDay = new Date(`${sample.mode === "example" ? sample.date : sample.month}T00:00:00Z`);
    if (sample.mode === "production") lastDay.setUTCMonth(lastDay.getUTCMonth() + 1, 0);
    const data = await readBillingCalculationContext(request, hospital, lastDay.toISOString().slice(0, 10));
    const context = officialBillingContext(data, hospital.code);
    const { latest, revisions } = await publicationProjection(request, hospital.code, planId, draft,
      context.activation.first_publication_version);
    if (planId !== null && !context.plans.some((plan) => plan.id === planId && plan.plan_name === draft.planName)) {
      return billingReply({ error: "O plano mudou ou não pertence ao hospital.", code: "scope_changed" }, 409);
    }
    const sources = sample.mode === "example" ? [exampleSource(hospital.code, sample)] : await sampleProduction(hospital.code, sample.month);
    const subset = sources.slice(0, sampleLimit);
    const evaluation = previewBillingV2(hospital.code, revisions.map(({ configuration_after }) => configuration_after), subset,
      billingPublishedScopes(context.plans, revisions));
    if (evaluation.issues) return billingReply({ error: "Confira as revisões e os dados da simulação.", issues: evaluation.issues }, 400);
    if (evaluation.excludedSourceCount > 0) return billingReply({ error: "Não foi possível verificar os dados da simulação." }, 503);
    const current = calculateOfficialBilling(subset.map((source) => ({ ...source, record_number: null, anesthesiologist_name: null, crm: null })), context);
    if (sample.mode === "production") await openPeriod(hospital.code, sample.month);
    const response: BillingDraftPreview = { expectedVersion: latest, sampleLimited: sources.length > sampleLimit,
      sampleMode: sample.mode, summary: evaluation.summary, items: evaluation.items.map((item, index) => viewItem(item, current[index].item)) };
    return billingReply(response);
  } catch (error) {
    return publicationUnavailable(error);
  }
}

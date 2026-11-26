import { billingNameKey, identifyAnesthesia, isBillingDate, type BillingPlan } from "@/lib/institutional-billing";
import { previewBillingV2, type BillingPreviewV2 } from "@/lib/institutional-billing-preview-v2";
import { calculateProduction, type BillingSource, type ProductionCase } from "@/lib/institutional-billing-production";
import type { BillingRevisionV2 } from "@/lib/institutional-billing-rules-v2";

export type BillingActivation = { version: number; starts_on: string | null; first_publication_version: number | null };
export type BillingScopedRevision = { plan_id: string | null; configuration_after: BillingRevisionV2 };
type PublishedRevision = BillingScopedRevision & { version: number };
export type BillingCalculationContext = {
  hospital_code: string; activation: BillingActivation; plans: BillingPlan[]; publications: PublishedRevision[];
};
export type OfficialBillingSource = BillingSource & { user_id: string; financial_classification_id?: string };
type VersionedItem = Extract<BillingPreviewV2, { items: object[] }>["items"][number];
type OfficialLine = { item: ProductionCase; evaluation?: VersionedItem };

const weekdayNames: Record<string, string> = {
  Sun: "dom.", Mon: "seg.", Tue: "ter.", Wed: "qua.", Thu: "qui.", Fri: "sex.", Sat: "sáb.",
};

export function officialBillingContext(raw: unknown, hospitalCode: string): BillingCalculationContext {
  const context = raw as Partial<BillingCalculationContext> | null;
  const activation = context?.activation;
  if (context?.hospital_code !== hospitalCode || !activation || !Number.isInteger(activation.version) || activation.version < 0
      || !Array.isArray(context.plans) || !Array.isArray(context.publications)
      || (activation.starts_on === null ? activation.first_publication_version !== null || context.publications.length > 0
        : !isBillingDate(activation.starts_on) || !Number.isInteger(activation.first_publication_version)
          || (activation.first_publication_version ?? 0) < 1)) throw new Error("invalid_billing_calculation_context");
  return context as BillingCalculationContext;
}

export function billingPublishedScopes(plans: BillingPlan[], revisions: BillingScopedRevision[]) {
  const registeredPlans = new Map<string, string[]>();
  for (const plan of plans) {
    const name = billingNameKey(plan.plan_name);
    if (!name) continue;
    const ids = registeredPlans.get(name) ?? [];
    ids.push(plan.id);
    registeredPlans.set(name, ids);
  }
  const revisionPlans = new Map<string, string>();
  for (const { plan_id, configuration_after } of revisions) {
    if (plan_id !== null) revisionPlans.set(configuration_after.revisionId, plan_id);
  }
  return { registeredPlans, revisionPlans };
}

// Ponto de entrada para a produção aberta e para a preparação do snapshot.
// As tabelas antigas conservam a sua semântica. Os preços publicados usam a avaliação V2.
export function calculateOfficialBilling(sources: OfficialBillingSource[], context: BillingCalculationContext): OfficialLine[] {
  const rows: OfficialLine[] = new Array(sources.length);
  const legacy: number[] = [];
  const versioned: number[] = [];
  const cutover = context.activation.starts_on;
  sources.forEach(({ procedure_date }, index) => {
    (cutover && isBillingDate(procedure_date) && procedure_date >= cutover ? versioned : legacy).push(index);
  });
  if (legacy.length) {
    calculateProduction(legacy.map((index) => sources[index]), context.plans).forEach((item, index) => {
      const sourceIndex = legacy[index];
      rows[sourceIndex] = { item: sources[sourceIndex].financial_classification_id === undefined ? item : {
        ...item, amountCents: null, baseAmountCents: null, additions: [], rule: null,
        pending: "A classificação financeira exige uma revisão publicada aplicável.",
      } };
    });
  }
  if (!versioned.length) return rows;

  const planIds = new Set(context.plans.map(({ id }) => id));
  const publications = new Map<string, PublishedRevision>();
  for (const publication of context.publications) {
    const revision = publication?.configuration_after;
    if (!revision || revision.hospitalCode !== context.hospital_code
        || !Number.isInteger(publication.version) || publication.version < context.activation.first_publication_version!
        || (publication.plan_id !== null && !planIds.has(publication.plan_id))
        || publications.has(revision.revisionId)) throw new Error("invalid_billing_calculation_publication");
    publications.set(revision.revisionId, publication);
  }
  const calculated = previewBillingV2(context.hospital_code, context.publications.map(({ configuration_after }) => configuration_after),
    versioned.map((index) => ({ ...sources[index], hospital_code: context.hospital_code })),
    billingPublishedScopes(context.plans, context.publications));
  if (calculated.issues || calculated.excludedSourceCount || calculated.items.length !== versioned.length) {
    throw new Error("invalid_official_billing_evaluation");
  }
  calculated.items.forEach((evaluation, index) => {
    const sourceIndex = versioned[index];
    const source = sources[sourceIndex];
    const { document_id: id, user_id: userId } = source;
    if (evaluation.documentId !== id || evaluation.userId !== userId) throw new Error("unexpected_official_billing_item");
    const { facts, revision } = evaluation;
    const publication = revision && publications.get(revision.id);
    const item: ProductionCase = { id, patient_name: source.patient_name ?? null, anesthesia_type: source.anesthesia_type ?? null,
      record_number: source.record_number, procedure_date: source.procedure_date, procedure_name: source.procedure_name,
      plan_name: source.plan_name, anesthesiologist_name: source.anesthesiologist_name, crm: source.crm,
      start_date_time: source.start_date_time, end_date_time: source.end_date_time, technique: identifyAnesthesia(source.anesthesia_type),
      durationMinutes: facts.durationMinutes, billedMinutes: facts.billedMinutes, timeZone: facts.timeZone ?? "",
      weekday: facts.weekday ? weekdayNames[facts.weekday] ?? null : null,
      shift: facts.shift === "day" ? "Diurno" : facts.shift === "night" ? "Noturno" : null,
      amountCents: evaluation.amountCents, baseAmountCents: evaluation.amountCents === null ? null : evaluation.baseAmountCents,
      additions: evaluation.amountCents === null ? [] : evaluation.additions.map(({ label, amountCents }) => ({ label, amountCents })),
      startsOn: revision?.startsOn ?? null, rule: null, pending: evaluation.pending?.message ?? null,
      ...(publication && { publication: { version: publication.version, revisionId: publication.configuration_after.revisionId,
        ruleLabel: evaluation.priceRule?.label ?? null } }),
    };
    rows[sourceIndex] = { item, evaluation };
  });
  return rows;
}

import { billingNameKey, billingText, identifyAnesthesia, isBillingDate, type BillingAdditional } from "@/lib/institutional-billing";
import { additionalCents, elapsedMinutes, timing, type BillingSource } from "@/lib/institutional-billing-production";
import { validateBillingRevisionV2, type BillingConditionFieldV2, type BillingConfigurationIssueV2,
  type BillingDurationV2, type BillingLabelV2, type BillingRevisionV2, type BillingRuleV2 } from "@/lib/institutional-billing-rules-v2";
import { isHospitalCode } from "@/lib/institutional-hospitals";

export type BillingPreviewSourceV2 = Pick<BillingSource, "document_id" | "procedure_date" | "procedure_name" | "plan_name"
  | "anesthesia_type" | "start_date_time" | "end_date_time"> & {
    hospital_code: string; user_id: string; financial_classification_id?: string;
  };

type Stage = "mark" | "tier" | "classification" | "price" | "additional";
type Match = "matched" | "not_matched" | "insufficient";
type ConditionField = BillingConditionFieldV2 | "duration";
type ConditionExplanation = {
  field: ConditionField;
  expected: readonly string[] | BillingDurationV2;
  actual: string | number | readonly string[] | null;
  status: Match;
};
type RuleExplanation = {
  stage: Stage; ruleId: string; label: string; priority: number; conditions: ConditionExplanation[]; status: Match; applied: boolean;
  candidateAmountCents?: string;
};
type Pending = {
  code: "invalid_procedure_date" | "missing_plan" | "ambiguous_plan" | "missing_revision" | "missing_data"
    | "invalid_classification" | "no_price" | "amount_out_of_range";
  stage: "revision" | Stage;
  message: string;
  ruleId?: string;
  fields?: ConditionField[];
};
type Facts = {
  procedureDate: string | null; procedure: string | null; plan: string | null; anesthesia: string | null;
  technique: string | null; durationMinutes: number | null; billedMinutes: number | null;
  shift: "day" | "night" | null; weekday: string | null; timeZone: string | null;
};
type Context = {
  facts: Facts;
  marks: Set<string>;
  uncertainMarks: Set<string>;
  tier: BillingLabelV2 | null;
  classification: BillingLabelV2 | null;
};
type PreviewItem = {
  documentId: string;
  userId: string;
  revision: (Pick<BillingRevisionV2, "startsOn" | "planName" | "durationRounding" | "additionMode"> & { id: string }) | null;
  facts: Facts;
  marks: BillingLabelV2[];
  tier: BillingLabelV2 | null;
  classification: BillingLabelV2 | null;
  rules: RuleExplanation[];
  priceRule: BillingLabelV2 | null;
  baseAmountCents: number | null;
  additions: (BillingLabelV2 & { value: BillingAdditional; amountCents: number })[];
  amountCents: number | null;
  pending: Pending | null;
};

export type BillingPublishedScopes = {
  revisionPlans: ReadonlyMap<string, string>;
  registeredPlans: ReadonlyMap<string, readonly string[]>;
};

export type BillingPreviewV2 = { issues: BillingConfigurationIssueV2[]; items?: never } | {
  issues?: never;
  hospitalCode: string;
  excludedSourceCount: number;
  items: PreviewItem[];
  summary: { calculated: number; pending: number; totalCents: string };
};

const weekdays: Record<string, string> = { dom: "Sun", seg: "Mon", ter: "Tue", qua: "Wed", qui: "Thu", sex: "Fri", sáb: "Sat" };
const timePattern = /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/;

function timestamp(value: string | null) {
  return value && timePattern.test(value) && isBillingDate(value.slice(0, 10)) && Number.isFinite(Date.parse(value)) ? value : null;
}

function caseFacts(source: BillingPreviewSourceV2, revision?: BillingRevisionV2): Facts {
  const start = timestamp(source.start_date_time);
  const durationMinutes = elapsedMinutes(start, timestamp(source.end_date_time));
  const billedMinutes = !revision || durationMinutes === null ? null
    : revision.durationRounding === "nearest" ? Math.round(durationMinutes) : durationMinutes;
  const clock = revision && timing(start, revision);
  return {
    procedureDate: source.procedure_date,
    procedure: billingText(source.procedure_name) || null,
    plan: billingText(source.plan_name) || null,
    anesthesia: billingText(source.anesthesia_type) || null,
    technique: identifyAnesthesia(source.anesthesia_type),
    durationMinutes, billedMinutes, timeZone: clock?.timeZone ?? null,
    shift: clock?.shift === "Diurno" ? "day" : clock?.shift === "Noturno" ? "night" : null,
    weekday: clock?.weekday ? weekdays[clock.weekday.replace(/\.$/, "")] ?? null : null,
  };
}

function evaluate<T extends BillingRuleV2>(stage: Stage, rules: readonly T[], ctx: Context, trace: RuleExplanation[]) {
  return rules.map((rule) => {
    const conditions: ConditionExplanation[] = [];
    for (const field of Object.keys(rule.when) as ConditionField[]) {
      if (field === "duration") {
        const range = rule.when.duration!;
        const minutes = ctx.facts.billedMinutes;
        const status = minutes === null ? "insufficient"
          : ((minutes > range.aboveMinutes || (minutes === 0 && range.aboveMinutes === 0))
            && (range.upToMinutes === null || minutes <= range.upToMinutes)) ? "matched" : "not_matched";
        conditions.push({ field, expected: range, actual: minutes, status });
        continue;
      }
      const expected = rule.when[field]!;
      if (field === "mark") {
        const status = expected.some((id) => ctx.marks.has(id)) ? "matched"
          : expected.some((id) => ctx.uncertainMarks.has(id)) ? "insufficient" : "not_matched";
        conditions.push({ field, expected, actual: [...ctx.marks], status });
        continue;
      }
      const derived = field === "tier" || field === "classification";
      const actual = derived ? ctx[field]?.id ?? null : ctx.facts[field];
      const matchValue = field === "procedure" || field === "plan" ? billingNameKey(actual) : actual;
      const status = actual === null ? (derived ? "not_matched" : "insufficient")
        : matchValue !== null && expected.includes(matchValue) ? "matched" : "not_matched";
      conditions.push({ field, expected, actual, status });
    }
    const status = conditions.some((item) => item.status === "not_matched") ? "not_matched"
      : conditions.some((item) => item.status === "insufficient") ? "insufficient" : "matched";
    const explanation: RuleExplanation = { stage, ruleId: rule.id, label: rule.label, priority: rule.priority, conditions, status, applied: false };
    trace.push(explanation);
    return { rule, explanation };
  });
}

function insufficient(explanation: RuleExplanation): Pending {
  return { code: "missing_data", stage: explanation.stage, ruleId: explanation.ruleId,
    fields: explanation.conditions.filter(({ status }) => status === "insufficient").map(({ field }) => field),
    message: "Faltam dados para decidir se esta regra deve ser aplicada." };
}

function selectRevision(source: BillingPreviewSourceV2, revisions: readonly BillingRevisionV2[], scopes?: BillingPublishedScopes):
  { revision: BillingRevisionV2; pending?: never } | { revision?: never; pending: Pending } {
  const date = source.procedure_date;
  if (!isBillingDate(date)) {
    return { pending: { code: "invalid_procedure_date", stage: "revision", message: "Data original da cirurgia indisponível." } };
  }

  const applicable = revisions.filter(({ startsOn }) => startsOn <= date);
  const plan = billingNameKey(source.plan_name);
  if (!plan && applicable.some(({ planName }) => planName !== null)) {
    return { pending: { code: "missing_plan", stage: "revision", fields: ["plan"], message: "O plano da ficha pode alterar a tabela aplicável." } };
  }
  const planIds = scopes && plan ? new Set(scopes.registeredPlans.get(plan)) : null;
  if (planIds && scopes) {
    for (const revision of applicable) {
      const id = scopes.revisionPlans.get(revision.revisionId);
      if (id && billingNameKey(revision.planName) === plan) planIds.add(id);
    }
    if (planIds.size > 1) {
      return { pending: { code: "ambiguous_plan", stage: "revision", fields: ["plan"],
        message: "Mais de um cadastro corresponde ao plano da ficha." } };
    }
  }
  // Com revisões em ordem decrescente, a data desempata apenas dentro do mesmo escopo.
  const revision = applicable.find(({ planName, revisionId }) => planName !== null
    && (scopes ? planIds?.has(scopes.revisionPlans.get(revisionId) ?? "") : billingNameKey(planName) === plan))
    ?? applicable.find(({ planName }) => planName === null);
  if (revision) return { revision };
  return { pending: { code: "missing_revision", stage: "revision", message: "Nenhuma revisão é aplicável à data e ao plano da ficha." } };
}

function calculateItem(source: BillingPreviewSourceV2, revisions: readonly BillingRevisionV2[], scopes?: BillingPublishedScopes): PreviewItem {
  const selection = selectRevision(source, revisions, scopes);
  const { revision } = selection;
  const result: PreviewItem = {
    documentId: source.document_id, userId: source.user_id, revision: null, facts: caseFacts(source, revision),
    marks: [], tier: null, classification: null, rules: [], priceRule: null,
    baseAmountCents: null, additions: [], amountCents: null, pending: null,
  };
  const pending = (reason: Pending): PreviewItem => ({ ...result, pending: reason });
  if (!revision) return pending(selection.pending);

  result.revision = { id: revision.revisionId, startsOn: revision.startsOn, planName: revision.planName,
    durationRounding: revision.durationRounding, additionMode: revision.additionMode };
  const ctx: Context = { facts: result.facts, marks: new Set(), uncertainMarks: new Set(), tier: null, classification: null };
  for (const { rule, explanation } of evaluate("mark", revision.markRules, ctx, result.rules)) {
    if (explanation.status === "matched") {
      ctx.marks.add(rule.resultId);
      explanation.applied = true;
    } else if (explanation.status === "insufficient") ctx.uncertainMarks.add(rule.resultId);
  }
  result.marks = revision.marks.filter(({ id }) => ctx.marks.has(id));

  // A validação ordena as regras por prioridade. Uma regra possível acima da primeira
  // regra comprovada impede usar uma regra genérica para suprir um dado ausente.
  for (const [stage, rules, catalog] of [["tier", revision.tierRules, revision.tiers],
    ["classification", revision.classificationRules, revision.classifications]] as const) {
    if (stage === "classification" && source.financial_classification_id !== undefined) {
      const selected = catalog.find(({ id }) => id === source.financial_classification_id);
      if (!selected) return pending({ code: "invalid_classification", stage,
        message: "A classificação financeira não existe na revisão aplicável." });
      result.classification = ctx.classification = selected;
      continue;
    }
    const choice = evaluate(stage, rules, ctx, result.rules).find(({ explanation }) => explanation.status !== "not_matched");
    if (!choice) continue;
    if (choice.explanation.status === "insufficient") return pending(insufficient(choice.explanation));
    result[stage] = ctx[stage] = catalog.find(({ id }) => id === choice.rule.resultId)!;
    choice.explanation.applied = true;
  }
  const price = evaluate("price", revision.priceRules, ctx, result.rules).find(({ explanation }) => explanation.status !== "not_matched");
  if (!price) return pending({ code: "no_price", stage: "price", message: "Nenhuma regra de valor corresponde à ficha." });
  if (price.explanation.status === "insufficient") return pending(insufficient(price.explanation));

  const base = price.rule.amountCents;
  result.baseAmountCents = base;
  result.priceRule = { id: price.rule.id, label: price.rule.label };
  price.explanation.applied = true;
  const candidates = evaluate("additional", revision.additionalRules, ctx, result.rules)
    .filter(({ explanation }) => explanation.status !== "not_matched")
    .map(({ rule, explanation }) => {
      const amount = additionalCents(base, rule.value);
      explanation.candidateAmountCents = amount.toString();
      return { rule, explanation, amount };
    });
  const cumulative = revision.additionMode === "cumulative";
  if (!cumulative) candidates.sort((a, b) => a.amount === b.amount ? a.rule.priority - b.rule.priority : a.amount > b.amount ? -1 : 1);
  const confirmed = candidates.filter(({ explanation }) => explanation.status === "matched");
  const selected = cumulative ? confirmed : confirmed.slice(0, 1);
  // Um empate pode mudar a regra vencedora e preservar o mesmo total em centavos.
  const threshold = (!cumulative ? selected[0]?.amount : undefined) ?? BigInt(0);
  const blocked = candidates.find(({ explanation, amount }) => explanation.status === "insufficient" && amount > threshold);
  if (blocked && !cumulative) return pending(insufficient(blocked.explanation));
  const amount = selected.reduce((total, addition) => total + addition.amount, BigInt(base));
  if (amount > BigInt(Number.MAX_SAFE_INTEGER)) {
    return pending({ code: "amount_out_of_range", stage: "additional", message: "O total excede o limite de centavos suportado." });
  }
  result.additions = selected.map(({ rule, amount, explanation }) => {
    explanation.applied = true;
    return { id: rule.id, label: rule.label, value: rule.value, amountCents: Number(amount) };
  });
  if (blocked) return pending(insufficient(blocked.explanation));
  result.amountCents = Number(amount);
  return result;
}

// Produção e prévia usam esta avaliação. A integração oficial fornece os IDs dos planos publicados.
export function previewBillingV2(hospitalCode: string, configurations: readonly unknown[],
  sources: readonly BillingPreviewSourceV2[], scopes?: BillingPublishedScopes): BillingPreviewV2 {
  if (!isHospitalCode(hospitalCode)) return { issues: [{ path: "hospitalCode", message: "Hospital inválido." }] };
  const issues: BillingConfigurationIssueV2[] = [];
  const ids = new Set<string>();
  const vigencies = new Set<string>();
  const revisions: BillingRevisionV2[] = [];
  configurations.forEach((input, index) => {
    if (!input || typeof input !== "object" || !("hospitalCode" in input) || input.hospitalCode !== hospitalCode) return;
    const validation = validateBillingRevisionV2(input);
    const path = `revisions.${index}`;
    if (validation.issues) {
      issues.push(...validation.issues.map((item) => ({ ...item, path: `${path}.${item.path}` })));
      return;
    }
    const revision = validation.revision;
    const scopeId = scopes?.revisionPlans.get(revision.revisionId);
    if (scopes && (revision.planName !== null) !== Boolean(scopeId)) {
      issues.push({ path, message: "Escopo do plano publicado inválido." });
      return;
    }
    const vigency = JSON.stringify([scopeId ?? billingNameKey(revision.planName), revision.startsOn]);
    if (ids.has(revision.revisionId)) issues.push({ path, message: "Revisão repetida no hospital." });
    if (vigencies.has(vigency)) issues.push({ path, message: "Mais de uma revisão para o mesmo plano e início de vigência." });
    ids.add(revision.revisionId);
    vigencies.add(vigency);
    revisions.push(revision);
  });
  const ownSources: BillingPreviewSourceV2[] = [];
  const documents = new Set<string>();
  sources.forEach((source, index) => {
    if (source.hospital_code !== hospitalCode) return;
    ownSources.push(source);
    const userId = billingText(source.user_id);
    const documentId = billingText(source.document_id);
    const key = JSON.stringify([userId, documentId]);
    if (!userId || userId !== source.user_id || !documentId || documentId !== source.document_id || documents.has(key)) {
      issues.push({ path: `sources.${index}`, message: "Identidade documental ausente ou repetida no hospital." });
    }
    documents.add(key);
  });
  if (issues.length) return { issues };

  revisions.sort((a, b) => b.startsOn.localeCompare(a.startsOn));
  const items = ownSources.map((source) => calculateItem(source, revisions, scopes));
  const calculated = items.filter((item) => item.amountCents !== null);
  const total = calculated.reduce((sum, item) => sum + BigInt(item.amountCents!), BigInt(0));
  return { hospitalCode, excludedSourceCount: sources.length - ownSources.length, items,
    summary: { calculated: calculated.length, pending: items.length - calculated.length, totalCents: total.toString() } };
}

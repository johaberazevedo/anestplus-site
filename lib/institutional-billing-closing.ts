import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { billingNameKey, billingRuleLabel, billingText, isBillingDate } from "@/lib/institutional-billing";
import { calculateOfficialBilling, officialBillingContext, type OfficialBillingSource } from "@/lib/institutional-billing-calculation";

type FinancialCorrection = { plan_name?: string; classification_id?: string; reason: string };
export type ClosingChoice = { user_id: string; document_id: string; included: boolean; exclusion_reason: string | null;
  recalculate?: boolean; correction?: FinancialCorrection };
type ClosingSource = OfficialBillingSource & { source: Record<string, unknown> };
export type FrozenItem = { user_id: string; document_id: string; included: boolean; exclusion_reason: string | null;
  source: Record<string, unknown>; amount_cents: string | null; rule_snapshot: Record<string, unknown> | null };
export type ClosingContext = {
  period: { hospital_code: string; competence_month: string; expires_at: string; state: "open" | "closed" | "expired";
    source_revision: number; latest_version: number };
  configs: unknown;
  config_sha256: string;
  sources: ClosingSource[];
  latest_closed: { version: number; operation_id?: string; created_at?: string; created_by?: string; reason?: string | null;
    snapshot: { schema_version: number; total_cents?: string; items: FrozenItem[] } } | null;
};

const bahiaDate = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bahia", year: "numeric", month: "2-digit", day: "2-digit" });
const identity = ({ user_id, document_id }: { user_id: string; document_id: string }) => JSON.stringify([user_id, document_id]);
const correctionFields = new Set(["plan_name", "classification_id", "reason"]);
const choiceFields = new Set(["user_id", "document_id", "included", "exclusion_reason", "recalculate", "correction"]);
const validText = (value: unknown, max: number): value is string => typeof value === "string" && value === value.trim()
  && value.length > 0 && value.length <= max && !value.includes("\0");

export function currentBillingMonth(now = new Date()) {
  return `${bahiaDate.format(now).slice(0, 7)}-01`;
}

export function billingSourceForClosing(source: OfficialBillingSource, choice: ClosingChoice) {
  return { ...source, plan_name: choice.correction?.plan_name ?? source.plan_name,
    financial_classification_id: choice.correction?.classification_id };
}

export function keepsClosedPrice(old: FrozenItem | undefined, choice: ClosingChoice): old is FrozenItem {
  return Boolean(old?.included && choice.included && !choice.recalculate && !choice.correction);
}

function validChoice(choice: ClosingChoice) {
  if (!choice || Object.keys(choice).some((field) => !choiceFields.has(field)) || typeof choice.included !== "boolean"
      || (choice.recalculate !== undefined && typeof choice.recalculate !== "boolean")) return false;
  if (choice.included ? choice.exclusion_reason !== null
    : !validText(choice.exclusion_reason, 1000) || choice.recalculate || choice.correction) return false;
  const correction = choice.correction;
  if (correction === undefined) return true;
  return Boolean(correction && Object.keys(correction).every((field) => correctionFields.has(field))
    && validText(correction.reason, 1000) && (correction.plan_name !== undefined || correction.classification_id !== undefined)
    && (correction.plan_name === undefined || validText(correction.plan_name, 160))
    && (correction.classification_id === undefined || /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/.test(correction.classification_id)));
}

// O snapshot e a intenção são montados no servidor com a resposta da RPC de preparo.
export function buildBillingClose(prepared: ClosingContext, choices: ClosingChoice[], reason: string | null, now = new Date()) {
  const { period, config_sha256, latest_closed, sources } = prepared;
  const month = period.competence_month;
  if (!isBillingDate(month) || !month.endsWith("-01") || month >= currentBillingMonth(now)) {
    throw new Error("billing_month_not_ended");
  }
  if (period.state === "expired" || !(Date.parse(period.expires_at) > now.getTime())) throw new Error("competence_expired");
  if (!/^[0-9a-f]{64}$/.test(config_sha256) || !Number.isSafeInteger(period.source_revision) || period.source_revision < 0
      || !Number.isInteger(period.latest_version) || period.latest_version < 0
      || (period.state === "closed" ? period.latest_version < 1 || latest_closed?.version !== period.latest_version
        || latest_closed.snapshot.schema_version !== 1 : period.latest_version !== 0 || latest_closed !== null)) {
    throw new Error("invalid_billing_close_context");
  }
  const justification = billingText(reason) || null;
  if ((period.latest_version > 0 || reason !== null) && !validText(justification, 1000)) throw new Error("invalid_closure_reason");
  const calculation = officialBillingContext(prepared.configs, period.hospital_code);
  if (choices.length !== sources.length || choices.some((choice) => !validChoice(choice))) {
    throw new Error("invalid_billing_close_choices");
  }
  const decisions = new Map(choices.map((choice) => [identity(choice), choice]));
  if (decisions.size !== choices.length) throw new Error("invalid_billing_close_choices");
  const previous = new Map(latest_closed?.snapshot.items.map((item) => [identity(item), item]));
  if (new Set(sources.map(identity)).size !== sources.length) throw new Error("duplicate_billing_close_sources");
  const lines = sources.map((source) => {
    const key = identity(source);
    const choice = decisions.get(key);
    if (!choice || !isBillingDate(source.procedure_date) || source.procedure_date.slice(0, 7) !== month.slice(0, 7)
        || !source.source || source.source.procedure_date !== source.procedure_date) {
      throw new Error("billing_close_source_mismatch");
    }
    if (choice.correction?.plan_name !== undefined && calculation.plans.filter(({ plan_name }) =>
      billingNameKey(plan_name) === billingNameKey(choice.correction!.plan_name)).length !== 1) throw new Error("invalid_financial_plan");
    const old = previous.get(key);
    return { source, choice, frozen: keepsClosedPrice(old, choice) ? old : null };
  });
  const recalculated = lines.filter(({ choice, frozen }) => choice.included && !frozen);
  const prices = calculateOfficialBilling(recalculated.map(({ source, choice }) => billingSourceForClosing(source, choice)), calculation);
  const correctedSources = recalculated.filter(({ choice }) => choice.correction).map(({ source }) => source);
  const originals = new Map(calculateOfficialBilling(correctedSources, calculation).map((original, index) =>
    [identity(correctedSources[index]), original.evaluation?.classification ?? null]));

  let total = BigInt(0);
  const byDocument = new Map(recalculated.map(({ source }, index) => [identity(source), prices[index]]));
  const items = lines.map(({ source, choice, frozen }): FrozenItem => {
    const item = { user_id: source.user_id, document_id: source.document_id, included: choice.included,
      exclusion_reason: choice.exclusion_reason, source: source.source };
    if (!choice.included) return { ...item, amount_cents: null, rule_snapshot: null };
    if (frozen) {
      if (!frozen.amount_cents || !/^(0|[1-9][0-9]*)$/.test(frozen.amount_cents) || !frozen.rule_snapshot) {
        throw new Error("invalid_previous_closed_item");
      }
      total += BigInt(frozen.amount_cents);
      return { ...frozen, source: source.source };
    }
    const { item: price, evaluation } = byDocument.get(identity(source))!;
    if (price.amountCents === null) throw new Error("included_billing_item_has_no_price");
    total += BigInt(price.amountCents);
    const ruleSnapshot = {
      label: price.publication?.ruleLabel ?? (price.rule ? billingRuleLabel(price.rule) : null),
      starts_on: price.startsOn, publication: price.publication ?? null, activation_version: calculation.activation.version,
      rule: price.rule, base_cents: price.baseAmountCents, additions: price.additions,
      duration_minutes: price.durationMinutes, billed_minutes: price.billedMinutes, technique: price.technique,
      shift: price.shift, weekday: price.weekday, time_zone: price.timeZone,
      ...(evaluation ? { applied_rules: evaluation.rules.filter(({ applied }) => applied), marks: evaluation.marks,
        tier: evaluation.tier, classification: evaluation.classification } : {}),
      ...(choice.correction ? { correction: { ...choice.correction, original: {
        plan_name: source.plan_name, procedure_name: source.procedure_name, classification: originals.get(identity(source)) ?? null,
      }, applied: { plan_name: price.plan_name, classification: evaluation?.classification ?? null } } } : {}),
    };
    return { ...item, amount_cents: String(price.amountCents), rule_snapshot: ruleSnapshot };
  });
  return {
    request: { base_version: period.latest_version, source_revision: period.source_revision, config_sha256, reason: justification,
      choices: lines.map(({ choice }) => choice.correction ? { ...choice, recalculate: true } : choice) },
    snapshot: { schema_version: 1, calculation_version: "anest-pro/official-1", total_cents: total.toString(), items },
  };
}

type BuiltClosing = ReturnType<typeof buildBillingClose>;
export type BillingCloseRequest = BuiltClosing["request"];
export type ReviewScope = { hospitalCode: string; actorId: string; month: string; operationId: string };

export function billingCloseSnapshotDigest(snapshot: BuiltClosing["snapshot"]) {
  return createHash("sha256").update(JSON.stringify(snapshot)).digest("hex");
}

function signBillingCloseIntent(request: BillingCloseRequest, snapshotDigest: string, scope: ReviewScope, signingKey: string) {
  if (!/^[0-9a-f]{64}$/i.test(signingKey)) throw new Error("missing_billing_review_key");
  // Usar a ordem do conjunto preparado pelo banco e uma ordem explícita dos campos da decisão.
  const choices = request.choices.map(({ user_id, document_id, included, exclusion_reason, recalculate, correction }) => [
    user_id, document_id, included, exclusion_reason, recalculate ?? false,
    correction ? [correction.plan_name ?? null, correction.classification_id ?? null, correction.reason] : null,
  ]);
  const payload = JSON.stringify(["anest:billing-closure-review:v2", scope.hospitalCode, scope.actorId, scope.month, scope.operationId,
    request.base_version, request.source_revision, request.config_sha256, request.reason, choices, snapshotDigest]);
  return createHmac("sha256", Buffer.from(signingKey, "hex")).update(payload).digest("hex");
}

export function billingCloseReview({ request, snapshot }: BuiltClosing, scope: ReviewScope, signingKey: string) {
  return signBillingCloseIntent(request, billingCloseSnapshotDigest(snapshot), scope, signingKey);
}

export function assertBillingCloseIntent(review: string, request: BillingCloseRequest, snapshotDigest: string, scope: ReviewScope, signingKey: string) {
  const expected = signBillingCloseIntent(request, snapshotDigest, scope, signingKey);
  if (!/^[0-9a-f]{64}$/.test(review) || !timingSafeEqual(Buffer.from(review, "hex"), Buffer.from(expected, "hex"))) {
    throw new Error("billing_preview_stale");
  }
}

export function assertBillingCloseReview(review: string, closing: BuiltClosing, scope: ReviewScope, signingKey: string) {
  assertBillingCloseIntent(review, closing.request, billingCloseSnapshotDigest(closing.snapshot), scope, signingKey);
}

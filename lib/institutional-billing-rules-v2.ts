import { billingNameKey, billingText, isAnesthesiaTechnique, isBillingDate, type BillingAdditional } from "@/lib/institutional-billing";
import { isHospitalCode } from "@/lib/institutional-hospitals";

export type BillingLabelV2 = { id: string; label: string };
export type BillingDurationV2 = { aboveMinutes: number; upToMinutes: number | null };
export type BillingConditionFieldV2 = "procedure" | "plan" | "technique" | "shift" | "weekday" | "mark" | "tier" | "classification";
export type BillingConditionsV2 = Partial<Record<BillingConditionFieldV2, readonly string[]>> & { duration?: BillingDurationV2 };
export type BillingRuleV2 = BillingLabelV2 & { priority: number; when: BillingConditionsV2 };
type ClassificationRule = BillingRuleV2 & { resultId: string };
export type BillingPriceRuleV2 = BillingRuleV2 & { amountCents: number };
export type BillingAdditionalRuleV2 = BillingRuleV2 & { value: BillingAdditional };

export type BillingRevisionV2 = {
  schemaVersion: 2;
  hospitalCode: string;
  revisionId: string;
  startsOn: string;
  planName: string | null;
  durationRounding: "exact" | "nearest";
  timeZone: string;
  nightStart: string;
  nightEnd: string;
  marks: BillingLabelV2[];
  tiers: BillingLabelV2[];
  classifications: BillingLabelV2[];
  markRules: ClassificationRule[];
  tierRules: ClassificationRule[];
  classificationRules: ClassificationRule[];
  priceRules: BillingPriceRuleV2[];
  additionMode: "cumulative" | "highest";
  additionalRules: BillingAdditionalRuleV2[];
};

export type BillingConfigurationIssueV2 = { path: string; message: string };

export const billingWeekdaysV2 = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const factFields = ["procedure", "plan", "technique", "duration", "shift", "weekday"] as const;
const markedFields = [...factFields, "mark"] as const;
const tieredFields = [...markedFields, "tier"] as const;
const classifiedFields = [...tieredFields, "classification"] as const;
const rootFields = ["schemaVersion", "hospitalCode", "revisionId", "startsOn", "planName", "durationRounding",
  "timeZone", "nightStart", "nightEnd", "marks", "tiers", "classifications", "markRules", "tierRules",
  "classificationRules", "priceRules", "additionMode", "additionalRules"];
const ruleFields = ["id", "label", "priority", "when"];
const clockPattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function integer(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function identifier(value: unknown) {
  const id = billingText(value);
  return /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/.test(id) ? id : "";
}

function readLabel(value: Record<string, unknown>) {
  const id = identifier(value.id);
  const label = billingText(value.label);
  return id && label ? { id, label } : null;
}

function readDuration(value: unknown): BillingDurationV2 | null {
  const fields = record(value);
  if (!fields || Object.keys(fields).length !== 2) return null;
  const { aboveMinutes, upToMinutes } = fields;
  if (!integer(aboveMinutes) || (upToMinutes !== null && (!integer(upToMinutes) || upToMinutes <= aboveMinutes))) return null;
  return { aboveMinutes, upToMinutes };
}

function readAdditional(value: unknown): BillingAdditional | null {
  const additional = record(value);
  if (!additional || Object.keys(additional).length !== 2) return null;
  if (additional.kind === "fixed" && integer(additional.amountCents)) return { kind: "fixed", amountCents: additional.amountCents };
  if (additional.kind === "percent" && integer(additional.basisPoints)) return { kind: "percent", basisPoints: additional.basisPoints };
  return null;
}

function overlap(a: BillingConditionsV2, b: BillingConditionsV2) {
  if (a.duration && b.duration && (a.duration.aboveMinutes >= (b.duration.upToMinutes ?? Infinity)
      || b.duration.aboveMinutes >= (a.duration.upToMinutes ?? Infinity))) return false;
  // Uma ficha pode ter simultaneamente as marcações exigidas por duas regras.
  const exclusiveFields = ["procedure", "plan", "technique", "shift", "weekday", "tier", "classification"] as const;
  return exclusiveFields.every((key) => {
    const left = a[key];
    const right = b[key];
    return !left || !right || left.some((value) => right.includes(value));
  });
}

export function validateBillingRevisionV2(input: unknown):
  { revision: BillingRevisionV2; issues?: never } | { revision?: never; issues: BillingConfigurationIssueV2[] } {
  const parsed = record(input);
  if (!parsed) return { issues: [{ path: "revision", message: "Informe uma configuração." }] };
  const value = parsed;

  const issues: BillingConfigurationIssueV2[] = [];
  const issue = (path: string, message: string) => { issues.push({ path, message }); };
  function checkFields(fields: Record<string, unknown>, allowed: readonly string[], path: string) {
    for (const key of Object.keys(fields)) {
      if (!allowed.includes(key)) issue(`${path}.${key}`, "Campo desconhecido ou indisponível nesta etapa de avaliação.");
    }
  }

  checkFields(value, rootFields, "revision");
  const { hospitalCode, startsOn } = value;
  const revisionId = identifier(value.revisionId);
  const planName = value.planName === null ? null : billingText(value.planName);
  const { durationRounding = "exact", timeZone: rawTimeZone = "America/Bahia",
    nightStart: rawNightStart = "19:00", nightEnd: rawNightEnd = "07:00", additionMode = "cumulative" } = value;
  const timeZone = billingText(rawTimeZone);
  const nightStart = billingText(rawNightStart);
  const nightEnd = billingText(rawNightEnd);
  if (value.schemaVersion !== 2) issue("schemaVersion", "Esta prévia exige configuração na versão 2.");
  if (!isHospitalCode(hospitalCode)) issue("hospitalCode", "Informe o hospital da revisão.");
  if (!revisionId) issue("revisionId", "Informe um identificador de revisão válido.");
  if (!isBillingDate(startsOn)) issue("startsOn", "Informe a data de início da vigência.");
  if (planName === "") issue("planName", "Informe um plano ou use null para uma tabela geral do hospital.");
  if (durationRounding !== "exact" && durationRounding !== "nearest") issue("durationRounding", "Política de duração inválida.");
  try { new Intl.DateTimeFormat("en", { timeZone }); }
  catch { issue("timeZone", "Fuso horário inválido."); }
  if (!clockPattern.test(nightStart) || !clockPattern.test(nightEnd) || nightStart === nightEnd) {
    issue("nightStart", "Informe início e término diferentes para o período noturno, no formato HH:mm.");
  }
  if (additionMode !== "cumulative" && additionMode !== "highest") issue("additionMode", "Política de adicionais inválida.");

  function catalog(key: string): BillingLabelV2[] {
    const seen = new Set<string>();
    const { [key]: entries = [] } = value;
    if (!Array.isArray(entries)) {
      issue(key, "Informe uma lista de itens.");
      return [];
    }
    return entries.flatMap((entry, index) => {
      const fields = record(entry);
      const item = fields && readLabel(fields);
      const path = `${key}.${index}`;
      if (!fields || !item) {
        issue(path, "Informe identificador e nome válidos.");
        return [];
      }
      checkFields(fields, ["id", "label"], path);
      if (seen.has(item.id)) issue(path, "Identificador repetido no catálogo.");
      seen.add(item.id);
      return [item];
    });
  }

  const marks = catalog("marks");
  const tiers = catalog("tiers");
  const classifications = catalog("classifications");
  const referenceIds = { mark: new Set(marks.map(({ id }) => id)), tier: new Set(tiers.map(({ id }) => id)),
    classification: new Set(classifications.map(({ id }) => id)) };

  function conditions(input: unknown, allowed: readonly string[], path: string): BillingConditionsV2 {
    const fields = record(input);
    if (!fields) {
      issue(path, "Informe as condições da regra. Use {} para uma regra geral.");
      return {};
    }
    checkFields(fields, allowed, path);
    const result: BillingConditionsV2 = {};
    for (const key of classifiedFields) {
      if (!allowed.includes(key) || !Object.hasOwn(fields, key)) continue;
      const raw = fields[key];
      if (key === "duration") {
        const range = readDuration(raw);
        if (range) result.duration = range;
        else issue(`${path}.duration`, "Faixa de duração inválida.");
        continue;
      }
      if (!Array.isArray(raw) || !raw.length || raw.some((item) => !billingText(item))) {
        issue(`${path}.${key}`, "Informe pelo menos um valor válido.");
        continue;
      }
      const values = [...new Set(raw.map(key === "procedure" || key === "plan" ? billingNameKey : billingText))];
      const valid = values.every((item) => {
        if (key === "technique") return isAnesthesiaTechnique(item);
        if (key === "shift") return item === "day" || item === "night";
        if (key === "weekday") return billingWeekdaysV2.some((day) => day === item);
        if (key === "mark" || key === "tier" || key === "classification") return referenceIds[key].has(item);
        return true;
      });
      if (!valid) issue(`${path}.${key}`, "A condição referencia um valor desconhecido.");
      result[key] = values;
    }
    return result;
  }

  function rules<T extends BillingRuleV2>(key: string, extra: string, allowed: readonly string[],
    readResult: (common: BillingRuleV2, value: unknown, path: string) => T | null,
    compete?: (a: T, b: T) => boolean): T[] {
    const { [key]: entries = [] } = value;
    if (!Array.isArray(entries)) {
      issue(key, "Informe uma lista de regras.");
      return [];
    }
    const seen = new Set<string>();
    const prior: { rule: T; index: number }[] = [];
    entries.forEach((entry, index) => {
      const fields = record(entry);
      const label = fields && readLabel(fields);
      const path = `${key}.${index}`;
      if (!fields || !label || !integer(fields.priority)) {
        issue(path, "Informe identificador, nome e prioridade inteira não negativa.");
        return;
      }
      const issueCount = issues.length;
      checkFields(fields, [...ruleFields, extra], path);
      if (seen.has(label.id)) issue(path, "Identificador de regra repetido.");
      seen.add(label.id);
      const common = { ...label, priority: fields.priority, when: conditions(fields.when, allowed, `${path}.when`) };
      const rule = readResult(common, fields[extra], `${path}.${extra}`);
      if (!rule || issues.length !== issueCount) return;
      if (compete) {
        for (const previous of prior) {
          if (rule.priority === previous.rule.priority && compete(rule, previous.rule) && overlap(rule.when, previous.rule.when)) {
            issue(path, `Conflito com ${key}.${previous.index} na prioridade ${rule.priority}.`);
          }
        }
      }
      prior.push({ rule, index });
    });
    return prior.map(({ rule }) => rule).sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id, "en"));
  }

  function classificationRules(key: string, target: keyof typeof referenceIds, allowed: readonly string[]) {
    return rules<ClassificationRule>(key, "resultId", allowed, (common, raw, path) => {
      const resultId = billingText(raw);
      if (referenceIds[target].has(resultId)) return { ...common, resultId };
      issue(path, "O resultado deve apontar para o catálogo correspondente.");
      return null;
    }, target === "mark" ? undefined : () => true);
  }

  const markRules = classificationRules("markRules", "mark", factFields);
  const tierRules = classificationRules("tierRules", "tier", markedFields);
  const classification = classificationRules("classificationRules", "classification", tieredFields);
  const priceRules = rules<BillingPriceRuleV2>("priceRules", "amountCents", classifiedFields, (common, raw, path) => {
    if (integer(raw)) return { ...common, amountCents: raw };
    issue(path, "Informe um valor em centavos inteiros não negativos.");
    return null;
  }, () => true);
  const additionalRules = rules<BillingAdditionalRuleV2>("additionalRules", "value", classifiedFields, (common, raw, path) => {
    const additional = readAdditional(raw);
    if (additional) return { ...common, value: additional };
    issue(path, "Informe valor fixo em centavos ou percentual em pontos-base.");
    return null;
  }, additionMode === "highest" ? (a, b) => a.value.kind !== "fixed" || b.value.kind !== "fixed"
      || a.value.amountCents === b.value.amountCents : undefined);

  if (issues.length || !isHospitalCode(hospitalCode) || !isBillingDate(startsOn)
      || (durationRounding !== "exact" && durationRounding !== "nearest")
      || (additionMode !== "cumulative" && additionMode !== "highest")) return { issues };
  return { revision: {
    schemaVersion: 2, hospitalCode, revisionId, startsOn, planName, durationRounding, timeZone, nightStart, nightEnd,
    marks, tiers, classifications, markRules, tierRules, classificationRules: classification, priceRules, additionMode, additionalRules,
  } };
}

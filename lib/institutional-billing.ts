type ProcedureMatch = { kind: "procedure"; name: string };
type DurationMatch = { kind: "duration"; aboveMinutes: number; upToMinutes: number | null };
export type BillingMatch = ProcedureMatch | DurationMatch;

export type BillingRule = (
  BillingMatch | { kind: "porte"; label: string; match: BillingMatch }
) & { amountCents: number };
export type BillingConfiguration = { rules: BillingRule[] };
export type BillingTable = { starts_on: string; configuration: BillingConfiguration };
export type BillingPlan = {
  id: string;
  plan_name: string;
  insurer_name: string | null;
  tables: BillingTable[];
};

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : null;
}

export function billingText(value: unknown) {
  return typeof value === "string" && !value.includes("\0") ? value.trim() : "";
}

export function isBillingDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith("0000")) return false;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isNonnegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function readMatch(value: unknown): BillingMatch | null {
  const match = record(value);
  if (match?.kind === "procedure") {
    const name = billingText(match.name);
    return name ? { kind: "procedure", name } : null;
  }
  if (match?.kind !== "duration") return null;
  const { aboveMinutes, upToMinutes } = match;
  if (!isNonnegativeInteger(aboveMinutes)
    || (upToMinutes !== null && (!isNonnegativeInteger(upToMinutes) || upToMinutes <= aboveMinutes))) return null;
  return { kind: "duration", aboveMinutes, upToMinutes };
}

function readRule(value: unknown): BillingRule | null {
  const rule = record(value);
  const amountCents = rule?.amountCents;
  if (!rule || !isNonnegativeInteger(amountCents)) return null;
  if (rule.kind === "porte") {
    const label = billingText(rule.label);
    const match = readMatch(rule.match);
    return label && match ? { kind: "porte", label, match, amountCents } : null;
  }
  const match = readMatch(rule);
  return match ? { ...match, amountCents } : null;
}

export function billingNameKey(value: unknown) {
  return billingText(value).normalize("NFC").toLowerCase();
}

function sameName(first: string, second: string) {
  return billingNameKey(first) === billingNameKey(second);
}

function overlap(first: BillingMatch, second: BillingMatch) {
  if (first.kind === "procedure" && second.kind === "procedure") return sameName(first.name, second.name);
  if (first.kind === "duration" && second.kind === "duration") {
    return first.aboveMinutes < (second.upToMinutes ?? Infinity)
      && second.aboveMinutes < (first.upToMinutes ?? Infinity);
  }
  return false;
}

export function parseBillingConfiguration(value: unknown): BillingConfiguration | { error: string } {
  const rawRules = record(value)?.rules;
  if (!Array.isArray(rawRules) || !rawRules.length) return { error: "Adicione pelo menos uma regra de valor." };
  const rules: BillingRule[] = [];
  for (const [index, rawRule] of rawRules.entries()) {
    const rule = readRule(rawRule);
    if (!rule) return { error: `Confira os dados da regra ${index + 1}.` };
    for (const [otherIndex, other] of rules.entries()) {
      if (rule.kind === "porte" && other.kind === "porte") {
        if (sameName(rule.label, other.label) && rule.amountCents !== other.amountCents) {
          return { error: `As regras ${otherIndex + 1} e ${index + 1} têm valores diferentes para o mesmo porte.` };
        }
        if (!overlap(rule.match, other.match)) continue;
      } else if (rule.kind === "porte" || other.kind === "porte" || !overlap(rule, other)) continue;
      return { error: `As regras ${otherIndex + 1} e ${index + 1} se sobrepõem.` };
    }
    rules.push(rule);
  }
  return { rules };
}

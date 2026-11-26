import { isBillingDate } from "@/lib/institutional-billing";
import type { ProductionCase, ProductionReport } from "@/lib/institutional-billing-production";

export type BillingVersionSelection = { month: string; version: number };
export type BillingCompetence =
  | { month: string; state: "open" | "expired" }
  | { month: string; state: "closed"; version: number; latestVersion: number };

export type BillingReadCase = ProductionCase & {
  version: number | null;
  ruleLabel?: string | null;
  exclusionReason?: string | null;
  financialNotes?: string | null;
};

export type BillingVersionDetails = {
  version: number;
  baseVersion: number;
  closedAt: string | null;
  closedBy: string | null;
  reason: string | null;
  previousTotalCents: string | null;
  totalCents: string;
  deltaCents: string | null;
};

export type BillingReadReport = Omit<ProductionReport, "cases"> & {
  cases: BillingReadCase[];
  competences: BillingCompetence[];
  excluded: number;
  hasExpired: boolean;
  versionDetails?: BillingVersionDetails;
};

function record(value: unknown) {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : null;
}

function text(value: unknown) {
  return typeof value === "string" ? value : null;
}

function cents(value: unknown) {
  const parsed = typeof value === "string" && /^(0|[1-9][0-9]*)$/.test(value) ? Number(value) : value;
  return typeof parsed === "number" && Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null;
}

export function readBillingSnapshot(value: unknown, month: string, version: number) {
  const snapshot = record(value);
  const invalid = () => new Error("invalid_billing_snapshot");
  if (snapshot?.schema_version !== 1 || !Array.isArray(snapshot.items)) throw invalid();
  const keys = new Set<string>();
  let total = BigInt(0);
  const cases = snapshot.items.map((entry: unknown) => {
    const item = record(entry);
    const source = record(item?.source);
    const id = text(item?.document_id);
    const owner = text(item?.user_id);
    const date = source?.procedure_date;
    if (!source || !id || !/^[a-f0-9]{64}$/.test(id) || !owner || !isBillingDate(date)
        || date.slice(0, 7) !== month.slice(0, 7) || typeof item?.included !== "boolean") throw invalid();
    const rowKey = `${id}:${owner}`;
    if (keys.has(rowKey)) throw invalid();
    keys.add(rowKey);

    const amountCents = cents(item.amount_cents);
    const rule = record(item.rule_snapshot);
    const correction = record(rule?.correction);
    const applied = record(correction?.applied);
    const publication = record(rule?.publication);
    const exclusionReason = item.included ? null : text(item.exclusion_reason);
    if (item.included) {
      if (amountCents === null || !rule) throw invalid();
      total += BigInt(amountCents);
    } else if (item.amount_cents != null || !exclusionReason?.trim()) {
      throw invalid();
    }

    const itemView: BillingReadCase = {
      id, version, exclusionReason, amountCents,
      procedure_date: date, procedure_name: text(source.procedure_name),
      plan_name: text(applied?.plan_name) ?? text(correction?.plan_name) ?? text(source.plan_name),
      patient_name: text(source.patient_name), record_number: text(source.record_number),
      anesthesiologist_name: text(source.anesthesiologist_name), crm: text(source.crm),
      anesthesia_type: text(source.anesthesia_type), start_date_time: text(source.start_date_time),
      end_date_time: text(source.end_date_time),
      ruleLabel: text(rule?.label) ?? text(rule?.code), rule: null,
      startsOn: isBillingDate(rule?.starts_on) ? rule.starts_on : null,
      financialNotes: text(correction?.reason),
      ...(typeof publication?.version === "number" && typeof publication.revisionId === "string"
        ? { publication: { version: publication.version, revisionId: publication.revisionId, ruleLabel: text(publication.ruleLabel) } } : {}),
      baseAmountCents: item.included ? cents(rule?.base_cents) : null, additions: [], pending: exclusionReason,
      durationMinutes: null, billedMinutes: null, technique: null, timeZone: "", weekday: null, shift: null,
    };
    return { rowKey, item: itemView };
  });
  if (String(snapshot.total_cents) !== total.toString()) throw invalid();
  return cases;
}

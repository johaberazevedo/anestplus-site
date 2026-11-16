import { billingNameKey, isBillingDate, parseBillingConfiguration, type BillingPlan, type BillingRule } from "@/lib/institutional-billing";

export type BillingSource = {
  document_id: string;
  record_number: string | null;
  procedure_date: string | null;
  procedure_name: string | null;
  plan_name: string | null;
  anesthesiologist_name: string | null;
  crm: string | null;
  start_date_time: string | null;
  end_date_time: string | null;
};

type Calculation =
  | { amountCents: number; startsOn: string; rule: BillingRule; pending: null }
  | { amountCents: null; startsOn: string | null; rule: null; pending: string };

type ProductionCase = Omit<BillingSource, "document_id" | "start_date_time" | "end_date_time"> &
  Calculation & { id: string; durationMinutes: number | null };

export type ProductionReport = {
  hospitalName: string;
  cases: ProductionCase[];
  summary: { totalCents: string; calculated: number; pending: number };
  page: number;
  lastPage: number;
};

function elapsedMinutes(start: string | null, end: string | null) {
  if (start === null || end === null) return null;
  const milliseconds = Date.parse(end) - Date.parse(start);
  return Number.isFinite(milliseconds) && milliseconds > 0 ? milliseconds / 60_000 : null;
}

function pending(message: string, startsOn: string | null = null): Calculation {
  return { amountCents: null, startsOn, rule: null, pending: message };
}

function byPriority(rule: BillingRule) {
  if (rule.kind === "procedure") return 0;
  if (rule.kind === "porte") return rule.match.kind === "procedure" ? 1 : 2;
  return 3;
}

function price(rules: BillingRule[], startsOn: string, procedure: string | null, minutes: number | null): Calculation {
  const procedureKey = billingNameKey(procedure);
  for (const rule of rules) {
    const match = rule.kind === "porte" ? rule.match : rule;
    if (match.kind === "procedure") {
      if (!procedureKey) return pending("Cirurgia ausente na ficha.", startsOn);
      if (billingNameKey(match.name) !== procedureKey) continue;
    } else {
      if (minutes === null) return pending("Duração indisponível. Confira os horários de início e término.", startsOn);
      if (minutes <= match.aboveMinutes || (match.upToMinutes !== null && minutes > match.upToMinutes)) continue;
    }
    return { amountCents: rule.amountCents, startsOn, rule, pending: null };
  }
  return pending("Nenhuma regra corresponde à ficha.", startsOn);
}

function indexTables(plan: BillingPlan) {
  return plan.tables.map(({ starts_on: startsOn, configuration }) => {
    const parsed = parseBillingConfiguration(configuration);
    return {
      startsOn,
      rules: "error" in parsed ? null : parsed.rules.sort((first, second) => byPriority(first) - byPriority(second)),
    };
  }).sort((first, second) => second.startsOn.localeCompare(first.startsOn));
}

export function calculateProduction(cases: BillingSource[], plans: BillingPlan[]): ProductionCase[] {
  const planTables = new Map<string, ReturnType<typeof indexTables> | null>();
  for (const plan of plans) {
    const name = billingNameKey(plan.plan_name);
    planTables.set(name, planTables.has(name) ? null : indexTables(plan));
  }

  function calculate(ficha: BillingSource, duration: number | null): Calculation {
    const name = billingNameKey(ficha.plan_name);
    if (!name) return pending("Plano ausente na ficha.");
    const tables = planTables.get(name);
    if (tables === undefined) return pending("Plano sem cadastro no hospital.");
    if (tables === null) return pending("Mais de um cadastro corresponde ao plano da ficha.");
    const date = ficha.procedure_date;
    if (!isBillingDate(date)) return pending("Data da cirurgia indisponível.");
    const table = tables.find(({ startsOn }) => startsOn <= date);
    if (!table) return pending("Sem tabela vigente na data da cirurgia.");
    if (!table.rules) return pending("A tabela vigente tem regras inválidas.", table.startsOn);
    return price(table.rules, table.startsOn, ficha.procedure_name, duration);
  }

  return cases.map((ficha) => {
    const durationMinutes = elapsedMinutes(ficha.start_date_time, ficha.end_date_time);
    return {
      id: ficha.document_id,
      record_number: ficha.record_number,
      procedure_date: ficha.procedure_date,
      procedure_name: ficha.procedure_name,
      plan_name: ficha.plan_name,
      anesthesiologist_name: ficha.anesthesiologist_name,
      crm: ficha.crm,
      durationMinutes,
      ...calculate(ficha, durationMinutes),
    };
  });
}

export function summarizeProduction(cases: ProductionCase[]) {
  let total = BigInt(0);
  let calculated = 0;
  for (const ficha of cases) {
    if (ficha.amountCents === null) continue;
    total += BigInt(ficha.amountCents);
    calculated++;
  }
  return { totalCents: total.toString(), calculated, pending: cases.length - calculated };
}

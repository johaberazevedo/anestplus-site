import {
  anesthesiaTechniques, billingNameKey, billingRuleLabel, identifyAnesthesia, isBillingDate,
  parseBillingConfiguration, type AnesthesiaTechnique, type BillingAdditional,
  type BillingConfiguration, type BillingPlan, type BillingRule,
} from "@/lib/institutional-billing";

export type BillingSource = {
  document_id: string;
  patient_name?: string | null;
  anesthesia_type?: string | null;
  record_number: string | null;
  procedure_date: string | null;
  procedure_name: string | null;
  plan_name: string | null;
  anesthesiologist_name: string | null;
  crm: string | null;
  start_date_time: string | null;
  end_date_time: string | null;
};

type AppliedAdditional = { label: string; amountCents: number };
type Calculation = {
  amountCents: number | null;
  baseAmountCents: number | null;
  additions: AppliedAdditional[];
  startsOn: string | null;
  rule: BillingRule | null;
  pending: string | null;
  billedMinutes: number | null;
  timeZone: string;
  shift: "Diurno" | "Noturno" | null;
  weekday: string | null;
};

export type ProductionCase = Omit<BillingSource, "document_id"> & Calculation & {
  id: string; durationMinutes: number | null; technique: AnesthesiaTechnique | null;
  publication?: { version: number; revisionId: string; ruleLabel: string | null };
};
export type ProductionReport = {
  hospitalName: string;
  cases: ProductionCase[];
  summary: { totalCents: string; calculated: number; pending: number };
  page: number;
  lastPage: number;
};

export function elapsedMinutes(start: string | null, end: string | null) {
  if (start === null || end === null) return null;
  const milliseconds = Date.parse(end) - Date.parse(start);
  return Number.isFinite(milliseconds) && milliseconds > 0 ? milliseconds / 60_000 : null;
}

function pending(message: string, startsOn: string | null = null) {
  return { amountCents: null, baseAmountCents: null, additions: [], startsOn, rule: null, pending: message };
}

function byPriority(rule: BillingRule) {
  let priority = 3;
  if (rule.kind === "procedure") priority = 0;
  if (rule.kind === "porte") priority = rule.match.kind === "procedure" ? 1 : 2;
  return priority * 2 + (rule.technique ? 0 : 1);
}

function price(rules: BillingRule[], startsOn: string, procedure: string | null,
  minutes: number | null, technique: AnesthesiaTechnique | null) {
  const procedureKey = billingNameKey(procedure);
  for (const rule of rules) {
    if (rule.technique && technique && rule.technique !== technique) continue;
    const match = rule.kind === "porte" ? rule.match : rule;
    if (match.kind === "procedure") {
      if (!procedureKey) return pending("Cirurgia ausente na ficha.", startsOn);
      if (billingNameKey(match.name) !== procedureKey) continue;
    } else {
      if (minutes === null) return pending("Duração indisponível. Confira os horários de início e término.", startsOn);
      // Um tempo positivo arredondado para zero pertence à primeira faixa.
      if ((minutes <= match.aboveMinutes && !(minutes === 0 && match.aboveMinutes === 0))
        || (match.upToMinutes !== null && minutes > match.upToMinutes)) continue;
    }
    if (rule.technique && !technique) return pending("Técnica anestésica ausente ou não reconhecida. Confira a ficha.", startsOn);
    return { amountCents: rule.amountCents, baseAmountCents: rule.amountCents,
      additions: [] as AppliedAdditional[], startsOn, rule, pending: null };
  }
  return pending("Nenhuma regra corresponde à ficha.", startsOn);
}

function timeMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function timing(start: string | null, configuration: Pick<BillingConfiguration, "timeZone" | "nightStart" | "nightEnd">) {
  const timeZone = configuration.timeZone ?? "America/Bahia";
  if (!start || !Number.isFinite(Date.parse(start))) return { timeZone, shift: null, weekday: null, weekend: false };
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone, hourCycle: "h23", hour: "2-digit", minute: "2-digit", weekday: "short",
  }).formatToParts(new Date(start));
  const part = (key: string) => parts.find((item) => item.type === key)?.value ?? "";
  const minutes = Number(part("hour")) * 60 + Number(part("minute"));
  const from = timeMinutes(configuration.nightStart ?? "19:00");
  const to = timeMinutes(configuration.nightEnd ?? "07:00");
  const night = from < to ? minutes >= from && minutes < to : minutes >= from || minutes < to;
  const weekday = new Intl.DateTimeFormat("pt-BR", { timeZone, weekday: "short" }).format(new Date(start));
  return { timeZone, shift: night ? "Noturno" as const : "Diurno" as const, weekday,
    weekend: part("weekday") === "Sat" || part("weekday") === "Sun" };
}

export function additionalCents(base: number, additional: BillingAdditional) {
  if (additional.kind === "fixed") return BigInt(additional.amountCents);
  // Arredondamento monetário em centavos, sempre sobre o valor-base.
  return (BigInt(base) * BigInt(additional.basisPoints) + BigInt(5000)) / BigInt(10000);
}

function applyAdditions(base: number, configuration: BillingConfiguration, clock: ReturnType<typeof timing>) {
  const additions = configuration.additions;
  const candidates: { label: string; cents: bigint }[] = [];
  if (clock.shift === "Noturno" && additions?.night) {
    candidates.push({ label: "Noturno", cents: additionalCents(base, additions.night) });
  }
  if (clock.weekend && additions?.weekend) {
    candidates.push({ label: "Fim de semana", cents: additionalCents(base, additions.weekend) });
  }
  const selected = additions?.cumulative ? candidates
    : candidates.sort((first, second) => first.cents === second.cents ? 0 : first.cents > second.cents ? -1 : 1).slice(0, 1);
  const total = selected.reduce((sum, item) => sum + item.cents, BigInt(base));
  if (total > BigInt(Number.MAX_SAFE_INTEGER)) return null;
  return { amountCents: Number(total), additions: selected.map(({ label, cents }) => ({ label, amountCents: Number(cents) })) };
}

function indexTables(plan: BillingPlan) {
  return plan.tables.map(({ starts_on: startsOn, configuration }) => {
    const parsed = parseBillingConfiguration(configuration);
    return { startsOn, configuration: "error" in parsed ? null : {
      ...parsed, rules: parsed.rules.sort((first, second) => byPriority(first) - byPriority(second)),
    } };
  }).sort((first, second) => second.startsOn.localeCompare(first.startsOn));
}

export function calculateProduction(cases: BillingSource[], plans: BillingPlan[]): ProductionCase[] {
  const planTables = new Map<string, ReturnType<typeof indexTables> | null>();
  for (const plan of plans) {
    const name = billingNameKey(plan.plan_name);
    planTables.set(name, planTables.has(name) ? null : indexTables(plan));
  }

  function calculate(ficha: BillingSource, duration: number | null, technique: AnesthesiaTechnique | null): Calculation {
    let configuration: BillingConfiguration = { rules: [] };
    let failure: ReturnType<typeof pending> | undefined;
    let startsOn: string | null = null;
    const name = billingNameKey(ficha.plan_name);
    const tables = planTables.get(name);
    if (!name) failure = pending("Plano ausente na ficha.");
    else if (tables === undefined) failure = pending("Plano sem cadastro no hospital.");
    else if (tables === null) failure = pending("Mais de um cadastro corresponde ao plano da ficha.");
    else if (!isBillingDate(ficha.procedure_date)) failure = pending("Data da cirurgia indisponível.");
    else {
      const table = tables.find((item) => item.startsOn <= ficha.procedure_date!);
      if (!table) failure = pending("Sem tabela vigente na data da cirurgia.");
      else if (!table.configuration) failure = pending("A tabela vigente tem regras inválidas.", table.startsOn);
      else { configuration = table.configuration; startsOn = table.startsOn; }
    }
    const billedMinutes = duration === null ? null : configuration.durationRounding === "nearest" ? Math.round(duration) : duration;
    const clock = timing(ficha.start_date_time, configuration);
    const details = { billedMinutes, timeZone: clock.timeZone, shift: clock.shift, weekday: clock.weekday };
    if (failure) return { ...details, ...failure };
    const base = price(configuration.rules, startsOn!, ficha.procedure_name, billedMinutes, technique);
    if (base.amountCents === null) return { ...details, ...base };
    const hasAdditions = Boolean(configuration.additions?.night || configuration.additions?.weekend);
    if (hasAdditions && clock.shift === null) {
      return { ...details, ...pending("Horário de início indisponível para verificar os adicionais.", startsOn) };
    }
    const total = applyAdditions(base.amountCents, configuration, clock);
    if (!total) return { ...details, ...pending("O valor calculado excede o limite permitido. Confira a tabela.", startsOn) };
    return { ...details, ...base, ...total };
  }

  return cases.map((ficha) => {
    const durationMinutes = elapsedMinutes(ficha.start_date_time, ficha.end_date_time);
    const technique = identifyAnesthesia(ficha.anesthesia_type);
    return { id: ficha.document_id, patient_name: ficha.patient_name ?? null,
      anesthesia_type: ficha.anesthesia_type ?? null, record_number: ficha.record_number,
      procedure_date: ficha.procedure_date, procedure_name: ficha.procedure_name, plan_name: ficha.plan_name,
      anesthesiologist_name: ficha.anesthesiologist_name, crm: ficha.crm,
      start_date_time: ficha.start_date_time, end_date_time: ficha.end_date_time,
      durationMinutes, technique, ...calculate(ficha, durationMinutes, technique) };
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

export function productionSpreadsheet(cases: ProductionCase[]) {
  const money = (value: number | null) => value === null ? "" : `${Math.floor(value / 100)},${String(value % 100).padStart(2, "0")}`;
  const decimal = (value: number | null) => value === null ? "" : String(value).replace(".", ",");
  const date = (value: string | null) => value?.split("-").reverse().join("/") ?? "";
  const cell = (value: string | null | undefined) => {
    const text = (value ?? "").replace(/[\t\r\n\u0000]/g, " ");
    // Textos da ficha são literais ao colar em Excel/Sheets.
    return /^\s*[=+\-@]/.test(text) ? `'${text}` : text;
  };
  const rows = cases.map((ficha) => [
    date(ficha.procedure_date), ficha.record_number, ficha.patient_name, ficha.anesthesiologist_name, ficha.crm,
    ficha.plan_name, ficha.procedure_name, ficha.anesthesia_type,
    ficha.technique ? anesthesiaTechniques[ficha.technique] : "",
    ficha.publication?.ruleLabel ?? (ficha.rule ? billingRuleLabel(ficha.rule) : ""),
    decimal(ficha.durationMinutes), decimal(ficha.billedMinutes), ficha.timeZone, ficha.weekday, ficha.shift,
    money(ficha.baseAmountCents), money(ficha.amountCents === null ? null : ficha.additions.reduce((sum, item) => sum + item.amountCents, 0)),
    ficha.additions.map((item) => `${item.label} ${money(item.amountCents)}`).join(" + "),
    money(ficha.amountCents), date(ficha.startsOn), ficha.pending,
  ]);
  return [
    ["Data", "Prontuário", "Paciente", "Anestesista", "CRM", "Plano", "Cirurgia", "Técnica na ficha", "Técnica identificada",
      "Regra / classificação", "Duração exata (min)", "Duração usada (min)", "Fuso horário", "Dia", "Turno",
      "Valor-base (R$)", "Adicionais (R$)", "Detalhe dos adicionais", "Total (R$)", "Vigência", "Pendência"],
    ...rows,
  ].map((row) => row.map(cell).join("\t")).join("\n");
}

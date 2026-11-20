type ProcedureMatch = { kind: "procedure"; name: string };
type DurationMatch = { kind: "duration"; aboveMinutes: number; upToMinutes: number | null };
export type BillingMatch = ProcedureMatch | DurationMatch;

export const anesthesiaTechniques = {
  general: "Anestesia Geral",
  regional: "Bloqueio Regional",
  epidural: "Peridural",
  spinal: "Raquianestesia",
  sedation: "Sedação",
} as const;
export type AnesthesiaTechnique = keyof typeof anesthesiaTechniques;
export const billingTimeZones: Record<string, string> = {
  "America/Bahia": "Bahia (Salvador)",
  "America/Sao_Paulo": "Brasília / São Paulo",
  "America/Recife": "Pernambuco (Recife)",
  "America/Fortaleza": "Ceará (Fortaleza)",
  "America/Manaus": "Amazonas (Manaus)",
  "America/Cuiaba": "Mato Grosso (Cuiabá)",
  "America/Porto_Velho": "Rondônia (Porto Velho)",
  "America/Rio_Branco": "Acre (Rio Branco)",
  "America/Noronha": "Fernando de Noronha",
  UTC: "UTC",
};

export type BillingRule = (
  BillingMatch | { kind: "porte"; label: string; match: BillingMatch }
) & { amountCents: number; technique?: AnesthesiaTechnique; productionLabel?: string };
export type BillingAdditional = { kind: "fixed"; amountCents: number } | { kind: "percent"; basisPoints: number };
export type BillingConfiguration = {
  rules: BillingRule[];
  durationRounding?: "exact" | "nearest";
  timeZone?: string;
  nightStart?: string;
  nightEnd?: string;
  additions?: { night?: BillingAdditional; weekend?: BillingAdditional; cumulative: boolean };
};
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
  if (rule.technique !== undefined && !isAnesthesiaTechnique(rule.technique)) return null;
  if (rule.productionLabel !== undefined && !billingText(rule.productionLabel)) return null;
  const details = {
    ...(rule.technique === undefined ? {} : { technique: rule.technique as AnesthesiaTechnique }),
    ...(rule.productionLabel === undefined ? {} : { productionLabel: billingText(rule.productionLabel) }),
  };
  if (rule.kind === "porte") {
    const label = billingText(rule.label);
    const match = readMatch(rule.match);
    return label && match ? { kind: "porte", label, match, amountCents, ...details } : null;
  }
  const match = readMatch(rule);
  return match ? { ...match, amountCents, ...details } : null;
}

export function isAnesthesiaTechnique(value: unknown): value is AnesthesiaTechnique {
  return typeof value === "string" && Object.hasOwn(anesthesiaTechniques, value);
}

export function identifyAnesthesia(value: unknown): AnesthesiaTechnique | null {
  const text = billingText(value).normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  if (text.includes("geral")) return "general";
  if (/bloqueio|plexo|regional/.test(text)) return "regional";
  if (text.includes("peridural")) return "epidural";
  if (/raqui|subaracno/.test(text)) return "spinal";
  return text.includes("sedacao") ? "sedation" : null;
}

export function billingRuleLabel(rule: BillingRule) {
  const match = rule.kind === "porte" ? rule.match : rule;
  const criterion = match.kind === "procedure" ? match.name
    : `Acima de ${match.aboveMinutes} min${match.upToMinutes === null ? "" : ` e até ${match.upToMinutes} min`}`;
  const parts = [rule.productionLabel, rule.technique && anesthesiaTechniques[rule.technique],
    rule.kind === "porte" ? `Porte ${rule.label}` : null, criterion];
  return parts.filter(Boolean).join(" · ");
}

function readAdditional(value: unknown): BillingAdditional | null {
  const item = record(value);
  if (item?.kind === "fixed" && isNonnegativeInteger(item.amountCents)) {
    return { kind: "fixed", amountCents: item.amountCents };
  }
  if (item?.kind === "percent" && isNonnegativeInteger(item.basisPoints)) {
    return { kind: "percent", basisPoints: item.basisPoints };
  }
  return null;
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
  const source = record(value);
  const rawRules = source?.rules;
  if (!Array.isArray(rawRules) || !rawRules.length) return { error: "Adicione pelo menos uma regra de valor." };
  const rules: BillingRule[] = [];
  for (const [index, rawRule] of rawRules.entries()) {
    const rule = readRule(rawRule);
    if (!rule) return { error: `Confira os dados da regra ${index + 1}.` };
    for (const [otherIndex, other] of rules.entries()) {
      // Uma técnica específica pode substituir o valor geral do mesmo critério.
      if (rule.technique !== other.technique) continue;
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
  const configuration: BillingConfiguration = { rules };
  if (source?.durationRounding !== undefined) {
    if (source.durationRounding !== "exact" && source.durationRounding !== "nearest") {
      return { error: "Escolha duração exata ou minuto mais próximo." };
    }
    configuration.durationRounding = source.durationRounding;
  }
  if (source?.timeZone !== undefined) {
    const timeZone = billingText(source.timeZone);
    try {
      if (!timeZone) throw new Error();
      new Intl.DateTimeFormat("pt-BR", { timeZone }).format();
    } catch {
      return { error: "Confira o fuso horário do hospital." };
    }
    configuration.timeZone = timeZone;
  }
  for (const key of ["nightStart", "nightEnd"] as const) {
    if (source?.[key] === undefined) continue;
    if (typeof source[key] !== "string" || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(source[key])) {
      return { error: "Confira o início e o fim do horário noturno." };
    }
    configuration[key] = source[key];
  }
  if ((configuration.nightStart ?? "19:00") === (configuration.nightEnd ?? "07:00")) {
    return { error: "O início e o fim do horário noturno precisam ser diferentes." };
  }
  if (source?.additions !== undefined) {
    const additions = record(source.additions);
    if (!additions || typeof additions.cumulative !== "boolean") {
      return { error: "Escolha se os adicionais podem acumular." };
    }
    configuration.additions = { cumulative: additions.cumulative };
    for (const key of ["night", "weekend"] as const) {
      if (additions[key] === undefined) continue;
      const additional = readAdditional(additions[key]);
      if (!additional) return { error: `Confira o adicional ${key === "night" ? "noturno" : "de fim de semana"}.` };
      configuration.additions[key] = additional;
    }
  }
  return configuration;
}

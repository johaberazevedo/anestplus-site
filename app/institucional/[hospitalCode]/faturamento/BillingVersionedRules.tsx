import { useState } from "react";
import { anesthesiaTechniques, type BillingAdditional } from "@/lib/institutional-billing";
import {
  billingWeekdaysV2, type BillingConditionFieldV2, type BillingConditionsV2, type BillingLabelV2, type BillingRevisionV2,
} from "@/lib/institutional-billing-rules-v2";

export type BillingFormStyles = { panel: string; button: string; input: string };
type Catalog = "marks" | "tiers" | "classifications";
type RuleGroup = "markRules" | "tierRules" | "classificationRules" | "priceRules" | "additionalRules";
type Rule = BillingRevisionV2[RuleGroup][number];
type Condition = BillingConditionFieldV2 | "duration";

export const fieldLabel: Record<Condition, string> = {
  procedure: "Procedimento", plan: "Plano na ficha", technique: "Técnica", shift: "Turno", weekday: "Dia da semana",
  duration: "Duração", mark: "Marcação", tier: "Porte", classification: "Classificação",
};
const catalogs = [
  { key: "marks", title: "Marcações", singular: "marcação" }, { key: "tiers", title: "Portes", singular: "porte" },
  { key: "classifications", title: "Classificações", singular: "classificação" },
] as const;
const sourceConditions: Condition[] = ["procedure", "plan", "technique", "duration", "shift", "weekday"];
const tierConditions: Condition[] = [...sourceConditions, "mark"];
const classificationConditions: Condition[] = [...tierConditions, "tier"];
const pricingConditions: Condition[] = [...classificationConditions, "classification"];
const groups: { key: RuleGroup; title: string; allowed: Condition[]; result?: Catalog }[] = [
  { key: "markRules", title: "Regras de marcação", allowed: sourceConditions, result: "marks" },
  { key: "tierRules", title: "Regras de porte", allowed: tierConditions, result: "tiers" },
  { key: "classificationRules", title: "Regras de classificação", allowed: classificationConditions, result: "classifications" },
  { key: "priceRules", title: "Preços-base", allowed: pricingConditions },
  { key: "additionalRules", title: "Adicionais", allowed: pricingConditions },
];
const weekdays = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const card = "rounded-2xl border border-zinc-200 p-4";
const labelClass = "block text-sm font-bold text-zinc-700";

function numberInput(value: number) {
  return Number.isFinite(value) ? value : "";
}

function decimalInput(raw: string) {
  const parts = /^(\d+)(?:[,.](\d{0,2}))?$/.exec(raw.trim());
  if (!parts) return NaN;
  const result = Number(parts[1]) * 100 + Number((parts[2] ?? "").padEnd(2, "0"));
  return Number.isSafeInteger(result) ? result : NaN;
}

function DecimalField({ label, value, onChange, input }: { label: string; value: number; onChange: (value: number) => void; input: string }) {
  const [text, setText] = useState(() => Number.isFinite(value) ? `${Math.floor(value / 100)},${String(value % 100).padStart(2, "0")}` : "");
  return <label className={labelClass}>{label}
    <input className={input} inputMode="decimal" value={text} onChange={(event) => {
      setText(event.target.value);
      onChange(decimalInput(event.target.value));
    }} />
  </label>;
}

function choices(field: Condition, draft: BillingRevisionV2): BillingLabelV2[] | undefined {
  switch (field) {
    case "technique": return Object.entries(anesthesiaTechniques).map(([id, label]) => ({ id, label }));
    case "shift": return [{ id: "day", label: "Diurno" }, { id: "night", label: "Noturno" }];
    case "weekday": return billingWeekdaysV2.map((id, index) => ({ id, label: weekdays[index] }));
    case "mark": return draft.marks;
    case "tier": return draft.tiers;
    case "classification": return draft.classifications;
  }
}

function Conditions({ when, allowed, draft, onChange, styles }: {
  when: BillingConditionsV2; allowed: Condition[]; draft: BillingRevisionV2;
  onChange: (value: BillingConditionsV2) => void; styles: BillingFormStyles;
}) {
  const entries = allowed.filter((key) => when[key] !== undefined);
  return <div className="space-y-3">
    {entries.length === 0 && <p className="text-sm text-zinc-600">Sem condições. A regra vale para todas as fichas do escopo.</p>}
    {entries.map((field) => {
      const values = field === "duration" ? undefined : when[field];
      const options = choices(field, draft);
      return <div className={card} key={field}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className={labelClass}>{fieldLabel[field]}</p>
          <button type="button" className="min-h-11 px-2 text-sm font-bold text-[#506047] underline"
            aria-label={`Remover condição de ${fieldLabel[field]}`} onClick={() => {
              const next = { ...when };
              delete next[field];
              onChange(next);
            }}>Remover condição</button>
        </div>
        {field === "duration" && when.duration ? <div className="grid gap-3 sm:grid-cols-2">
          <label className={labelClass}>Acima de (minutos)
            <input className={styles.input} type="number" min="0" value={numberInput(when.duration.aboveMinutes)}
              onChange={(event) => onChange({ ...when, duration: { ...when.duration!, aboveMinutes: event.target.valueAsNumber } })} />
          </label>
          <label className={labelClass}>Até (minutos)
            <input className={styles.input} type="number" min="1" placeholder="Sem limite" value={when.duration.upToMinutes ?? ""}
              onChange={(event) => onChange({ ...when, duration: { ...when.duration!, upToMinutes: event.target.value === "" ? null : event.target.valueAsNumber } })} />
          </label>
        </div> : options ? (
          options.length ? <div className="flex flex-wrap gap-x-5 gap-y-2">
            {options.map((option) => <label key={option.id} className="flex min-h-8 items-center gap-2 text-sm text-zinc-700">
              <input type="checkbox" checked={values?.includes(option.id) ?? false} onChange={(event) => onChange({
                ...when, [field]: event.target.checked ? [...(values ?? []), option.id] : values?.filter((value) => value !== option.id) ?? [],
              })} />{option.label || "Item sem nome"}
            </label>)}
          </div> : <p className="text-sm text-zinc-600">Cadastre as opções no catálogo acima.</p>
        ) : <label className={labelClass}>Um nome por linha
          <textarea className={styles.input} rows={2} aria-label={`Valores de ${fieldLabel[field]}`} value={values?.join("\n") ?? ""}
            onChange={(event) => onChange({ ...when, [field]: event.target.value.split("\n") })} />
        </label>}
      </div>;
    })}
    <label className={labelClass}>Adicionar condição
      <select className={styles.input} value="" onChange={(event) => {
        const field = event.target.value as Condition;
        if (field) onChange(field === "duration" ? { ...when, duration: { aboveMinutes: 0, upToMinutes: null } } : { ...when, [field]: [] });
      }}>
        <option value="">Selecione uma condição</option>
        {allowed.filter((key) => !entries.includes(key)).map((field) => <option key={field} value={field}>{fieldLabel[field]}</option>)}
      </select>
    </label>
  </div>;
}

export default function BillingVersionedRules({ draft, onChange, styles }: {
  draft: BillingRevisionV2; onChange: (value: Partial<BillingRevisionV2>) => void; styles: BillingFormStyles;
}) {
  return <div className="space-y-5">
    <p className="text-sm text-zinc-600">Todas as condições da regra precisam corresponder. Dentro de cada condição, basta uma das opções. Entre regras concorrentes, o menor número de prioridade vence.</p>
    {catalogs.map(({ key, title, singular }) => <details key={key} className={card}>
      <summary className="cursor-pointer text-sm font-bold text-zinc-800">{title} ({draft[key].length})</summary>
      <div className="mt-3 space-y-3">
        {draft[key].map((item, index) => <div className="flex flex-wrap items-end gap-2" key={item.id}>
          <label className={`${labelClass} min-w-48 flex-1`}>Nome de {singular}
            <input className={styles.input} value={item.label} onChange={(event) => onChange({
              [key]: draft[key].map((entry, position) => position === index ? { ...entry, label: event.target.value } : entry),
            })} />
          </label>
          <button type="button" className={styles.button} onClick={() => onChange({
            [key]: draft[key].filter(({ id }) => id !== item.id),
          })}>Remover</button>
        </div>)}
        <button type="button" className={styles.button} onClick={() => onChange({
          [key]: [...draft[key], { id: crypto.randomUUID(), label: "" }],
        })}>Adicionar {singular}</button>
      </div>
    </details>)}
    {groups.map(({ key, title, allowed, result }) => {
      const rules: Rule[] = draft[key];
      const update = (index: number, patch: Partial<Rule>) => onChange({
        [key]: rules.map((item, position) => position === index ? { ...item, ...patch } : item),
      });
      return <details key={key} className={card}>
        <summary className="cursor-pointer text-sm font-bold text-zinc-800">{title} ({rules.length})</summary>
        <div className="mt-3 space-y-3">
          {rules.map((rule, index) => <div className={`${card} space-y-3`} key={rule.id}>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={labelClass}>Nome da regra
                <input className={styles.input} value={rule.label} onChange={(event) => update(index, { label: event.target.value })} />
              </label>
              <label className={labelClass}>Prioridade
                <input className={styles.input} type="number" min="0" value={numberInput(rule.priority)}
                  onChange={(event) => update(index, { priority: event.target.valueAsNumber })} />
              </label>
            </div>
            <Conditions when={rule.when} allowed={allowed} draft={draft} styles={styles} onChange={(when) => update(index, { when })} />
            {result && "resultId" in rule && <label className={labelClass}>Resultado
              <select className={styles.input} value={rule.resultId} onChange={(event) => update(index, { resultId: event.target.value })}>
                <option value="">Escolha um item do catálogo</option>
                {draft[result].map((item) => <option key={item.id} value={item.id}>{item.label || "Item sem nome"}</option>)}
              </select>
            </label>}
            {"amountCents" in rule && <DecimalField label="Valor-base (R$)" input={styles.input}
              value={rule.amountCents} onChange={(amountCents) => update(index, { amountCents })} />}
            {"value" in rule && <div className="grid gap-3 sm:grid-cols-2">
              <label className={labelClass}>Forma do adicional
                <select className={styles.input} value={rule.value.kind} onChange={(event) => update(index, {
                  value: event.target.value === "percent" ? { kind: "percent", basisPoints: 0 } : { kind: "fixed", amountCents: 0 },
                })}>
                  <option value="fixed">Valor fixo</option><option value="percent">Percentual do valor-base</option>
                </select>
              </label>
              <DecimalField key={rule.value.kind} label={rule.value.kind === "fixed" ? "Adicional (R$)" : "Adicional (%)"} input={styles.input}
                value={rule.value.kind === "fixed" ? rule.value.amountCents : rule.value.basisPoints} onChange={(value) => {
                  const additional: BillingAdditional = rule.value.kind === "fixed" ? { kind: "fixed", amountCents: value } : { kind: "percent", basisPoints: value };
                  update(index, { value: additional });
                }} />
            </div>}
            <button type="button" className={styles.button} onClick={() => onChange({ [key]: rules.filter((item) => item.id !== rule.id) })}>
              Remover regra
            </button>
          </div>)}
          <button type="button" className={styles.button} onClick={() => {
            const common = { id: crypto.randomUUID(), label: "", priority: rules.length, when: {} };
            const rule: Rule = result ? { ...common, resultId: "" } : key === "priceRules" ? { ...common, amountCents: NaN }
              : { ...common, value: { kind: "fixed", amountCents: NaN } };
            onChange({ [key]: [...rules, rule] });
          }}>Adicionar regra</button>
        </div>
      </details>;
    })}
  </div>;
}

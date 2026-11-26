"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  anesthesiaTechniques, billingRuleLabel, billingTimeZones, isAnesthesiaTechnique, type BillingAdditional,
  type BillingMatch, type BillingPlan, type BillingRule, type BillingTable,
} from "@/lib/institutional-billing";
import { billingRequest as request, RequestError } from "./billing-request";
import BillingVersionedEditor from "./BillingVersionedEditor";

const panel = "min-w-0 rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6";
const button = "min-h-11 rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm font-bold text-zinc-700 transition hover:border-[#b9963b]/50 hover:bg-[#fafaf7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b9963b] disabled:cursor-not-allowed disabled:opacity-40";
const input = "mt-2 min-h-11 w-full min-w-0 rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-900 outline-none transition hover:border-zinc-400 focus:border-[#b9963b] focus:ring-2 focus:ring-[#b9963b]/15";

type Billing = { hospitalName: string; plans: BillingPlan[]; versionedPublications?: boolean };
type PlanDetails = Omit<BillingPlan, "tables">;
type SaveBilling = <T>(editing: boolean, body: object) => Promise<T>;
type Mode = "procedure" | "duration" | "porte_procedure" | "porte_duration";
type DraftRow = { id: string | number; rule?: BillingRule };

function message(error: unknown) {
  return error instanceof Error ? error.message : "Não foi possível concluir a operação.";
}

function dateLabel(value: string) {
  return value.split("-").reverse().join("/");
}

export default function BillingClient({ hospitalCode, token, onConfigurationSaved, onAccessDenied }: {
  hospitalCode: string; token: string; onConfigurationSaved?: () => void; onAccessDenied?: (message: string) => void;
}) {
  const endpoint = `/api/pro/institucional/faturamento/${hospitalCode}/configuracao`;
  const [billing, setBilling] = useState<Billing | null>(null);
  const [planId, setPlanId] = useState("");
  const [error, setError] = useState("");
  const [savedPlan, setSavedPlan] = useState("");
  const loadRequest = useRef<AbortController | null>(null);
  const plan = billing?.plans.find((item) => item.id === planId);

  useEffect(() => {
    const controller = new AbortController();
    loadRequest.current = controller;
    void request<Billing>(endpoint, token, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) {
          setBilling(data);
          setError("");
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setBilling(null);
          setError(message(error));
          if (error instanceof RequestError && (error.status === 401 || error.status === 403)) onAccessDenied?.(error.message);
        }
      });
    return () => controller.abort();
  }, [endpoint, token, onAccessDenied]);

  async function save<T>(editing: boolean, body: object) {
    try {
      const result = await request<T>(endpoint, token, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      onConfigurationSaved?.();
      return result;
    } catch (error) {
      if (error instanceof RequestError && (error.status === 401 || error.status === 403)) {
        loadRequest.current?.abort();
        setBilling(null);
        setError(error.message);
        onAccessDenied?.(error.message);
      }
      throw error;
    }
  }

  function updatePlan(details: PlanDetails) {
    setBilling((current) => current && {
      ...current,
      plans: [...current.plans.filter((item) => item.id !== details.id),
        { ...details, tables: current.plans.find((item) => item.id === details.id)?.tables ?? [] },
      ].sort((first, second) => first.plan_name.localeCompare(second.plan_name, "pt-BR")),
    });
    setPlanId((current) => current === planId ? details.id : current);
    setSavedPlan(details.id);
  }

  function updateTable(id: string, table: BillingTable) {
    setBilling((current) => current && {
      ...current,
      plans: current.plans.map((item) => item.id === id ? {
        ...item,
        tables: [table, ...item.tables.filter((entry) => entry.starts_on !== table.starts_on)]
          .sort((first, second) => second.starts_on.localeCompare(first.starts_on)),
      } : item),
    });
  }

  if (!billing) return <div className={panel}><p className={error ? "text-sm text-red-700" : "text-sm text-[#506047]"} role={error ? "alert" : "status"}>{error || "Carregando faturamento…"}</p></div>;

  return (
    <>
      <section className={panel}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-black tracking-tight sm:text-2xl">Planos e convênios</h2>
          <p className="rounded-full border border-[#b9963b]/20 bg-[#f6f7f1] px-4 py-2 text-sm font-semibold text-[#506047]">{billing.hospitalName}</p>
        </div>
        <label className="mt-6 block max-w-xl text-sm font-bold text-zinc-700">Plano
          <select className={input} value={planId} onChange={(event) => {
            setPlanId(event.target.value);
            setSavedPlan("");
          }}>
            <option value="">Novo plano</option>
            {billing.plans.map((item) => <option key={item.id} value={item.id}>{item.plan_name}</option>)}
          </select>
        </label>
        <PlanForm key={planId} save={save} plan={plan}
          onSave={() => setSavedPlan("")} onSaved={updatePlan} />
        {savedPlan && savedPlan === planId && <Feedback success="Plano salvo." />}
      </section>
      {plan && <TablesEditor key={plan.id} save={save} plan={plan} onSaved={(table) => updateTable(plan.id, table)} />}
      {billing.versionedPublications && <BillingVersionedEditor hospitalCode={hospitalCode} token={token}
        plans={billing.plans} styles={{ panel, button, input }} onAccessDenied={onAccessDenied} />}
    </>
  );
}

function PlanForm({ save, plan, onSave, onSaved }: {
  save: SaveBilling; plan?: BillingPlan; onSave: () => void; onSaved: (plan: PlanDetails) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setError("");
    onSave();
    try {
      const result = await save<{ plan: PlanDetails }>(Boolean(plan), {
        type: "plan", planId: plan?.id, plan_name: form.get("plan_name"), insurer_name: form.get("insurer_name"),
      });
      onSaved(result.plan);
    } catch (error) {
      setError(message(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-5 border-t border-zinc-100 pt-5">
      <fieldset disabled={saving} className="grid min-w-0 gap-4 text-sm font-bold text-zinc-700 sm:grid-cols-2">
        <label>Nome do plano na ficha
          <input name="plan_name" defaultValue={plan?.plan_name} className={input} required />
        </label>
        <label>Operadora (opcional)
          <input name="insurer_name" defaultValue={plan?.insurer_name ?? ""} className={input} />
        </label>
        <div className="sm:col-span-2"><button type="submit" className="min-h-11 w-full rounded-2xl bg-[#1a2718] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[#1a2718]/15 transition hover:bg-[#22331d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b9963b] sm:w-auto">{saving ? "Salvando…" : "Salvar plano"}</button></div>
      </fieldset>
      <Feedback error={error} />
    </form>
  );
}

function TablesEditor({ save, plan, onSaved }: {
  save: SaveBilling; plan: BillingPlan; onSaved: (table: BillingTable) => void;
}) {
  const [start, setStart] = useState("");
  const [savedTable, setSavedTable] = useState("");
  const table = plan.tables.find((item) => item.starts_on === start);

  return (
    <section className={panel}>
      <h2 className="text-xl font-black tracking-tight sm:text-2xl">Tabelas de valores</h2>
      <p className="mt-1 text-sm text-zinc-600">Cada tabela vale a partir da data indicada até o início da próxima vigência.</p>
      <label className="mt-6 block max-w-xl text-sm font-bold text-zinc-700">Tabela
        <select className={input} value={start} onChange={(event) => {
          setStart(event.target.value);
          setSavedTable("");
        }}>
          <option value="">Nova vigência</option>
          {plan.tables.map((item) => <option key={item.starts_on} value={item.starts_on}>Desde {dateLabel(item.starts_on)}</option>)}
        </select>
      </label>
      <TableForm key={start} save={save} planId={plan.id} table={table}
        onSave={() => setSavedTable("")} onSaved={(updated) => {
          onSaved(updated);
          setStart((current) => current === start ? updated.starts_on : current);
          setSavedTable(updated.starts_on);
        }} />
      {savedTable && savedTable === start && <Feedback success="Tabela salva." />}
    </section>
  );
}

function cents(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!/^\d+(?:[,.]\d{1,2})?$/.test(text)) return null;
  const [reais, decimal = ""] = text.split(/[,.]/);
  const amount = Number(reais + decimal.padEnd(2, "0"));
  return Number.isSafeInteger(amount) ? amount : null;
}

function formRule(form: FormData, row: DraftRow, index: number): BillingRule {
  const get = (field: string) => form.get(`${row.id}-${field}`);
  const mode = get("mode") as Mode;
  const amountCents = cents(get("amount"));
  if (amountCents === null) throw new Error(`Confira o valor da regra ${index + 1}. Exemplo de preenchimento: 500,00.`);
  const upper = get("upToMinutes");
  const technique = get("technique");
  const productionLabel = String(get("productionLabel") ?? "").trim();
  const details = {
    ...(isAnesthesiaTechnique(technique) ? { technique } : {}),
    ...(productionLabel ? { productionLabel } : {}),
  };
  const match: BillingMatch = mode === "procedure" || mode === "porte_procedure"
    ? { kind: "procedure", name: String(get("name") ?? "") }
    : { kind: "duration", aboveMinutes: Number(get("aboveMinutes")),
      upToMinutes: upper === "" ? null : Number(upper) };
  return mode === "porte_procedure" || mode === "porte_duration"
    ? { kind: "porte", label: String(get("label") ?? ""), match, amountCents, ...details }
    : { ...match, amountCents, ...details };
}

function formAdditional(form: FormData, key: "night" | "weekend"): BillingAdditional | undefined {
  if (form.get(`${key}-enabled`) !== "on") return undefined;
  const amount = cents(form.get(`${key}-amount`));
  if (amount === null) throw new Error(`Confira o valor do adicional ${key === "night" ? "noturno" : "de fim de semana"}.`);
  return form.get(`${key}-kind`) === "percent"
    ? { kind: "percent", basisPoints: amount } : { kind: "fixed", amountCents: amount };
}

function TableForm({ save, planId, table, onSave, onSaved }: {
  save: SaveBilling; planId: string; table?: BillingTable; onSave: () => void; onSaved: (table: BillingTable) => void;
}) {
  const [rows, setRows] = useState<DraftRow[]>(() => table
    ? table.configuration.rules.map((rule, index) => ({ id: index, rule }))
    : [{ id: 0 }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setError("");
    onSave();
    try {
      const night = formAdditional(form, "night");
      const weekend = formAdditional(form, "weekend");
      const result = await save<{ table: BillingTable }>(Boolean(table), {
        type: "table", planId, starts_on: form.get("starts_on"),
        configuration: {
          rules: rows.map((row, index) => formRule(form, row, index)),
          durationRounding: form.get("durationRounding"), timeZone: form.get("timeZone"),
          nightStart: form.get("nightStart"), nightEnd: form.get("nightEnd"),
          ...(night || weekend ? { additions: { night, weekend, cumulative: form.get("cumulative") === "on" } } : {}),
        },
      });
      onSaved(result.table);
    } catch (error) {
      setError(message(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 border-t border-zinc-100 pt-6">
      <fieldset disabled={saving} className="min-w-0 space-y-5 text-sm font-bold text-zinc-700">
        <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
        <label className="block">Início da vigência
          <input name="starts_on" type="date" defaultValue={table?.starts_on} readOnly={Boolean(table)} className={input} required />
        </label>
        <label className="block">Como usar a duração
          <select name="durationRounding" defaultValue={table?.configuration.durationRounding ?? "exact"} className={input}>
            <option value="exact">Duração exata</option>
            <option value="nearest">Minuto mais próximo</option>
          </select>
        </label>
        </div>
        <p className="rounded-2xl border border-[#b9963b]/20 bg-[#f6f7f1] px-4 py-3 text-sm font-normal leading-relaxed text-[#506047]">
          A regra de cirurgia tem prioridade sobre porte e duração. No mesmo critério, a técnica específica tem prioridade sobre todas as técnicas.
        </p>
        {rows.map((row, index) => <RuleFields key={row.id} row={row} index={index}
          remove={rows.length > 1 ? () => setRows((current) => current.filter((item) => item.id !== row.id)) : undefined} />)}
        <button type="button" onClick={() => setRows([...rows, { id: crypto.randomUUID() }])} className={button}>Adicionar regra</button>
        <details className="group rounded-3xl border border-zinc-200 bg-[#fafaf7] p-5">
          <summary className="cursor-pointer rounded-lg font-bold text-[#1a2718] marker:text-[#7a865f] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b9963b]">Horários e adicionais (opcional)</summary>
          <div className="mt-5 grid min-w-0 gap-5 sm:grid-cols-2">
            <label>Fuso horário do hospital
              <select name="timeZone" defaultValue={table?.configuration.timeZone ?? "America/Bahia"} className={input}>
                {Object.entries(billingTimeZones).map(([zone, label]) => <option key={zone} value={zone}>{label}</option>)}
                {table?.configuration.timeZone && !Object.hasOwn(billingTimeZones, table.configuration.timeZone)
                  && <option value={table.configuration.timeZone}>{table.configuration.timeZone}</option>}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label>Noturno começa às
                <input name="nightStart" type="time" defaultValue={table?.configuration.nightStart ?? "19:00"} className={input} required />
              </label>
              <label>Noturno termina às
                <input name="nightEnd" type="time" defaultValue={table?.configuration.nightEnd ?? "07:00"} className={input} required />
              </label>
            </div>
            <p className="font-normal leading-relaxed text-zinc-600 sm:col-span-2">Turno e fim de semana seguem o início da anestesia no fuso escolhido. Fim de semana corresponde a sábado e domingo.</p>
            <AdditionalFields name="night" label="Adicional noturno" additional={table?.configuration.additions?.night} />
            <AdditionalFields name="weekend" label="Adicional de fim de semana" additional={table?.configuration.additions?.weekend} />
            <label className="flex items-center gap-2 sm:col-span-2">
              <input name="cumulative" type="checkbox" className="h-4 w-4 accent-[#1a2718]" defaultChecked={table?.configuration.additions?.cumulative ?? false} />
              Acumular adicionais
            </label>
            <p className="font-normal leading-relaxed text-zinc-600 sm:col-span-2">Percentuais incidem sobre o valor-base. Com a acumulação desligada, aplica-se apenas o maior adicional.</p>
          </div>
        </details>
        <div className="border-t border-zinc-100 pt-5">
          <button type="submit" className="min-h-11 w-full rounded-2xl bg-[#1a2718] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[#1a2718]/15 transition hover:bg-[#22331d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b9963b] sm:w-auto">{saving ? "Salvando…" : "Salvar tabela"}</button>
        </div>
      </fieldset>
      <Feedback error={error} />
    </form>
  );
}

function RuleFields({ row, index, remove }: { row: DraftRow; index: number; remove?: () => void }) {
  const rule = row.rule;
  const initial = rule?.kind === "porte" ? rule.match : rule;
  const [mode, setMode] = useState<Mode>(rule?.kind === "porte" ? `porte_${rule.match.kind}` : rule?.kind ?? "procedure");
  const [draft, setDraft] = useState({
    technique: rule?.technique ?? "", productionLabel: rule?.productionLabel ?? "",
    label: rule?.kind === "porte" ? rule.label : "",
    name: initial?.kind === "procedure" ? initial.name : "",
    above: initial?.kind === "duration" ? String(initial.aboveMinutes) : "0",
    upTo: initial?.kind === "duration" ? String(initial.upToMinutes ?? "") : "",
    amount: rule ? `${Math.floor(rule.amountCents / 100)},${String(rule.amountCents % 100).padStart(2, "0")}` : "",
  });
  function update(key: keyof typeof draft, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
  }
  const isPorte = mode === "porte_procedure" || mode === "porte_duration";
  const byDuration = mode === "duration" || mode === "porte_duration";
  const field = (name: string) => `${row.id}-${name}`;
  const match: BillingMatch = byDuration
    ? { kind: "duration", aboveMinutes: Number(draft.above), upToMinutes: draft.upTo === "" ? null : Number(draft.upTo) }
    : { kind: "procedure", name: draft.name || "Cirurgia a preencher" };
  const preview: BillingRule = {
    ...(isPorte ? { kind: "porte" as const, label: draft.label || "a preencher", match } : match),
    amountCents: 0, productionLabel: draft.productionLabel,
    ...(isAnesthesiaTechnique(draft.technique) ? { technique: draft.technique } : {}),
  };

  return (
    <fieldset className="grid min-w-0 gap-4 rounded-3xl border border-zinc-200 bg-[#fafaf7]/60 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
      <legend className="px-2 text-xs font-bold uppercase tracking-[0.14em] text-[#7a865f]">Regra {index + 1}</legend>
      <label>Critério
        <select name={field("mode")} className={input} value={mode} onChange={(event) => setMode(event.target.value as Mode)}>
          <option value="procedure">Cirurgia específica</option>
          <option value="porte_procedure">Porte definido pela cirurgia</option>
          <option value="porte_duration">Porte definido pela duração</option>
          <option value="duration">Faixa de duração</option>
        </select>
      </label>
      <label>Técnica anestésica
        <select name={field("technique")} value={draft.technique} onChange={(event) => update("technique", event.target.value)} className={input}>
          <option value="">Todas as técnicas</option>
          {Object.entries(anesthesiaTechniques).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label>Valor (R$)
        <input name={field("amount")} inputMode="decimal"
          value={draft.amount} onChange={(event) => update("amount", event.target.value)}
          placeholder="500,00" className={input} required />
      </label>
      {isPorte && <label>Porte
        <input name={field("label")} value={draft.label} onChange={(event) => update("label", event.target.value)} className={input} required />
      </label>}
      {byDuration ? (
        <>
          <label>Acima de (min)
            <input name={field("aboveMinutes")} type="number" min={0} step={1} className={input} required
              value={draft.above} onChange={(event) => update("above", event.target.value)} />
          </label>
          <label>Até (min, opcional)
            <input name={field("upToMinutes")} type="number" min={1} step={1} className={input}
              value={draft.upTo} onChange={(event) => update("upTo", event.target.value)} />
          </label>
        </>
      ) : <label>Nome da cirurgia na ficha
        <input name={field("name")} value={draft.name} onChange={(event) => update("name", event.target.value)} className={input} required />
      </label>}
      <label>Rótulo na produção (opcional)
        <input name={field("productionLabel")} value={draft.productionLabel} onChange={(event) => update("productionLabel", event.target.value)}
          placeholder="Ex.: Anestesia Geral B" className={input} />
      </label>
      <p className="rounded-2xl border border-[#7a865f]/20 bg-[#f6f7f1] px-4 py-3 font-normal leading-relaxed text-[#506047] sm:col-span-2 xl:col-span-3" aria-live="polite">
        {billingRuleLabel(preview)} · {draft.amount ? `R$ ${draft.amount}` : "Valor a preencher"}
      </p>
      {remove && <div className="sm:col-span-2 xl:col-span-3"><button type="button" onClick={remove} className={button}>Remover regra {index + 1}</button></div>}
    </fieldset>
  );
}

function AdditionalFields({ name, label, additional }: { name: "night" | "weekend"; label: string; additional?: BillingAdditional }) {
  const [enabled, setEnabled] = useState(Boolean(additional));
  const [kind, setKind] = useState(additional?.kind ?? "percent");
  const value = additional?.kind === "fixed" ? additional.amountCents : additional?.basisPoints;
  return (
    <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-4">
      <label className="flex items-center gap-2">
        <input name={`${name}-enabled`} type="checkbox" className="h-4 w-4 accent-[#1a2718]" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />{label}
      </label>
      {enabled && <div className="grid grid-cols-2 gap-3">
        <label>Tipo
          <select name={`${name}-kind`} value={kind} onChange={(event) => setKind(event.target.value as "fixed" | "percent")} className={input}>
            <option value="percent">Percentual</option><option value="fixed">Valor fixo</option>
          </select>
        </label>
        <label>{kind === "percent" ? "Percentual (%)" : "Valor (R$)"}
          <input name={`${name}-amount`} inputMode="decimal" required className={input}
            defaultValue={value === undefined ? "" : `${Math.floor(value / 100)},${String(value % 100).padStart(2, "0")}`} />
        </label>
      </div>}
    </div>
  );
}

function Feedback({ error, success }: { error?: string; success?: string }) {
  if (error) return <p role="alert" className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>;
  if (success) return <p role="status" className="mt-4 rounded-2xl border border-[#7a865f]/25 bg-[#f6f7f1] px-4 py-3 text-sm font-medium text-[#506047]">{success}</p>;
  return null;
}

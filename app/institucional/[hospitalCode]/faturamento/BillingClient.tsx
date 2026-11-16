"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { BillingMatch, BillingPlan, BillingRule, BillingTable } from "@/lib/institutional-billing";
import { billingRequest as request, RequestError } from "./billing-request";

const panel = "rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm";
const button = "rounded-xl border border-zinc-200 px-3 py-2 text-sm font-bold text-zinc-800 hover:bg-zinc-50 disabled:opacity-40";
const input = "mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-950";

type Billing = { hospitalName: string; plans: BillingPlan[] };
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

export default function BillingClient({ hospitalCode, token }: { hospitalCode: string; token: string }) {
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
        }
      });
    return () => controller.abort();
  }, [endpoint, token]);

  async function save<T>(editing: boolean, body: object) {
    try {
      return await request<T>(endpoint, token, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch (error) {
      if (error instanceof RequestError && (error.status === 401 || error.status === 403)) {
        loadRequest.current?.abort();
        setBilling(null);
        setError(error.message);
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

  if (!billing) return <div className={panel}><p role={error ? "alert" : "status"}>{error || "Carregando faturamento…"}</p></div>;

  return (
    <>
      <section className={panel}>
        <h2 className="text-xl font-black">Configurações</h2>
        <p className="mt-1 text-sm text-zinc-600">{billing.hospitalName}</p>
        <label className="mt-4 block text-sm font-semibold">Plano
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
    <form onSubmit={submit} className="mt-4">
      <fieldset disabled={saving} className="grid gap-4 text-sm font-semibold sm:grid-cols-2">
        <label>Nome do plano na ficha
          <input name="plan_name" defaultValue={plan?.plan_name} className={input} required />
        </label>
        <label>Operadora (opcional)
          <input name="insurer_name" defaultValue={plan?.insurer_name ?? ""} className={input} />
        </label>
        <div><button type="submit" className={button}>{saving ? "Salvando…" : "Salvar plano"}</button></div>
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
      <h2 className="text-xl font-black">Tabelas de valores</h2>
      <p className="mt-1 text-sm text-zinc-600">Cada tabela vale a partir da data indicada até o início da próxima vigência.</p>
      <label className="mt-4 block text-sm font-semibold">Tabela
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
  const match: BillingMatch = mode === "procedure" || mode === "porte_procedure"
    ? { kind: "procedure", name: String(get("name") ?? "") }
    : { kind: "duration", aboveMinutes: Number(get("aboveMinutes")),
      upToMinutes: upper === "" ? null : Number(upper) };
  return mode === "porte_procedure" || mode === "porte_duration"
    ? { kind: "porte", label: String(get("label") ?? ""), match, amountCents }
    : { ...match, amountCents };
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
      const result = await save<{ table: BillingTable }>(Boolean(table), {
        type: "table", planId, starts_on: form.get("starts_on"),
        configuration: { rules: rows.map((row, index) => formRule(form, row, index)) },
      });
      onSaved(result.table);
    } catch (error) {
      setError(message(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-4">
      <fieldset disabled={saving} className="space-y-4 text-sm font-semibold">
        <label className="block max-w-xs">Início da vigência
          <input name="starts_on" type="date" defaultValue={table?.starts_on} readOnly={Boolean(table)} className={input} required />
        </label>
        <p className="text-zinc-600">Prioridade do valor-base: cirurgia específica, porte e faixa de duração.</p>
        {rows.map((row, index) => <RuleFields key={row.id} row={row} index={index}
          remove={rows.length > 1 ? () => setRows((current) => current.filter((item) => item.id !== row.id)) : undefined} />)}
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setRows([...rows, { id: crypto.randomUUID() }])} className={button}>Adicionar regra</button>
          <button type="submit" className={button}>{saving ? "Salvando…" : "Salvar tabela"}</button>
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
  const isPorte = mode === "porte_procedure" || mode === "porte_duration";
  const byDuration = mode === "duration" || mode === "porte_duration";
  const field = (name: string) => `${row.id}-${name}`;

  return (
    <fieldset className="grid gap-3 rounded-xl border border-zinc-200 p-4 sm:grid-cols-2">
      <legend className="px-1 font-bold">Regra {index + 1}</legend>
      <label>Critério
        <select name={field("mode")} className={input} value={mode} onChange={(event) => setMode(event.target.value as Mode)}>
          <option value="procedure">Cirurgia específica</option>
          <option value="porte_procedure">Porte definido pela cirurgia</option>
          <option value="porte_duration">Porte definido pela duração</option>
          <option value="duration">Faixa de duração</option>
        </select>
      </label>
      <label>Valor (R$)
        <input name={field("amount")} inputMode="decimal"
          defaultValue={rule ? `${Math.floor(rule.amountCents / 100)},${String(rule.amountCents % 100).padStart(2, "0")}` : ""}
          placeholder="500,00" className={input} required />
      </label>
      {isPorte && <label>Porte
        <input name={field("label")} defaultValue={rule?.kind === "porte" ? rule.label : ""} className={input} required />
      </label>}
      {byDuration ? (
        <>
          <label>Acima de (min)
            <input name={field("aboveMinutes")} type="number" min={0} step={1} className={input} required
              defaultValue={initial?.kind === "duration" ? initial.aboveMinutes : 0} />
          </label>
          <label>Até (min, opcional)
            <input name={field("upToMinutes")} type="number" min={1} step={1} className={input}
              defaultValue={initial?.kind === "duration" ? initial.upToMinutes ?? "" : ""} />
          </label>
        </>
      ) : <label>Nome da cirurgia na ficha
        <input name={field("name")} defaultValue={initial?.kind === "procedure" ? initial.name : ""} className={input} required />
      </label>}
      {remove && <div className="sm:col-span-2"><button type="button" onClick={remove} className={button}>Remover regra {index + 1}</button></div>}
    </fieldset>
  );
}

function Feedback({ error, success }: { error?: string; success?: string }) {
  if (error) return <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>;
  if (success) return <p role="status" className="mt-3 text-sm text-emerald-700">{success}</p>;
  return null;
}

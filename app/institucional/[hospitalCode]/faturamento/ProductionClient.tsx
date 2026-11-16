import { useEffect, useRef, useState, type FormEvent } from "react";
import type { BillingRule } from "@/lib/institutional-billing";
import type { ProductionReport } from "@/lib/institutional-billing-production";
import { billingRequest } from "./billing-request";

type Filters = { from: string; to: string; plan: string; professional: string };

const panel = "rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm";
const input = "mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-950";
const button = "rounded-xl border border-zinc-200 px-3 py-2 text-sm font-bold hover:bg-zinc-50 disabled:opacity-40";
const integers = new Intl.NumberFormat("pt-BR");
const minutes = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
const bahiaDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Bahia", year: "numeric", month: "2-digit", day: "2-digit",
});

function dateLabel(value: string | null) {
  return value ? value.split("-").reverse().join("/") : "—";
}

function money(cents: number | string) {
  const amount = BigInt(cents);
  const scale = BigInt(100);
  return `R$ ${integers.format(amount / scale)},${String(amount % scale).padStart(2, "0")}`;
}

function ruleLabel(rule: BillingRule) {
  const match = rule.kind === "porte" ? rule.match : rule;
  const criterion = match.kind === "procedure" ? match.name
    : `Acima de ${match.aboveMinutes} min${match.upToMinutes === null ? "" : ` e até ${match.upToMinutes} min`}`;
  if (rule.kind === "porte") return `Porte ${rule.label} · ${criterion}`;
  return rule.kind === "procedure" ? `Cirurgia · ${criterion}` : criterion;
}

export default function ProductionClient({ hospitalCode, token }: { hospitalCode: string; token: string }) {
  const [today] = useState(() => bahiaDate.format(new Date()));
  const [report, setReport] = useState<ProductionReport | null>(null);
  const [submitted, setSubmitted] = useState<Filters | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const pendingRequest = useRef<AbortController | null>(null);

  useEffect(() => () => pendingRequest.current?.abort(), []);

  async function search(filters: Filters, page = 1) {
    pendingRequest.current?.abort();
    const controller = new AbortController();
    pendingRequest.current = controller;
    setLoading(true);
    setReport(null);
    setError("");
    setSubmitted(filters);
    try {
      const result = await billingRequest<ProductionReport>(
        `/api/pro/institucional/faturamento/${hospitalCode}/producao`, token, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...filters, page }),
          signal: controller.signal,
        },
      );
      if (!controller.signal.aborted) setReport(result);
    } catch (error) {
      if (!controller.signal.aborted) {
        setError(error instanceof Error ? error.message : "Não foi possível consultar a produção.");
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void search({
      from: String(form.get("from")),
      to: String(form.get("to")),
      plan: String(form.get("plan")).trim(),
      professional: String(form.get("professional")).trim(),
    });
  }

  return (
    <>
      <form onSubmit={submit} className={panel}>
        <fieldset className="grid items-end gap-3 text-sm font-semibold sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.2fr_auto]">
          <label>Data inicial<input name="from" type="date" className={input} defaultValue={today} required /></label>
          <label>Data final<input name="to" type="date" className={input} defaultValue={today} required /></label>
          <label>Plano<input name="plan" className={input} placeholder="Todos" maxLength={120} /></label>
          <label>Anestesista<input name="professional" className={input} placeholder="Nome ou CRM" maxLength={120} /></label>
          <button type="submit" className="rounded-xl bg-[#1a2718] px-4 py-2 font-bold text-white disabled:opacity-40" disabled={loading}>
            {loading ? "Buscando…" : "Buscar"}
          </button>
        </fieldset>
      </form>
      {loading && <p className={panel} role="status">Calculando a produção…</p>}
      {error && <p className={`${panel} text-red-700`} role="alert">{error}</p>}
      {report && <section className={panel} aria-label="Resultado da produção">
        <h2 className="text-xl font-black">{report.hospitalName}</h2>
        <dl className="mt-4 grid gap-4 rounded-xl bg-zinc-50 p-4 sm:grid-cols-3">
          <div><dt className="text-sm text-zinc-600">Total calculado</dt><dd className="text-lg font-black">{money(report.summary.totalCents)}</dd></div>
          <div><dt className="text-sm text-zinc-600">Fichas calculadas</dt><dd className="text-lg font-black">{report.summary.calculated}</dd></div>
          <div><dt className="text-sm text-zinc-600">Pendentes de revisão</dt><dd className="text-lg font-black">{report.summary.pending}</dd></div>
        </dl>
        {report.cases.length === 0 ? <p className="mt-4 text-zinc-600">Nenhuma ficha encontrada.</p> : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 text-zinc-700">
                <tr>{["Ficha", "Plano", "Anestesista", "Duração", "Regra e vigência", "Valor"].map((label) => (
                  <th key={label} scope="col" className="px-3 py-2">{label}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {report.cases.map((ficha) => (
                  <tr key={ficha.id} className="align-top">
                    <td className="px-3 py-3">
                      <p className="font-semibold">{ficha.procedure_name ?? "Cirurgia indisponível"}</p>
                      <p className="text-zinc-600">{dateLabel(ficha.procedure_date)}{ficha.record_number ? ` · Prontuário ${ficha.record_number}` : ""}</p>
                    </td>
                    <td className="px-3 py-3">{ficha.plan_name ?? "—"}</td>
                    <td className="px-3 py-3">{ficha.anesthesiologist_name ?? "—"}{ficha.crm && <p className="text-zinc-600">CRM {ficha.crm}</p>}</td>
                    <td className="whitespace-nowrap px-3 py-3">{ficha.durationMinutes === null ? "—" : `${minutes.format(ficha.durationMinutes)} min`}</td>
                    <td className="px-3 py-3">
                      {ficha.rule ? ruleLabel(ficha.rule) : ficha.pending}
                      {ficha.startsOn && <p className="text-zinc-600">Desde {dateLabel(ficha.startsOn)}</p>}
                    </td>
                    <td className={`px-3 py-3 font-bold ${ficha.amountCents === null ? "text-amber-800" : "whitespace-nowrap"}`}>
                      {ficha.amountCents === null ? "Pendente de revisão" : money(ficha.amountCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {submitted && report.lastPage > 1 && <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <button type="button" className={button} disabled={report.page <= 1} onClick={() => void search(submitted, report.page - 1)}>Anterior</button>
          <span>Página {report.page} de {report.lastPage}</span>
          <button type="button" className={button} disabled={report.page >= report.lastPage} onClick={() => void search(submitted, report.page + 1)}>Próxima</button>
        </div>}
      </section>}
    </>
  );
}

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { anesthesiaTechniques, billingRuleLabel, billingTimeZones } from "@/lib/institutional-billing";
import type { BillingReadReport, BillingVersionSelection } from "@/lib/institutional-billing-reading";
import { billingRequest, billingResponse, RequestError } from "./billing-request";

type Filters = { from: string; to: string; plan: string; professional: string; version?: BillingVersionSelection };

const panel = "min-w-0 rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6";
const input = "mt-2 min-h-11 w-full min-w-0 rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-900 outline-none transition hover:border-zinc-400 focus:border-[#b9963b] focus:ring-2 focus:ring-[#b9963b]/15";
const button = "min-h-11 rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm font-bold text-zinc-700 transition hover:border-[#b9963b]/50 hover:bg-[#fafaf7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b9963b] disabled:cursor-not-allowed disabled:opacity-40";
const integers = new Intl.NumberFormat("pt-BR");
const minutes = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
const bahiaDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Bahia", year: "numeric", month: "2-digit", day: "2-digit",
});

function dateLabel(value: string | null) {
  return value ? value.split("-").reverse().join("/") : "—";
}

function monthLabel(value: string) {
  return value.slice(0, 7).split("-").reverse().join("/");
}

function money(cents: number | string) {
  const signed = BigInt(cents);
  const amount = signed < 0 ? -signed : signed;
  const scale = BigInt(100);
  return `${signed < 0 ? "−" : ""}R$ ${integers.format(amount / scale)},${String(amount % scale).padStart(2, "0")}`;
}

function versionFilters(version: BillingVersionSelection): Filters {
  const lastDay = new Date(`${version.month}T00:00:00Z`);
  lastDay.setUTCMonth(lastDay.getUTCMonth() + 1, 0);
  return { from: version.month, to: lastDay.toISOString().slice(0, 10), plan: "", professional: "",
    version: { month: version.month, version: version.version } };
}

export default function ProductionClient({ hospitalCode, token, active = true, configurationVersion = 0, onAccessDenied, initialVersion }: {
  hospitalCode: string; token: string; active?: boolean; configurationVersion?: number; onAccessDenied?: (message: string) => void;
  initialVersion?: BillingVersionSelection;
}) {
  const [today] = useState(() => bahiaDate.format(new Date()));
  const [report, setReport] = useState<BillingReadReport | null>(null);
  const [submitted, setSubmitted] = useState<Filters | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copying, setCopying] = useState(false);
  const [reportKind, setReportKind] = useState<"summary" | "detail">("detail");
  const [downloading, setDownloading] = useState<"pdf" | "xlsx" | null>(null);
  const [copyFeedback, setCopyFeedback] = useState("");
  const pendingRequest = useRef<AbortController | null>(null);
  const copyRequest = useRef<AbortController | null>(null);
  const downloadRequest = useRef<AbortController | null>(null);
  const requestedVersion = useRef(configurationVersion);
  const openedVersion = useRef(false);

  useEffect(() => () => {
    pendingRequest.current?.abort();
    copyRequest.current?.abort();
    downloadRequest.current?.abort();
  }, []);

  const search = useCallback(async (filters: Filters, page = 1) => {
    pendingRequest.current?.abort();
    copyRequest.current?.abort();
    downloadRequest.current?.abort();
    setCopying(false);
    setDownloading(null);
    setCopyFeedback("");
    const controller = new AbortController();
    requestedVersion.current = configurationVersion;
    pendingRequest.current = controller;
    setLoading(true);
    setReport(null);
    setError("");
    setSubmitted(filters);
    try {
      const result = await billingRequest<BillingReadReport>(
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
        if (error instanceof RequestError && (error.status === 401 || error.status === 403)) onAccessDenied?.(error.message);
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [hospitalCode, token, configurationVersion, onAccessDenied]);

  useEffect(() => {
    if (active && submitted && requestedVersion.current !== configurationVersion) void search(submitted);
  }, [active, submitted, configurationVersion, search]);

  useEffect(() => {
    if (!initialVersion || openedVersion.current) return;
    const result = search(versionFilters(initialVersion));
    const controller = pendingRequest.current;
    void result.then(() => { if (!controller?.signal.aborted) openedVersion.current = true; });
  }, [initialVersion, search]);

  async function copySpreadsheet() {
    if (!submitted || copying) return;
    const controller = new AbortController();
    copyRequest.current = controller;
    setCopying(true);
    setCopyFeedback("");
    setError("");
    try {
      const content = billingRequest<{ spreadsheet: string; count: number }>(
        `/api/pro/institucional/faturamento/${hospitalCode}/producao`, token, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...submitted, exportAll: true }), signal: controller.signal,
        },
      ).then((result) => {
        if (controller.signal.aborted) throw new DOMException("Busca cancelada", "AbortError");
        return result;
      });
      let result: { spreadsheet: string; count: number };
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
        // Safari exige iniciar a escrita no mesmo gesto do clique.
        const item = new ClipboardItem({ "text/plain": content.then((data) => new Blob([data.spreadsheet], { type: "text/plain" })) });
        [result] = await Promise.all([content, navigator.clipboard.write([item])]);
      } else {
        result = await content;
        await navigator.clipboard.writeText(result.spreadsheet);
      }
      if (!controller.signal.aborted) setCopyFeedback(`${result.count} ficha(s) copiadas com os filtros da busca, incluindo todas as páginas.`);
    } catch (error) {
      if (!controller.signal.aborted) {
        setError(error instanceof Error ? error.message : "Não foi possível copiar. Tente novamente.");
        if (error instanceof RequestError && (error.status === 401 || error.status === 403)) {
          setReport(null);
          onAccessDenied?.(error.message);
        }
      }
    } finally {
      if (!controller.signal.aborted) setCopying(false);
    }
  }

  async function downloadReport(format: "pdf" | "xlsx") {
    if (!submitted || !report || downloading || submitted.from.slice(0, 7) !== submitted.to.slice(0, 7)) return;
    const controller = new AbortController();
    downloadRequest.current = controller;
    setDownloading(format);
    setError("");
    try {
      const response = await billingResponse(`/api/pro/institucional/faturamento/${hospitalCode}/producao`, token, {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal,
        body: JSON.stringify({ ...submitted, report: { kind: reportKind, format, version: report.versionDetails?.version ?? null } }),
      });
      const blob = await response.blob();
      if (controller.signal.aborted) return;
      const name = response.headers.get("Content-Disposition")?.match(/filename="([a-z0-9_.-]+)"/i)?.[1];
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = name ?? `faturamento.${format}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      // Safari precisa manter a URL até que o navegador tenha iniciado a leitura.
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (caught) {
      if (!controller.signal.aborted) {
        setError(caught instanceof Error ? caught.message : "Não foi possível baixar o demonstrativo.");
        if (caught instanceof RequestError && (caught.status === 401 || caught.status === 403)) {
          setReport(null);
          onAccessDenied?.(caught.message);
        }
      }
    } finally {
      if (!controller.signal.aborted) setDownloading(null);
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
        <fieldset className="grid min-w-0 items-end gap-4 text-sm font-bold text-zinc-700 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1.2fr_auto]">
          <label>Data inicial<input name="from" type="date" className={input} defaultValue={initialVersion?.month ?? today} required /></label>
          <label>Data final<input name="to" type="date" className={input} defaultValue={initialVersion ? versionFilters(initialVersion).to : today} required /></label>
          <label>Plano<input name="plan" className={input} placeholder="Todos" maxLength={120} /></label>
          <label>Anestesista<input name="professional" className={input} placeholder="Nome ou CRM" maxLength={120} /></label>
          <button type="submit" className="min-h-12 rounded-2xl bg-[#1a2718] px-5 py-3 font-bold text-white shadow-md shadow-[#1a2718]/15 transition hover:bg-[#22331d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b9963b] disabled:cursor-not-allowed disabled:opacity-40" disabled={loading}>
            {loading ? "Buscando…" : "Buscar produção"}
          </button>
        </fieldset>
      </form>
      {loading && <p className={`${panel} py-10 text-center text-sm text-[#506047]`} role="status">Consultando a produção…</p>}
      {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">{error}</p>}
      {!submitted && <section className={`${panel} py-12 text-center sm:py-14`}>
        <h2 className="text-lg font-bold">Busque a produção do hospital</h2>
        <p className="mt-2 text-sm text-zinc-500">Escolha o período e os filtros para conferir as fichas e os valores.</p>
      </section>}
      {report && <section className={panel} aria-label="Resultado da produção">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-black tracking-tight sm:text-2xl">{report.hospitalName}</h2>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          {submitted && <button type="button" className={button} onClick={() => void search(submitted, report.page)}>Atualizar</button>}
          {report.cases.length > 0 && <button type="button" className="min-h-11 w-full rounded-2xl bg-[#1a2718] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#22331d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b9963b] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto" disabled={copying}
            onClick={() => void copySpreadsheet()}>{copying ? "Preparando…" : "Copiar linhas para planilha"}</button>}
          </div>
        </div>
        {report.hasExpired && <p className="mt-4 text-sm text-zinc-600">A consulta inclui um período expirado, sem acesso aos seus dados financeiros.</p>}
        {submitted && report.competences.some((competence) => competence.state === "closed") && (
          <fieldset className="mt-4 flex flex-wrap gap-4">
            <legend className="text-sm font-bold text-zinc-800">Histórico de versões</legend>
            {report.competences.filter((competence) => competence.state === "closed").map(({ month, version, latestVersion }) => (
              <label key={month} className="min-w-44 text-sm font-semibold text-zinc-700">
                Competência {monthLabel(month)}
                <select className={input} value={submitted.version?.month === month ? version : ""}
                  onChange={(event) => {
                    const selected = event.currentTarget.value;
                    void search({ ...submitted, version: selected ? { month, version: Number(selected) } : undefined });
                  }}>
                  <option value="">Última versão (v{latestVersion})</option>
                  {Array.from({ length: latestVersion }, (_, index) => (
                    <option key={index + 1} value={index + 1}>Versão {index + 1}</option>
                  ))}
                </select>
              </label>
            ))}
          </fieldset>
        )}
        {report.versionDetails && <section className="mt-4 rounded-2xl border border-zinc-200 p-4 text-sm text-zinc-700" aria-label="Dados da versão financeira">
          {report.versionDetails.closedAt && <p>Confirmada em {new Intl.DateTimeFormat("pt-BR", {
            timeZone: "America/Bahia", dateStyle: "short", timeStyle: "short",
          }).format(new Date(report.versionDetails.closedAt))}</p>}
          {report.versionDetails.closedBy && <p>Responsável (ID) {report.versionDetails.closedBy}</p>}
          {report.versionDetails.previousTotalCents !== null && report.versionDetails.deltaCents !== null && <p>
            Total da v{report.versionDetails.baseVersion} no mesmo recorte {money(report.versionDetails.previousTotalCents)}
            {" · Diferença "}{money(report.versionDetails.deltaCents)}
          </p>}
          {report.versionDetails.reason && <p>Justificativa da retificação: {report.versionDetails.reason}</p>}
        </section>}
        {submitted && !report.hasExpired && (submitted.from.slice(0, 7) === submitted.to.slice(0, 7)
          ? <fieldset className="mt-4 flex flex-wrap items-end gap-3 rounded-2xl border border-zinc-200 p-4">
            <legend className="px-2 text-sm font-bold text-zinc-800">Demonstrativo {report.versionDetails
              ? `definitivo · v${report.versionDetails.version}` : "preliminar"}</legend>
            <label className="min-w-36 text-sm font-bold text-zinc-700">Tipo de demonstrativo
              <select className={input} value={reportKind} disabled={downloading !== null}
                onChange={(event) => setReportKind(event.target.value === "summary" ? "summary" : "detail")}>
                <option value="detail">Analítico</option>
                <option value="summary">Sintético</option>
              </select>
            </label>
            <button type="button" className={button} disabled={downloading !== null} onClick={() => void downloadReport("pdf")}>
              {downloading === "pdf" ? "Gerando PDF…" : "Baixar PDF"}
            </button>
            <button type="button" className={button} disabled={downloading !== null} onClick={() => void downloadReport("xlsx")}>
              {downloading === "xlsx" ? "Gerando Excel…" : "Baixar Excel (.xlsx)"}
            </button>
          </fieldset>
          : <p className="mt-4 text-sm text-zinc-600">Selecione datas de uma única competência para baixar o demonstrativo.</p>)}
        {copyFeedback && <p role="status" className="mt-4 rounded-2xl border border-[#7a865f]/25 bg-[#f6f7f1] px-4 py-3 text-sm text-[#506047]">{copyFeedback}</p>}
        <dl className="my-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-[#7a865f]/25 bg-[#f6f7f1] p-5">
            <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#506047]">Total da consulta</dt>
            <dd className="mt-2 break-words text-3xl font-black tracking-tight text-[#1a2718]">{money(report.summary.totalCents)}</dd>
          </div>
          <div className="rounded-3xl border border-zinc-200 bg-white p-5">
            <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500">Fichas com valor</dt>
            <dd className="mt-2 text-3xl font-black">{report.summary.calculated}</dd>
          </div>
          <div className="rounded-3xl border border-zinc-200 bg-white p-5">
            <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500">Pendentes de revisão</dt>
            <dd className="mt-2 text-3xl font-black text-amber-700">{report.summary.pending}</dd>
            {report.excluded > 0 && <dd className="mt-1 text-xs text-zinc-600">Fichas excluídas: {report.excluded}</dd>}
          </div>
        </dl>
        {report.cases.length === 0 ? <p className="py-10 text-center text-sm text-zinc-500">Nenhuma ficha encontrada para os filtros escolhidos.</p> : (
          <div role="region" aria-label="Tabela da produção" tabIndex={0} className="overflow-x-auto rounded-2xl border border-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b9963b]">
            <table className="w-full min-w-[1120px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50/80 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                <tr>{["Ficha", "Plano", "Anestesista", "Técnica e turno", "Duração", "Regra e vigência", "Valor"].map((label) => (
                  <th key={label} scope="col" className="px-4 py-4 last:text-right">{label}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {report.cases.map((ficha, index) => (
                  <tr key={`${ficha.id}:${index}`} className="align-top transition-colors hover:bg-[#fafaf7]">
                    <td className="px-4 py-4">
                      <p className="font-bold text-zinc-950">{ficha.procedure_name ?? "Cirurgia indisponível"}</p>
                      {ficha.patient_name && <p className="mt-1">{ficha.patient_name}</p>}
                      <p className="mt-1 text-xs text-zinc-500">{dateLabel(ficha.procedure_date)}{ficha.record_number ? ` · Prontuário ${ficha.record_number}` : ""}</p>
                      <p className="mt-1 text-xs font-semibold text-zinc-600">{ficha.version === null ? "Preliminar" : `Fechada · v${ficha.version}`}</p>
                    </td>
                    <td className="px-4 py-4"><span className="inline-block rounded-full border border-[#b9963b]/20 bg-[#f6f7f1] px-3 py-1 text-xs font-bold text-[#506047]">{ficha.plan_name ?? "—"}</span></td>
                    <td className="px-4 py-4">{ficha.anesthesiologist_name ?? "—"}{ficha.crm && <p className="text-zinc-600">CRM {ficha.crm}</p>}</td>
                    <td className="px-4 py-4">
                      {ficha.version === null ? <>
                        <p>{ficha.technique ? anesthesiaTechniques[ficha.technique] : "Técnica não identificada"}</p>
                        {ficha.anesthesia_type && <p className="text-xs text-zinc-600">Na ficha · {ficha.anesthesia_type}</p>}
                        <p className="text-zinc-600">{[ficha.weekday, ficha.shift].filter(Boolean).join(" · ") || "Horário indisponível"}</p>
                        <p className="text-xs text-zinc-600">{billingTimeZones[ficha.timeZone] ?? ficha.timeZone}</p>
                      </> : <p>{ficha.anesthesia_type ?? "—"}</p>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      {ficha.durationMinutes === null ? "—" : `${minutes.format(ficha.durationMinutes)} min`}
                      {ficha.billedMinutes !== null && ficha.billedMinutes !== ficha.durationMinutes
                        && <p className="text-xs text-zinc-600">Cálculo · {minutes.format(ficha.billedMinutes)} min</p>}
                    </td>
                    <td className="px-4 py-4">
                      <p className={ficha.pending ? "text-amber-800" : "text-zinc-700"}>
                        {ficha.exclusionReason ?? ficha.ruleLabel
                          ?? (ficha.rule ? billingRuleLabel(ficha.rule) : ficha.pending ?? ficha.publication?.ruleLabel ?? "—")}
                      </p>
                      {ficha.startsOn && <p className="text-zinc-600">Desde {dateLabel(ficha.startsOn)}</p>}
                      {ficha.publication && <p className="text-zinc-600">Publicação v{ficha.publication.version}</p>}
                    </td>
                    <td className={`px-4 py-4 text-right font-bold ${ficha.amountCents === null ? "text-amber-800" : "whitespace-nowrap text-[#1a2718]"}`}>
                      {ficha.amountCents === null
                        ? <span className="inline-block rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs">{ficha.exclusionReason ? "Excluída da versão" : "Pendente de revisão"}</span>
                        : <span className="text-base">{money(ficha.amountCents)}</span>}
                      {ficha.additions.length > 0 && <div className="mt-1 text-xs font-normal text-zinc-600">
                        <p>Base · {money(ficha.baseAmountCents!)}</p>
                        {ficha.additions.map((item) => <p key={item.label}>{item.label} · +{money(item.amountCents)}</p>)}
                      </div>}
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

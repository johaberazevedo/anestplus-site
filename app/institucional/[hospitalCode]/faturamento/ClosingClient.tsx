import { useEffect, useImperativeHandle, useRef, useState, type FormEvent, type Ref } from "react";
import type { ClosingChoice } from "@/lib/institutional-billing-closing";
import { closingItemKey, type ClosingItemView, type ClosingView } from "@/lib/institutional-billing-closing-view";
import { billingRequest, RequestError } from "./billing-request";

const panel = "min-w-0 rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6";
const field = "mt-1 min-h-10 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#b9963b] focus:ring-2 focus:ring-[#b9963b]/15";
const action = "min-h-11 rounded-xl border border-zinc-300 px-4 py-2 text-sm font-bold text-zinc-700 hover:bg-[#fafaf7] focus-visible:outline-2 focus-visible:outline-[#b9963b] disabled:opacity-45";
const primary = "min-h-11 rounded-xl bg-[#1a2718] px-4 py-2 text-sm font-bold text-white hover:bg-[#22331d] focus-visible:outline-2 focus-visible:outline-[#b9963b] disabled:opacity-45";
const integers = new Intl.NumberFormat("pt-BR");
const bahia = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bahia", year: "numeric", month: "2-digit", day: "2-digit" });
const pageSize = 25;

function lastMonth() {
  const current = new Date(bahia.format(new Date()).slice(0, 7) + "-01T00:00:00Z");
  current.setUTCMonth(current.getUTCMonth() - 1);
  return current.toISOString().slice(0, 7);
}

function money(cents: number | string | null) {
  if (cents === null) return "—";
  const signed = BigInt(cents);
  const amount = signed < 0 ? -signed : signed;
  return `${signed < 0 ? "−" : ""}R$ ${integers.format(amount / BigInt(100))},${String(amount % BigInt(100)).padStart(2, "0")}`;
}

const dateLabel = (value: string | null) => value?.split("-").reverse().join("/") ?? "—";
const monthLabel = (value: string) => value.slice(0, 7).split("-").reverse().join("/");
type Action = "load" | "rectify" | "review" | "confirm";
type Correction = NonNullable<ClosingChoice["correction"]>;

function ReviewRow({ row, choice, plans, rectifying, update }: {
  row: ClosingItemView; choice: ClosingChoice; plans: string[]; rectifying: boolean; update: (choice: ClosingChoice) => void;
}) {
  const correction = choice.correction;
  const frozen = Boolean(row.previous?.included && !choice.recalculate && !choice.correction);
  const late = rectifying && !row.previous;
  const displayPlan = correction?.plan_name ?? row.appliedPlan ?? row.originalPlan ?? "Plano ausente";
  function revise(fieldName: keyof Correction, value: string) {
    const changed: Correction = { reason: "", ...correction, [fieldName]: value || undefined };
    if (fieldName === "plan_name") delete changed.classification_id;
    update({ ...choice, correction: changed.plan_name || changed.classification_id
      ? { ...changed, reason: changed.reason ?? "" } : undefined });
  }
  const classifications = correction?.plan_name && correction.plan_name !== row.appliedPlan ? [] : row.classifications;
  return <article className="min-w-0 rounded-2xl border border-zinc-200 p-4">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 className="font-bold text-zinc-900">{row.procedure ?? "Procedimento sem nome"}</h3>
        <p className="mt-1 text-xs text-zinc-600">{dateLabel(row.date)}{row.professional && ` · ${row.professional}`}{row.recordNumber && ` · Prontuário ${row.recordNumber}`}</p>
        <p className="mt-1 text-sm text-zinc-700">{displayPlan}{row.classification && ` · ${row.classification}`}</p>
        {row.rule && <p className="mt-1 text-xs text-zinc-600">{row.rule}{row.startsOn && ` · desde ${dateLabel(row.startsOn)}`}
          {row.publicationVersion !== null && ` · publicação v${row.publicationVersion}`}</p>}
      </div>
      <p className="text-right font-bold text-[#1a2718]">{choice.included ? money(row.amountCents)
        : late && !choice.exclusion_reason?.trim() ? "A decidir" : "Excluída da medição"}</p>
    </div>
    {rectifying && <p className="mt-2 text-xs font-semibold text-zinc-600">
      {late ? "Ficha tardia" : row.previous?.included ? `Na versão anterior: ${money(row.previous.amountCents)}` : "Excluída na versão anterior"}
      {row.changed && !late && " · Alteração na prévia"}
    </p>}
    {row.blocker && <p className="mt-2 text-sm font-medium text-amber-800">{row.blocker}</p>}
    <label className="mt-3 flex min-h-9 items-center gap-2 text-sm font-bold text-zinc-700">
      <input type="checkbox" checked={late ? choice.included : !choice.included} onChange={(event) => update({
        ...choice, included: late ? event.target.checked : !event.target.checked,
        exclusion_reason: null, correction: undefined, recalculate: undefined,
      })} /> {late ? "Incluir ficha tardia na medição" : "Excluir da medição"}
    </label>
    {row.previous?.included && choice.included && <label className="mb-2 flex min-h-9 items-center gap-2 text-sm font-medium text-zinc-700">
      <input type="checkbox" checked={Boolean(choice.recalculate || correction)} onChange={(event) => update({
        ...choice, recalculate: event.target.checked || undefined, correction: event.target.checked ? correction : undefined,
      })} /> Recalcular este item pelas regras vigentes na data da cirurgia
    </label>}
    {frozen && choice.included ? <p className="mt-2 text-xs text-zinc-600">Valor e regra preservados da versão anterior.</p>
      : choice.included ? <details className="rounded-xl border border-zinc-200 px-3 py-2">
      <summary className="cursor-pointer text-sm font-bold text-[#506047]">Ajustar enquadramento financeiro</summary>
      <div className="mt-2 grid gap-3 text-sm font-medium sm:grid-cols-2">
        <label>Plano usado no cálculo
          <select className={field} value={correction?.plan_name ?? ""} onChange={(event) => revise("plan_name", event.target.value)}>
            <option value="">Plano informado na ficha</option>
            {[...new Set(plans)].map((plan) => <option key={plan} value={plan}>{plan}</option>)}
          </select>
        </label>
        <label>Classificação financeira
          <select className={field} value={correction?.classification_id ?? ""} disabled={classifications.length === 0}
            onChange={(event) => revise("classification_id", event.target.value)}>
            <option value="">Classificação das regras</option>
            {classifications.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
          </select>
        </label>
        {correction && <label className="sm:col-span-2">Justificativa da correção
          <textarea className={field} rows={2} maxLength={1000} value={correction.reason}
            onChange={(event) => revise("reason", event.target.value)} />
        </label>}
        {correction?.plan_name && correction.plan_name !== row.appliedPlan &&
          <p className="text-xs text-zinc-600 sm:col-span-2">Atualize a prévia para ver as classificações da tabela desse plano.</p>}
      </div>
    </details> : <label className="block text-sm font-bold text-zinc-700">Justificativa da exclusão
      <textarea className={field} rows={2} maxLength={1000} value={choice.exclusion_reason ?? ""}
        onChange={(event) => update({ ...choice, exclusion_reason: event.target.value })} />
    </label>}
  </article>;
}

export type ClosingNavigation = { canLeave: () => boolean };

export default function ClosingClient({ ref, hospitalCode, token, initialMonth, onAccessDenied, onViewVersion, onConfirmed }: {
  ref?: Ref<ClosingNavigation>; initialMonth?: string; onConfirmed?: () => void;
  hospitalCode: string; token: string; onAccessDenied: (message: string) => void; onViewVersion: (month: string, version: number) => void;
}) {
  const [month, setMonth] = useState(() => initialMonth?.slice(0, 7) ?? lastMonth());
  const [view, setView] = useState<ClosingView | null>(null);
  const [choices, setChoices] = useState<ClosingChoice[]>([]);
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState<Action | null>(null);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [reason, setReason] = useState("");
  const [uncertain, setUncertain] = useState(false);
  const [requiresReload, setRequiresReload] = useState(false);
  const pending = useRef<AbortController | null>(null);
  useEffect(() => () => pending.current?.abort(), []);
  useImperativeHandle(ref, () => ({
    canLeave() {
      if (pending.current || uncertain) return false;
      return view?.kind !== "review" || window.confirm("Ao sair da conferência, as decisões ainda não confirmadas serão descartadas. Continuar?");
    },
  }), [uncertain, view]);

  async function send(action: Action) {
    if (pending.current) return;
    const draft = view?.kind === "review" ? view : null;
    if (action === "review" && (!draft?.basis || requiresReload || uncertain)) return;
    if (action === "rectify" && view?.kind !== "completed") return;
    if (action === "confirm" && (!draft?.receipt || dirty || requiresReload)) return;
    const controller = new AbortController();
    pending.current = controller;
    setBusy(action);
    setError("");
    if (action === "load") {
      setView(null);
      setChoices([]);
      setPage(1);
      setReason("");
      setDirty(false);
      setUncertain(false);
      setRequiresReload(false);
    }
    try {
      const result = await billingRequest<ClosingView>(`/api/pro/institucional/faturamento/${hospitalCode}/fechamento`, token, {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal,
        body: JSON.stringify({ action, month: action === "load" ? `${month}-01` : view?.month,
          ...(action === "rectify" && view?.kind === "completed" ? { baseVersion: view.version } : {}),
          ...(action === "review" ? { choices, basis: draft?.basis, reason } : {}),
          ...(action === "confirm" ? { receipt: draft?.receipt } : {}),
        }),
      });
      if (controller.signal.aborted) return;
      setView(result);
      setChoices(result.kind === "review" ? result.choices : []);
      setReason(result.kind === "review" ? result.rectification?.reason ?? "" : "");
      setDirty(false);
      setUncertain(false);
      if (action === "confirm" && result.kind === "completed") onConfirmed?.();
    } catch (caught) {
      if (controller.signal.aborted) return;
      if (caught instanceof RequestError && (caught.status === 401 || caught.status === 403)) {
        onAccessDenied(caught.message);
        return;
      }
      const needsReload = caught instanceof RequestError && (caught.status === 409 || caught.status === 410);
      if (needsReload) setRequiresReload(true);
      const possiblyClosed = action === "confirm" && (!(caught instanceof RequestError) || caught.status >= 500);
      setUncertain(possiblyClosed);
      setError(possiblyClosed ? "A resposta da confirmação não chegou. Use a mesma confirmação para verificar o resultado."
        : caught instanceof Error ? caught.message : "Não foi possível consultar a competência.");
    } finally {
      if (pending.current === controller) pending.current = null;
      if (!controller.signal.aborted) setBusy(null);
    }
  }

  function update(index: number, choice: ClosingChoice) {
    setChoices((items) => items.map((item, i) => i === index ? choice : item));
    setDirty(true);
  }

  function openMonth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send("load");
  }

  const draft = view?.kind === "review" ? view : null;
  const rectification = draft?.rectification;
  return <div className="space-y-5">
    <section className={panel}>
      <h2 className="text-xl font-bold text-zinc-950">Fechamento da competência</h2>
      <form onSubmit={openMonth} className="mt-4 flex flex-wrap items-end gap-3">
        <label className="text-sm font-bold text-zinc-700">Competência
          <input className={field} type="month" value={month} max={bahia.format(new Date()).slice(0, 7)} required
            onChange={(event) => { setMonth(event.target.value); setView(null); setChoices([]); setDirty(false); setError(""); }}
            disabled={busy !== null || uncertain} />
        </label>
        <button className={action} type="submit" disabled={busy !== null || uncertain}>
          {busy === "load" ? "Carregando…" : requiresReload ? "Recarregar competência" : "Carregar competência"}
        </button>
      </form>
    </section>
    {error && <p className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm font-medium text-amber-950" role="alert">{error}</p>}
    {view?.kind === "completed" && <section className={panel}>
      <h2 className="text-lg font-bold text-[#1a2718]" role="status">Competência {monthLabel(view.month)} fechada · versão {view.version}</h2>
      {view.recovered && <p className="mt-2 text-sm text-zinc-700">A confirmação anterior foi recuperada.</p>}
      {view.totalCents !== null && <p className="mt-2 font-bold text-zinc-900">Total da versão {money(view.totalCents)}</p>}
      {view.reason && <p className="mt-2 text-sm text-zinc-700">Justificativa da retificação: {view.reason}</p>}
      <div className="mt-4 flex flex-wrap gap-3">
        <button className={primary} type="button" onClick={() => onViewVersion(view.month, view.version)}>
          Ver versão {view.version} na produção
        </button>
        <button className={action} type="button" disabled={busy !== null || requiresReload} onClick={() => void send("rectify")}>
          {busy === "rectify" ? "Carregando…" : "Retificar competência"}
        </button>
      </div>
    </section>}
    {draft && <section className={panel}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-zinc-950">{rectification ? "Retificação" : "Conferência"} de {monthLabel(draft.month)}</h2>
          <p className="mt-1 text-sm text-zinc-600">{draft.ended ? "As decisões desta conferência ficam nesta tela até a confirmação."
            : "Competência em andamento. O fechamento fica disponível a partir do mês seguinte, no horário da Bahia."}</p>
        </div>
        <div className="rounded-xl bg-[#f6f7f1] px-4 py-3 text-sm text-[#1a2718]">
          <p>{dirty ? "Total da última prévia" : "Total preliminar"} <strong>{money(draft.summary.totalCents)}</strong></p>
          {rectification && <p className="text-xs">Versão {rectification.baseVersion}: {money(rectification.previousTotalCents)}
            {" · Diferença na última prévia: "}{money(rectification.deltaCents)}{" · "}{rectification.changed} alteração(ões)</p>}
          <p className="text-xs">{draft.summary.included} com valor · {draft.summary.excluded} excluídas · {draft.summary.pending} pendentes</p>
        </div>
      </div>
      {!draft.rows.length ? <p className="mt-4 text-sm text-zinc-600">Nenhuma ficha disponível nesta competência.</p> : <>
        {dirty && <p className="mt-4 text-sm text-amber-800" role="status">Atualize a prévia para aplicar as decisões da conferência.</p>}
        <fieldset className="mt-4 space-y-3" disabled={busy !== null || uncertain || requiresReload} aria-label="Decisões financeiras">
          {rectification && <label className="block text-sm font-bold text-zinc-700">Justificativa da retificação
            <textarea className={field} rows={2} value={reason} maxLength={1000}
              onChange={(event) => { setReason(event.target.value); setDirty(true); }} />
          </label>}
          {draft.rows.slice((page - 1) * pageSize, page * pageSize).map((row, offset) => {
            const index = (page - 1) * pageSize + offset;
            return <ReviewRow key={closingItemKey(row.userId, row.documentId)} row={row} choice={choices[index]}
              plans={draft.plans} rectifying={Boolean(rectification)} update={(choice) => update(index, choice)} />;
          })}
          {draft.rows.length > pageSize && <div className="flex flex-wrap items-center gap-3 text-sm">
            <button type="button" className={action} disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</button>
            <span>Página {page} de {Math.ceil(draft.rows.length / pageSize)}</span>
            <button type="button" className={action} disabled={page * pageSize >= draft.rows.length} onClick={() => setPage(page + 1)}>Próxima</button>
          </div>}
        </fieldset>
        {rectification && !dirty && !draft.receipt && <p className="mt-4 text-sm text-zinc-700">
          Informe a justificativa, resolva as pendências e revise pelo menos uma alteração para confirmar.
        </p>}
        <div className="mt-5 flex flex-wrap gap-3">
          <button className={action} type="button" disabled={busy !== null || uncertain || requiresReload} onClick={() => void send("review")}>
            {busy === "review" ? "Calculando…" : "Atualizar prévia"}
          </button>
          {draft.receipt && !dirty && !requiresReload && <button className={primary} type="button" disabled={busy !== null}
            onClick={() => void send("confirm")}>
            {busy === "confirm" ? "Confirmando…" : uncertain ? "Verificar ou repetir confirmação" : rectification
              ? `Confirmar retificação da versão ${rectification.baseVersion + 1}` : "Confirmar fechamento da versão 1"}
          </button>}
        </div>
      </>}
    </section>}
  </div>;
}

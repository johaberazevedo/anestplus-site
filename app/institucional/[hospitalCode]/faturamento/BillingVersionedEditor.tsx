"use client";

import { useEffect, useRef, useState } from "react";
import type { BillingDraftPreview } from "@/app/api/pro/institucional/faturamento/[hospitalCode]/previa/route";
import { anesthesiaTechniques, billingRuleLabel, billingTimeZones, parseBillingConfiguration, type BillingPlan } from "@/lib/institutional-billing";
import type { BillingPublication, BillingPublicationPage } from "@/lib/institutional-billing-publication-rpc";
import { validateBillingRevisionV2, type BillingConfigurationIssueV2, type BillingRevisionV2 } from "@/lib/institutional-billing-rules-v2";
import { billingRequest, RequestError } from "./billing-request";
import BillingVersionedRules, { fieldLabel, type BillingFormStyles } from "./BillingVersionedRules";

type PublishIntent = { configuration: BillingRevisionV2; planId: string | null; expectedVersion: number; reason: string | null };
const bahiaDate = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bahia", year: "numeric", month: "2-digit", day: "2-digit" });
const dateTime = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Bahia", dateStyle: "short", timeStyle: "short" });
const integers = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const label = "block text-sm font-bold text-zinc-700";
const card = "rounded-2xl border border-zinc-200 p-4";

function dateLabel(date: string | null) {
  return date ? date.split("-").reverse().join("/") : "—";
}

function money(value: string | number | null) {
  if (value === null) return "Pendente";
  const cents = BigInt(value);
  return `R$ ${integers.format(cents / BigInt(100))},${String(cents % BigInt(100)).padStart(2, "0")}`;
}

function emptyDraft(hospitalCode: string): BillingRevisionV2 {
  return { schemaVersion: 2, hospitalCode, revisionId: crypto.randomUUID(), startsOn: bahiaDate.format(new Date()), planName: null,
    durationRounding: "exact", timeZone: "America/Bahia", nightStart: "19:00", nightEnd: "07:00", additionMode: "cumulative",
    marks: [], tiers: [], classifications: [], markRules: [], tierRules: [], classificationRules: [], priceRules: [], additionalRules: [] };
}

function draftForReview(draft: BillingRevisionV2): BillingRevisionV2 {
  // Linhas em branco de listas de texto não são opções de correspondência.
  const clean = <T extends { when: BillingRevisionV2["priceRules"][number]["when"] }>(rules: T[]) => rules.map((rule) => {
    const when = { ...rule.when };
    if (when.procedure) when.procedure = when.procedure.filter((text) => text.trim());
    if (when.plan) when.plan = when.plan.filter((text) => text.trim());
    return { ...rule, when };
  });
  return { ...draft, markRules: clean(draft.markRules), tierRules: clean(draft.tierRules), classificationRules: clean(draft.classificationRules),
    priceRules: clean(draft.priceRules), additionalRules: clean(draft.additionalRules) };
}

function Preview({ result }: { result: BillingDraftPreview }) {
  return <div className="space-y-3" aria-live="polite">
    <h4 className="font-bold text-zinc-950">Resultado da prévia</h4>
    <p className="text-sm text-zinc-700">{result.summary.calculated} calculadas · {result.summary.pending} pendentes · {money(result.summary.totalCents)} na amostra</p>
    {result.sampleLimited && <p className="text-sm text-zinc-600">Amostra limitada aos 20 procedimentos mais recentes.</p>}
    {!result.items.length && <p className="text-sm text-zinc-600">Nenhum procedimento disponível nessa competência.</p>}
    {result.items.map((item, index) => <div className={card} key={index}>
      <p className="font-bold text-zinc-950">{item.facts.procedure ?? "Procedimento sem nome"}</p>
      <p className="mb-2 text-sm text-zinc-600">{dateLabel(item.facts.procedureDate)} · {item.facts.plan ?? "Plano ausente"}</p>
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div><dt>Cálculo em uso</dt>
          <dd className="font-bold">{money(item.currentAmountCents)}</dd>{item.currentPending && <dd>{item.currentPending}</dd>}</div>
        <div><dt>Prévia da configuração</dt><dd className="font-bold">{money(item.amountCents)}</dd>{item.pending && <dd>{item.pending.message}</dd>}</div>
      </dl>
      <details className="mt-3 text-sm text-zinc-700">
        <summary className="cursor-pointer font-bold">Memória de cálculo</summary>
        <div className="mt-2 space-y-2">
          <p>Vigência {dateLabel(item.revision?.startsOn ?? null)} · {item.revision?.planName ?? "Tabela geral ou sem revisão"}</p>
          <p>{item.tier?.label ? `Porte ${item.tier.label} · ` : ""}{item.classification?.label ?? "Sem classificação"}</p>
          {item.marks.length > 0 && <p>Marcações {item.marks.map(({ label }) => label).join(", ")}</p>}
          {item.priceRule && <p>{item.priceRule.label} · base {money(item.baseAmountCents)}</p>}
          {item.additions.map((entry) => <p key={entry.id}>{entry.label} · {money(entry.amountCents)}</p>)}
          {item.rules.length > 0 && <ul className="list-disc pl-5">
            {item.rules.map((rule) => <li key={`${rule.stage}:${rule.ruleId}`}>
              {rule.label} · {rule.applied ? "Aplicada" : rule.status === "insufficient" ? "Dados insuficientes" : rule.status === "matched" ? "Correspondente" : "Incompatível"}
              {rule.candidateAmountCents !== undefined && ` · ${money(rule.candidateAmountCents)}`}
              {rule.conditions.length > 0 && <span className="block text-xs text-zinc-600">{rule.conditions.map((condition) => {
                const expected = "aboveMinutes" in condition.expected
                  ? `acima de ${condition.expected.aboveMinutes} min${condition.expected.upToMinutes === null ? "" : ` até ${condition.expected.upToMinutes} min`}`
                  : condition.expected.join(" ou ");
                return `${fieldLabel[condition.field]} ${expected}`;
              }).join(" · ")}</span>}
            </li>)}
          </ul>}
        </div>
      </details>
    </div>)}
  </div>;
}

function Configuration({ value, startsOn }: { value: unknown; startsOn: string | null }) {
  if (value === null) return <p>Sem configuração anterior.</p>;
  const { revision } = validateBillingRevisionV2(value);
  if (revision) return <>
    <p>{revision.planName ?? "Tabela geral"} · {dateLabel(startsOn)}</p>
    <ul className="list-disc pl-5">
      {revision.priceRules.map((item) => <li key={item.id}>{item.label} · {money(item.amountCents)}</li>)}
      {revision.additionalRules.map((item) => <li key={item.id}>{item.label} · {item.value.kind === "fixed"
        ? money(item.value.amountCents) : `${(item.value.basisPoints / 100).toLocaleString("pt-BR")}%`}</li>)}
    </ul>
  </>;
  const legacy = parseBillingConfiguration(value);
  return <>
    <p>Tabela atual de referência · {dateLabel(startsOn)}</p>
    {"rules" in legacy && <ul className="list-disc pl-5">{legacy.rules.map((rule, index) =>
      <li key={index}>{billingRuleLabel(rule)} · {money(rule.amountCents)}</li>)}</ul>}
  </>;
}

function HistoryRow({ publication, onCopy, styles, disabled }: {
  publication: BillingPublication; onCopy: () => void; styles: BillingFormStyles; disabled: boolean;
}) {
  return <details className={card}>
    <summary className="cursor-pointer font-bold text-zinc-800">
      Versão {publication.version} · {publication.configuration_after.planName ?? "Tabela geral"} · {dateLabel(publication.starts_on)}
    </summary>
    <div className="mt-3 space-y-3 text-sm text-zinc-700">
      <p>{dateTime.format(new Date(publication.published_at))} · Autor {publication.published_by}</p>
      {publication.reason && <p>{publication.is_retroactive ? "Justificativa da vigência retroativa" : "Justificativa"} · {publication.reason}</p>}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="min-w-0 rounded-2xl bg-[#fafaf7] p-3">
          <h5 className="font-bold">Anterior{publication.previous_version ? ` · versão ${publication.previous_version}` : ""}</h5>
          <Configuration value={publication.configuration_before} startsOn={publication.previous_starts_on} />
        </div>
        <div className="min-w-0 rounded-2xl bg-[#f6f7f1] p-3">
          <h5 className="font-bold">Publicada</h5>
          <Configuration value={publication.configuration_after} startsOn={publication.starts_on} />
        </div>
      </div>
      <details>
        <summary className="cursor-pointer font-bold">Configurações completas</summary>
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          <pre aria-label="Configuração anterior" className="max-h-64 min-w-0 overflow-auto rounded-lg bg-[#fafaf7] p-3 text-xs">{JSON.stringify(publication.configuration_before, null, 2)}</pre>
          <pre aria-label="Configuração publicada" className="max-h-64 min-w-0 overflow-auto rounded-lg bg-[#f6f7f1] p-3 text-xs">{JSON.stringify(publication.configuration_after, null, 2)}</pre>
        </div>
      </details>
      <button className={styles.button} type="button" disabled={disabled} onClick={onCopy}>Usar como base de nova revisão</button>
    </div>
  </details>;
}

export default function BillingVersionedEditor({ hospitalCode, token, plans, styles, onAccessDenied }: {
  hospitalCode: string; token: string; plans: BillingPlan[]; styles: BillingFormStyles; onAccessDenied?: (message: string) => void;
}) {
  const [draft, setDraft] = useState(() => emptyDraft(hospitalCode));
  const [planId, setPlanId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [sampleMode, setSampleMode] = useState<"example" | "production">("example");
  const [sample, setSample] = useState({ date: draft.startsOn, procedure: "", start: "08:00", duration: "", plan: "", technique: "" });
  const [month, setMonth] = useState(draft.startsOn.slice(0, 7));
  const [preview, setPreview] = useState<BillingDraftPreview | null>(null);
  const [reviewed, setReviewed] = useState<BillingRevisionV2 | null>(null);
  const [history, setHistory] = useState<BillingPublicationPage | null>(null);
  const [busy, setBusy] = useState<"preview" | "publish" | "history" | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [retry, setRetry] = useState<PublishIntent | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; error?: true; issues?: BillingConfigurationIssueV2[] } | null>(null);
  const inFlight = useRef<AbortController | null>(null);
  const endpoint = `/api/pro/institucional/faturamento/${hospitalCode}`;
  const reasonRequired = draft.startsOn <= bahiaDate.format(new Date());
  const scope = draft.planName ?? "Tabela geral";

  useEffect(() => () => {
    inFlight.current?.abort();
    inFlight.current = null;
  }, []);

  function startRequest(action: NonNullable<typeof busy>) {
    if (inFlight.current) return null;
    const controller = new AbortController();
    inFlight.current = controller;
    setBusy(action);
    return controller;
  }

  function finishRequest(controller: AbortController) {
    if (inFlight.current !== controller) return;
    inFlight.current = null;
    setBusy(null);
  }

  function clearReview() {
    setPreview(null);
    setReviewed(null);
    setConfirming(false);
    setFeedback(null);
  }

  function revise(patch: Partial<BillingRevisionV2>) {
    setDraft((current) => ({ ...current, ...patch }));
    clearReview();
  }

  function sampleChange(patch: Partial<typeof sample>) {
    setSample((current) => ({ ...current, ...patch }));
    clearReview();
  }

  function fail(error: unknown) {
    const message = error instanceof RequestError ? error.message : "Não foi possível concluir a operação. Tente novamente.";
    setFeedback({ message, error: true, issues: error instanceof RequestError ? error.details?.issues : undefined });
    if (error instanceof RequestError && (error.status === 401 || error.status === 403)) onAccessDenied?.(message);
  }

  async function simulate() {
    if (busy || retry) return;
    clearReview();
    const validated = validateBillingRevisionV2(draftForReview(draft));
    if (!validated.revision) {
      setFeedback({ error: true, message: "Confira as regras da configuração.", issues: validated.issues });
      return;
    }
    const source = sampleMode === "production" ? { mode: "production", month: `${month}-01` } : {
      mode: "example", date: sample.date, procedure: sample.procedure || null, plan: sample.plan || null,
      technique: sample.technique || null, start: sample.start || null, duration: sample.duration === "" ? null : Number(sample.duration),
    };
    const controller = startRequest("preview");
    if (!controller) return;
    try {
      const result = await billingRequest<BillingDraftPreview>(`${endpoint}/previa`, token, {
        method: "POST", signal: controller.signal, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configuration: validated.revision, planId, sample: source }),
      });
      if (controller.signal.aborted) return;
      setReviewed(validated.revision);
      setPreview(result);
    } catch (error) {
      if (!controller.signal.aborted) fail(error);
    } finally {
      finishRequest(controller);
    }
  }

  async function confirmPublication() {
    if (busy || !preview || !reviewed || !confirming) return;
    const intent = retry ?? { configuration: reviewed, planId, expectedVersion: preview.expectedVersion, reason: reason.trim() || null };
    const controller = startRequest("publish");
    if (!controller) return;
    setFeedback(null);
    try {
      const { publication } = await billingRequest<{ publication: BillingPublication }>(`${endpoint}/publicacoes`, token, {
        method: "POST", signal: controller.signal, headers: { "Content-Type": "application/json" }, body: JSON.stringify(intent),
      });
      if (controller.signal.aborted) return;
      setRetry(null);
      clearReview();
      setHistory(null);
      setReason("");
      setDraft((current) => ({ ...current, revisionId: crypto.randomUUID() }));
      setFeedback({ message: `Versão ${publication.version} publicada.` });
    } catch (error) {
      if (controller.signal.aborted) return;
      if (!(error instanceof RequestError) || error.status >= 500) {
        setRetry(intent);
        setFeedback({ error: true, message: "O resultado da operação não foi confirmado. Tente novamente com a mesma publicação." });
      } else {
        setRetry(null);
        if (error.status === 409) clearReview();
        fail(error);
      }
    } finally {
      finishRequest(controller);
    }
  }

  async function loadHistory(cursor: number | null) {
    if (busy) return;
    const controller = startRequest("history");
    if (!controller) return;
    setFeedback(null);
    try {
      const suffix = cursor === null ? "" : `?antes=${cursor}`;
      const page = await billingRequest<BillingPublicationPage>(`${endpoint}/publicacoes${suffix}`, token, { signal: controller.signal });
      if (controller.signal.aborted) return;
      if (cursor !== null && page.latest_version !== history?.latest_version) {
        setFeedback({ error: true, message: "O histórico mudou. Atualize a primeira página." });
        return;
      }
      setHistory(cursor === null || !history ? page : { ...page, publications: [...history.publications, ...page.publications] });
    } catch (error) {
      if (!controller.signal.aborted) fail(error);
    } finally {
      finishRequest(controller);
    }
  }

  function copy(publication: BillingPublication) {
    const plan = plans.find(({ id }) => id === publication.plan_id);
    if (publication.plan_id !== null && !plan) {
      setFeedback({ error: true, message: "O plano desta revisão não está disponível no cadastro atual." });
      return;
    }
    const currentName = plan?.plan_name ?? null;
    const date = bahiaDate.format(new Date());
    setPlanId(publication.plan_id);
    setSample((current) => ({ ...current, plan: currentName ?? "", date }));
    setReason("");
    revise({ ...publication.configuration_after, revisionId: crypto.randomUUID(), planName: currentName, startsOn: date });
  }

  return <section className={styles.panel}>
    <details>
      <summary className="cursor-pointer text-xl font-black tracking-tight">Regras versionadas</summary>
      <div className="mt-4 space-y-5">
        <p className="text-sm text-zinc-600">Simule e publique revisões para conferência. A aba Produção segue com a tabela em uso.</p>
        <fieldset disabled={Boolean(busy || retry)} className="min-w-0 space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={label}>Escopo
              <select className={styles.input} value={planId ?? ""} onChange={(event) => {
                const next = plans.find(({ id }) => id === event.target.value);
                setPlanId(next?.id ?? null);
                setSample((current) => ({ ...current, plan: next?.plan_name ?? "" }));
                revise({ planName: next?.plan_name ?? null });
              }}>
                <option value="">Tabela geral</option>
                {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.plan_name}</option>)}
              </select>
            </label>
            <label className={label}>Início de vigência
              <input className={styles.input} type="date" value={draft.startsOn} onChange={(event) => {
                setSample((current) => ({ ...current, date: event.target.value }));
                revise({ startsOn: event.target.value });
              }} />
            </label>
          </div>
          <details className={card}>
            <summary className="cursor-pointer font-bold">Duração, turno e política de adicionais</summary>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className={label}>Duração
                <select className={styles.input} value={draft.durationRounding}
                  onChange={(event) => revise({ durationRounding: event.target.value === "nearest" ? "nearest" : "exact" })}>
                  <option value="exact">Duração exata</option><option value="nearest">Arredondar ao minuto</option>
                </select>
              </label>
              <label className={label}>Fuso das regras
                <select className={styles.input} value={draft.timeZone} onChange={(event) => revise({ timeZone: event.target.value })}>
                  {!Object.hasOwn(billingTimeZones, draft.timeZone) && <option value={draft.timeZone}>{draft.timeZone}</option>}
                  {Object.entries(billingTimeZones).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                </select>
              </label>
              <label className={label}>Início do turno noturno
                <input className={styles.input} type="time" value={draft.nightStart} onChange={(event) => revise({ nightStart: event.target.value })} />
              </label>
              <label className={label}>Fim do turno noturno
                <input className={styles.input} type="time" value={draft.nightEnd} onChange={(event) => revise({ nightEnd: event.target.value })} />
              </label>
              <label className={label}>Adicionais
                <select className={styles.input} value={draft.additionMode}
                  onChange={(event) => revise({ additionMode: event.target.value === "highest" ? "highest" : "cumulative" })}>
                  <option value="cumulative">Acumular os adicionais</option><option value="highest">Aplicar o maior adicional</option>
                </select>
              </label>
            </div>
          </details>
          <BillingVersionedRules key={draft.revisionId} draft={draft} onChange={revise} styles={styles} />
          <div className={`${card} space-y-3`}>
            <h3 className="font-bold">Simular cálculo</h3>
            <label className={label}>Dados da simulação
              <select className={styles.input} value={sampleMode} onChange={(event) => {
                setSampleMode(event.target.value === "production" ? "production" : "example");
                clearReview();
              }}>
                <option value="example">Procedimento de exemplo</option><option value="production">Amostra de competência aberta</option>
              </select>
            </label>
            {sampleMode === "production" ? <label className={label}>Competência
              <input className={styles.input} type="month" value={month} onChange={(event) => { setMonth(event.target.value); clearReview(); }} />
            </label> : <div className="grid gap-3 sm:grid-cols-2">
              <label className={label}>Data da cirurgia
                <input className={styles.input} type="date" value={sample.date} onChange={(event) => sampleChange({ date: event.target.value })} />
              </label>
              <label className={label}>Procedimento
                <input className={styles.input} value={sample.procedure} onChange={(event) => sampleChange({ procedure: event.target.value })} />
              </label>
              <label className={label}>Plano informado
                <input className={styles.input} value={sample.plan} onChange={(event) => sampleChange({ plan: event.target.value })} />
              </label>
              <label className={label}>Técnica
                <select className={styles.input} value={sample.technique} onChange={(event) => sampleChange({ technique: event.target.value })}>
                  <option value="">Não informada</option>
                  {Object.values(anesthesiaTechniques).map((name) => <option key={name} value={name}>{name}</option>)}
                </select>
              </label>
              <label className={label}>Início (horário de Brasília)
                <input className={styles.input} type="time" value={sample.start} onChange={(event) => sampleChange({ start: event.target.value })} />
              </label>
              <label className={label}>Duração (minutos)
                <input className={styles.input} type="number" min="1" value={sample.duration} onChange={(event) => sampleChange({ duration: event.target.value })} />
              </label>
            </div>}
            <button type="button" className={styles.button} onClick={() => void simulate()}>{busy === "preview" ? "Simulando…" : "Simular"}</button>
          </div>
        </fieldset>
        {preview && <Preview result={preview} />}
        {preview && preview.items.length > 0 && <div className={`${card} space-y-3`}>
          <label className={label}>Justificativa {reasonRequired ? "(obrigatória)" : "(opcional)"}
            <textarea className={styles.input} value={reason} maxLength={1000} disabled={Boolean(busy || retry)} onChange={(event) => {
              setReason(event.target.value);
              setConfirming(false);
            }} />
          </label>
          {confirming ? <>
            <p className="text-sm text-zinc-700">Publicar {scope} com início em {dateLabel(draft.startsOn)} a partir da versão {preview.expectedVersion || "inicial"}?</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={styles.button} disabled={Boolean(busy)}
                onClick={() => void confirmPublication()}>{retry ? "Repetir a publicação" : busy === "publish" ? "Publicando…" : "Confirmar publicação"}</button>
              {!retry && <button type="button" className={styles.button} disabled={Boolean(busy)} onClick={() => setConfirming(false)}>Voltar</button>}
            </div>
          </> : <button type="button" className={styles.button} disabled={Boolean(busy || (reasonRequired && !reason.trim()))}
            onClick={() => setConfirming(true)}>Revisar publicação</button>}
        </div>}
        {feedback && <div role={feedback.error ? "alert" : "status"} className={feedback.error ? "text-sm text-red-700" : "text-sm text-[#506047]"}>
          <p>{feedback.message}</p>
          {Array.isArray(feedback.issues) && <ul className="list-disc pl-5">{feedback.issues.map((issue, index) =>
            <li key={index}>{issue.message} <span className="text-xs">({issue.path})</span></li>)}</ul>}
        </div>}
        <div className="space-y-3 border-t border-zinc-200 pt-4">
          <h3 className="font-bold">Histórico de publicações</h3>
          <button type="button" className={styles.button} disabled={Boolean(busy || retry)}
            onClick={() => void loadHistory(null)}>{busy === "history" ? "Carregando…" : history ? "Atualizar histórico" : "Consultar histórico"}</button>
          {history && !history.publications.length && <p className="text-sm text-zinc-600">Nenhuma revisão publicada.</p>}
          {history?.publications.map((row) => <HistoryRow key={row.version} publication={row} styles={styles}
            disabled={Boolean(busy || retry)} onCopy={() => copy(row)} />)}
          {history?.next_before_version != null && <button type="button" className={styles.button} disabled={Boolean(busy || retry)}
            onClick={() => void loadHistory(history.next_before_version)}>Carregar versões anteriores</button>}
        </div>
      </div>
    </details>
  </section>;
}

import { randomUUID } from "node:crypto";
import { isUuid } from "@/lib/admin-auth";
import { billingNameKey, billingRuleLabel, isBillingDate } from "@/lib/institutional-billing";
import { billingReply as reply, getBillingHospital } from "@/lib/institutional-billing-access";
import { calculateOfficialBilling, officialBillingContext } from "@/lib/institutional-billing-calculation";
import {
  assertBillingCloseIntent, assertBillingCloseReview, billingCloseReview, billingCloseSnapshotDigest,
  billingSourceForClosing, buildBillingClose, currentBillingMonth, keepsClosedPrice,
  type BillingCloseRequest, type ClosingChoice, type ClosingContext,
} from "@/lib/institutional-billing-closing";
import { closingItemKey, type ClosingCompleted, type ClosingDraft, type ClosingReceipt } from "@/lib/institutional-billing-closing-view";
import { signBillingEngineIntent } from "@/lib/institutional-billing-publication";
import { publicationRpc, publicationUnavailable } from "@/lib/institutional-billing-publication-rpc";
import { activeBillingMonthCutoff } from "@/lib/pro-institutional-cycles";
import { supabaseAdmin } from "@/lib/supabase-admin";

type RouteContext = { params: Promise<{ hospitalCode: string }> };
type Hospital = { code: string; actorId: string };
const invalid = () => reply({ error: "Confira a competência e as decisões financeiras." }, 400);
const stale = () => reply({ error: "A competência mudou. Carregue novamente e revise a prévia.", code: "closing_stale" }, 409);
const expired = () => reply({ error: "A competência expirou.", code: "competence_expired" }, 410);
const monthNotEnded = () => reply({ error: "O fechamento fica disponível após o fim da competência.", code: "billing_month_not_ended" }, 409);
const digestPattern = /^[0-9a-f]{64}$/;
const isDigest = (value: unknown): value is string => typeof value === "string" && digestPattern.test(value);
const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
const key = (choice: { user_id: string; document_id: string }) => closingItemKey(choice.user_id, choice.document_id);
const safeText = (value: unknown, limit: number): value is string =>
  typeof value === "string" && value.length <= limit && !value.includes("\0");

function parseChoices(input: unknown, allowRecalculate = false): ClosingChoice[] | null {
  if (!Array.isArray(input)) return null;
  const choices: ClosingChoice[] = [];
  for (const value of input) {
    const choice = asRecord(value);
    if (!choice || Object.keys(choice).some((field) => ![
      "user_id", "document_id", "included", "exclusion_reason", "correction", ...(allowRecalculate ? ["recalculate"] : []),
    ].includes(field)) || !isUuid(choice.user_id) || !isDigest(choice.document_id) || typeof choice.included !== "boolean"
        || !(choice.exclusion_reason === null || safeText(choice.exclusion_reason, 1000))
        || (choice.recalculate !== undefined && (choice.recalculate !== true || !choice.included))) return null;
    const correction = asRecord(choice.correction);
    if (choice.correction !== undefined && (!choice.included || !correction
        || Object.keys(correction).some((field) => !["plan_name", "classification_id", "reason"].includes(field))
        || !safeText(correction.reason, 1000)
        || (correction.plan_name !== undefined && !safeText(correction.plan_name, 160))
        || (correction.classification_id !== undefined && (typeof correction.classification_id !== "string"
          || !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/.test(correction.classification_id)))
        || (correction.plan_name === undefined && correction.classification_id === undefined))) return null;
    const exclusionReason = typeof choice.exclusion_reason === "string" ? choice.exclusion_reason.trim() || null : null;
    if (choice.included && exclusionReason) return null;
    choices.push({
      user_id: choice.user_id, document_id: choice.document_id, included: choice.included,
      exclusion_reason: exclusionReason,
      ...(correction && { correction: { reason: String(correction.reason).trim(),
        ...(typeof correction.plan_name === "string" && { plan_name: correction.plan_name.trim() }),
        ...(typeof correction.classification_id === "string" && { classification_id: correction.classification_id }),
      } }),
      ...(choice.recalculate === true && { recalculate: true }),
    });
  }
  return choices;
}

function matchChoices(prepared: ClosingContext, choices: ClosingChoice[]) {
  const byDocument = new Map(choices.map((choice) => [key(choice), choice]));
  if (choices.length !== prepared.sources.length || byDocument.size !== choices.length
      || prepared.sources.some((source) => !byDocument.has(key(source)))) throw stale();
  return prepared.sources.map((source) => byDocument.get(key(source))!);
}

function reviewReceipt(value: unknown): ClosingReceipt | null {
  const receipt = asRecord(value);
  const request = asRecord(receipt?.request);
  if (!receipt || !request || !isUuid(receipt.operationId) || !isDigest(receipt.snapshotDigest) || !isDigest(receipt.signature)
      || typeof request.base_version !== "number" || !Number.isInteger(request.base_version)
      || request.base_version < 0 || request.base_version >= 2_147_483_647
      || (request.base_version ? !safeText(request.reason, 1000) || !request.reason.trim() : request.reason !== null) || typeof request.source_revision !== "number"
      || !Number.isSafeInteger(request.source_revision) || request.source_revision < 0 || !isDigest(request.config_sha256)) return null;
  const choices = parseChoices(request.choices, true);
  if (!choices?.length) return null;
  return { operationId: receipt.operationId, snapshotDigest: receipt.snapshotDigest, signature: receipt.signature,
    request: { base_version: request.base_version, source_revision: request.source_revision, config_sha256: request.config_sha256,
      reason: typeof request.reason === "string" ? request.reason.trim() : null, choices } };
}

async function prepare(request: Request, hospital: Hospital, month: string): Promise<ClosingContext> {
  const data = await publicationRpc(request, "prepare_pro_billing_close", signBillingEngineIntent(hospital, { action: "closure_prepare", month }));
  const prepared = data as ClosingContext | null;
  const period = prepared?.period;
  if (!prepared || period?.hospital_code !== hospital.code || period.competence_month !== month
      || !Array.isArray(prepared.sources) || !isDigest(prepared.config_sha256)
      || !Number.isSafeInteger(period.source_revision) || period.source_revision < 0
      || !Number.isSafeInteger(period.latest_version) || period.latest_version < 0) throw new Error("invalid_closing_context");
  if (period.state === "expired" || !(Date.parse(period.expires_at) > Date.now())) throw expired();
  if (period.state === "closed" ? prepared.latest_closed?.version !== period.latest_version || period.latest_version < 1
      : period.state !== "open" || period.latest_version !== 0 || prepared.latest_closed !== null) throw new Error("invalid_closing_period");
  return prepared;
}

function completed(month: string, closed: NonNullable<ClosingContext["latest_closed"]>, recovered?: boolean): ClosingCompleted {
  return { kind: "completed", state: "closed", month, version: closed.version,
    totalCents: closed.snapshot?.total_cents ?? null, closedAt: closed.created_at ?? null,
    closedBy: closed.created_by ?? null, reason: closed.reason ?? null, recovered };
}

function draft(prepared: ClosingContext, month: string, choices?: ClosingChoice[], reason = ""): ClosingDraft {
  const context = officialBillingContext(prepared.configs, prepared.period.hospital_code);
  const previous = prepared.latest_closed;
  const prior = new Map(previous?.snapshot.items.map((item) => [key(item), item]));
  const choicesBySource = choices ? matchChoices(prepared, choices) : prepared.sources.map((source): ClosingChoice => {
    const old = prior.get(key(source));
    return { user_id: source.user_id, document_id: source.document_id,
      included: old?.included ?? !previous, exclusion_reason: old?.exclusion_reason ?? null };
  });
  const rowsToPrice = prepared.sources.flatMap((source, index) => {
    const choice = choicesBySource[index];
    const old = prior.get(key(source));
    return choice.included && !keepsClosedPrice(old, choice) ? [{ index, source: billingSourceForClosing(source, choice) }] : [];
  });
  const values = calculateOfficialBilling(rowsToPrice.map(({ source }) => source), context);
  const priced = new Map(rowsToPrice.map(({ index }, position) => [index, values[position]]));
  const revisions = new Map(context.publications.map(({ configuration_after }) => [configuration_after.revisionId, configuration_after]));
  const plans = context.plans.map(({ plan_name }) => plan_name).sort((a, b) => a.localeCompare(b, "pt-BR"));
  let total = BigInt(0);
  let included = 0;
  let excluded = 0;
  let pending = 0;
  let changed = 0;
  const rows = prepared.sources.map((source, index) => {
    const choice = choicesBySource[index];
    const old = prior.get(key(source));
    const frozen = keepsClosedPrice(old, choice) ? old : null;
    const { item, evaluation } = priced.get(index) ?? {};
    const correction = choice.correction;
    const revisedPlan = correction?.plan_name;
    const validPlan = revisedPlan === undefined || plans.filter((name) => billingNameKey(name) === billingNameKey(revisedPlan)).length === 1;
    const rule = frozen?.rule_snapshot;
    const applied = asRecord(asRecord(rule?.correction)?.applied);
    const frozenPublication = asRecord(rule?.publication);
    const string = (value: unknown) => typeof value === "string" ? value : null;
    const amount = frozen?.amount_cents ?? item?.amountCents ?? null;
    const hasChanged = Boolean(previous && (old ? choice.included !== old.included
      || choice.exclusion_reason !== old.exclusion_reason || choice.recalculate || correction
      : choice.included || choice.exclusion_reason));
    if (hasChanged) changed++;
    let blocker = null;
    if (!choice.included) {
      if (!choice.exclusion_reason) blocker = old || !previous
        ? "Informe a justificativa da exclusão." : "Decida se a ficha tardia será incluída ou justifique a exclusão.";
      else excluded++;
    } else if (!validPlan) {
      blocker = "Selecione um plano financeiro cadastrado.";
    } else if (correction && !correction.reason) {
      blocker = "Informe a justificativa da correção.";
    } else if (amount === null) {
      blocker = item?.pending ?? "Confira o enquadramento financeiro da ficha.";
    } else {
      included++;
      total += BigInt(amount);
    }
    if (blocker) pending++;
    return { userId: source.user_id, documentId: source.document_id, date: source.procedure_date,
      procedure: source.procedure_name, professional: source.anesthesiologist_name, recordNumber: source.record_number,
      originalPlan: source.plan_name, appliedPlan: item?.plan_name ?? string(applied?.plan_name) ?? source.plan_name,
      classification: evaluation?.classification?.label ?? string(asRecord(rule?.classification)?.label),
      classifications: revisions.get(evaluation?.revision?.id ?? "")?.classifications ?? [],
      rule: item?.publication?.ruleLabel ?? (item?.rule ? billingRuleLabel(item.rule) : string(rule?.label) ?? string(rule?.code)),
      startsOn: item?.startsOn ?? string(rule?.starts_on),
      publicationVersion: item?.publication?.version ?? (typeof frozenPublication?.version === "number" ? frozenPublication.version : null),
      amountCents: amount === null ? null : Number(amount), blocker, changed: hasChanged,
      previous: old ? { included: old.included, amountCents: old.amount_cents } : null };
  });
  const previousTotal = previous?.snapshot.total_cents;
  if (previous && !/^(0|[1-9][0-9]*)$/.test(previousTotal ?? "")) throw new Error("invalid_previous_closed_item");
  return { kind: "review", state: previous ? "closed" : "open", month, ended: month < currentBillingMonth(), expiresAt: prepared.period.expires_at,
    basis: { baseVersion: prepared.period.latest_version, sourceRevision: prepared.period.source_revision, configurationHash: prepared.config_sha256 },
    rows, choices: choicesBySource, plans, summary: { totalCents: total.toString(), included, excluded, pending }, receipt: null,
    rectification: previous && previousTotal !== undefined ? { baseVersion: previous.version, previousTotalCents: previousTotal,
      deltaCents: (total - BigInt(previousTotal)).toString(), changed, reason } : null };
}

function matchesReview(request: BillingCloseRequest, prepared: ClosingContext) {
  return request.base_version === prepared.period.latest_version
    && request.source_revision === prepared.period.source_revision && request.config_sha256 === prepared.config_sha256;
}

async function readConfirmedVersion(hospital: Hospital, month: string, version: number) {
  const { data, error } = await supabaseAdmin.from("institutional_billing_closures")
    .select("version,created_at,created_by,reason,snapshot,period:institutional_billing_periods!inner(state,expires_at)")
    .eq("hospital_code", hospital.code).eq("competence_month", month).eq("version", version)
    .eq("period.state", "closed").gt("period.expires_at", new Date().toISOString())
    .maybeSingle<NonNullable<ClosingContext["latest_closed"]>>();
  if (error) throw error;
  if (!data) throw stale();
  return data;
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { hospitalCode } = await params;
    const hospital = await getBillingHospital(request, hospitalCode);
    if (hospital instanceof Response) return hospital;
    const input = asRecord(await request.json().catch(() => null));
    const month = input?.month;
    if (!isBillingDate(month) || !month.endsWith("-01") || month > currentBillingMonth()) return invalid();
    if (month < activeBillingMonthCutoff()) return expired();
    if (input?.action === "load" || input?.action === "rectify") {
      // A RPC de preparo também reserva uma competência inexistente. A consulta do painel
      // primeiro verifica se há competência, para não criar meses vazios.
      const { data, error } = await supabaseAdmin.from("institutional_billing_periods").select("state")
        .eq("hospital_code", hospital.code).eq("competence_month", month).maybeSingle();
      if (error) throw error;
      if (input.action === "rectify") {
        if (data?.state !== "closed") return data?.state === "expired" ? expired() : stale();
        const prepared = await prepare(request, hospital, month);
        if (!prepared.latest_closed || input.baseVersion !== prepared.period.latest_version) return stale();
        return reply(draft(prepared, month));
      }
      if (!data) return reply({ kind: "review", state: "open", month, ended: month < currentBillingMonth(), expiresAt: null, basis: null,
        rows: [], choices: [], plans: [], summary: { totalCents: "0", included: 0, excluded: 0, pending: 0 },
        receipt: null, rectification: null } satisfies ClosingDraft);
      const prepared = await prepare(request, hospital, month);
      return reply(prepared.latest_closed ? completed(month, prepared.latest_closed) : draft(prepared, month));
    }
    const signingKey = process.env.ANEST_BILLING_PUBLICATION_SIGNING_KEY ?? "";
    if (input?.action === "review") {
      const basis = asRecord(input.basis);
      const rectification = typeof basis?.baseVersion === "number" && basis.baseVersion > 0;
      const choices = parseChoices(input.choices, rectification);
      if (!choices?.length || !basis || !isDigest(basis.configurationHash) || !Number.isSafeInteger(basis.sourceRevision)) return invalid();
      const prepared = await prepare(request, hospital, month);
      if (basis.baseVersion !== prepared.period.latest_version || basis.configurationHash !== prepared.config_sha256
          || basis.sourceRevision !== prepared.period.source_revision) return stale();
      if (rectification && !safeText(input.reason, 1000)) return invalid();
      const result = draft(prepared, month, choices, rectification ? String(input.reason).trim() : "");
      const amendment = result.rectification;
      if (result.ended && result.rows.length && result.summary.pending === 0 && (!amendment || (amendment.reason && amendment.changed))) {
        const closing = buildBillingClose(prepared, result.choices, amendment?.reason ?? null);
        const operationId = randomUUID();
        const scope = { hospitalCode: hospital.code, actorId: hospital.actorId, month, operationId };
        result.receipt = { operationId, request: closing.request, snapshotDigest: billingCloseSnapshotDigest(closing.snapshot),
          signature: billingCloseReview(closing, scope, signingKey) };
      }
      return reply(result);
    }
    if (input?.action !== "confirm") return invalid();
    if (month >= currentBillingMonth()) return monthNotEnded();
    const receipt = reviewReceipt(input.receipt);
    if (!receipt) return invalid();
    const scope = { hospitalCode: hospital.code, actorId: hospital.actorId, month, operationId: receipt.operationId };
    assertBillingCloseIntent(receipt.signature, receipt.request, receipt.snapshotDigest, scope, signingKey);
    const prepared = await prepare(request, hospital, month);
    let snapshot = null;
    if (prepared.period.latest_version === receipt.request.base_version) {
      if (!matchesReview(receipt.request, prepared)) return stale();
      const closing = buildBillingClose(prepared, receipt.request.choices, receipt.request.reason);
      assertBillingCloseReview(receipt.signature, closing, scope, signingKey);
      snapshot = closing.snapshot;
    } else if (prepared.period.latest_version < receipt.request.base_version
        || (prepared.period.latest_version === receipt.request.base_version + 1
          && prepared.latest_closed?.operation_id !== receipt.operationId)) {
      return stale();
    }
    // Com base ultrapassada a RPC só pode devolver uma operação anterior idêntica.
    const result = await publicationRpc(request, "close_pro_billing_period", signBillingEngineIntent(hospital, {
      action: "closure_commit", month, operationId: receipt.operationId, closeRequest: receipt.request, snapshot,
    })) as { version?: number; already_closed?: boolean } | null;
    if (!result || result.version !== receipt.request.base_version + 1 || typeof result.already_closed !== "boolean") {
      throw new Error("invalid_closing_result");
    }
    const recorded = prepared.latest_closed?.version === result.version
      ? prepared.latest_closed : await readConfirmedVersion(hospital, month, result.version);
    return reply(completed(month, recorded, result.already_closed));
  } catch (error) {
    if (error instanceof Error && error.message === "billing_preview_stale") return stale();
    if (error instanceof Error && error.message === "billing_month_not_ended") return monthNotEnded();
    if (error instanceof Error && error.message === "competence_expired") return expired();
    return publicationUnavailable(error);
  }
}

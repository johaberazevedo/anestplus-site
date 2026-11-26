import { billingNameKey, isBillingDate } from "@/lib/institutional-billing";
import { billingReply as reply, billingTiming, getBillingHospital } from "@/lib/institutional-billing-access";
import { calculateOfficialBilling, officialBillingContext } from "@/lib/institutional-billing-calculation";
import { productionSpreadsheet, summarizeProduction, type BillingSource } from "@/lib/institutional-billing-production";
import { publicationUnavailable, readBillingCalculationContext } from "@/lib/institutional-billing-publication-rpc";
import { readBillingSnapshot, type BillingCompetence, type BillingReadReport, type BillingVersionSelection, type BillingVersionDetails, type BillingReadCase } from "@/lib/institutional-billing-reading";
import { cycleTables, activeBillingMonthCutoff } from "@/lib/pro-institutional-cycles";
import { supabaseAdmin } from "@/lib/supabase-admin";

const pageSize = 50;
const batchSize = 500;
const monthOf = (date: string) => `${date.slice(0, 7)}-01`;
const periodsTable = "institutional_billing_periods";

type Period = { competence_month: string; state: "open" | "closed" | "expired"; expires_at: string; latest_version: number };
type Source = BillingSource & { user_id: string };
type StoredVersion = { snapshot: unknown; base_version?: number; created_at?: string; created_by?: string; reason?: string | null };

function summarizeReadRows(rows: BillingReadCase[]) {
  const { totalCents, calculated, pending } = summarizeProduction(rows);
  const excluded = rows.filter((item) => item.exclusionReason).length;
  return { totalCents, calculated, pending: pending - excluded, excluded };
}

function isSearch(value: unknown): value is string {
  return typeof value === "string" && value.length <= 120 && !value.includes("\0");
}

function isVersionSelection(value: unknown): value is BillingVersionSelection {
  if (!value || typeof value !== "object") return false;
  const { month, version } = value as Partial<BillingVersionSelection>;
  return isBillingDate(month) && month === monthOf(month)
    && typeof version === "number" && Number.isInteger(version) && version > 0 && version <= 2_147_483_647;
}

async function listPeriods(hospitalCode: string, from: string, to: string) {
  const { data, error } = await supabaseAdmin.from(periodsTable)
    .select("competence_month,state,expires_at,latest_version").eq("hospital_code", hospitalCode)
    .gte("competence_month", from).lte("competence_month", to)
    .order("competence_month", { ascending: false }).returns<Period[]>();
  if (error) throw error;
  const now = Date.now();
  return (data ?? []).map((period): Period => Date.parse(period.expires_at) <= now
    ? { ...period, state: "expired" } : period);
}

async function listCases(hospitalCode: string, months: string[], from: string, to: string) {
  const cases: Source[] = [];
  if (!months.length) return cases;
  let count: number | null = null;
  // PostgREST limita linhas por consulta. O resumo usa o período inteiro, inclusive se houver várias páginas.
  while (count === null || cases.length < count) {
    const offset = cases.length;
    const { data, count: available, error } = await supabaseAdmin.from(cycleTables.production)
      .select("user_id,document_id,patient_name,anesthesia_type,record_number,procedure_date,procedure_name,plan_name,anesthesiologist_name,crm,start_date_time,end_date_time,period:institutional_billing_periods!inner(state,expires_at)",
        offset === 0 ? { count: "exact" } : undefined)
      .eq("hospital_code", hospitalCode).in("competence_month", months)
      .eq("period.state", "open").gt("period.expires_at", new Date().toISOString())
      .gte("procedure_date", from).lte("procedure_date", to)
      .order("procedure_date", { ascending: false }).order("document_id").order("user_id")
      .range(offset, offset + batchSize - 1).returns<Source[]>();
    if (error) throw error;
    if (!data?.length) break;
    if (offset === 0) count = available;
    cases.push(...data);
  }
  return cases;
}

async function loadSnapshot(hospitalCode: string, { month, version }: BillingVersionSelection) {
  const { data, error } = await supabaseAdmin.from("institutional_billing_closures")
    .select("snapshot,base_version,created_at,created_by,reason,period:institutional_billing_periods!inner(state,expires_at)")
    .eq("hospital_code", hospitalCode).eq("competence_month", month).eq("version", version)
    .eq("period.state", "closed").gt("period.expires_at", new Date().toISOString())
    .maybeSingle<StoredVersion>();
  if (error) throw error;
  return { month, version, stored: data };
}

async function readProduction(request: Request, hospital: { code: string; actorId: string }, from: string, to: string,
  selection: BillingVersionSelection | undefined, matches: (item: Omit<BillingSource, "document_id">) => boolean,
  timing: ReturnType<typeof billingTiming>,
  { exportVersion, includeVersionDetails }: { exportVersion?: number | null; includeVersionDetails: boolean }) {
  const cutoff = activeBillingMonthCutoff();
  const hospitalCode = hospital.code;
  const firstMonth = monthOf(from);
  const lastMonth = monthOf(to);
  const expired = () => reply({ error: "A competência expirou." }, 410);
  if (lastMonth < cutoff || (selection && selection.month < cutoff)) return expired();
  const firstActive = firstMonth < cutoff ? cutoff : firstMonth;
  const readPeriods = () => listPeriods(hospitalCode, firstActive, lastMonth);
  let periods = await timing.measure("competencias_inicial", readPeriods);

  // Uma leitura iniciada durante um fechamento ou uma expiração deve usar o estado reconciliado.
  for (let attempt = 0; attempt < 2; attempt++) {
    const target = periods.find((period) => period.competence_month === (selection?.month ?? lastMonth));
    if (target?.state === "expired" && (selection || firstActive === lastMonth)) return expired();
    if (exportVersion === null && target?.state === "closed") {
      return reply({ error: "A competência foi fechada. Atualize a busca e selecione a versão para exportar." }, 409);
    }
    if (selection && (target?.state !== "closed" || selection.version > target.latest_version)) {
      return reply({ error: "Versão financeira indisponível." }, 404);
    }
    const competences = periods.map(({ competence_month: month, state, latest_version: latestVersion }): BillingCompetence =>
      state === "closed" ? { month, state, latestVersion, version: selection?.month === month ? selection.version : latestVersion }
        : { month, state });
    const open = competences.filter(({ state }) => state === "open").map(({ month }) => month);
    const closed = competences.flatMap((period) => period.state === "closed" ? [period] : []);
    const monthlyClosed = firstMonth === lastMonth ? closed[0] : undefined;
    const [cases, snapshots, config, previous] = await Promise.all([
      timing.measure("fichas", () => listCases(hospitalCode, open, from, to)),
      Promise.all(closed.map((period) => loadSnapshot(hospitalCode, period))),
      open.length ? timing.measure("tabelas", () => readBillingCalculationContext(request, hospital, to)).catch(publicationUnavailable) : null,
      includeVersionDetails && monthlyClosed && monthlyClosed.version > 1
        ? loadSnapshot(hospitalCode, { month: monthlyClosed.month, version: monthlyClosed.version - 1 }) : null,
    ]);

    const current = await timing.measure(attempt === 0 ? "competencias_rechecagem" : "competencias_rechecagem_extra", readPeriods);
    if (current.length !== periods.length || current.some((period, index) =>
      period.competence_month !== periods[index].competence_month || period.state !== periods[index].state
      || period.latest_version !== periods[index].latest_version)) {
      periods = current;
      continue;
    }
    const matchingCases = cases.filter(matches);
    if (matchingCases.length && config instanceof Response) return config;
    const openRows = matchingCases.length ? await timing.measure("calculo", () =>
      calculateOfficialBilling(matchingCases, officialBillingContext(config, hospitalCode))
        .map(({ item }, index) => ({ rowKey: `${item.id}:${matchingCases[index].user_id}`, item: { ...item, version: null } }))) : [];
    const closedRows = snapshots.flatMap(({ stored, month, version }) => readBillingSnapshot(stored?.snapshot, month, version));
    let versionDetails: BillingVersionDetails | undefined;
    const stored = snapshots[0]?.stored;
    if (monthlyClosed && stored) {
      const baseVersion = stored.base_version ?? monthlyClosed.version - 1;
      if (baseVersion !== monthlyClosed.version - 1) throw new Error("invalid_billing_version_chain");
      if (includeVersionDetails) {
        const totalCents = summarizeReadRows(closedRows.map(({ item }) => item).filter(matches)).totalCents;
        const previousTotalCents = previous
          ? summarizeReadRows(readBillingSnapshot(previous.stored?.snapshot, previous.month, previous.version)
            .map(({ item }) => item).filter(matches)).totalCents : null;
        versionDetails = { version: monthlyClosed.version, baseVersion, closedAt: stored.created_at ?? null,
          closedBy: stored.created_by ?? null, reason: stored.reason ?? null, totalCents, previousTotalCents,
          deltaCents: previousTotalCents === null ? null : String(BigInt(totalCents) - BigInt(previousTotalCents)) };
      }
    }
    return {
      rows: [...openRows, ...closedRows.filter(({ item }) => matches(item))],
      records: cases.length + closedRows.length,
      competences, versionDetails,
      hasExpired: firstMonth < cutoff || competences.some(({ state }) => state === "expired"),
    };
  }
  return reply({ error: "A produção mudou durante a consulta. Atualize a busca." }, 409);
}

export async function POST(request: Request, { params }: { params: Promise<{ hospitalCode: string }> }) {
  const timing = billingTiming("producao");
  const respond = (data: object, status = 200, records?: number) => timing.finish(reply(data, status), records);
  const { hospitalCode } = await params;
  try {
    const hospital = await getBillingHospital(request, hospitalCode, timing);
    if (hospital instanceof Response) return timing.finish(hospital);

    const body = await request.json().catch(() => null);
    const { from, to, plan, professional, page = 1, exportAll = false, version, report } = body ?? {};
    if (!isBillingDate(from) || !isBillingDate(to) || from > to || !isSearch(plan) || !isSearch(professional)
        || !Number.isSafeInteger(page) || page < 1 || typeof exportAll !== "boolean") {
      return respond({ error: "Confira o período e os filtros." }, 400);
    }
    if (version !== undefined && (!isVersionSelection(version) || version.month < monthOf(from) || version.month > monthOf(to))) {
      return respond({ error: "Confira a competência e a versão solicitadas." }, 400);
    }

    let exportVersion: number | null | undefined;
    if (report !== undefined) {
      if (!report || !["pdf", "xlsx"].includes(report.format) || !["summary", "detail"].includes(report.kind)
          || !(report.version === null || isVersionSelection({ month: monthOf(from), version: report.version }))
          || monthOf(from) !== monthOf(to) || exportAll
          || (version !== undefined && version.version !== report.version)) {
        return respond({ error: "Selecione uma única competência e o formato do demonstrativo." }, 400);
      }
      exportVersion = report.version;
    }
    const selection = typeof exportVersion === "number" ? { month: monthOf(from), version: exportVersion } : version;

    const planKey = billingNameKey(plan);
    const professionalKey = billingNameKey(professional);
    const matches = (ficha: Omit<BillingSource, "document_id">) => (
      ficha.procedure_date !== null && ficha.procedure_date >= from && ficha.procedure_date <= to
      && (!planKey || billingNameKey(ficha.plan_name) === planKey)
      && (!professionalKey || billingNameKey(ficha.anesthesiologist_name).includes(professionalKey)
        || billingNameKey(ficha.crm).includes(professionalKey))
    );
    const result = await readProduction(request, hospital, from, to, selection, matches, timing, {
      exportVersion, includeVersionDetails: !exportAll,
    });
    if (result instanceof Response) return timing.finish(result);
    const { rows, records, competences, hasExpired, versionDetails } = result;
    const filtered = rows.sort((a, b) => b.item.procedure_date!.localeCompare(a.item.procedure_date!)
      || a.rowKey.localeCompare(b.rowKey)).map(({ item }) => item);
    if (report) {
      const { billingReportResponse } = await import("@/lib/institutional-billing-reports");
      return timing.finish(await billingReportResponse({ hospitalName: hospital.name, hospitalCode: hospital.code,
        month: monthOf(from), from, to, plan, professional, rows: filtered, summary: summarizeReadRows(filtered),
        version: versionDetails, issuedAt: new Date() }, report.format, report.kind), records);
    }
    if (exportAll) {
      const spreadsheet = await timing.measure("planilha", () => productionSpreadsheet(filtered));
      return respond({ spreadsheet, count: filtered.length }, 200, records);
    }
    const lastPage = Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Math.min(page, lastPage);
    const offset = (currentPage - 1) * pageSize;
    const { excluded, ...summary } = summarizeReadRows(filtered);
    return respond({
      hospitalName: hospital.name,
      cases: filtered.slice(offset, offset + pageSize),
      summary,
      competences, excluded, hasExpired, versionDetails,
      page: currentPage,
      lastPage,
    } satisfies BillingReadReport, 200, records);
  } catch {
    return respond({ error: "Não foi possível consultar a produção agora." }, 503);
  }
}

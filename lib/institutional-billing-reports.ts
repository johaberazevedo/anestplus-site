import { billingRuleLabel } from "@/lib/institutional-billing";
import type { BillingReadCase, BillingVersionDetails } from "@/lib/institutional-billing-reading";
import { renderBillingPdf } from "@/lib/institutional-billing-report-pdf";
import { renderBillingXlsx } from "@/lib/institutional-billing-report-xlsx";

type ReportData = {
  hospitalName: string;
  hospitalCode: string;
  month: string;
  from: string;
  to: string;
  plan: string;
  professional: string;
  rows: BillingReadCase[];
  summary: { totalCents: string; calculated: number; excluded: number; pending: number };
  version?: BillingVersionDetails;
  issuedAt: Date;
};

export type ReportCell = string | number | { cents: string };
export type ReportDocument = {
  title: string;
  subtitle: string;
  summary: { label: string; value: ReportCell }[];
  detail: { header: string[]; rows: ReportCell[][] } | null;
};

const institutionTime = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Bahia", dateStyle: "short", timeStyle: "short",
});
const date = (value: string) => value.split("-").reverse().join("/");
const timestamp = (value: string | Date) => institutionTime.format(new Date(value));
const amount = (cents: string | number) => ({ cents: String(cents) });

function documentFor(data: ReportData, kind: "summary" | "detail"): ReportDocument {
  const { version, summary } = data;
  const title = kind === "detail" ? "Demonstrativo analítico" : "Demonstrativo sintético";
  const subtitle = version ? `Definitivo · versão ${version.version}` : "Preliminar · sujeito a conferência";
  const report: ReportDocument = {
    title, subtitle,
    summary: [
      { label: "Hospital", value: data.hospitalName },
      { label: "Competência", value: date(data.month.slice(0, 7)) },
      { label: "Período da consulta", value: `${date(data.from)} a ${date(data.to)}` },
      ...(data.plan ? [{ label: "Filtro de plano", value: data.plan }] : []),
      ...(data.professional ? [{ label: "Filtro de anestesista", value: data.professional }] : []),
      { label: "Emissão", value: `${timestamp(data.issuedAt)} (Bahia)` },
      ...(version?.closedAt ? [{ label: "Confirmação", value: timestamp(version.closedAt) }] : []),
      ...(version?.closedBy ? [{ label: "Responsável (ID)", value: version.closedBy }] : []),
      { label: "Total da consulta", value: amount(summary.totalCents) },
      { label: "Fichas com valor", value: summary.calculated },
      { label: "Fichas excluídas", value: summary.excluded },
      { label: "Fichas pendentes", value: summary.pending },
    ],
    detail: null,
  };
  if (version && version.previousTotalCents !== null && version.deltaCents !== null) {
    report.summary.push(
      { label: `Total da versão ${version.baseVersion} no mesmo recorte`, value: amount(version.previousTotalCents) },
      { label: "Diferença da retificação", value: amount(version.deltaCents) },
      { label: "Justificativa da retificação", value: version.reason ?? "Indisponível" },
    );
  }
  if (kind === "detail") {
    report.detail = {
      header: ["Data", "Procedimento", "Plano", "Anestesista", "Regra e vigência", "Situação", "Valor", "Observação financeira"],
      rows: data.rows.map((row) => {
        const rule = row.ruleLabel ?? row.publication?.ruleLabel ?? (row.rule ? billingRuleLabel(row.rule) : "");
        return [
          row.procedure_date ? date(row.procedure_date) : "", row.procedure_name ?? "", row.plan_name ?? "",
          row.anesthesiologist_name ?? "",
          [rule, row.startsOn ? `desde ${date(row.startsOn)}` : "", row.publication ? `publicação v${row.publication.version}` : ""]
            .filter(Boolean).join(" · "),
          row.exclusionReason ? "Excluída" : row.amountCents === null ? "Pendente" : "Incluída",
          row.amountCents === null ? "" : amount(row.amountCents),
          row.exclusionReason ?? row.financialNotes ?? row.pending ?? "",
        ];
      }),
    };
  }
  return report;
}

export async function billingReportResponse(data: ReportData, format: "pdf" | "xlsx", kind: "summary" | "detail") {
  const document = documentFor(data, kind);
  const type = format === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  const state = data.version ? `definitivo-v${data.version.version}` : "preliminar";
  const scope = kind === "detail" ? "analitico" : "sintetico";
  const name = `faturamento-${data.hospitalCode}-${data.month.slice(0, 7)}-${state}-${scope}.${format}`;
  const bytes = format === "pdf" ? renderBillingPdf(document) : renderBillingXlsx(document);
  return new Response(Uint8Array.from(bytes), { headers: {
    "Content-Type": type, "Content-Disposition": `attachment; filename="${name}"`,
    "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff",
  } });
}

import { authenticateProHospitalToken, getProHospitalLinksForUser } from "@/lib/pro-hospital-access";
import { submitInstitutionalPDF, type InstitutionalDelivery } from "@/lib/pro-institutional-submission";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { extractTrustMarker } from "@/lib/trust/extractTrustMarker";
import { verifyTrustSignature } from "@/lib/trust/verifyTrustSignature";

import { authorizeCycle, confirmCycle, verifyCycleTicket, cycleJSON, CycleFailure, cycleFailureResponse } from "@/lib/pro-institutional-cycles";

export const runtime = "nodejs";

const procedureDayFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bahia",
  year: "numeric", month: "2-digit", day: "2-digit" });

async function hasAccess(userId: string, hospitalCode: string) {
  const codes = await getProHospitalLinksForUser(userId, hospitalCode);
  if (!codes.includes(hospitalCode)) return false;
  const { data, error } = await supabaseAdmin.from("institutional_hospitals")
    .select("code").eq("code", hospitalCode).eq("is_active", true).maybeSingle();
  if (error) throw error;
  return data?.code === hospitalCode;
}

async function verifyDocument(pdf: Uint8Array) {
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  // PDF.js pode transferir o buffer para o worker. O PDF enviado ao R2 conserva os bytes originais.
  const loading = getDocument({
    data: new Uint8Array(pdf), stopAtErrors: true, useSystemFonts: false,
    disableFontFace: true, useWorkerFetch: false, verbosity: 0,
  });
  try {
    const doc = await loading.promise;
    // O gerador institucional do Pro emite uma página.
    if (doc.numPages !== 1) return null;
    const page = await doc.getPage(1);
    const content = await page.getTextContent();
    const text = content.items.map((item) => "str" in item ? item.str : "").join(" ");
    const marker = extractTrustMarker(text);
    const encoded = marker?.match(/^\[ANESTPLUS_TRUST_BEGIN\]([A-Za-z0-9+/=]+)\[ANESTPLUS_TRUST_END\]$/)?.[1];
    if (!encoded) return null;
    const trust = JSON.parse(Buffer.from(encoded, "base64").toString("utf8"));
    const signedPayload = trust?.anestplusTrust?.payload?.json;
    if (typeof signedPayload !== "string" || !(await verifyTrustSignature(trust)).overallValid) return null;
    return { signedPayload };
  } catch {
    return null;
  } finally {
    await loading.destroy();
  }
}

function signedText(value: unknown) {
  if (typeof value !== "string" || value.includes("\0")) return null;
  return value.trim() || null;
}

function signedTimestamp(value: unknown) {
  // O Pro assina timestamps já convertidos para UTC.
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) return null;
  const date = new Date(value);
  const canonical = value.length === 20 ? value.replace(/Z$/, ".000Z") : value;
  return Number.isFinite(date.getTime()) && date.toISOString() === canonical ? canonical : null;
}

function signedMetadata(payload: string) {
  const data = JSON.parse(payload) as {
    patient?: { name?: unknown; recordNumber?: unknown };
    anesthesiologist?: { name?: unknown; crm?: unknown };
    procedure?: { procedure?: unknown; plan?: unknown; anesthesiaPlan?: unknown };
    caseTiming?: { procedureDateISO8601?: unknown; startISO8601?: unknown; endISO8601?: unknown };
  };
  const patientName = signedText(data.patient?.name);
  const recordNumber = signedText(data.patient?.recordNumber);
  const professional = signedText(data.anesthesiologist?.name);
  const crm = signedText(data.anesthesiologist?.crm);
  const anesthesia = signedText(data.procedure?.anesthesiaPlan);
  const performedAt = signedTimestamp(data.caseTiming?.procedureDateISO8601);
  const start = signedTimestamp(data.caseTiming?.startISO8601);
  const rawEnd = data.caseTiming?.endISO8601;
  const end = rawEnd == null ? null : signedTimestamp(rawEnd);
  if (!patientName || !recordNumber || !professional || !crm || !anesthesia || !performedAt || !start
      || (rawEnd != null && (!end || end < start))) return null;
  return {
    patient_name: patientName, record_number: recordNumber,
    anesthesiologist_name: professional, crm,
    procedure_name: signedText(data.procedure?.procedure),
    plan_name: signedText(data.procedure?.plan),
    procedure_date: procedureDayFormatter.format(new Date(performedAt)),
    start_date_time: start, end_date_time: end, anesthesia_type: anesthesia,
  };
}

async function confirm(delivery: InstitutionalDelivery, token: string | null) {
  const metadata = signedMetadata(delivery.signedPayload);
  if (!metadata) return "invalid_metadata" as const;
  if (!token) throw new CycleFailure(426, "institutional_client_update_required");
  const ticket = verifyCycleTicket(token, delivery.userId, "case", delivery.hospitalCode, delivery.shareWithHospital);
  if (ticket.document !== delivery.id || ticket.pdfHash !== delivery.pdfSha256) {
    throw new CycleFailure(409, "document_conflict");
  }
  const cycle = await confirmCycle(ticket, metadata, delivery.pdf);
  return { status: cycle.already_confirmed ? "already_received" as const : "created" as const,
    hospitalShared: cycle.hospital_shared, cycle };
}

export async function POST(request: Request, { params }: { params: Promise<{ hospitalCode: string }> }) {
  if (process.env.PRO_INSTITUTIONAL_UPLOAD_ENABLED !== "true") {
    return Response.json({ error: "institutional_upload_disabled" }, {
      status: 503, headers: { "Cache-Control": "private, no-store" },
    });
  }
  const { hospitalCode } = await params;
  const shared = !new URL(request.url).pathname.startsWith("/api/pro/conta/fichas-institucionais/");
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() === "application/json") {
    try {
      const bearer = request.headers.get("authorization")?.match(/^Bearer\s+(\S+)$/i)?.[1];
      const owner = bearer ? await authenticateProHospitalToken(bearer) : null;
      if (!owner) throw new CycleFailure(401, "unauthenticated");
      if (!await hasAccess(owner, hospitalCode)) throw new CycleFailure(403, "access_denied");
      const data = await cycleJSON(request);
      if (data.operation !== "authorize") throw new CycleFailure(400, "invalid_operation");
      const authorization = await authorizeCycle({ kind: "case", owner, hospital: hospitalCode,
        document: data.documentId, attempt: data.attemptId, pdfHash: data.pdfSha256, shared,
        createAttempt: data.createAttempt, uploadToken: data.uploadToken });
      return Response.json(authorization, { headers: { "Cache-Control": "private, no-store" } });
    } catch (error) { return cycleFailureResponse(error); }
  }
  return submitInstitutionalPDF(request, hospitalCode, {
    authenticate: authenticateProHospitalToken, hasAccess, verifyDocument,
    confirm: delivery => confirm(delivery, request.headers.get("x-anest-upload-token")), failure: cycleFailureResponse,
  }, shared);
}

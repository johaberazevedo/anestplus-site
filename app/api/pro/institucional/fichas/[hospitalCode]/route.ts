import { HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { authenticateProHospitalToken, getProHospitalLinksForUser } from "@/lib/pro-hospital-access";
import { institutionalRetentionMs, institutionalStorage, institutionalUploads,
  submitInstitutionalPDF, type InstitutionalDelivery } from "@/lib/pro-institutional-submission";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { extractTrustMarker } from "@/lib/trust/extractTrustMarker";
import { verifyTrustSignature } from "@/lib/trust/verifyTrustSignature";

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
    procedure?: { anesthesiaPlan?: unknown };
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
    procedure_date: procedureDayFormatter.format(new Date(performedAt)),
    start_date_time: start, end_date_time: end, anesthesia_type: anesthesia,
  };
}

async function confirm(delivery: InstitutionalDelivery) {
  const { id, hospitalCode, userId, pdfSha256, signedPayload, pdf } = delivery;
  const metadata = signedMetadata(signedPayload);
  if (!metadata) return "invalid_metadata";
  const fileKey = `pro/institucional/${hospitalCode}/${userId}/${id}.pdf`;
  const findReceipt = async () => {
    const { data, error } = await supabaseAdmin.from(institutionalUploads)
      .select("pdf_sha256,file_key,uploaded_at")
      .eq("hospital_code", hospitalCode).eq("user_id", userId).eq("document_id", id).maybeSingle();
    if (error) throw error;
    return data;
  };
  const receipt = await findReceipt();
  const checkReceipt = (row: NonNullable<typeof receipt>) => {
    if (row.pdf_sha256 !== pdfSha256 || row.file_key !== fileKey) return "conflict";
    if (Date.parse(row.uploaded_at) + institutionalRetentionMs <= Date.now()) return "expired";
    return "already_received";
  };
  const status = receipt ? checkReceipt(receipt) : null;
  if (status === "conflict" || status === "expired") return status;

  const { client, bucket } = institutionalStorage();
  const checkObject = async () => {
    const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: fileKey }));
    if (head.Metadata?.sha256 !== pdfSha256 || head.ContentLength !== pdf.byteLength
        || head.ContentType !== "application/pdf") return "conflict";
    if (head.LastModified && head.LastModified.getTime() + institutionalRetentionMs <= Date.now()) return "expired";
    return "same";
  };
  if (status === "already_received") {
    const object = await checkObject();
    return object === "same" ? status : object;
  }

  try {
    await client.send(new PutObjectCommand({
      Bucket: bucket, Key: fileKey, Body: pdf, ContentType: "application/pdf",
      CacheControl: "private, no-store", IfNoneMatch: "*", Metadata: { sha256: pdfSha256 },
    }));
  } catch (error) {
    const httpStatus = (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
    if (httpStatus !== 412) throw error;
    const object = await checkObject();
    if (object !== "same") return object;
  }

  // O vínculo pode ter sido revogado enquanto o R2 recebia o arquivo.
  if (!await hasAccess(userId, hospitalCode)) return "access_denied";
  const { error } = await supabaseAdmin.from(institutionalUploads).insert({
    hospital_code: hospitalCode, user_id: userId, document_id: id,
    pdf_sha256: pdfSha256, file_key: fileKey, ...metadata,
  });
  if (error?.code === "23505") {
    const concurrentReceipt = await findReceipt();
    if (concurrentReceipt) return checkReceipt(concurrentReceipt);
  }
  if (error) throw error;
  return "created";
}

export async function POST(request: Request, { params }: { params: Promise<{ hospitalCode: string }> }) {
  if (process.env.PRO_INSTITUTIONAL_UPLOAD_ENABLED !== "true") {
    return Response.json({ error: "institutional_upload_disabled" }, {
      status: 503, headers: { "Cache-Control": "private, no-store" },
    });
  }
  const { hospitalCode } = await params;
  return submitInstitutionalPDF(request, hospitalCode, {
    authenticate: authenticateProHospitalToken, hasAccess, verifyDocument, confirm,
  });
}

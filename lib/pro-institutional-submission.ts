export type InstitutionalDelivery = {
  id: string;
  hospitalCode: string;
  userId: string;
  pdfSha256: string;
  signedPayload: string;
  pdf: Uint8Array;
  shareWithHospital: boolean;
};

type VerifiedDocument = { signedPayload: string };

type SubmissionServices = {
  failure?(error: unknown): Response;
  authenticate(token: string): Promise<string | null>;
  hasAccess(userId: string, hospitalCode: string): Promise<boolean>;
  // Must extract the marker from these very bytes and verify its payload and signature.
  verifyDocument(pdf: Uint8Array): Promise<VerifiedDocument | null>;
  // Must atomically deduplicate hospital/user/id and compare the PDF hash on replay.
  confirm(delivery: InstitutionalDelivery): Promise<
    "created" | "already_received" | "conflict" | "access_denied" | "expired" | "invalid_metadata"
    | { status: "created" | "already_received"; hospitalShared: boolean; cycle?: { attempt_id: string; uploaded_at: string; expires_at: string; already_confirmed: boolean; billing_effect: string } }
  >;
};

const maxPDFBytes = 4 * 1024 * 1024;
const noStore = { "Cache-Control": "private, no-store" };

function reply(body: object, status: number) {
  return Response.json(body, { status, headers: noStore });
}

async function readPDF(request: Request): Promise<Uint8Array<ArrayBuffer> | null> {
  const reader = request.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maxPDFBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const data = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    data.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return data;
}

async function sha256(bytes: Uint8Array<ArrayBuffer>) {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function submitInstitutionalPDF(request: Request, hospitalCode: string, services: SubmissionServices,
  shareWithHospital = true) {
  if (hospitalCode.length > 80 || !/^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(hospitalCode)) {
    return reply({ error: "invalid_hospital" }, 400);
  }
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!token) return reply({ error: "unauthenticated" }, 401);

  try {
    const userId = await services.authenticate(token);
    if (!userId) return reply({ error: "unauthenticated" }, 401);
    if (!await services.hasAccess(userId, hospitalCode)) return reply({ error: "access_denied" }, 403);

    if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/pdf") {
      return reply({ error: "invalid_content_type" }, 415);
    }
    if (Number(request.headers.get("content-length")) > maxPDFBytes) return reply({ error: "pdf_too_large" }, 413);
    const pdf = await readPDF(request);
    if (!pdf) return reply({ error: "pdf_too_large" }, 413);
    if (new TextDecoder().decode(pdf.subarray(0, 5)) !== "%PDF-") {
      return reply({ error: "invalid_pdf" }, 422);
    }

    const document = await services.verifyDocument(pdf);
    if (!document) return reply({ error: "invalid_signature" }, 422);
    let institution: { hospitalCode?: unknown; signerUserID?: unknown } | undefined;
    try {
      institution = JSON.parse(document.signedPayload)?.institution;
    } catch {
      return reply({ error: "invalid_signature" }, 422);
    }
    if (institution?.hospitalCode !== hospitalCode || typeof institution.signerUserID !== "string"
        || institution.signerUserID.toLowerCase() !== userId.toLowerCase()) {
      return reply({ error: "document_scope_mismatch" }, 403);
    }

    const id = await sha256(new TextEncoder().encode(document.signedPayload));
    const pdfSha256 = await sha256(pdf);
    if (!await services.hasAccess(userId, hospitalCode)) return reply({ error: "access_denied" }, 403);
    const result = await services.confirm({ id, hospitalCode, userId, pdfSha256,
      signedPayload: document.signedPayload, pdf, shareWithHospital });
    if (result === "conflict") return reply({ error: "document_conflict" }, 409);
    if (result === "access_denied") return reply({ error: "access_denied" }, 403);
    if (result === "expired") return reply({ error: "document_expired" }, 410);
    if (result === "invalid_metadata") return reply({ error: "invalid_metadata" }, 422);
    const status = typeof result === "string" ? result : result.status;
    const hospitalShared = typeof result === "string" ? shareWithHospital : result.hospitalShared;
    return reply({ id, status: "received", hospital_shared: hospitalShared,
      ...(typeof result === "object" && result.cycle ? result.cycle : {}) }, status === "created" ? 201 : 200);
  } catch (error) {
    return services.failure?.(error) ?? reply({ error: "temporarily_unavailable" }, 503);
  }
}
import { S3Client } from "@aws-sdk/client-s3";

export const institutionalUploads = "institutional_pro_fichas_uploads";
export const institutionalRetentionMs = 30 * 24 * 60 * 60 * 1000;

export function institutionalStorage() {
  const { R2_ACCOUNT_ID: account, R2_ACCESS_KEY_ID: accessKeyId,
    R2_SECRET_ACCESS_KEY: secretAccessKey, R2_BUCKET_NAME: bucket } = process.env;
  if (!account || !accessKeyId || !secretAccessKey || !bucket) throw new Error("R2 configuration");
  return { bucket, client: new S3Client({ region: "auto",
    endpoint: `https://${account}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey } }) };
}

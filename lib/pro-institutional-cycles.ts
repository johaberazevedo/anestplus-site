import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { isHospitalCode } from "@/lib/institutional-hospitals";
import { institutionalStorage } from "@/lib/pro-institutional-submission";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const cycleTables = {
  identities: "institutional_pro_document_identities",
  caseOwner: "institutional_case_owner_latest",
  caseHospital: "institutional_case_hospital_latest",
  preOwner: "institutional_pre_owner_latest",
  preHospital: "institutional_pre_hospital_latest",
  production: "institutional_billing_production",
} as const;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const hashPattern = /^[0-9a-f]{64}$/;
const maxPDFBytes = 4 * 1024 * 1024;
type Kind = "case" | "pre";
export type CycleTicket = {
  version: 1; kind: Kind; owner: string; hospital: string; document: string;
  attempt: string; pdfHash: string; shared: boolean; key: string;
  issuedAt: string; expiresAt: string; hiddenMarker: string | null;
  fileName?: string; crm?: string;
};
type Reservation = {
  issued_at: string; ticket_expires_at: string; owner_hidden_marker: string | null;
  legacy_reference_required: boolean; legacy_attempt_id: string | null; legacy_file_key: string | null;
};
export type CycleReceipt = {
  ok: true; document_id: string; attempt_id: string; already_confirmed: boolean;
  hospital_shared: boolean; billing_effect: string; uploaded_at: string; expires_at: string;
};
export class CycleFailure extends Error {
  constructor(public status: number, public code: string) { super(code); }
}
export async function cycleJSON(request: Request): Promise<Record<string, unknown>> {
  const reader = request.body?.getReader();
  if (!reader) throw new CycleFailure(400, "invalid_json");
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 16 * 1024) { await reader.cancel(); throw new CycleFailure(413, "request_too_large"); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  let data;
  try { data = JSON.parse(Buffer.concat(chunks, length).toString("utf8")); }
  catch { throw new CycleFailure(400, "invalid_json"); }
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new CycleFailure(400, "invalid_json");
  return data;
}
export function cycleUUID(value: unknown): string {
  if (typeof value !== "string" || !uuidPattern.test(value.toLowerCase())) {
    throw new CycleFailure(400, "invalid_attempt_id");
  }
  return value.toLowerCase();
}
export function cycleHash(value: unknown): string {
  if (typeof value !== "string" || !hashPattern.test(value)) throw new CycleFailure(400, "invalid_pdf_hash");
  return value;
}
export function pdfHash(bytes: Uint8Array): string { return createHash("sha256").update(bytes).digest("hex"); }
function objectKey(t: Pick<CycleTicket, "kind" | "hospital" | "owner" | "document" | "attempt">) {
  const prefix = t.kind === "case" ? "pro/institucional" : "pro/institutional/pre-anestesicas";
  return `${prefix}/${t.hospital}/${t.owner}/${t.document}/${t.attempt}.pdf`;
}
function signature(payload: string): Buffer {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Cycle signing configuration");
  // Dominio exclusivo: nao aceita autorizacoes do fluxo pessoal de pre-anestesica.
  return createHmac("sha256", key).update(`pro-institutional-cycle-v1:${payload}`).digest();
}
function sign(t: CycleTicket) {
  const payload = Buffer.from(JSON.stringify(t)).toString("base64url");
  return `${payload}.${signature(payload).toString("base64url")}`;
}
export function verifyCycleTicket(value: unknown, owner: string, kind: Kind, hospital: string, shared: boolean): CycleTicket {
  if (typeof value !== "string" || value.length > 6000) throw new CycleFailure(403, "invalid_upload_authorization");
  const parts = value.split(".");
  if (parts.length !== 2 || !/^[A-Za-z0-9_-]+$/.test(parts[0]) || !/^[A-Za-z0-9_-]+$/.test(parts[1])) {
    throw new CycleFailure(403, "invalid_upload_authorization");
  }
  const actual = Buffer.from(parts[1], "base64url");
  const expected = signature(parts[0]);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    throw new CycleFailure(403, "invalid_upload_authorization");
  }
  let t: CycleTicket;
  try { t = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8")); }
  catch { throw new CycleFailure(403, "invalid_upload_authorization"); }
  if (!t || t.version !== 1 || t.owner !== owner || t.kind !== kind || t.hospital !== hospital || t.shared !== shared
      || !isHospitalCode(t.hospital) || !uuidPattern.test(t.owner) || !uuidPattern.test(t.attempt)
      || !(kind === "case" ? hashPattern : uuidPattern).test(t.document) || !hashPattern.test(t.pdfHash)
      || t.key !== objectKey(t) || !Number.isFinite(Date.parse(t.issuedAt)) || !Number.isFinite(Date.parse(t.expiresAt))
      || Date.parse(t.expiresAt) <= Date.parse(t.issuedAt) || Date.parse(t.expiresAt) - Date.parse(t.issuedAt) > 86_400_000
      || (t.hiddenMarker !== null && !Number.isFinite(Date.parse(t.hiddenMarker)))
      || (kind === "pre" && (!t.crm || !t.fileName || !/^[A-Za-z0-9_][A-Za-z0-9_.-]*\.pdf$/.test(t.fileName)))) {
    throw new CycleFailure(403, "upload_scope_mismatch");
  }
  // Nao expira aqui: uma tentativa ja confirmada pode recuperar seu recibo apos 24h.
  return t;
}
function databaseFailure(error: { code?: string; message?: string }): never {
  const message = error.message ?? "";
  if (error.code === "42501") throw new CycleFailure(403, "access_denied");
  if (error.code === "23514" || error.code === "23505") throw new CycleFailure(409, "document_conflict");
  if (error.code === "22023") {
    if (message === "legacy_pdf_hash_required") throw new CycleFailure(409, "legacy_pdf_hash_required");
    if (message.includes("attempt_expired")) throw new CycleFailure(403, "upload_authorization_expired");
    if (message === "cycle_expired") throw new CycleFailure(410, "cycle_expired");
    throw new CycleFailure(422, "invalid_metadata");
  }
  // Inclusive funcao/tabela ainda ausente: nunca volta ao INSERT antigo.
  throw new CycleFailure(503, "institutional_cycle_unavailable");
}
async function rpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    const { data, error } = await supabaseAdmin.rpc(name, args);
    if (!error) {
      if (data == null) throw new CycleFailure(503, "institutional_cycle_unavailable");
      return data as T;
    }
    if (attempt < 2 && (error.code === "40001" || error.code === "40P01")) {
      await new Promise((resolve) => setTimeout(resolve, 25 * (attempt + 1)));
    } else databaseFailure(error);
  }
}
async function readObject(key: string, storage = institutionalStorage()) {
  const { client, bucket } = storage;
  let object;
  try { object = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key })); }
  catch (error) {
    const missing = error as { name?: string; Code?: string; $metadata?: { httpStatusCode?: number } };
    if (missing.$metadata?.httpStatusCode === 404 && (missing.name === "NoSuchKey" || missing.Code === "NoSuchKey")) {
      throw new CycleFailure(409, "pdf_missing");
    }
    throw new CycleFailure(503, "temporarily_unavailable");
  }
  const closeBody = () => (object.Body as { destroy?: () => void } | undefined)?.destroy?.();
  if (object.ContentLength != null && object.ContentLength > maxPDFBytes) {
    closeBody();
    throw new CycleFailure(413, "pdf_too_large");
  }
  if (object.ContentType?.split(";")[0].trim().toLowerCase() !== "application/pdf" || !object.Body
      || (object.ContentLength != null && object.ContentLength < 1)) {
    closeBody();
    throw new CycleFailure(422, "invalid_pdf");
  }
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    for await (const chunk of object.Body as AsyncIterable<Uint8Array>) {
      if (!(chunk instanceof Uint8Array)) throw new CycleFailure(422, "invalid_pdf");
      length += chunk.byteLength;
      if (length > maxPDFBytes) throw new CycleFailure(413, "pdf_too_large");
      chunks.push(chunk);
    }
  } finally { closeBody(); }
  const bytes = Buffer.concat(chunks, length);
  if (bytes.subarray(0, 5).toString("ascii") !== "%PDF-"
      || !object.LastModified || !Number.isFinite(object.LastModified.getTime())) {
    throw new CycleFailure(422, "invalid_pdf");
  }
  return { hash: pdfHash(bytes), uploadedAt: object.LastModified.toISOString(), authorization: object.Metadata?.["anest-cycle"] };
}
export async function authorizeCycle(input: {
  kind: Kind; owner: string; hospital: string; document: unknown; attempt: unknown;
  pdfHash: unknown; shared: boolean; fileName?: string; crm?: string;
  createAttempt?: unknown; uploadToken?: unknown;
}) {
  if (!isHospitalCode(input.hospital) || typeof input.document !== "string"
      || !(input.kind === "case" ? hashPattern : uuidPattern).test(input.document)) {
    throw new CycleFailure(400, "invalid_document_id");
  }
  if (input.kind === "pre" && (!input.fileName || input.fileName.length > 200
      || !/^[A-Za-z0-9_][A-Za-z0-9_.-]*\.pdf$/.test(input.fileName)
      || !input.crm?.trim() || input.crm.length > 50 || input.crm.includes("\0"))) {
    throw new CycleFailure(400, "invalid_pre_metadata");
  }
  const creating = input.createAttempt === true;
  if (creating && (input.attempt != null || input.uploadToken != null)) throw new CycleFailure(400, "invalid_attempt_operation");
  if (!creating && input.attempt == null) throw new CycleFailure(426, "institutional_client_update_required");
  const attempt = creating ? randomUUID() : cycleUUID(input.attempt);
  const hash = cycleHash(input.pdfHash);
  // Só uma criação explícita emite horários. Retomar nunca chama a reserva SQL.
  const reservation = creating ? await rpc<Reservation>("reserve_pro_institutional_ticket", {
    p_kind: input.kind, p_hospital: input.hospital, p_owner: input.owner,
    p_document: input.document, p_pdf_sha256: hash,
  }) : null;
  if (reservation?.legacy_reference_required) {
    if (input.kind !== "pre" || !reservation.legacy_file_key || !reservation.legacy_attempt_id) {
      throw new CycleFailure(503, "legacy_reference_unavailable");
    }
    const legacy = await readObject(reservation.legacy_file_key);
    // O hash vem dos bytes antigos, nunca do novo arquivo ou de HEAD/metadata.
    const { error } = await supabaseAdmin.rpc("establish_pro_legacy_pre_hash", {
      p_hospital: input.hospital, p_owner: input.owner, p_document: input.document,
      p_reference: reservation.legacy_attempt_id, p_file_key: reservation.legacy_file_key, p_pdf_sha256: legacy.hash,
    });
    if (error) databaseFailure(error);
    if (legacy.hash !== hash) throw new CycleFailure(409, "document_conflict");
  }
  let ticket: CycleTicket = {
    version: 1, kind: input.kind, owner: input.owner, hospital: input.hospital,
    document: input.document, attempt, pdfHash: hash, shared: input.shared,
    key: "", issuedAt: reservation?.issued_at ?? "", expiresAt: reservation?.ticket_expires_at ?? "",
    hiddenMarker: reservation?.owner_hidden_marker ?? null,
    ...(input.kind === "pre" && { fileName: input.fileName, crm: input.crm }),
  };
  ticket.key = objectKey(ticket);
  // Reautorizacao da MESMA tentativa ja confirmada recupera seus horarios.
  // Nao emite um ciclo novo nem altera o destino de um recibo existente.
  const { data: previous, error: lookupError } = await supabaseAdmin.from(
    input.kind === "case" ? "institutional_pro_fichas_uploads" : "institutional_pro_pre_anesthetic_uploads",
  ).select("*")
    .eq("user_id", input.owner).eq(input.kind === "case" ? "attempt_id" : "id", attempt).maybeSingle();
  if (lookupError) databaseFailure(lookupError);
  if (previous) {
    if (previous.hospital_code !== input.hospital || (input.kind === "case" ? previous.document_id : previous.upload_id) !== input.document
        || previous.pdf_sha256 !== hash || previous.file_key !== ticket.key || previous.hospital_visible !== input.shared
        || (input.kind === "pre" && (previous.crm !== input.crm || previous.file_name !== input.fileName))) {
      throw new CycleFailure(409, "document_conflict");
    }
    if (Date.parse(previous.uploaded_at) + 30 * 86_400_000 <= Date.now()) throw new CycleFailure(410, "cycle_expired");
    ticket.issuedAt = previous.attempt_issued_at;
    ticket.expiresAt = previous.attempt_expires_at;
    ticket.hiddenMarker = null;
  } else if (!creating) {
    // Sem recibo, só a autorização original pode provar a idade da tentativa.
    // UUID desconhecido jamais ganha outro ticket, inclusive após a limpeza.
    if (input.uploadToken == null) throw new CycleFailure(410, "attempt_unrecoverable");
    const original = verifyCycleTicket(input.uploadToken, input.owner, input.kind, input.hospital, input.shared);
    if (original.attempt !== attempt || original.document !== input.document || original.pdfHash !== hash
        || original.crm !== ticket.crm || original.fileName !== ticket.fileName) {
      throw new CycleFailure(409, "attempt_conflict");
    }
    if (Date.parse(original.expiresAt) <= Date.now()) throw new CycleFailure(410, "upload_authorization_expired");
    ticket = original;
  }
  const { bucket, client } = institutionalStorage();
  const uploadToken = !creating && !previous ? input.uploadToken as string : sign(ticket);
  return {
    attemptId: attempt, documentId: ticket.document, uploadId: ticket.document,
    uploadToken, issuedAt: ticket.issuedAt, authorizationExpiresAt: ticket.expiresAt,
    confirmationOnly: previous !== null,
    ...(ticket.kind === "pre" && { fileKey: ticket.key, fileName: ticket.fileName }),
    ...(ticket.kind === "pre" && !previous && {
      uploadUrl: await getSignedUrl(client, new PutObjectCommand({
        Bucket: bucket, Key: ticket.key, ContentType: "application/pdf", IfNoneMatch: "*",
        Metadata: { "anest-cycle": uploadToken },
      }), { expiresIn: 60, unhoistableHeaders: new Set(["x-amz-meta-anest-cycle"]) }),
      uploadHeaders: { "Content-Type": "application/pdf", "If-None-Match": "*", "x-amz-meta-anest-cycle": uploadToken },
    }),
  };
}
export async function confirmCycle(ticket: CycleTicket, metadata: Record<string, unknown>, pdf?: Uint8Array): Promise<CycleReceipt> {
  const table = ticket.kind === "case" ? "institutional_pro_fichas_uploads" : "institutional_pro_pre_anesthetic_uploads";
  const { data: previous, error } = await supabaseAdmin.from(table).select("*")
    .eq("user_id", ticket.owner).eq(ticket.kind === "case" ? "attempt_id" : "id", ticket.attempt).maybeSingle();
  if (error) databaseFailure(error);
  if (previous && (previous.hospital_code !== ticket.hospital
      || (ticket.kind === "case" ? previous.document_id : previous.upload_id) !== ticket.document
      || previous.file_key !== ticket.key || previous.pdf_sha256 !== ticket.pdfHash || previous.hospital_visible !== ticket.shared
      || (ticket.kind === "pre" && (previous.file_name !== ticket.fileName || previous.crm !== ticket.crm)))) {
    throw new CycleFailure(409, "attempt_conflict");
  }
  if (previous && Date.parse(previous.uploaded_at) + 30 * 86_400_000 <= Date.now()) {
    throw new CycleFailure(410, "cycle_expired");
  }
  if (!previous && Date.parse(ticket.expiresAt) <= Date.now()) throw new CycleFailure(403, "upload_authorization_expired");
  const storage = institutionalStorage();
  if (pdf) {
    if (pdfHash(pdf) !== ticket.pdfHash) throw new CycleFailure(409, "document_conflict");
    // Nao recria um objeto desaparecido de uma tentativa ja confirmada.
    if (!previous) {
      const { client, bucket } = storage;
      try {
        await client.send(new PutObjectCommand({ Bucket: bucket, Key: ticket.key, Body: pdf,
          ContentType: "application/pdf", CacheControl: "private, no-store", IfNoneMatch: "*",
          Metadata: { "anest-cycle": sign(ticket) } }));
      } catch (putError) {
        if ((putError as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode !== 412) throw putError;
      }
    }
  }
  let object;
  try { object = await readObject(ticket.key, storage); }
  catch (readError) {
    if (readError instanceof CycleFailure && readError.code === "pdf_missing") {
      throw new CycleFailure(409, previous ? "confirmed_pdf_missing" : "upload_not_received");
    }
    throw readError;
  }
  if (object.hash !== ticket.pdfHash) throw new CycleFailure(409, "document_conflict");
  // O PUT condicional fixa a PRIMEIRA autorizacao. Reautorizacoes concorrentes
  // nao trocam horarios/marcador nem prolongam uma tentativa ja enviada.
  // Recibo confirmado e a referencia definitiva, inclusive apos rotacao da chave
  // HMAC. A recuperacao exige sessao, ticket atual valido e hash REAL coincidente.
  const stored = previous
    ? { ...ticket, issuedAt: previous.attempt_issued_at, expiresAt: previous.attempt_expires_at, hiddenMarker: null }
    : verifyCycleTicket(object.authorization, ticket.owner, ticket.kind, ticket.hospital, ticket.shared);
  if (stored.document !== ticket.document || stored.attempt !== ticket.attempt || stored.pdfHash !== ticket.pdfHash
      || stored.key !== ticket.key || stored.crm !== ticket.crm || stored.fileName !== ticket.fileName) {
    throw new CycleFailure(409, "attempt_conflict");
  }
  const result = await rpc<CycleReceipt>("confirm_pro_institutional_cycle", {
    p_kind: ticket.kind, p_hospital_code: ticket.hospital, p_user_id: ticket.owner,
    p_document_id: ticket.document, p_attempt_id: ticket.attempt, p_pdf_sha256: object.hash, p_file_key: ticket.key,
    p_object_uploaded_at: previous?.uploaded_at ?? object.uploadedAt,
    p_issued_at: stored.issuedAt, p_ticket_expires_at: stored.expiresAt,
    p_hospital_shared: ticket.shared, p_metadata: metadata, p_file_name: ticket.fileName ?? null,
    p_hidden_marker: stored.hiddenMarker,
  });
  if (!result.ok || result.attempt_id !== ticket.attempt || result.document_id !== ticket.document) {
    throw new CycleFailure(503, "institutional_cycle_unavailable");
  }
  return result;
}
export function cycleFailureResponse(error: unknown) {
  return error instanceof CycleFailure
    ? Response.json({ error: error.code, code: error.code }, { status: error.status, headers: { "Cache-Control": "private, no-store" } })
    : Response.json({ error: "temporarily_unavailable" }, { status: 503, headers: { "Cache-Control": "private, no-store" } });
}

// Calendario da competencia ja aprovado: America/Bahia; nao depende do mes de upload.
export function activeBillingMonthCutoff(now = new Date()) {
  const local = new Date(now.getTime() - 3 * 3_600_000);
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth() - 6, 1)).toISOString().slice(0, 10);
}

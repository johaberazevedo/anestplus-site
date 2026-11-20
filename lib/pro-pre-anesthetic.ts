import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { HOSPITAL_PRE_ANESTHETIC_FEATURE, HOSPITAL_COORDINATION_FEATURE, isHospitalCode, type HospitalAccessFeature } from "@/lib/institutional-hospitals";
import { getProHospitalLinksForUser } from "@/lib/pro-hospital-access";
import { supabaseAdmin } from "@/lib/supabase-admin";

const TABLE = "pro_pre_anesthetic_uploads";
const AUDIT = "pro_pre_anesthetic_audit_logs";
export const institutionalPreUploads = "institutional_pro_pre_anesthetic_uploads";
const institutionalPreAudit = "institutional_pro_pre_anesthetic_audit_logs";
type InstitutionalScope = { hospitalCode: string; hospitalShared: boolean };
function uploads(institutional: boolean) { return institutional ? institutionalPreUploads : TABLE; }
async function requireHospital(owner: string, code: string, feature: HospitalAccessFeature = HOSPITAL_PRE_ANESTHETIC_FEATURE) {
  if (!isHospitalCode(code)) fail(400, "Hospital inválido.");
  const [links, hospital] = await Promise.all([
    getProHospitalLinksForUser(owner, code, feature),
    supabaseAdmin.from("institutional_hospitals").select("code,name")
      .eq("code", code).eq("is_active", true).maybeSingle(),
  ]);
  if (hospital.error) throw hospital.error;
  if (!links.includes(code) || !hospital.data) fail(403, "Vínculo institucional não autorizado.");
  return hospital.data;
}
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DAY = 86_400_000;
class Failure extends Error {
  constructor(public status: number, message: string, public code?: string) { super(message); }
}
function fail(status: number, message: string): never { throw new Failure(status, message); }
function required(value: unknown, name: string, max = 250): string {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max) {
    fail(400, `${name} inválido.`);
  }
  return value.trim();
}
function uuid(value: unknown, name: string): string {
  const result = required(value, name, 36);
  if (!UUID.test(result)) fail(400, `${name} inválido.`);
  return result.toLowerCase();
}
function dateOnly(value: unknown): string {
  const date = required(value, "Data", 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) ||
      new Date(date).toISOString().slice(0, 10) !== date) fail(400, "Data inválida.");
  return date;
}
function timestamp(value: unknown): string {
  const date = required(value, "Data de exportação", 40);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,9})?(Z|[+-]\d{2}:\d{2})$/.test(date) ||
      !Number.isFinite(Date.parse(date))) fail(400, "Data de exportação inválida.");
  dateOnly(date.slice(0, 10));
  return new Date(date).toISOString();
}
async function body(request: Request): Promise<Record<string, unknown>> {
  const data = await request.json().catch(() => null);
  if (!data || typeof data !== "object" || Array.isArray(data)) fail(400, "JSON inválido.");
  return data;
}
async function userId(request: Request): Promise<string> {
  const match = request.headers.get("authorization")?.match(/^Bearer\s+(\S+)$/i);
  if (!match) fail(401, "Não autenticado.");
  const { data, error } = await supabaseAdmin.auth.getUser(match[1]);
  if (error || !data.user) fail(401, "Sessão inválida.");
  return data.user.id;
}
function storage() {
  const { R2_ACCOUNT_ID: account, R2_ACCESS_KEY_ID: accessKeyId,
    R2_SECRET_ACCESS_KEY: secretAccessKey, R2_BUCKET_NAME: bucket } = process.env;
  if (!account || !accessKeyId || !secretAccessKey || !bucket) throw new Error("R2 configuration");
  return { bucket, client: new S3Client({ region: "auto",
    endpoint: `https://${account}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey } }) };
}
function safeName(value: unknown): string {
  const name = required(value, "Nome do arquivo", 200).normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").replace(/\.pdf$/i, "")
    .replace(/[^a-zA-Z0-9_.-]+/g, "_").replace(/^\.+/, "");
  return `${name || "pre-anestesica"}.pdf`;
}
type Ticket = { userId: string; uploadId: string; crm: string; fileKey: string; fileName: string; expires: number; hospitalCode?: string; hospitalShared?: boolean };
function signature(payload: string): Buffer {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Signing configuration");
  return createHmac("sha256", key).update(`pro-pre-upload-v1:${payload}`).digest();
}
function sign(ticket: Ticket): string {
  const payload = Buffer.from(JSON.stringify(ticket)).toString("base64url");
  return `${payload}.${signature(payload).toString("base64url")}`;
}
function verify(value: unknown, owner: string): Ticket {
  const token = required(value, "Autorização de envio", 4000);
  const parts = token.split(".");
  if (parts.length !== 2) fail(403, "Autorização de envio inválida.");
  const expected = signature(parts[0]);
  const actual = Buffer.from(parts[1], "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    fail(403, "Autorização de envio inválida.");
  }
  let ticket: Ticket;
  try { ticket = JSON.parse(Buffer.from(parts[0], "base64url").toString()); }
  catch { return fail(403, "Autorização de envio inválida."); }
  if (!ticket || ticket.userId !== owner || !Number.isFinite(ticket.expires)) {
    fail(403, "Autorização de envio inválida.");
  }
  return ticket;
}
async function audit(event: string, owner: string, id: string, key: string, institutional = false) {
  const { error } = await supabaseAdmin.from(institutional ? institutionalPreAudit : AUDIT).insert({
    event_type: event, user_id: owner, ficha_id: id, file_key: key,
    metadata: {},
  });
  // As in the existing API, an audit failure must not report an uploaded PDF as unsent.
  if (error) console.error("[pro-pre] audit failed", error.code);
}
async function run(request: Request, operation: (owner: string) => Promise<unknown>) {
  try {
    const result = await operation(await userId(request));
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof Failure) {
      return NextResponse.json({ error: error.message, ...(error.code && { code: error.code }) }, { status: error.status, headers: { "Cache-Control": "no-store" } });
    }
    // Do not log tokens, PDF keys, patient names, or raw provider responses.
    console.error("[pro-pre] operation failed");
    return NextResponse.json({ error: "Não foi possível concluir a operação. Tente novamente." }, { status: 500 });
  }
}

async function authorize(request: Request, scope?: InstitutionalScope) {
  return run(request, async (owner) => {
    const data = await body(request);
    const uploadId = uuid(data.uploadId, "Identificador de envio");
    if (scope) {
      await requireHospital(owner, scope.hospitalCode);
      const { data: previous, error } = await supabaseAdmin.from(institutionalPreUploads).select("*")
        .eq("user_id", owner).eq("upload_id", uploadId).eq("hospital_code", scope.hospitalCode).maybeSingle();
      if (error) throw error;
      if (previous) {
        if (Date.parse(previous.expires_at) <= Date.now()) fail(409, "Este envio expirou.");
        if (scope.hospitalShared && !previous.hospital_visible) {
          const { error } = await supabaseAdmin.from(institutionalPreUploads).update({ hospital_visible: true })
            .eq("id", previous.id).eq("user_id", owner).eq("hospital_code", scope.hospitalCode);
          if (error) throw error;
        }
        return { ok: true, id: previous.id, alreadyConfirmed: true,
          hospital_shared: previous.hospital_visible || scope.hospitalShared };
      }
    }
    const crm = required(data.crm, "CRM", 50);
    const fileName = safeName(data.fileName);
    const fileKey = scope
      ? `pro/institutional/pre-anestesicas/${scope.hospitalCode}/${owner}/${uploadId}/${randomUUID()}.pdf`
      : `pro/pre-anestesicas/${owner}/${uploadId}/${randomUUID()}.pdf`;
    const { client, bucket } = storage();
    const uploadUrl = await getSignedUrl(client, new PutObjectCommand({
      Bucket: bucket, Key: fileKey, ContentType: "application/pdf", IfNoneMatch: "*",
    }), { expiresIn: 60 });
    return { uploadUrl, uploadId, fileKey, fileName,
      uploadHeaders: { "Content-Type": "application/pdf", "If-None-Match": "*" },
      uploadToken: sign({ userId: owner, uploadId, crm, fileKey, fileName, expires: Date.now() + DAY,
        ...(scope && { hospitalCode: scope.hospitalCode, hospitalShared: scope.hospitalShared }) }) };
  });
}

async function confirm(request: Request, scope?: InstitutionalScope) {
  return run(request, async (owner) => {
    const data = await body(request);
    const ticket = verify(data.uploadToken, owner);
    if (scope) await requireHospital(owner, scope.hospitalCode);
    if (ticket.hospitalCode !== scope?.hospitalCode || ticket.hospitalShared !== scope?.hospitalShared) {
      fail(403, "Autorização incompatível com o destino do envio.");
    }
    const patientName = required(data.patientName, "Paciente");
    const recordNumber = data.recordNumber == null || data.recordNumber === "" ? null
      : required(data.recordNumber, "Prontuário", 100);
    const exportedAt = timestamp(data.exportedAt);
    const exportDate = dateOnly(data.exportDate);
    // exportDate is the device's local date; permit offsets up to +/-14 hours.
    if (Math.abs(Date.parse(`${exportDate}T12:00:00Z`) - Date.parse(exportedAt)) > 26 * 3_600_000) {
      fail(400, "Data local incompatível com a exportação.");
    }
    const row = { user_id: owner, upload_id: ticket.uploadId, crm: ticket.crm,
      patient_name: patientName, record_number: recordNumber, exported_at: exportedAt,
      export_date: exportDate, file_key: ticket.fileKey, file_name: ticket.fileName,
      ...(scope && { hospital_code: scope.hospitalCode }) };
    const findExisting = async () => {
      const { data: existing, error } = await supabaseAdmin.from(uploads(!!scope)).select("*")
        .eq("user_id", owner).eq("upload_id", ticket.uploadId).maybeSingle();
      if (error) throw error;
      if (!existing) return null;
      if ((!scope && existing.deleted_at) || Date.parse(existing.expires_at) <= Date.now()) {
        fail(409, "Este envio foi excluído ou expirou. Faça uma nova exportação.");
      }
      // Tickets concorrentes do mesmo envio lógico podem apontar para objetos distintos.
      // O primeiro confirmado é preservado; os metadados e o escopo devem coincidir.
      const matches = Object.entries(row).every(([key, value]) => scope && key === "file_key" ? true : key === "exported_at"
        ? Date.parse(existing[key]) === Date.parse(value as string) : existing[key] === value);
      if (!matches) fail(409, "Identificador de envio já utilizado por outro documento ou conteúdo.");
      if (scope?.hospitalShared && !existing.hospital_visible) {
        const { error } = await supabaseAdmin.from(institutionalPreUploads).update({ hospital_visible: true })
          .eq("id", existing.id).eq("user_id", owner).eq("hospital_code", scope.hospitalCode);
        if (error) throw error;
      }
      return { ok: true, id: existing.id, alreadyConfirmed: true,
        ...(scope && { hospital_shared: existing.hospital_visible || scope.hospitalShared }) };
    };
    const existing = await findExisting();
    if (existing) return existing;
    if (ticket.expires <= Date.now()) throw new Failure(403, "Autorização de envio expirada.",
      scope ? "upload_authorization_expired" : undefined);
    const { client, bucket } = storage();
    let head;
    try { head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: ticket.fileKey })); }
    catch (error) {
      const status = (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
      if (status === 404) throw new Failure(409, "PDF ainda não encontrado. O envio não foi confirmado.", scope ? "pdf_missing" : undefined);
      throw error;
    }
    if (!head.ContentLength || head.ContentType?.split(";")[0].trim() !== "application/pdf") {
      fail(400, "Arquivo enviado vazio ou com tipo inválido.");
    }
    const now = Date.now();
    const { data: inserted, error } = await supabaseAdmin.from(uploads(!!scope)).insert({ ...row,
      ...(scope && { hospital_visible: scope.hospitalShared }),
      uploaded_at: new Date(now).toISOString(), expires_at: new Date(now + 30 * DAY).toISOString(),
    }).select("id").single();
    if (error?.code === "23505") {
      const raced = await findExisting();
      if (raced) return raced;
    }
    if (error || !inserted) throw error || new Error("Insert failed");
    await audit("sync_created", owner, inserted.id, ticket.fileKey, !!scope);
    return { ok: true, id: inserted.id, alreadyConfirmed: false, ...(scope && { hospital_shared: scope.hospitalShared }) };
  });
}

function list(request: Request, institutional = false) {
  return run(request, async (owner) => {
    const params = new URL(request.url).searchParams;
    const one = params.get("date");
    const from = dateOnly(one ?? params.get("date_from"));
    const to = dateOnly(one ?? params.get("date_to"));
    if (from > to) fail(400, "A data inicial não pode ser maior que a final.");
    const rawOffset = params.get("offset") ?? "0";
    if (!/^\d{1,8}$/.test(rawOffset)) fail(400, "Paginação inválida.");
    const offset = Number(rawOffset);
    const limit = 100;
    const { data, error } = await supabaseAdmin.from(uploads(institutional))
      .select("id, patient_name, record_number, crm, exported_at, export_date, uploaded_at, expires_at, file_name" +
        (institutional ? ",hospital_code,hospital:institutional_hospitals(name)" : ""))
      .eq("user_id", owner).is(institutional ? "owner_hidden_at" : "deleted_at", null).gt("expires_at", new Date().toISOString())
      .gte("export_date", from).lte("export_date", to)
      .order("exported_at", { ascending: false }).order("id", { ascending: false })
      .range(offset, offset + limit);
    if (error) throw error;
    const rows = data ?? [];
    return { fichas: rows.slice(0, limit), nextOffset: rows.length > limit ? offset + limit : null };
  });
}

function getDownload(request: Request, institutional = false) {
  return run(request, async (owner) => {
    const data = await body(request);
    const id = uuid(data.fichaId, "Ficha");
    const now = new Date().toISOString();
    const { data: row, error } = await supabaseAdmin.from(uploads(institutional))
      .select("id, file_key, file_name, expires_at").eq("id", id).eq("user_id", owner)
      .is(institutional ? "owner_hidden_at" : "deleted_at", null).gt("expires_at", now).maybeSingle();
    if (error) throw error;
    if (!row) fail(404, "Pré-anestésica indisponível.");
    const { client, bucket } = storage();
    const remaining = institutional ? Math.floor((Date.parse(row.expires_at) - Date.now()) / 1000) : 60;
    if (remaining < 1) fail(404, "Pré-anestésica indisponível.");
    const downloadUrl = await getSignedUrl(client, new GetObjectCommand({
      Bucket: bucket, Key: row.file_key, ResponseContentType: "application/pdf",
      ResponseContentDisposition: `attachment; filename="${safeName(row.file_name)}"`,
    }), { expiresIn: Math.min(remaining, 60) });
    const { error: updateError } = await supabaseAdmin.from(uploads(institutional))
      .update({ last_downloaded_at: now }).eq("id", id).eq("user_id", owner);
    if (updateError) console.error("[pro-pre] download timestamp failed", updateError.code);
    return { downloadUrl };
  });
}

function remove(request: Request, institutional = false) {
  return run(request, async (owner) => {
    const data = await body(request);
    const id = uuid(data.fichaId, "Ficha");
    const { data: row, error } = await supabaseAdmin.from(uploads(institutional))
      .update({ [institutional ? "owner_hidden_at" : "deleted_at"]: new Date().toISOString() }).eq("id", id).eq("user_id", owner)
      .is(institutional ? "owner_hidden_at" : "deleted_at", null).select("id, file_key").maybeSingle();
    if (error) throw error;
    if (!row) fail(404, "Pré-anestésica indisponível ou já excluída.");
    await audit("user_deleted", owner, row.id, row.file_key, institutional);
    return { ok: true };
  });
}

// Os clientes antigos continuam nos handlers pessoais, sem aceitar tickets institucionais.
export function upload(request: Request) { return authorize(request); }
export function confirmar(request: Request) { return confirm(request); }
export function listar(request: Request) { return list(request); }
export function download(request: Request) { return getDownload(request); }
export function excluir(request: Request) { return remove(request); }

export async function institutionalPreUpload(request: Request, hospitalCode: string, operation: string) {
  if (process.env.PRO_INSTITUTIONAL_UPLOAD_ENABLED !== "true") {
    return NextResponse.json({ error: "institutional_upload_disabled" }, {
      status: 503, headers: { "Cache-Control": "no-store" },
    });
  }
  const data = await request.clone().json().catch(() => null);
  if (typeof data?.shareWithHospital !== "boolean") {
    return NextResponse.json({ error: "Informe o destino do envio." }, { status: 400 });
  }
  const scope = { hospitalCode, hospitalShared: data.shareWithHospital };
  if (operation === "upload") return authorize(request, scope);
  if (operation === "confirmar") return confirm(request, scope);
  return NextResponse.json({ error: "Operação inválida." }, { status: 400 });
}

export function institutionalPreOwner(request: Request, operation: string) {
  if (request.method === "GET" && operation === "listar") return list(request, true);
  if (request.method === "POST" && operation === "download") return getDownload(request, true);
  if (request.method === "POST" && operation === "excluir") return remove(request, true);
  return NextResponse.json({ error: "Operação inválida." }, { status: 400 });
}

export function institutionalPreCoordination(request: Request, hospitalCode: string) {
  return run(request, async (owner) => {
    await requireHospital(owner, hospitalCode, HOSPITAL_COORDINATION_FEATURE);
    const data = await body(request);
    const now = new Date().toISOString();
    const base = () => supabaseAdmin.from(institutionalPreUploads).select("*")
      .eq("hospital_code", hospitalCode).eq("hospital_visible", true).gt("expires_at", now);
    if (data.action === "download") {
      const { data: row, error } = await base().eq("id", uuid(data.documentId, "Pré-anestésica")).maybeSingle();
      if (error) throw error;
      if (!row) fail(404, "Pré-anestésica indisponível.");
      const { client, bucket } = storage();
      const remaining = Math.floor((Date.parse(row.expires_at) - Date.now()) / 1000);
      if (remaining < 1) fail(404, "Pré-anestésica indisponível.");
      return { downloadUrl: await getSignedUrl(client, new GetObjectCommand({
        Bucket: bucket, Key: row.file_key, ResponseContentType: "application/pdf",
        ResponseContentDisposition: `attachment; filename="${safeName(row.file_name)}"`,
      }), { expiresIn: Math.min(60, remaining) }) };
    }
    if (data.action !== "search") fail(400, "Operação inválida.");
    const date = dateOnly(data.date);
    const page = data.page ?? 1;
    if (typeof page !== "number" || !Number.isSafeInteger(page) || page < 1 || page > 1000000) fail(400, "Página inválida.");
    if (data.field !== "patient" && data.field !== "record") fail(400, "Filtro inválido.");
    const term = data.term ?? "";
    if (typeof term !== "string" || term.length > 120 || term.includes("\0")) fail(400, "Busca inválida.");
    const query = base().eq("export_date", date);
    if (term.trim()) query.filter(data.field === "patient" ? "patient_name" : "record_number", "imatch",
      term.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const { data: rows, error } = await query.order("exported_at", { ascending: false }).order("id")
      .range((page - 1) * 100, page * 100);
    if (error) throw error;
    return { fichas: (rows ?? []).slice(0, 100).map(row => ({ document_id: row.id,
      patient_name: row.patient_name, record_number: row.record_number, procedure_date: row.export_date,
      anesthesiologist_name: null, crm: row.crm })), page, hasMore: (rows ?? []).length > 100 };
  });
}

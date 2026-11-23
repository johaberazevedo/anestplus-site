import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { HOSPITAL_COORDINATION_FEATURE, isHospitalCode } from "@/lib/institutional-hospitals";
import { getProHospitalLinks } from "@/lib/pro-hospital-access";
import { institutionalRetentionMs, institutionalStorage } from "@/lib/pro-institutional-submission";
import { supabaseAdmin } from "@/lib/supabase-admin";

import { cycleTables, cycleUUID } from "@/lib/pro-institutional-cycles";

export const runtime = "nodejs";

const pageSize = 100;
type RouteContext = { params: Promise<{ hospitalCode: string }> };
type Hospital = { code: string; name: string };
type Search = { date?: unknown; page?: unknown; field?: unknown; term?: unknown };

function reply(body: object, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
}

function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

async function withCoordination(request: Request, { params }: RouteContext,
  action: (hospital: Hospital, validAfter: string) => Promise<Response>) {
  const { hospitalCode } = await params;
  if (!isHospitalCode(hospitalCode)) return reply({ error: "Hospital inválido." }, 400);
  try {
    const links = await getProHospitalLinks(request, hospitalCode, HOSPITAL_COORDINATION_FEATURE);
    if (!Array.isArray(links)) return links;
    if (!links.includes(hospitalCode)) return reply({ error: "Acesso à coordenação não autorizado." }, 403);

    const { data: hospital, error: hospitalError } = await supabaseAdmin.from("institutional_hospitals")
      .select("code,name").eq("code", hospitalCode).eq("is_active", true).maybeSingle();
    if (hospitalError) throw hospitalError;
    if (!hospital) return reply({ error: "Acesso à coordenação não autorizado." }, 403);

    return await action(hospital, new Date(Date.now() - institutionalRetentionMs).toISOString());
  } catch {
    return reply({ error: "Não foi possível acessar as fichas da coordenação." }, 503);
  }
}

async function listFichas(hospital: Hospital, validAfter: string, { date, page: rawPage, field = "patient", term = "" }: Search) {
  const pageValue = rawPage ?? 1;
  const page = typeof pageValue === "string" || typeof pageValue === "number" ? Number(pageValue) : NaN;
  const offset = (page - 1) * pageSize;
  if (!validDate(date) || !Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(offset + pageSize)
      || (field !== "patient" && field !== "record") || typeof term !== "string" || term.length > 120 || term.includes("\0")) {
    return reply({ error: "Data, página ou filtro inválidos." }, 400);
  }

  const query = supabaseAdmin.from(cycleTables.caseHospital)
    .select("user_id,document_id,attempt_id,patient_name,record_number,procedure_date,anesthesiologist_name,crm,uploaded_at")
    .eq("hospital_code", hospital.code).eq("hospital_visible", true)
    .eq("procedure_date", date).gt("uploaded_at", validAfter);
  const search = term.trim();
  if (search) {
    const pattern = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.filter(field === "patient" ? "patient_name" : "record_number", "imatch", pattern);
  }
  const { data, error } = await query.order("uploaded_at", { ascending: false })
    .order("document_id").order("user_id").range(offset, offset + pageSize);
  if (error) throw error;
  const rows = data ?? [];
  return reply({ hospital, fichas: rows.slice(0, pageSize), page, hasMore: rows.length > pageSize });
}

async function downloadFicha(hospital: Hospital, validAfter: string, documentId: unknown, userId: unknown, attemptId: unknown) {
  if (typeof documentId !== "string" || !/^[0-9a-f]{64}$/.test(documentId)) {
    return reply({ error: "Identificador da ficha inválido." }, 400);
  }
  let owner: string;
  let attempt: string;
  try {
    owner = cycleUUID(userId);
    attempt = cycleUUID(attemptId);
  } catch {
    return reply({ error: "Identificação da ficha incompleta. Atualize a busca." }, 400);
  }

  const { data, error } = await supabaseAdmin.from(cycleTables.caseHospital).select("file_key,uploaded_at")
    .eq("hospital_code", hospital.code).eq("hospital_visible", true)
    .eq("user_id", owner).eq("document_id", documentId).eq("attempt_id", attempt)
    .gt("uploaded_at", validAfter).maybeSingle();
  if (error) throw error;
  if (!data) return reply({ error: "Este ciclo da ficha não está mais disponível. Atualize a busca." }, 404);

  const remaining = Math.floor((Date.parse(data.uploaded_at) + institutionalRetentionMs - Date.now()) / 1000);
  if (!Number.isFinite(remaining) || remaining < 1) return reply({ error: "Este ciclo da ficha não está mais disponível. Atualize a busca." }, 404);
  const { bucket, client } = institutionalStorage();
  const downloadUrl = await getSignedUrl(client, new GetObjectCommand({
    Bucket: bucket, Key: data.file_key, ResponseContentType: "application/pdf",
    ResponseContentDisposition: 'attachment; filename="ficha-institucional.pdf"',
  }), { expiresIn: Math.min(remaining, 60) });
  return reply({ downloadUrl });
}

export async function GET(request: Request, context: RouteContext) {
  const query = new URL(request.url).searchParams;
  return withCoordination(request, context, (hospital, validAfter) =>
    listFichas(hospital, validAfter, { date: query.get("date"), page: query.get("page") }));
}

export async function POST(request: Request, context: RouteContext) {
  return withCoordination(request, context, async (hospital, validAfter) => {
    const body = await request.json().catch(() => null);
    if (body?.action === "search") return listFichas(hospital, validAfter, body);
    if (body?.action === "download") return downloadFicha(hospital, validAfter, body.documentId, body.userId, body.attemptId);
    return reply({ error: "Operação de coordenação inválida." }, 400);
  });
}

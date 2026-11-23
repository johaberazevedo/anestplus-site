import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { isHospitalCode } from "@/lib/institutional-hospitals";
import { authenticateProHospitalToken, getProHospitalLinksForUser } from "@/lib/pro-hospital-access";
import { institutionalRetentionMs, institutionalStorage } from "@/lib/pro-institutional-submission";
import { supabaseAdmin } from "@/lib/supabase-admin";

import { cycleTables, cycleUUID } from "@/lib/pro-institutional-cycles";

export const runtime = "nodejs";

function reply(body: object, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
}

async function withOwner(request: Request, action: (owner: string, validAfter: string) => Promise<Response>) {
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!token) return reply({ error: "Não autenticado." }, 401);
  try {
    const owner = await authenticateProHospitalToken(token);
    if (!owner) return reply({ error: "Sessão inválida." }, 401);
    return await action(owner, new Date(Date.now() - institutionalRetentionMs).toISOString());
  } catch {
    return reply({ error: "Não foi possível acessar as fichas institucionais agora." }, 503);
  }
}

function dateOnly(value: string | null): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

type Listing = {
  hospital_code: string;
  document_id: string;
  attempt_id: string;
  patient_name: string;
  record_number: string;
  procedure_date: string;
  start_date_time: string;
  end_date_time: string | null;
  anesthesia_type: string | null;
  uploaded_at: string;
  hospital_name: string | null;
};

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const contextOnly = params.get("context") === "1";
  if (process.env.PRO_INSTITUTIONAL_UPLOAD_ENABLED !== "true") {
    return reply(contextOnly ? { hasInstitutionalContext: false } : { fichas: [] });
  }
  return withOwner(request, async (owner, validAfter) => {
    if (contextOnly) {
      const links = await getProHospitalLinksForUser(owner);
      if (links.length > 0) return reply({ hasInstitutionalContext: true });

      const { data, error } = await supabaseAdmin.from(cycleTables.caseOwner)
        .select("document_id").eq("user_id", owner)
        .is("document_hidden_at", null).gt("uploaded_at", validAfter).limit(1).maybeSingle();
      if (error) throw error;
      return reply({ hasInstitutionalContext: data !== null });
    }
    const from = params.get("date") ?? params.get("date_from");
    const to = params.get("date") ?? params.get("date_to");
    if (!dateOnly(from) || !dateOnly(to) || from > to) {
      return reply({ error: "Informe uma data ou um período válido." }, 400);
    }
    const { data, error } = await supabaseAdmin.from(cycleTables.caseOwner)
      .select(`hospital_code,document_id,attempt_id,patient_name,record_number,procedure_date,
        start_date_time,end_date_time,anesthesia_type,uploaded_at,hospital_name`)
      .eq("user_id", owner).is("document_hidden_at", null).gt("uploaded_at", validAfter)
      .gte("procedure_date", from).lte("procedure_date", to)
      .order("uploaded_at", { ascending: false }).returns<Listing[]>();
    if (error) throw error;
    return reply({
      fichas: (data ?? []).map(({ hospital_name, ...ficha }) => ({
        ...ficha,
        id: `institucional:${ficha.hospital_code}:${ficha.document_id}`,
        hospital_name: hospital_name ?? ficha.hospital_code,
        expires_at: new Date(Date.parse(ficha.uploaded_at) + institutionalRetentionMs).toISOString(),
      })),
    });
  });
}

async function documentSelector(request: Request) {
  const body = await request.json().catch(() => null);
  if (!isHospitalCode(body?.hospitalCode) || typeof body?.documentId !== "string"
      || !/^[0-9a-f]{64}$/.test(body.documentId)) return null;
  return { hospitalCode: body.hospitalCode, documentId: body.documentId as string, attemptId: body.attemptId as unknown };
}

function unavailable() {
  return reply({ error: "Ficha institucional indisponível." }, 404);
}

export async function POST(request: Request) {
  if (process.env.PRO_INSTITUTIONAL_UPLOAD_ENABLED !== "true") return unavailable();
  return withOwner(request, async (owner, validAfter) => {
    const selector = await documentSelector(request);
    if (!selector) return reply({ error: "Identificador da ficha inválido." }, 400);
    const { hospitalCode, documentId } = selector;
    let attemptId: string;
    try { attemptId = cycleUUID(selector.attemptId); }
    catch { return reply({ error: "Identificação da ficha incompleta. Atualize a busca." }, 400); }
    const { data, error } = await supabaseAdmin.from(cycleTables.caseOwner)
      .select("file_key,uploaded_at")
      .eq("user_id", owner).eq("hospital_code", hospitalCode).eq("document_id", documentId).eq("attempt_id", attemptId)
      .is("document_hidden_at", null).gt("uploaded_at", validAfter).maybeSingle();
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
  });
}

export async function PATCH(request: Request) {
  if (process.env.PRO_INSTITUTIONAL_UPLOAD_ENABLED !== "true") return unavailable();
  return withOwner(request, async (owner, validAfter) => {
    const selector = await documentSelector(request);
    if (!selector) return reply({ error: "Identificador da ficha inválido." }, 400);
    const { hospitalCode, documentId } = selector;
    const { data: available, error: availableError } = await supabaseAdmin.from(cycleTables.caseOwner)
      .select("document_id").eq("user_id", owner).eq("hospital_code", hospitalCode).eq("document_id", documentId)
      .gt("uploaded_at", validAfter).maybeSingle();
    if (availableError) throw availableError;
    if (!available) return unavailable();
    const { data, error } = await supabaseAdmin.from(cycleTables.identities)
      .update({ owner_hidden_at: new Date().toISOString() })
      .eq("document_kind", "case").eq("user_id", owner).eq("hospital_code", hospitalCode).eq("document_id", documentId)
      .is("owner_hidden_at", null).select("document_id").maybeSingle();
    if (error) throw error;
    if (data) return reply({ ok: true });
    // Retry de ocultacao nao altera seu marcador nem o acesso do hospital.
    const { data: existing, error: lookupError } = await supabaseAdmin.from(cycleTables.identities)
      .select("owner_hidden_at").eq("document_kind", "case")
      .eq("user_id", owner).eq("hospital_code", hospitalCode).eq("document_id", documentId).maybeSingle();
    if (lookupError) throw lookupError;
    return existing?.owner_hidden_at ? reply({ ok: true }) : unavailable();
  });
}

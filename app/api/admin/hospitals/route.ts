import { NextResponse } from "next/server";
import { hasValidAdminSession, isTrustedAdminMutationRequest } from "@/lib/admin-auth";
import { HOSPITAL_FIELDS, parseHospital } from "@/lib/institutional-hospitals";
import { supabaseAdmin } from "@/lib/supabase-admin";

const ADMIN_HOSPITAL_FIELDS = `${HOSPITAL_FIELDS},billing_retention_emails_enabled`;

export async function GET() {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const { data, error } = await supabaseAdmin.from("institutional_hospitals")
    .select(ADMIN_HOSPITAL_FIELDS).order("name").order("code");
  if (error) {
    return NextResponse.json({ error: "Não foi possível carregar os hospitais." }, { status: 500 });
  }
  return NextResponse.json({ hospitals: data }, { headers: { "Cache-Control": "no-store" } });
}

async function save(request: Request, create: boolean) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  if (!isTrustedAdminMutationRequest(request)) {
    return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const hospital = body && typeof body === "object" ? parseHospital(body) : null;
  if (!hospital) {
    return NextResponse.json({ error: "Confira o código, o nome, as coordenadas e o raio." }, { status: 400 });
  }

  const retentionEmails = body.billing_retention_emails_enabled;
  if (retentionEmails !== undefined && typeof retentionEmails !== "boolean") {
    return NextResponse.json({ error: "Confira a configuração dos avisos de retenção por e-mail." }, { status: 400 });
  }
  const { code, ...fields } = hospital;
  const table = supabaseAdmin.from("institutional_hospitals");
  const query = create
    ? table.insert({ ...fields, code, is_active: false })
    : table.update({ ...fields, updated_at: new Date().toISOString(),
      ...(retentionEmails === undefined ? {} : { billing_retention_emails_enabled: retentionEmails }),
    }).eq("code", code);
  const { data, error } = await query.select(ADMIN_HOSPITAL_FIELDS).maybeSingle();
  if (error?.code === "23505") {
    return NextResponse.json({ error: "Esse código já está em uso." }, { status: 409 });
  }
  if (error) {
    return NextResponse.json({ error: "Não foi possível salvar o hospital." }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Hospital não encontrado." }, { status: 404 });
  }
  return NextResponse.json({ hospital: data }, { status: create ? 201 : 200 });
}

export function POST(request: Request) {
  return save(request, true);
}

export function PATCH(request: Request) {
  return save(request, false);
}

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createServerSupabase } from "@/lib/supabase-server";

function isNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidDateLike(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return false;
  return !Number.isNaN(Date.parse(value));
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);

    const {
      userId,
      crm,
      patientName,
      recordNumber,
      procedureDate,
      anesthesiaType,
      startDateTime,
      endDateTime,
      fileKey,
      fileName,
    } = body ?? {};

    if (
      !isNonEmptyString(crm) ||
      !isNonEmptyString(patientName) ||
      !isNonEmptyString(recordNumber) ||
      !isNonEmptyString(procedureDate) ||
      !isNonEmptyString(startDateTime) ||
      !isNonEmptyString(fileKey) ||
      !isNonEmptyString(fileName)
    ) {
      return NextResponse.json(
        { error: "Campos obrigatórios ausentes ou inválidos." },
        { status: 400 }
      );
    }

    if (!isValidDateLike(procedureDate)) {
      return NextResponse.json(
        { error: "procedureDate inválido." },
        { status: 400 }
      );
    }

    if (!isValidDateLike(startDateTime)) {
      return NextResponse.json(
        { error: "startDateTime inválido." },
        { status: 400 }
      );
    }

    if (endDateTime != null && !isValidDateLike(endDateTime)) {
      return NextResponse.json(
        { error: "endDateTime inválido." },
        { status: 400 }
      );
    }

    if (userId != null && userId !== user.id) {
      return NextResponse.json(
        { error: "Usuário inválido para esta operação." },
        { status: 403 }
      );
    }

    const expectedPrefix = `pro/${user.id}/`;
    if (!fileKey.startsWith(expectedPrefix)) {
      return NextResponse.json(
        { error: "fileKey inválido para o usuário autenticado." },
        { status: 403 }
      );
    }

    const uploadedAt = new Date();
    const expiresAt = new Date(uploadedAt.getTime() + 30 * 24 * 60 * 60 * 1000);

    const normalizedProcedureDate = new Date(procedureDate);
    const normalizedStartDateTime = new Date(startDateTime);
    const normalizedEndDateTime = endDateTime ? new Date(endDateTime) : null;

    const { data: insertedFicha, error } = await supabaseAdmin
      .from("pro_fichas_uploads")
      .insert({
        user_id: user.id,
        crm: crm.trim(),
        patient_name: patientName.trim(),
        record_number: recordNumber.trim(),
        procedure_date: normalizedProcedureDate.toISOString().slice(0, 10),
        anesthesia_type:
          isNonEmptyString(anesthesiaType) ? anesthesiaType.trim() : null,
        start_date_time: normalizedStartDateTime.toISOString(),
        end_date_time: normalizedEndDateTime?.toISOString() ?? null,
        file_key: fileKey.trim(),
        file_name: fileName.trim(),
        uploaded_at: uploadedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .select("id")
      .single();

    if (error || !insertedFicha) {
      console.error("Erro ao salvar metadados do Pro:", error);
      return NextResponse.json(
        { error: "Erro ao salvar metadados da ficha." },
        { status: 500 }
      );
    }

    const { error: auditError } = await supabaseAdmin
      .from("pro_fichas_audit_logs")
      .insert({
        event_type: "sync_created",
        user_id: user.id,
        ficha_id: insertedFicha.id,
        file_key: fileKey.trim(),
        metadata: {
          crm: crm.trim(),
          patient_name: patientName.trim(),
          record_number: recordNumber.trim(),
          procedure_date: normalizedProcedureDate.toISOString().slice(0, 10),
          anesthesia_type:
            isNonEmptyString(anesthesiaType) ? anesthesiaType.trim() : null,
          uploaded_at: uploadedAt.toISOString(),
          expires_at: expiresAt.toISOString(),
        },
      });

    if (auditError) {
      console.error("Erro ao registrar auditoria de sync:", auditError);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro na confirmação de upload do Pro:", error);
    return NextResponse.json(
      { error: "Erro interno ao confirmar upload." },
      { status: 500 }
    );
  }
}
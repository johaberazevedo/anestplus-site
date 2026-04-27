import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function nullableString(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      hospitalId,
      crm,
      patientName,
      recordNumber,
      procedureDate,
      fileKey,
      fileName,

      // Novos campos opcionais.
      anesthesiaType,
      startDateTime,
      endDateTime,
      anesthesiologistName,
      userId,
    } = body ?? {};

    if (
      !hospitalId ||
      !crm ||
      !patientName ||
      !recordNumber ||
      !procedureDate ||
      !fileKey ||
      !fileName
    ) {
      return NextResponse.json(
        { error: "Campos obrigatórios ausentes." },
        { status: 400 }
      );
    }

    const uploadedAt = new Date();
    const expiresAt = addDays(uploadedAt, 30);

    const normalizedAnesthesiaType = nullableString(anesthesiaType);
    const normalizedStartDateTime = nullableString(startDateTime);
    const normalizedEndDateTime = nullableString(endDateTime);
    const normalizedAnesthesiologistName = nullableString(anesthesiologistName);
    const normalizedUserId = nullableString(userId);

    const { data: ficha, error } = await supabaseAdmin
      .from("fichas_uploads")
      .insert({
        hospital_id: hospitalId,
        crm,
        patient_name: patientName,
        record_number: recordNumber,
        procedure_date: procedureDate,
        file_key: fileKey,
        file_name: fileName,

        // Novos campos — todos opcionais.
        anesthesia_type: normalizedAnesthesiaType,
        start_date_time: normalizedStartDateTime,
        end_date_time: normalizedEndDateTime,
        anesthesiologist_name: normalizedAnesthesiologistName,
        user_id: normalizedUserId,
        expires_at: expiresAt.toISOString(),
        deleted_at: null,
        last_downloaded_at: null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Erro ao salvar metadados:", error);
      return NextResponse.json(
        { error: "Erro ao salvar metadados da ficha." },
        { status: 500 }
      );
    }

    const { error: auditError } = await supabaseAdmin
      .from("fichas_audit_logs")
      .insert({
        event_type: "sync_created",
        hospital_id: hospitalId,
        user_id: normalizedUserId,
        ficha_id: ficha.id,
        file_key: fileKey,
        metadata: {
          hospital_id: hospitalId,
          crm,
          patient_name: patientName,
          record_number: recordNumber,
          procedure_date: procedureDate,
          file_name: fileName,
          uploaded_at: uploadedAt.toISOString(),
          expires_at: expiresAt.toISOString(),
          anesthesia_type: normalizedAnesthesiaType,
          start_date_time: normalizedStartDateTime,
          end_date_time: normalizedEndDateTime,
          anesthesiologist_name: normalizedAnesthesiologistName,
        },
      });

    if (auditError) {
      // Não quebra o upload por falha de auditoria.
      // A ficha já foi salva; apenas registramos o erro para investigar.
      console.error("Erro ao salvar auditoria da ficha:", auditError);
    }

    return NextResponse.json({
      ok: true,
      fichaId: ficha.id,
    });
  } catch (error) {
    console.error("Erro na confirmação de upload:", error);
    return NextResponse.json(
      { error: "Erro interno ao confirmar upload." },
      { status: 500 }
    );
  }
}
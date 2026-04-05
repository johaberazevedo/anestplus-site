import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();

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
      !userId ||
      !crm ||
      !patientName ||
      !recordNumber ||
      !procedureDate ||
      !startDateTime ||
      !fileKey ||
      !fileName
    ) {
      return NextResponse.json(
        { error: "Campos obrigatórios ausentes." },
        { status: 400 }
      );
    }

    const uploadedAt = new Date();
    const expiresAt = new Date(uploadedAt.getTime() + 30 * 24 * 60 * 60 * 1000);

    const { data: insertedFicha, error } = await supabaseAdmin
      .from("pro_fichas_uploads")
      .insert({
        user_id: userId,
        crm,
        patient_name: patientName,
        record_number: recordNumber,
        procedure_date: procedureDate,
        anesthesia_type: anesthesiaType ?? null,
        start_date_time: startDateTime,
        end_date_time: endDateTime ?? null,
        file_key: fileKey,
        file_name: fileName,
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
        user_id: userId,
        ficha_id: insertedFicha.id,
        file_key: fileKey,
        metadata: {
          crm,
          patient_name: patientName,
          record_number: recordNumber,
          procedure_date: procedureDate,
          anesthesia_type: anesthesiaType ?? null,
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
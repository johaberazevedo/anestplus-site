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

    const { error } = await supabaseAdmin.from("pro_fichas_uploads").insert({
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
    });

    if (error) {
      console.error("Erro ao salvar metadados do Pro:", error);
      return NextResponse.json(
        { error: "Erro ao salvar metadados da ficha." },
        { status: 500 }
      );
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
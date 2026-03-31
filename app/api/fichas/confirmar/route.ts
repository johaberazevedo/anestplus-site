import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

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

    const { error } = await supabaseAdmin.from("fichas_uploads").insert({
      hospital_id: hospitalId,
      crm,
      patient_name: patientName,
      record_number: recordNumber,
      procedure_date: procedureDate,
      file_key: fileKey,
      file_name: fileName,
    });

    if (error) {
      console.error("Erro ao salvar metadados:", error);
      return NextResponse.json(
        { error: "Erro ao salvar metadados da ficha." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro na confirmação de upload:", error);
    return NextResponse.json(
      { error: "Erro interno ao confirmar upload." },
      { status: 500 }
    );
  }
}
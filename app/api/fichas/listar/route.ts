import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const hospitalId = searchParams.get("hospitalId");
    const crm = searchParams.get("crm");
    const date = searchParams.get("date");

    if (!hospitalId || !crm || !date) {
      return NextResponse.json(
        { error: "hospitalId, crm e date são obrigatórios." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("fichas_uploads")
      .select("id, patient_name, record_number, procedure_date, file_key, file_name, uploaded_at")
      .eq("hospital_id", hospitalId)
      .eq("crm", crm)
      .eq("procedure_date", date)
      .order("uploaded_at", { ascending: false });

    if (error) {
      console.error("Erro ao listar fichas:", error);
      return NextResponse.json(
        { error: "Erro ao listar fichas." },
        { status: 500 }
      );
    }

    return NextResponse.json({ fichas: data ?? [] });
  } catch (error) {
    console.error("Erro interno ao listar fichas:", error);
    return NextResponse.json(
      { error: "Erro interno ao listar fichas." },
      { status: 500 }
    );
  }
}
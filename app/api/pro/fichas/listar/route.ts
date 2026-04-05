import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

function getBearerToken(request: Request) {
  const authHeader =
    request.headers.get("authorization") ||
    request.headers.get("Authorization");

  if (!authHeader) return null;

  const [type, token] = authHeader.split(" ");
  if (type !== "Bearer" || !token) return null;

  return token.trim();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");

    const token = getBearerToken(request);

    if (!token) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Sessão inválida." },
        { status: 401 }
      );
    }

    const nowIso = new Date().toISOString();

    let query = supabaseAdmin
      .from("pro_fichas_uploads")
      .select(
        "id, patient_name, record_number, procedure_date, anesthesia_type, start_date_time, end_date_time, file_key, file_name, uploaded_at"
      )
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .gt("expires_at", nowIso);

    if (date) {
      query = query.eq("procedure_date", date);
    } else if (dateFrom && dateTo) {
      if (dateFrom > dateTo) {
        return NextResponse.json(
          { error: "A data inicial não pode ser maior que a data final." },
          { status: 400 }
        );
      }

      query = query
        .gte("procedure_date", dateFrom)
        .lte("procedure_date", dateTo);
    } else {
      return NextResponse.json(
        { error: "Informe date ou date_from + date_to." },
        { status: 400 }
      );
    }

    const { data, error } = await query.order("uploaded_at", { ascending: false });

    if (error) {
      console.error("Erro ao listar fichas do Pro:", error);
      return NextResponse.json(
        { error: "Erro ao listar fichas." },
        { status: 500 }
      );
    }

    return NextResponse.json({ fichas: data ?? [] });
  } catch (error) {
    console.error("Erro interno ao listar fichas do Pro:", error);
    return NextResponse.json(
      { error: "Erro interno ao listar fichas." },
      { status: 500 }
    );
  }
}
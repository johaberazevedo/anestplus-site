import { NextRequest, NextResponse } from "next/server";
import { PRODUCAO_COOKIE, validProducaoSession } from "@/lib/producao-session";
import { supabaseAdmin } from "@/lib/supabase-admin";

type FichaRow = {
  id: string;
  hospital_id: string;
  crm: string;
  patient_name: string;
  record_number: string;
  procedure_date: string;
  anesthesia_type: string | null;
  start_date_time: string | null;
  end_date_time: string | null;
  anesthesiologist_name: string | null;
  file_key: string;
  file_name: string;
  uploaded_at: string;
};

const TIME_ZONE = "America/Bahia";
const EMPRESA_FIXA = "ATENDE SAÚDE";
const UUID = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
const RETIRADA_AUTH_MAX_AGE_SECONDS = 5 * 60;

function productionGroupKey(ficha: Pick<FichaRow, "hospital_id" | "procedure_date" | "record_number" | "patient_name">) {
  return JSON.stringify([
    ficha.hospital_id,
    ficha.procedure_date,
    ficha.record_number.trim(),
    ficha.patient_name.trim().toUpperCase(),
  ]);
}

export async function PATCH(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
  }
  if (!validProducaoSession(request.cookies.get(PRODUCAO_COOKIE)?.value)) {
    return NextResponse.json({ error: "Entre novamente na Produção." }, { status: 401 });
  }

  const authorizedId = process.env.PRODUCAO_RETIRADA_USUARIO_ID?.trim().toLowerCase();
  if (!authorizedId || !UUID.test(authorizedId)) {
    return NextResponse.json({ error: "Retirada ainda não configurada." }, { status: 503 });
  }

  const token = /^Bearer (\S+)$/i.exec(request.headers.get("authorization") ?? "")?.[1];
  if (!token) {
    return NextResponse.json({ error: "Autentique a Conta Anest para confirmar." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const ids: unknown = body?.ids;
  if (!Array.isArray(ids) || !ids.length || ids.length > 50 ||
      !ids.every((id): id is string => typeof id === "string" && UUID.test(id))) {
    return NextResponse.json({ error: "Confira os envios selecionados." }, { status: 400 });
  }
  const selectedIds = ids.map((id) => id.toLowerCase());
  if (new Set(selectedIds).size !== selectedIds.length) {
    return NextResponse.json({ error: "Seleção de envios inválida." }, { status: 400 });
  }

  try {
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: "Sessão da Conta Anest inválida." }, { status: 401 });
    }
    if (user.id !== authorizedId) {
      return NextResponse.json({ error: "Esta Conta Anest não pode autorizar retiradas." }, { status: 403 });
    }

    const { data: verified, error: claimsError } = await supabaseAdmin.auth.getClaims(token);
    const claims = verified?.claims;
    if (claimsError || !claims || claims.sub !== user.id || claims.role !== "authenticated") {
      return NextResponse.json({ error: "Sessão da Conta Anest inválida." }, { status: 401 });
    }
    const now = Math.floor(Date.now() / 1000);
    // iat também muda no refresh. O horário do login com senha fica em amr.
    const recent = Array.isArray(claims.amr) && claims.amr.some((entry) =>
      typeof entry === "object" && entry !== null && entry.method === "password" &&
      Number.isSafeInteger(entry.timestamp) && entry.timestamp <= now &&
      now - entry.timestamp <= RETIRADA_AUTH_MAX_AGE_SECONDS
    );
    if (!recent) {
      return NextResponse.json({ error: "Confirme novamente o e-mail e a senha da Conta Anest." }, { status: 403 });
    }

    const { data: envios, error: selectionError } = await supabaseAdmin
      .from("fichas_uploads")
      .select("id, hospital_id, procedure_date, record_number, patient_name")
      .in("id", selectedIds)
      .is("deleted_at", null)
      .is("production_excluded_at", null);
    if (selectionError) throw selectionError;

    const selectionChanged = () => NextResponse.json({
      error: "A seleção mudou ou contém envios de outra ficha. Consulte novamente.",
    }, { status: 409 });

    if (!envios || envios.length !== selectedIds.length ||
        new Set(envios.map(productionGroupKey)).size !== 1) {
      return selectionChanged();
    }

    const { data, error } = await supabaseAdmin.rpc("retirar_fichas_producao", {
      p_envios: envios,
      p_autorizado_por: user.id,
    });
    if (error?.code === "P0001") return selectionChanged();
    if (error || data !== selectedIds.length) throw error ?? new Error("Contagem inesperada de retiradas.");

    return NextResponse.json({ ok: true });
  } catch {
    console.error("Falha ao retirar fichas da Produção.");
    return NextResponse.json({ error: "Não foi possível confirmar a retirada." }, { status: 500 });
  }
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function getLocalDateParts(dateString: string) {
  const date = new Date(dateString);

  const formatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    day: get("day"),
    month: get("month"),
    year: get("year"),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

function formatDateBRFromStart(
  startDateTime: string | null,
  fallbackDate: string
) {
  if (!startDateTime) {
    return fallbackDate;
  }

  const parts = getLocalDateParts(startDateTime);

  return `${parts.year}-${parts.month}-${parts.day}`;
}

function inferTurno(startDateTime: string | null) {
  if (!startDateTime) return "REVISAR";

  const { hour } = getLocalDateParts(startDateTime);

  // SD = diurno, SN = noturno.
  if (hour >= 19 || hour < 7) return "SN";
  return "SD";
}

function inferDiaSemanaComTurno(startDateTime: string | null) {
  if (!startDateTime) return "REVISAR";

  const date = new Date(startDateTime);

  const weekday = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    weekday: "short",
  })
    .format(date)
    .replace(".", "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toUpperCase();

  const map: Record<string, string> = {
    SEG: "SEG",
    TER: "TER",
    QUA: "QUA",
    QUI: "QUI",
    SEX: "SEX",
    SAB: "SAB",
    DOM: "DOM",
  };

  const dia = map[weekday] ?? weekday;
  const turno = inferTurno(startDateTime);

  return `${dia}${turno}`;
}

function durationMinutes(
  startDateTime: string | null,
  endDateTime: string | null
) {
  if (!startDateTime || !endDateTime) return null;

  const start = new Date(startDateTime).getTime();
  const end = new Date(endDateTime).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return null;
  }

  return Math.round((end - start) / 60000);
}

function inferBaseAnesthesiaType(raw: string | null) {
  const text = normalizeText(raw ?? "");

  if (!text) return null;

  // Hierarquia: se tiver geral + raqui/peridural/bloqueio, considera geral.
  if (text.includes("geral")) return "Anestesia Geral";

  if (
    text.includes("bloqueio") ||
    text.includes("plexo") ||
    text.includes("regional")
  ) {
    return "Bloqueio Regional";
  }

  if (text.includes("peridural")) return "Peridural";

  if (
    text.includes("raqui") ||
    text.includes("raquianestesia") ||
    text.includes("subaracno")
  ) {
    return "Raquianestesia";
  }

  if (text.includes("sedacao") || text.includes("sedação")) return "Sedação";

  return null;
}

function inferPorte(minutes: number | null) {
  if (minutes == null) return null;

  if (minutes <= 120) return "I";
  if (minutes <= 240) return "II";
  if (minutes <= 360) return "III";
  return "IV";
}

function classifyProductionAnesthesia(
  raw: string | null,
  minutes: number | null
) {
  const base = inferBaseAnesthesiaType(raw);
  const porte = inferPorte(minutes);

  if (!base) return "REVISAR";
  if (!porte) return `REVISAR - ${base}`;

  if (base === "Anestesia Geral") {
    return porte === "III" || porte === "IV"
      ? "Anestesia Geral A"
      : "Anestesia Geral B";
  }

  if (
    base === "Raquianestesia" ||
    base === "Peridural" ||
    base === "Bloqueio Regional"
  ) {
    return porte === "III" || porte === "IV" ? `${base} A` : `${base} B`;
  }

  if (base === "Sedação") {
    return porte === "I" ? "Sedação A" : "Sedação B";
  }

  return "REVISAR";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const hospitalId = searchParams.get("hospitalId");
    const date = searchParams.get("date");

    if (!hospitalId || !date) {
      return NextResponse.json(
        { error: "hospitalId e date são obrigatórios." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("fichas_uploads")
      .select(
        `
        id,
        hospital_id,
        crm,
        patient_name,
        record_number,
        procedure_date,
        anesthesia_type,
        start_date_time,
        end_date_time,
        anesthesiologist_name,
        file_key,
        file_name,
        uploaded_at
      `
      )
      .eq("hospital_id", hospitalId)
      .eq("procedure_date", date)
      .is("deleted_at", null)
      .is("production_excluded_at", null)
      .order("uploaded_at", { ascending: false });

    if (error) {
      console.error("Erro ao listar produção:", error);
      return NextResponse.json(
        { error: "Erro ao listar produção." },
        { status: 500 }
      );
    }

    const groupedByCase = new Map<string, FichaRow[]>();

    for (const ficha of (data ?? []) as FichaRow[]) {
      const key = productionGroupKey(ficha);

      const versions = groupedByCase.get(key) ?? [];
      versions.push(ficha);
      groupedByCase.set(key, versions);
    }

    const groupedRows = Array.from(groupedByCase.values())
      .map((versions) =>
        versions.sort(
          (a, b) =>
            new Date(b.uploaded_at).getTime() -
            new Date(a.uploaded_at).getTime()
        )
      )
      .sort(
        (a, b) =>
          new Date(b[0].uploaded_at).getTime() -
          new Date(a[0].uploaded_at).getTime()
      );

    const fichas = groupedRows.map((versions) => {
      const ficha = versions[0];

      const minutes = durationMinutes(
        ficha.start_date_time,
        ficha.end_date_time
      );

      const tipoProducao = classifyProductionAnesthesia(
        ficha.anesthesia_type,
        minutes
      );

      const porte = inferPorte(minutes);
      const turno = inferTurno(ficha.start_date_time);
      const dia = inferDiaSemanaComTurno(ficha.start_date_time);

      return {
        id: ficha.id,
        hospitalId: ficha.hospital_id,
        crm: ficha.crm,
        data: formatDateBRFromStart(
          ficha.start_date_time,
          ficha.procedure_date
        ),
        turno,
        dia,
        registro: ficha.record_number,
        paciente: ficha.patient_name,
        empresa: EMPRESA_FIXA,
        anestesista: ficha.anesthesiologist_name ?? "",
        tipoAnestesiaBruto: ficha.anesthesia_type ?? "",
        tipoAnestesiaProducao: tipoProducao,
        porte,
        duracaoMinutos: minutes,
        startDateTime: ficha.start_date_time,
        endDateTime: ficha.end_date_time,
        fileKey: ficha.file_key,
        fileName: ficha.file_name,
        uploadedAt: ficha.uploaded_at,
        versionCount: versions.length,
        versions: versions.map((version) => ({
          id: version.id,
          fileKey: version.file_key,
          fileName: version.file_name,
          uploadedAt: version.uploaded_at,
          anesthesiaType: version.anesthesia_type,
          startDateTime: version.start_date_time,
          endDateTime: version.end_date_time,
        })),
        needsReview:
          tipoProducao.startsWith("REVISAR") ||
          !ficha.anesthesiologist_name ||
          !ficha.start_date_time,
      };
    });

    return NextResponse.json({ fichas });
  } catch (error) {
    console.error("Erro interno ao listar produção:", error);
    return NextResponse.json(
      { error: "Erro interno ao listar produção." },
      { status: 500 }
    );
  }
}

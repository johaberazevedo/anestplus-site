import { NextResponse } from "next/server";
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
      const key = [
        ficha.hospital_id,
        ficha.procedure_date,
        ficha.record_number.trim(),
        ficha.patient_name.trim().toUpperCase(),
      ].join("|");

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
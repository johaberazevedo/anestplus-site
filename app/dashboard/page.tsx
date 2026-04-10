"use client";

import { useMemo, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Ficha = {
  id: string;
  patient_name: string;
  record_number: string;
  procedure_date: string;
  file_key: string;
  file_name: string;
  uploaded_at: string;
};

const HOSPITAIS = [
  { id: "hgvitoria", label: "HGVC" },
  { id: "afraniopeixoto", label: "Afrânio" },
];

function todayISO() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateBR(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

function formatDateTimeBR(date: string) {
  return new Date(date).toLocaleString("pt-BR");
}

export default function DashboardPage() {
  const router = useRouter();

  const [hospitalId, setHospitalId] = useState<string>("hgvitoria");
  const [crm, setCrm] = useState<string>("");
  const [date, setDate] = useState<string>(todayISO());
  const [fichas, setFichas] = useState<Ficha[]>([]);

  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedRecordId, setCopiedRecordId] = useState<string | null>(null);

  const hospitalLabel = useMemo(
    () => HOSPITAIS.find((h) => h.id === hospitalId)?.label ?? hospitalId,
    [hospitalId]
  );

  async function buscarFichas(e?: FormEvent) {
    if (e) e.preventDefault();

    setHasSearched(true);
    setLoading(true);
    setError("");
    setFichas([]);

    try {
      const params = new URLSearchParams({
        hospitalId,
        crm: crm.trim(),
        date,
      });

      const response = await fetch(`/api/fichas/listar?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Erro ao buscar fichas.");
      }

      setFichas(json.fichas ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro inesperado ao buscar.";
      setError(message);
      setFichas([]);
    } finally {
      setLoading(false);
    }
  }

  async function baixarFicha(ficha: Ficha) {
    setDownloadingId(ficha.id);
    setError("");

    try {
      const response = await fetch("/api/fichas/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileKey: ficha.file_key,
          fileName: ficha.file_name,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Erro ao gerar link de download.");
      }

      window.open(json.downloadUrl, "_blank");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao baixar a ficha.";
      setError(message);
    } finally {
      setDownloadingId(null);
    }
  }

async function copiarProntuario(ficha: Ficha) {
  try {
    await navigator.clipboard.writeText(ficha.record_number);
    setCopiedRecordId(ficha.id);

    window.setTimeout(() => {
      setCopiedRecordId((current) => (current === ficha.id ? null : current));
    }, 1600);
  } catch {
    setError("Não foi possível copiar o número do prontuário.");
  }
}

  async function sair() {
    try {
      await fetch("/api/auth/dashboard-logout", {
        method: "POST",
      });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <main className="min-h-screen bg-[#fafaf7] pb-16 text-zinc-950 font-sans selection:bg-[#22331d] selection:text-white">
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl">
                <Image
                  src="/brand/anest-symbol.png"
                  alt="Anest+"
                  width={56}
                  height={56}
                  priority
                  className="h-14 w-14 object-contain rounded-2xl"
                />
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#7a865f]">
                  Painel hospitalar
                </p>
                <h1 className="mt-1 text-3xl font-black tracking-tight text-zinc-950 sm:text-[2.1rem]">
                  Fichas sincronizadas
                </h1>
              </div>
            </div>

            <p className="mt-3 text-sm text-zinc-500">
              Selecione o hospital, informe o CRM e visualize as fichas do dia.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start">
            <div className="inline-flex items-center rounded-full border border-[#b9963b]/20 bg-[#f6f7f1] px-4 py-2 text-sm font-medium text-[#506047]">
              <span className="font-bold text-zinc-900">{hospitalLabel}</span>
              <span className="mx-2 text-[#b9963b]/50">•</span>
              <span>{date.split("-").reverse().join("/")}</span>
            </div>

            <button
              type="button"
              onClick={sair}
              className="inline-flex items-center rounded-full px-3 py-2 text-sm font-bold text-zinc-500 transition hover:bg-red-50 hover:text-red-600"
            >
              Sair
            </button>
          </div>
        </div>

        <form
          onSubmit={buscarFichas}
          className="mb-10 rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="mb-5">
            <label className="mb-3 block text-sm font-bold text-zinc-700">
              Hospital
            </label>

            <div className="flex flex-wrap gap-3">
              {HOSPITAIS.map((hospital) => {
                const active = hospital.id === hospitalId;

                return (
                  <button
                    key={hospital.id}
                    type="button"
                    onClick={() => setHospitalId(hospital.id)}
                    className={[
                      "rounded-full px-4 py-2 text-sm font-bold transition",
                      active
                        ? "border border-[#1a2718] bg-[#1a2718] text-white shadow-md shadow-[#1a2718]/20"
                        : "border border-zinc-300 bg-white text-zinc-700 hover:border-[#b9963b]/50 hover:bg-[#fafaf7]",
                    ].join(" ")}
                  >
                    {hospital.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
            <div className="relative group">
              <label
                htmlFor="crm-input"
                className="absolute -top-2.5 left-3 bg-white px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500 transition-colors group-focus-within:text-[#b9963b]"
              >
                CRM
              </label>
              <input
                id="crm-input"
                value={crm}
                onChange={(e) => setCrm(e.target.value)}
                placeholder="Digite seu CRM"
                autoComplete="off"
                className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-900 outline-none transition hover:border-zinc-400 focus:border-[#b9963b] focus:ring-2 focus:ring-[#b9963b]/10 placeholder:text-zinc-400"
              />
            </div>

            <div className="relative group">
              <label
                htmlFor="date-input"
                className="absolute -top-2.5 left-3 bg-white px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500 transition-colors group-focus-within:text-[#b9963b]"
              >
                Data
              </label>
              <input
                id="date-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-900 outline-none transition hover:border-zinc-400 focus:border-[#b9963b] focus:ring-2 focus:ring-[#b9963b]/10"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-2xl bg-[#1a2718] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[#1a2718]/20 transition hover:bg-[#22331d] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading || crm.trim().length === 0}
              >
                {loading ? "Buscando..." : "Buscar"}
              </button>
            </div>
          </div>
        </form>

        {error ? (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-sm">
            {error}
          </div>
        ) : null}

        {!hasSearched ? (
          <div className="rounded-[28px] border border-zinc-200 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#b9963b]/10 bg-[#f6f7f1] text-2xl">
              <span className="text-xl">🔎</span>
            </div>
            <h2 className="text-lg font-bold text-zinc-950">Busque as fichas do dia</h2>
            <p className="mt-2 text-sm text-zinc-500">
              Selecione o hospital, informe o CRM e clique em buscar.
            </p>
          </div>
        ) : !loading && !error && fichas.length === 0 ? (
          <div className="rounded-[28px] border border-zinc-200 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-[#b9963b]/10 bg-[#f6f7f1] text-2xl">
              <span className="text-2xl">📄</span>
            </div>
            <h2 className="text-lg font-bold text-zinc-950">Nenhuma ficha encontrada</h2>
            <p className="mt-2 text-sm text-zinc-500">
              Verifique o hospital, o CRM e a data selecionada.
            </p>
          </div>
        ) : null}

        {fichas.length > 0 ? (
          <div className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 px-6 py-5">
              <h2 className="text-base font-bold text-zinc-950">
                {fichas.length} ficha{fichas.length === 1 ? "" : "s"} encontrada
                {fichas.length === 1 ? "" : "s"}
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-zinc-50/70">
                  <tr className="text-left text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                    <th className="border-b border-zinc-200 px-6 py-4">Paciente</th>
                    <th className="border-b border-zinc-200 px-6 py-4">Prontuário</th>
                    <th className="border-b border-zinc-200 px-6 py-4">Data da ficha</th>
                    <th className="border-b border-zinc-200 px-6 py-4">Enviado em</th>
                    <th className="border-b border-zinc-200 px-6 py-4 text-right">Ação</th>
                  </tr>
                </thead>

                <tbody>
                  {fichas.map((ficha, index) => {
                    const isDownloadingThis = downloadingId === ficha.id;

                    return (
                      <tr
                        key={ficha.id}
                        className={index !== fichas.length - 1 ? "border-b border-zinc-100 transition-colors hover:bg-zinc-50/50" : "transition-colors hover:bg-zinc-50/50"}
                      >
                        <td className="px-6 py-5">
                          <div className="font-bold text-zinc-950">
                            {ficha.patient_name}
                          </div>
                        </td>

                        <td className="px-6 py-5">
  <div className="flex items-center gap-2">
    <span className="text-sm font-medium text-zinc-700">
      {ficha.record_number}
    </span>

    <button
  type="button"
  onClick={() => copiarProntuario(ficha)}
  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#b9963b]/20 bg-[#f6f7f1] text-[#8f7740] shadow-sm transition hover:border-[#b9963b]/35 hover:bg-[#f3f1e8] hover:text-[#7f6937]"
  aria-label={`Copiar prontuário ${ficha.record_number}`}
  title={copiedRecordId === ficha.id ? "Copiado!" : "Copiar prontuário"}
>
  {copiedRecordId === ficha.id ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      className="h-4 w-4"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      className="h-4 w-4"
    >
      <rect x="9" y="9" width="10" height="10" rx="2.2" />
      <path d="M15 9V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
    </svg>
  )}
</button>
  </div>
</td>

                        <td className="px-6 py-5 text-sm text-zinc-600">
                          <span className="inline-flex whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-3 py-1 text-xs font-bold text-zinc-700 shadow-sm">
                            {formatDateBR(ficha.procedure_date + "T00:00:00")}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-6 py-5 text-sm font-medium text-zinc-600">
                          {formatDateTimeBR(ficha.uploaded_at)}
                        </td>

                        <td className="px-6 py-5 text-right">
                          <button
                            className="w-[96px] rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-bold text-zinc-800 shadow-sm transition hover:border-[#b9963b] hover:bg-[#fafaf7] hover:text-[#7a865f] disabled:cursor-wait disabled:opacity-50"
                            onClick={() => baixarFicha(ficha)}
                            disabled={isDownloadingThis}
                          >
                            {isDownloadingThis ? "Gerando..." : "Baixar"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
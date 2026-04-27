"use client";

import { Fragment, FormEvent, useMemo, useState } from "react";
import Image from "next/image";

type FichaProducao = {
  id: string;
  hospitalId: string;
  crm: string;
  data: string;
  turno: string;
  registro: string;
  paciente: string;
  empresa: string;
  anestesista: string;
  tipoAnestesiaBruto: string;
  tipoAnestesiaProducao: string;
  duracaoMinutos: number | null;
  startDateTime: string | null;
  endDateTime: string | null;
  fileKey: string;
  fileName: string;
  uploadedAt: string;
  versionCount: number;
  versions: {
    id: string;
    fileKey: string;
    fileName: string;
    uploadedAt: string;
    anesthesiaType: string | null;
    startDateTime: string | null;
    endDateTime: string | null;
  }[];
  needsReview: boolean;
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

function formatDateTimeBR(date: string | null) {
  if (!date) return "—";

  return new Date(date).toLocaleString("pt-BR", {
    timeZone: "America/Bahia",
  });
}

function formatDuration(minutes: number | null) {
  if (minutes == null) return "—";

  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  if (h <= 0) return `${m}min`;
  if (m === 0) return `${h}h`;

  return `${h}h${String(m).padStart(2, "0")}`;
}

export default function ProducaoPage() {
  const [hospitalId, setHospitalId] = useState("hgvitoria");
  const [date, setDate] = useState(todayISO());
  const [fichas, setFichas] = useState<FichaProducao[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const hospitalLabel = useMemo(
    () => HOSPITAIS.find((h) => h.id === hospitalId)?.label ?? hospitalId,
    [hospitalId]
  );

  const fichasValidas = useMemo(() => {
    return fichas.filter(
      (ficha): ficha is FichaProducao => ficha != null
    );
  }, [fichas]);

  const linhasParaColar = useMemo(() => {
    return fichasValidas
      .map((ficha) =>
        [
          ficha.data,
          ficha.turno === "REVISAR" ? "" : ficha.turno,
          ficha.registro,
          ficha.paciente,
          ficha.empresa,
          ficha.anestesista,
          ficha.tipoAnestesiaProducao.startsWith("REVISAR")
            ? ""
            : ficha.tipoAnestesiaProducao,
        ].join("\t")
      )
      .join("\n");
  }, [fichasValidas]);

  const totalRevisar = fichasValidas.filter((f) => f.needsReview).length;

  const totalVersoesExtras = fichasValidas.reduce(
    (total, ficha) => total + Math.max(0, ficha.versionCount - 1),
    0
  );

  function toggleExpanded(id: string) {
    setExpandedIds((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  async function buscarProducao(e?: FormEvent) {
    if (e) e.preventDefault();

    setHasSearched(true);
    setLoading(true);
    setError("");
    setFichas([]);
    setExpandedIds(new Set());

    try {
      const params = new URLSearchParams({
        hospitalId,
        date,
      });

      const response = await fetch(`/api/fichas/producao?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Erro ao buscar produção.");
      }

      const safeFichas = Array.isArray(json.fichas)
        ? json.fichas.filter(
            (
              ficha: FichaProducao | null | undefined
            ): ficha is FichaProducao => ficha != null
          )
        : [];

      setFichas(safeFichas);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro inesperado ao buscar.";
      setError(message);
      setFichas([]);
    } finally {
      setLoading(false);
    }
  }

  async function copiarLinhas() {
    try {
      await navigator.clipboard.writeText(linhasParaColar);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setError("Não foi possível copiar as linhas.");
    }
  }

  async function baixarArquivo({
    id,
    fileKey,
    fileName,
  }: {
    id: string;
    fileKey: string;
    fileName: string;
  }) {
    setDownloadingId(id);
    setError("");

    try {
      const response = await fetch("/api/fichas/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileKey,
          fileName,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Erro ao gerar link de download.");
      }

      window.open(json.downloadUrl, "_blank");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao baixar a ficha.";
      setError(message);
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#fafaf7] pb-16 text-zinc-950 font-sans selection:bg-[#22331d] selection:text-white">
  <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
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
              Painel de produção
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-zinc-950 sm:text-[2.1rem]">
              Produção anestésica
            </h1>
          </div>
        </div>

        <p className="mt-3 text-sm text-zinc-500">

  Consolide a produção anestésica a partir das fichas geradas no Anest+, organize a planilha de produção para conferência e baixe fichas por hospital e dia.
</p>
      </div>

      <div className="inline-flex items-center self-start rounded-full border border-[#b9963b]/20 bg-[#f6f7f1] px-4 py-2 text-sm font-medium text-[#506047]">
        <span className="font-bold text-zinc-900">{hospitalLabel}</span>
        <span className="mx-2 text-[#b9963b]/50">•</span>
        <span>{date.split("-").reverse().join("/")}</span>
      </div>
    </div>
        <form
          onSubmit={buscarProducao}
          className="mb-8 rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-700">
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

            <div>
              <label
                htmlFor="date-input"
                className="mb-2 block text-sm font-bold text-zinc-700"
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
                disabled={loading}
                className="w-full rounded-2xl bg-[#1a2718] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[#1a2718]/20 transition hover:bg-[#22331d] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Buscando..." : "Buscar produção"}
              </button>
            </div>
          </div>
        </form>

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        {fichasValidas.length > 0 ? (
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
                Casos únicos
              </p>
              <p className="mt-2 text-3xl font-black">{fichasValidas.length}</p>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
                Versões extras
              </p>
              <p className="mt-2 text-3xl font-black text-orange-600">
                {totalVersoesExtras}
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
                Revisar
              </p>
              <p className="mt-2 text-3xl font-black text-orange-600">
                {totalRevisar}
              </p>
            </div>

            <div className="flex items-center rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
              <button
                type="button"
                onClick={copiarLinhas}
                disabled={fichasValidas.length === 0}
                className="w-full rounded-2xl bg-[#1a2718] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#22331d] disabled:opacity-50"
              >
                {copied ? "Copiado!" : "Copiar linhas para planilha"}
              </button>
            </div>
          </div>
        ) : null}

        {!hasSearched ? (
          <div className="rounded-[28px] border border-zinc-200 bg-white px-6 py-14 text-center shadow-sm">
            <h2 className="text-lg font-bold">Busque a produção do dia</h2>
            <p className="mt-2 text-sm text-zinc-500">
              Selecione o hospital e a data para gerar as linhas da planilha.
            </p>
          </div>
        ) : !loading && !error && fichasValidas.length === 0 ? (
          <div className="rounded-[28px] border border-zinc-200 bg-white px-6 py-14 text-center shadow-sm">
            <h2 className="text-lg font-bold">Nenhuma ficha encontrada</h2>
            <p className="mt-2 text-sm text-zinc-500">
              Não há fichas institucionais para esse hospital nessa data.
            </p>
          </div>
        ) : null}

        {fichasValidas.length > 0 ? (
          <div className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 px-6 py-5">
              <h2 className="text-base font-bold">
                Linhas da produção — {hospitalLabel}
              </h2>
              <p className="mt-2 text-xs font-medium text-zinc-500">
                A tabela principal usa sempre a versão mais recente. Casos com
                múltiplas exportações podem ser expandidos para baixar versões
                anteriores.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-zinc-50/70">
                  <tr className="text-left text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                    <th className="border-b border-zinc-200 px-4 py-4">Data</th>
                    <th className="border-b border-zinc-200 px-4 py-4">Turno</th>
                    <th className="border-b border-zinc-200 px-4 py-4">
                      Registro
                    </th>
                    <th className="border-b border-zinc-200 px-4 py-4">
                      Paciente
                    </th>
                    <th className="border-b border-zinc-200 px-4 py-4">
                      Anestesista
                    </th>
                    <th className="border-b border-zinc-200 px-4 py-4">
                      Tipo produção
                    </th>
                    <th className="border-b border-zinc-200 px-4 py-4">
                      Duração
                    </th>
                    <th className="border-b border-zinc-200 px-4 py-4">
                      Início/Fim
                    </th>
                    <th className="border-b border-zinc-200 px-4 py-4 text-right">
                      Ficha
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {fichasValidas.map((ficha) => {
                    const isDownloading = downloadingId === ficha.id;

                    return (
                      <Fragment key={ficha.id}>
                        <tr className="border-b border-zinc-100 transition hover:bg-zinc-50/60">
                          <td className="whitespace-nowrap px-4 py-4 text-sm font-medium">
                            {ficha.data}
                          </td>

                          <td className="px-4 py-4 text-sm font-bold">
                            {ficha.turno}
                          </td>

                          <td className="px-4 py-4 text-sm">
                            {ficha.registro}
                          </td>

                          <td className="px-4 py-4">
                            <div className="font-bold">{ficha.paciente}</div>
                            <div className="mt-1 text-xs text-zinc-400">
                              CRM {ficha.crm}
                            </div>

                            {ficha.versionCount > 1 ? (
                              <button
                                type="button"
                                onClick={() => toggleExpanded(ficha.id)}
                                className="mt-2 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700 transition hover:bg-orange-100"
                              >
                                {expandedIds.has(ficha.id)
                                  ? "Ocultar versões"
                                  : `${ficha.versionCount} versões`}
                              </button>
                            ) : null}
                          </td>

                          <td className="px-4 py-4 text-sm">
                            {ficha.anestesista || (
                              <span className="font-bold text-orange-600">
                                REVISAR
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-4">
                            <div
                              className={[
                                "inline-flex rounded-full px-3 py-1 text-xs font-bold",
                                ficha.tipoAnestesiaProducao.startsWith(
                                  "REVISAR"
                                )
                                  ? "bg-orange-50 text-orange-700"
                                  : "bg-green-50 text-green-700",
                              ].join(" ")}
                            >
                              {ficha.tipoAnestesiaProducao}
                            </div>

                            {ficha.tipoAnestesiaBruto ? (
                              <div className="mt-1 text-xs text-zinc-400">
                                Bruto: {ficha.tipoAnestesiaBruto}
                              </div>
                            ) : null}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-sm">
                            {formatDuration(ficha.duracaoMinutos)}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-xs text-zinc-500">
                            <div>{formatDateTimeBR(ficha.startDateTime)}</div>
                            <div>{formatDateTimeBR(ficha.endDateTime)}</div>
                          </td>

                          <td className="px-4 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                baixarArquivo({
                                  id: ficha.id,
                                  fileKey: ficha.fileKey,
                                  fileName: ficha.fileName,
                                })
                              }
                              disabled={isDownloading}
                              className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-bold text-zinc-800 shadow-sm transition hover:border-[#b9963b] hover:bg-[#fafaf7] disabled:cursor-wait disabled:opacity-50"
                            >
                              {isDownloading ? "Gerando..." : "Baixar"}
                            </button>
                          </td>
                        </tr>

                        {expandedIds.has(ficha.id) && ficha.versions.length > 1
                          ? ficha.versions.slice(1).map((version) => (
                              <tr key={version.id} className="bg-orange-50/30">
                                <td colSpan={9} className="px-6 py-3">
                                  <div className="flex flex-col gap-2 rounded-2xl border border-orange-100 bg-white p-3 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                      <span className="font-bold text-orange-700">
                                        Versão anterior
                                      </span>
                                      <span className="mx-2">•</span>
                                      <span>
                                        Enviada em{" "}
                                        {formatDateTimeBR(version.uploadedAt)}
                                      </span>
                                      <span className="mx-2">•</span>
                                      <span>
                                        Tipo: {version.anesthesiaType || "—"}
                                      </span>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        baixarArquivo({
                                          id: version.id,
                                          fileKey: version.fileKey,
                                          fileName: version.fileName,
                                        })
                                      }
                                      disabled={downloadingId === version.id}
                                      className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-bold text-zinc-800 shadow-sm transition hover:border-[#b9963b] hover:bg-[#fafaf7] disabled:cursor-wait disabled:opacity-50"
                                    >
                                      {downloadingId === version.id
                                        ? "Gerando..."
                                        : "Baixar versão"}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          : null}
                      </Fragment>
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
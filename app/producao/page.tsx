"use client";

import { Fragment, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SupportChatErrorBoundary } from "@/components/support-chat/SupportChatErrorBoundary";

const SupportChatWidget = dynamic(
  () =>
    import("@/components/support-chat/SupportChatWidget").then(
      (mod) => mod.SupportChatWidget
    ),
  {
    ssr: false,
    loading: () => null,
  }
);

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

type TipoProducao = "geral" | "chd";

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

function isFichaChd(ficha: FichaProducao) {
  return ficha.tipoAnestesiaBruto.toLocaleUpperCase("pt-BR").includes("CHD");
}

function filtrarProducao(fichas: FichaProducao[], tipo: TipoProducao) {
  return fichas.filter((ficha) => isFichaChd(ficha) === (tipo === "chd"));
}

async function consultarProducao(filtros: { hospitalId: string; date: string }) {
  const params = new URLSearchParams(filtros);
  const response = await fetch(`/api/fichas/producao?${params}`, { cache: "no-store" });
  const json = await response.json().catch(() => null);
  if (!response.ok || !Array.isArray(json?.fichas)) {
    throw new Error(json?.error || "Não foi possível atualizar a produção.");
  }
  return (json.fichas as (FichaProducao | null)[]).filter(
    (ficha): ficha is FichaProducao => ficha != null
  );
}

function buildLinhasParaColar(fichas: FichaProducao[]) {
  return fichas
    .map((ficha) =>
      [
        ficha.data,
        ficha.turno === "REVISAR" ? "" : ficha.turno,
        ficha.registro,
        ficha.paciente.toLocaleUpperCase("pt-BR"),
        ficha.empresa,
        ficha.anestesista.toLocaleUpperCase("pt-BR"),
        ficha.tipoAnestesiaProducao.startsWith("REVISAR")
          ? ""
          : ficha.tipoAnestesiaProducao,
      ].join("\t")
    )
    .join("\n");
}

export default function ProducaoPage() {
  const [hospitalId, setHospitalId] = useState("hgvitoria");
  const [date, setDate] = useState(todayISO());
  const [fichas, setFichas] = useState<FichaProducao[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [tipoProducao, setTipoProducao] = useState<TipoProducao>("geral");
  const [copied, setCopied] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const ultimaBusca = useRef({ hospitalId, date });
  const retiradaDialog = useRef<HTMLDialogElement>(null);
  const [fichaParaRetirar, setFichaParaRetirar] = useState<FichaProducao | null>(null);
  const [idsParaRetirar, setIdsParaRetirar] = useState<string[]>([]);
  const [erroRetirada, setErroRetirada] = useState("");
  const [retirando, setRetirando] = useState(false);
  const [mensagemRetirada, setMensagemRetirada] = useState("");
  const [menuFicha, setMenuFicha] = useState<{
    ficha: FichaProducao;
    top: number;
    left: number;
  } | null>(null);
  const menuRetirada = useRef<HTMLDivElement>(null);
  const gatilhoMenu = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const dialog = retiradaDialog.current;
    if (fichaParaRetirar && dialog && !dialog.open) dialog.showModal();
  }, [fichaParaRetirar]);

  useEffect(() => {
    if (!menuFicha) return;

    menuRetirada.current?.querySelector("button")?.focus({ preventScroll: true });
    const posicaoInicial = gatilhoMenu.current?.getBoundingClientRect();

    function fecharAoClicarFora(event: PointerEvent) {
      const target = event.target;
      if (target instanceof Node && !menuRetirada.current?.contains(target) &&
          !gatilhoMenu.current?.contains(target)) {
        setMenuFicha(null);
      }
    }

    function fecharAoTeclar(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuFicha(null);
        gatilhoMenu.current?.focus();
      }
    }

    function fecharAoMover(event: Event) {
      const posicaoAtual = gatilhoMenu.current?.getBoundingClientRect();
      if (event.type === "resize" || !posicaoInicial || !posicaoAtual ||
          Math.abs(posicaoAtual.top - posicaoInicial.top) > 1 ||
          Math.abs(posicaoAtual.right - posicaoInicial.right) > 1) {
        setMenuFicha(null);
      }
    }

    document.addEventListener("pointerdown", fecharAoClicarFora);
    document.addEventListener("keydown", fecharAoTeclar);
    document.addEventListener("scroll", fecharAoMover, true);
    window.addEventListener("resize", fecharAoMover);
    return () => {
      document.removeEventListener("pointerdown", fecharAoClicarFora);
      document.removeEventListener("keydown", fecharAoTeclar);
      document.removeEventListener("scroll", fecharAoMover, true);
      window.removeEventListener("resize", fecharAoMover);
    };
  }, [menuFicha]);

  const hospitalLabel = useMemo(
    () => HOSPITAIS.find((h) => h.id === hospitalId)?.label ?? hospitalId,
    [hospitalId]
  );

  const fichasExibidas = useMemo(
    () => filtrarProducao(fichas, tipoProducao),
    [fichas, tipoProducao]
  );

  const linhasParaColar = useMemo(
    () => buildLinhasParaColar(fichasExibidas),
    [fichasExibidas]
  );

  const linhasTitulo =
    tipoProducao === "chd" ? "produção CHD" : "produção geral";

  const emptyTitle =
    tipoProducao === "chd"
      ? "Nenhuma produção CHD encontrada"
      : "Nenhuma produção geral encontrada";

  const totalRevisar = fichasExibidas.filter((f) => f.needsReview).length;

  const totalVersoesExtras = fichasExibidas.reduce(
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

  async function buscarProducao(e?: FormEvent, filtros = { hospitalId, date }) {
    if (e) e.preventDefault();

    setMenuFicha(null);
    ultimaBusca.current = filtros;
    setHasSearched(true);
    setLoading(true);
    setError("");
    setCopied(false);
    setFichas([]);
    setExpandedIds(new Set());

    try {
      setFichas(await consultarProducao(filtros));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro inesperado ao buscar.";
      setError(message);
      setFichas([]);
    } finally {
      setLoading(false);
    }
  }

  function abrirRetirada(ficha: FichaProducao) {
    setMenuFicha(null);
    setFichaParaRetirar(ficha);
    setIdsParaRetirar([ficha.id]);
    setErroRetirada("");
    setMensagemRetirada("");
  }

  async function confirmarRetirada(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (retirando || !idsParaRetirar.length) return;

    const form = e.currentTarget;
    const campos = new FormData(form);
    let autorizacao: SupabaseClient | undefined;
    setRetirando(true);
    setErroRetirada("");
    try {
      const { createClient } = await import("@supabase/supabase-js");
      autorizacao = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
            storageKey: "anest-producao-retirada",
          },
        }
      );
      const { data, error: authError } = await autorizacao.auth.signInWithPassword({
        email: String(campos.get("email") ?? "").trim(),
        password: String(campos.get("password") ?? ""),
      });
      if (authError?.status === 429) {
        throw new Error("Muitas tentativas. Aguarde e tente novamente.");
      }
      if (authError || !data.session) {
        throw new Error("Não foi possível autenticar a Conta Anest. Confira o e-mail e a senha.");
      }

      const response = await fetch("/api/fichas/producao", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.session.access_token}`,
        },
        body: JSON.stringify({ ids: idsParaRetirar }),
      });
      const json = await response.json().catch(() => null);
      if (!response.ok || !json?.ok) {
        throw new Error(json?.error || "Não foi possível confirmar a retirada.");
      }

      retiradaDialog.current?.close();
      setMensagemRetirada(idsParaRetirar.length === 1 ? "Envio retirado da produção." : "Envios selecionados retirados da produção.");
      await buscarProducao(undefined, ultimaBusca.current);
    } catch (err) {
      setErroRetirada(err instanceof Error ? err.message : "Não foi possível confirmar a retirada.");
    } finally {
      form.reset();
      if (autorizacao) void autorizacao.auth.signOut({ scope: "local" }).catch(() => {});
      setRetirando(false);
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
        body: JSON.stringify({ fileKey, fileName }),
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
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.9fr_1.35fr_auto]">
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

            <div>
              <label className="mb-2 block text-sm font-bold text-zinc-700">
                Tipo de produção
              </label>

              <div className="flex flex-wrap gap-3">
                {[
                  { id: "geral" as const, label: "Produção geral" },
                  { id: "chd" as const, label: "Produção CHD" },
                ].map((tipo) => {
                  const active = tipo.id === tipoProducao;

                  return (
                    <button
                      key={tipo.id}
                      type="button"
                      onClick={() => {
                        setTipoProducao(tipo.id);
                        setCopied(false);
                        setExpandedIds(new Set());
                      }}
                      className={[
                        "rounded-full px-4 py-2 text-sm font-bold transition",
                        active
                          ? "border border-[#1a2718] bg-[#1a2718] text-white shadow-md shadow-[#1a2718]/20"
                          : "border border-zinc-300 bg-white text-zinc-700 hover:border-[#b9963b]/50 hover:bg-[#fafaf7]",
                      ].join(" ")}
                    >
                      {tipo.label}
                    </button>
                  );
                })}
              </div>
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

        {fichasExibidas.length > 0 ? (
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
                Casos únicos
              </p>
              <p className="mt-2 text-3xl font-black">{fichasExibidas.length}</p>
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
                disabled={fichasExibidas.length === 0}
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
        ) : !loading && !error && fichasExibidas.length === 0 ? (
          <div className="rounded-[28px] border border-zinc-200 bg-white px-6 py-14 text-center shadow-sm">
            <h2 className="text-lg font-bold">{emptyTitle}</h2>
            <p className="mt-2 text-sm text-zinc-500">
              Altere o tipo de produção ou busque outra data para conferir.
            </p>
          </div>
        ) : null}

        {fichasExibidas.length > 0 ? (
          <div className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 px-6 py-5">
              <h2 className="text-base font-bold">
                Linhas da {linhasTitulo} — {hospitalLabel}
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
                  {fichasExibidas.map((ficha) => {
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
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => baixarArquivo({
                                  id: ficha.id,
                                  fileKey: ficha.fileKey,
                                  fileName: ficha.fileName,
                                })}
                                disabled={isDownloading}
                                className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-bold text-zinc-800 shadow-sm transition hover:border-[#b9963b] hover:bg-[#fafaf7] disabled:cursor-wait disabled:opacity-50"
                              >
                                {isDownloading ? "Gerando..." : "Baixar"}
                              </button>
                              <button
                                type="button"
                                aria-label={`Ações da ficha de ${ficha.paciente}, registro ${ficha.registro}`}
                                aria-expanded={menuFicha?.ficha.id === ficha.id}
                                aria-controls={menuFicha?.ficha.id === ficha.id ? "acoes-ficha" : undefined}
                                title="Mais ações"
                                onClick={(event) => {
                                  if (menuFicha?.ficha.id === ficha.id) {
                                    setMenuFicha(null);
                                    return;
                                  }
                                  gatilhoMenu.current = event.currentTarget;
                                  const rect = event.currentTarget.getBoundingClientRect();
                                  setMenuFicha({
                                    ficha,
                                    top: Math.max(8, rect.bottom + 54 <= window.innerHeight - 8
                                      ? rect.bottom + 6 : rect.top - 54),
                                    left: Math.max(8, Math.min(rect.right - 192, window.innerWidth - 200)),
                                  });
                                }}
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-xl leading-none text-zinc-400 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a865f]"
                              >
                                <span aria-hidden="true">…</span>
                              </button>
                            </div>
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
                                      onClick={() => baixarArquivo({
                                        id: version.id,
                                        fileKey: version.fileKey,
                                        fileName: version.fileName,
                                      })}
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

      <div role="status" className="mx-auto max-w-7xl px-4 text-sm font-medium text-green-800 sm:px-6">
        {mensagemRetirada ? <p className="pt-4">{mensagemRetirada}</p> : null}
      </div>

      {menuFicha ? (
        <div
          ref={menuRetirada}
          id="acoes-ficha"
          role="group"
          aria-label="Ações da ficha"
          style={{ top: menuFicha.top, left: menuFicha.left }}
          className="fixed z-[96] w-48 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg"
        >
          <button
            type="button"
            onClick={() => abrirRetirada(menuFicha.ficha)}
            className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-700 transition hover:bg-red-50 hover:text-red-800 focus-visible:bg-red-50 focus-visible:text-red-800 focus-visible:outline-none"
          >
            Retirar da produção
          </button>
        </div>
      ) : null}

      <dialog
        ref={retiradaDialog}
        aria-labelledby="retirada-titulo"
        onClose={() => setFichaParaRetirar(null)}
        onCancel={(e) => { if (retirando) e.preventDefault(); }}
        className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-md overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-5 text-zinc-950 shadow-xl backdrop:bg-black/40 sm:p-6"
      >
        {fichaParaRetirar ? (
          <form onSubmit={confirmarRetirada} className="space-y-4">
            <h2 id="retirada-titulo" className="text-lg font-bold">Retirar da produção</h2>
            <div className="rounded-xl bg-zinc-50 p-3 text-sm">
              <p className="font-bold">{fichaParaRetirar.paciente}</p>
              <p>Registro <strong>{fichaParaRetirar.registro}</strong></p>
              <p>{HOSPITAIS.find((h) => h.id === fichaParaRetirar.hospitalId)?.label ?? fichaParaRetirar.hospitalId} · {fichaParaRetirar.data}</p>
            </div>
            <p className="text-sm text-zinc-600">
              Os envios selecionados sairão da produção e da tabela para copiar. Continuarão disponíveis no dashboard para consulta e download.
            </p>
            {fichaParaRetirar.versions.length > 1 ? (
              <fieldset disabled={retirando} className="space-y-2 text-sm">
                <legend className="font-bold">Envios a retirar</legend>
                <p className="text-zinc-600">Marque apenas os envios com erro. Os demais podem continuar aparecendo neste registro.</p>
                {idsParaRetirar.length > 50 ? <p className="text-red-800">Selecione até 50 envios por vez.</p> : null}
                {fichaParaRetirar.versions.map((version) => (
                  <label key={version.id} className="flex items-start gap-2 rounded-lg border border-zinc-200 p-2">
                    <input
                      type="checkbox"
                      checked={idsParaRetirar.includes(version.id)}
                      onChange={(e) => {
                        const checked = e.currentTarget.checked;
                        setIdsParaRetirar((ids) => checked
                          ? [...ids, version.id]
                          : ids.filter((id) => id !== version.id));
                      }}
                      className="mt-1"
                    />
                    <span>
                      {formatDateTimeBR(version.uploadedAt)} · {version.anesthesiaType || "Tipo não informado"}
                      <span className="block break-all text-xs text-zinc-600">{version.fileName}</span>
                    </span>
                  </label>
                ))}
              </fieldset>
            ) : null}
            <fieldset disabled={retirando} className="space-y-2">
              <legend className="text-sm font-bold">Conta Anest da responsável</legend>
              <label className="block text-sm">
                E-mail
                <input
                  type="email"
                  name="email"
                  autoComplete="username"
                  required
                  className="mt-1 block w-full rounded-xl border border-zinc-300 px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                Senha
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  className="mt-1 block w-full rounded-xl border border-zinc-300 px-3 py-2"
                />
              </label>
            </fieldset>
            {erroRetirada ? <p role="alert" className="text-sm text-red-800">{erroRetirada}</p> : null}
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                disabled={retirando}
                onClick={() => retiradaDialog.current?.close()}
                className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={retirando || !idsParaRetirar.length || idsParaRetirar.length > 50}
                className="rounded-xl bg-red-800 px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                {retirando ? "Retirando..." : "Confirmar retirada"}
              </button>
            </div>
          </form>
        ) : null}
      </dialog>

      <SupportChatErrorBoundary>
        <SupportChatWidget area="production" />
      </SupportChatErrorBoundary>
    </main>
  );
}

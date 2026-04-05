"use client";

import { useEffect, useMemo, useRef, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Ficha = {
  id: string;
  patient_name: string;
  record_number: string;
  procedure_date: string;
  anesthesia_type: string | null;
  start_date_time: string;
  end_date_time: string | null;
  file_key: string;
  file_name: string;
  uploaded_at: string;
  expires_at?: string;
};

function todayISO() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shiftISO(baseDate: string, days: number) {
  const [year, month, day] = baseDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDateBR(date: string) {
  return new Date(date).toLocaleDateString("pt-BR");
}

function formatDateTimeBR(date: string) {
  return new Date(date).toLocaleString("pt-BR");
}

function getExpiryTone(expiresAt?: string) {
  if (!expiresAt) {
    return "bg-slate-100 text-slate-600";
  }

  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffMs = expiry.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays <= 3) {
    return "bg-red-50 text-red-700";
  }

  if (diffDays <= 7) {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-slate-100 text-slate-600";
}

export default function ProDashboardPage() {
  const router = useRouter();
  const today = todayISO();

  const [userId, setUserId] = useState<string>("");
  const [crm, setCrm] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");

  const [useRange, setUseRange] = useState(false);
  const [date, setDate] = useState<string>(today);
  const [dateFrom, setDateFrom] = useState<string>(today);
  const [dateTo, setDateTo] = useState<string>(today);

  const [search, setSearch] = useState<string>("");
  const [fichas, setFichas] = useState<Ficha[]>([]);

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
const [success, setSuccess] = useState<string>("");
const [hasSearched, setHasSearched] = useState(false);
const [isSigningOut, setIsSigningOut] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [fichaToDelete, setFichaToDelete] = useState<Ficha | null>(null);

  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session) {
        router.replace("/pro/login?reason=session-expired");
        return;
      }

      const currentUserId = String(session.user.id ?? "").trim();
      const crmFromMetadata = String(session.user.user_metadata?.crm ?? "").trim();
      const fullNameFromMetadata = String(
        session.user.user_metadata?.full_name ?? ""
      ).trim();

      if (!currentUserId) {
        setError("Não foi possível identificar o usuário logado.");
        setCheckingSession(false);
        return;
      }

      setUserId(currentUserId);
      setCrm(crmFromMetadata);
      setFullName(fullNameFromMetadata);
      setCheckingSession(false);
    }

    checkSession();

    const {
  data: { subscription },
} = supabase.auth.onAuthStateChange((_event, session) => {
  if (!session && !isSigningOut) {
    router.replace("/pro/login?reason=session-expired");
  }
});

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, isSigningOut]);

  useEffect(() => {
    if (!error) return;

    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
    }

    errorTimerRef.current = setTimeout(() => {
      setError("");
    }, 4000);

    return () => {
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
      }
    };
  }, [error]);

  useEffect(() => {
    if (!success) return;

    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
    }

    successTimerRef.current = setTimeout(() => {
      setSuccess("");
    }, 4000);

    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, [success]);

  function aplicarPeriodoRapido(days: number) {
    const end = todayISO();
    const start = shiftISO(end, -(days - 1));
    setDateFrom(start);
    setDateTo(end);
    setUseRange(true);
  }

  async function buscarFichas(e?: FormEvent) {
    if (e) e.preventDefault();

    setHasSearched(true);
    setLoading(true);
    setError("");
    setSuccess("");
    setFichas([]);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const accessToken = session?.access_token?.trim();

      if (!accessToken) {
        throw new Error("Sua sessão expirou. Entre novamente.");
      }

      const params = new URLSearchParams();

      if (useRange) {
        if (dateFrom > dateTo) {
          throw new Error("A data inicial não pode ser maior que a data final.");
        }

        params.set("date_from", dateFrom);
        params.set("date_to", dateTo);
      } else {
        params.set("date", date);
      }

      const response = await fetch(`/api/pro/fichas/listar?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Erro ao buscar fichas.");
      }

      setFichas(json.fichas ?? []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro inesperado ao buscar fichas.";
      setError(message);
      setFichas([]);
    } finally {
      setLoading(false);
    }
  }

  async function baixarFicha(ficha: Ficha) {
    setDownloadingId(ficha.id);
    setError("");
    setSuccess("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const accessToken = session?.access_token?.trim();

      if (!accessToken) {
        throw new Error("Sua sessão expirou. Entre novamente.");
      }

      const response = await fetch("/api/pro/fichas/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
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
      setSuccess("Link de download gerado com sucesso.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao baixar a ficha.";
      setError(message);
    } finally {
      setDownloadingId(null);
    }
  }

  function abrirModalExclusao(ficha: Ficha) {
    setError("");
    setSuccess("");
    setFichaToDelete(ficha);
    setConfirmOpen(true);
  }

  function fecharModalExclusao() {
    if (deletingId) return;
    setConfirmOpen(false);
    setFichaToDelete(null);
  }

  async function confirmarExclusao() {
    if (!fichaToDelete) return;

    setDeletingId(fichaToDelete.id);
    setError("");
    setSuccess("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const accessToken = session?.access_token?.trim();

      if (!accessToken) {
        throw new Error("Sua sessão expirou. Entre novamente.");
      }

      const response = await fetch("/api/pro/fichas/excluir", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          fichaId: fichaToDelete.id,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Erro ao excluir a ficha.");
      }

      setFichas((prev) => prev.filter((item) => item.id !== fichaToDelete.id));
      setSuccess("Ficha removida do painel com sucesso.");
      setConfirmOpen(false);
      setFichaToDelete(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao excluir a ficha.";
      setError(message);
    } finally {
      setDeletingId(null);
    }
  }

  async function sair() {
  setError("");
  setSuccess("");
  setIsSigningOut(true);

  try {
    sessionStorage.setItem("pro_logout_intent", "1");

    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message || "Não foi possível sair.");
    }

    window.location.href = "/pro/login";
  } catch (err) {
    sessionStorage.removeItem("pro_logout_intent");

    const message =
      err instanceof Error ? err.message : "Não foi possível sair.";
    setError(message);
    setIsSigningOut(false);
  }
}

  const fichasFiltradas = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return fichas;

    return fichas.filter((ficha) => {
      const patient = (ficha.patient_name ?? "").toLowerCase();
      const record = (ficha.record_number ?? "").toLowerCase();
      return patient.includes(term) || record.includes(term);
    });
  }, [fichas, search]);

  if (checkingSession) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-8 sm:px-6">
          <div className="rounded-3xl border border-slate-200 bg-white px-8 py-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
              ⏳
            </div>
            <p className="text-sm font-medium text-slate-900">Preparando sua conta</p>
            <p className="mt-1 text-sm text-slate-500">Verificando sua sessão e carregando suas informações.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
  Conta Anest+
</p>
<h1 className="text-2xl font-semibold tracking-tight">
  Minhas fichas
</h1>
              <p className="mt-2 text-sm text-slate-600">
                {fullName ? (
                  <>
                    <span className="font-medium text-slate-900">{fullName}</span>
                    {crm ? (
                      <>
                        {" "}• CRM vinculado:{" "}
                        <span className="font-medium text-slate-900">{crm}</span>
                      </>
                    ) : null}
                  </>
                ) : (
                  <>
                    Conta conectada
                    {crm ? (
                      <>
                        {" "}• CRM vinculado:{" "}
                        <span className="font-medium text-slate-900">{crm}</span>
                      </>
                    ) : null}
                  </>
                )}
              </p>

              <p className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                Fichas sincronizadas ficam disponíveis no painel por tempo limitado.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
                <span className="font-medium text-slate-900">
                  {useRange ? "Período" : "Data"}
                </span>
                <span className="mx-2 text-slate-400">•</span>
                <span>
                  {useRange
                    ? `${dateFrom.split("-").reverse().join("/")} até ${dateTo
                        .split("-")
                        .reverse()
                        .join("/")}`
                    : date.split("-").reverse().join("/")}
                </span>
              </div>

              <Link
  href="/pro/perfil"
  className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50"
>
  Minha conta
</Link>

              <button
                type="button"
                onClick={sair}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Sair
              </button>
            </div>
          </div>
        </div>

        <form
          onSubmit={buscarFichas}
          className="mb-8 grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setUseRange((prev) => !prev);
                setError("");
                setSuccess("");
              }}
              className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              {useRange ? "Usar busca por dia" : "Buscar por período"}
            </button>

            {useRange ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    const now = todayISO();
                    setDateFrom(now);
                    setDateTo(now);
                  }}
                  className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  Hoje
                </button>

                <button
                  type="button"
                  onClick={() => aplicarPeriodoRapido(7)}
                  className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  7 dias
                </button>

                <button
                  type="button"
                  onClick={() => aplicarPeriodoRapido(30)}
                  className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  30 dias
                </button>
              </>
            ) : null}
          </div>

          {useRange ? (
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1.2fr_auto]">
              <div>
                <label
                  htmlFor="date-from-input"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Data inicial
                </label>
                <input
                  id="date-from-input"
                  type="date"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="date-to-input"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Data final
                </label>
                <input
                  id="date-to-input"
                  type="date"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="search-input-range"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Buscar por paciente ou prontuário
                </label>
                <input
                  id="search-input-range"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Ex.: Maria ou 123456"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={loading || !userId.trim()}
                >
                  {loading ? "Buscando..." : "Buscar"}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-[1fr_1.2fr_auto]">
              <div>
                <label
                  htmlFor="date-input"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Data
                </label>
                <input
                  id="date-input"
                  type="date"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="search-input-day"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Buscar por paciente ou prontuário
                </label>
                <input
                  id="search-input-day"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Ex.: Maria ou 123456"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={loading || !userId.trim()}
                >
                  {loading ? "Buscando..." : "Buscar"}
                </button>
              </div>
            </div>
          )}
        </form>

        {loading ? (
          <div className="mb-6 rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
              <div>
                <p className="text-sm font-medium text-slate-900">Buscando fichas</p>
                <p className="text-sm text-slate-500">
                  Aguarde enquanto buscamos suas fichas.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm transition-all">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm transition-all">
            {success}
          </div>
        ) : null}

        {!hasSearched ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
              🔎
            </div>
            <h2 className="text-lg font-semibold">Busque suas fichas</h2>
            <p className="mt-2 text-sm text-slate-600">
              {useRange
                ? "Escolha um período e, se quiser, filtre por paciente ou prontuário."
                : "Escolha a data e, se quiser, filtre por paciente ou prontuário."}
            </p>
          </div>
        ) : !loading && !error && fichasFiltradas.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-2xl">
              📄
            </div>
            <h2 className="text-lg font-semibold">Nenhuma ficha encontrada</h2>
            <p className="mt-2 max-w-md mx-auto text-sm text-slate-600">
              {useRange
                ? "Não encontramos fichas nesse período. Tente ampliar o intervalo ou ajustar o termo da busca."
                : "Não encontramos fichas nessa data. Tente outra data ou ajuste o termo da busca."}
            </p>
          </div>
        ) : null}

        {fichasFiltradas.length > 0 ? (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                {fichasFiltradas.length}{" "}
                {fichasFiltradas.length === 1 ? "ficha encontrada" : "fichas encontradas"}
              </h2>
              {search.trim() ? (
                <p className="text-sm text-slate-500">
                  Filtro ativo:{" "}
                  <span className="font-medium text-slate-700">{search}</span>
                </p>
              ) : null}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[920px] w-full">
                <thead className="bg-slate-50">
                  <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    <th className="px-4 py-4 sm:px-5">Paciente</th>
                    <th className="px-4 py-4 sm:px-5">Anestesia</th>
                    <th className="px-4 py-4 sm:px-5">Data da ficha</th>
                    <th className="px-4 py-4 sm:px-5">Enviado em</th>
                    <th className="px-4 py-4 sm:px-5">Disponível até</th>
                    <th className="px-4 py-4 text-right sm:px-5">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {fichasFiltradas.map((ficha, index) => {
                    const isDownloadingThis = downloadingId === ficha.id;
                    const isDeletingThis = deletingId === ficha.id;
                    const expiryTone = getExpiryTone(ficha.expires_at);

                    return (
                      <tr
                        key={ficha.id}
                        className={index !== fichasFiltradas.length - 1 ? "border-b border-slate-100" : ""}
                      >
                        <td className="px-4 py-4 sm:px-5">
                          <div className="min-w-[220px]">
                            <div className="text-[15px] font-semibold leading-tight text-slate-900">
                              {ficha.patient_name}
                            </div>
                            <div className="mt-1 text-sm text-slate-500">
                              Prontuário:{" "}
                              <span className="font-medium text-slate-700">
                                {ficha.record_number}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 sm:px-5 text-sm text-slate-700">
                          {ficha.anesthesia_type ? (
                            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                              {ficha.anesthesia_type}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        <td className="px-4 py-4 sm:px-5 text-sm text-slate-600">
                          <span className="inline-flex whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                            {formatDateBR(ficha.procedure_date + "T00:00:00")}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 sm:px-5 text-sm text-slate-600">
                          {formatDateTimeBR(ficha.uploaded_at)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 sm:px-5 text-sm text-slate-600">
                          {ficha.expires_at ? (
                            <span
                              title="A ficha permanece disponível no painel até esta data."
                              className={`inline-flex rounded-full px-3 py-1 font-medium ${expiryTone}`}
                            >
                              {formatDateBR(ficha.expires_at)}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>

                        <td className="px-4 py-4 sm:px-5">
                          <div className="flex justify-end gap-2 whitespace-nowrap">
                            <button
                              className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-50"
                              onClick={() => baixarFicha(ficha)}
                              disabled={isDownloadingThis || isDeletingThis}
                            >
                              {isDownloadingThis ? "Gerando..." : "Baixar"}
                            </button>

                            <button
                              className="rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-50"
                              onClick={() => abrirModalExclusao(ficha)}
                              disabled={isDeletingThis || isDownloadingThis}
                            >
                              {isDeletingThis ? "Excluindo..." : "Excluir"}
                            </button>
                          </div>
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

      {confirmOpen && fichaToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-xl">
              🗑️
            </div>

            <h2 className="text-lg font-semibold text-slate-900">
              Remover ficha da sua conta?
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Você está removendo a ficha de{" "}
              <span className="font-medium text-slate-900">
                {fichaToDelete.patient_name}
              </span>{" "}
              do painel Pro.
            </p>

            <p className="mt-2 text-sm text-slate-500">
              ssa ação remove a ficha da sua Conta Anest+
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={fecharModalExclusao}
                disabled={Boolean(deletingId)}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmarExclusao}
                disabled={Boolean(deletingId)}
                className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {deletingId ? "Excluindo..." : "Confirmar exclusão"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
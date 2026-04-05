"use client";

import { useEffect, useMemo, useRef, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
  last_downloaded_at?: string | null;
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
  return new Date(date).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

function formatDateTimeBR(date: string) {
  return new Date(date).toLocaleString("pt-BR");
}

function calculateDuration(start: string, end: string | null) {
  if (!end) return null;

  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  if (diffMs <= 0) return null;

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
}

function getExpiryTone(expiresAt?: string) {
  if (!expiresAt) {
    return "bg-zinc-100 text-zinc-600";
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

  return "bg-zinc-100 text-zinc-600";
}

export default function ProDashboardPage() {
  const router = useRouter();
  const today = todayISO();

  const [userId, setUserId] = useState<string>("");
  const [crm, setCrm] = useState<string>("");
  const [rqe, setRqe] = useState<string>("");
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
      const rqeFromMetadata = String(session.user.user_metadata?.rqe ?? "").trim();
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
      setRqe(rqeFromMetadata);
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

      setFichas((prev) =>
        prev.map((item) =>
          item.id === ficha.id
            ? { ...item, last_downloaded_at: new Date().toISOString() }
            : item
        )
      );
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
      setSuccess("Ficha removida com sucesso.");
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

    let result = fichas;

    if (term) {
      result = result.filter((ficha) => {
        const patient = (ficha.patient_name ?? "").toLowerCase();
        const record = (ficha.record_number ?? "").toLowerCase();
        return patient.includes(term) || record.includes(term);
      });
    }

    return [...result].sort((a, b) => {
      const dateA = new Date(a.procedure_date).getTime();
      const dateB = new Date(b.procedure_date).getTime();

      if (dateA === dateB) {
        return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
      }

      return dateB - dateA;
    });
  }, [fichas, search]);

  const dashboardMetrics = useMemo(() => {
    let totalMinutes = 0;
    const typesCount: Record<string, number> = {};

    fichasFiltradas.forEach((ficha) => {
      if (ficha.start_date_time && ficha.end_date_time) {
        const diff =
          new Date(ficha.end_date_time).getTime() -
          new Date(ficha.start_date_time).getTime();

        if (diff > 0) {
          totalMinutes += Math.floor(diff / (1000 * 60));
        }
      }

      const type = ficha.anesthesia_type || "Não informado";
      typesCount[type] = (typesCount[type] || 0) + 1;
    });

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const timeString = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    let topType = "Nenhum";
    let maxCount = 0;

    Object.entries(typesCount).forEach(([type, count]) => {
      if (count > maxCount && type !== "Não informado") {
        topType = type;
        maxCount = count;
      }
    });

    return {
      total: fichasFiltradas.length,
      timeString,
      topType,
    };
  }, [fichasFiltradas]);

  if (checkingSession) {
    return (
      <main className="min-h-screen bg-[#fafaf7] text-zinc-950 font-sans">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-8 sm:px-6">
          <div className="inline-flex rounded-lg border border-[#b9963b]/15 bg-[#f6f7f1] px-2.5 py-1 text-xs font-bold text-[#506047]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#b9963b]/10 text-2xl">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#b9963b]/30 border-t-[#b9963b]" />
            </div>
            <p className="text-sm font-bold text-zinc-950">Preparando sua conta</p>
            <p className="mt-1 text-sm text-zinc-500">
              Verificando sua sessão e carregando suas informações.
            </p>
          </div>
        </div>
      </main>
    );
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
                  Conta Anest+
                </p>
                <h1 className="mt-1 text-3xl font-black tracking-tight text-zinc-950 sm:text-[2.1rem]">
                  Olá, {fullName || "doutor(a)"}
                </h1>
              </div>
            </div>

            {(crm || rqe) ? (
              <p className="mt-3 text-sm text-zinc-500">
                {crm ? (
                  <>
                    CRM: <span className="font-bold text-zinc-800">{crm}</span>
                  </>
                ) : null}
                {crm && rqe ? <span className="mx-2 text-zinc-300">•</span> : null}
                {rqe ? (
                  <>
                    RQE: <span className="font-bold text-zinc-800">{rqe}</span>
                  </>
                ) : null}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-3 self-start">
            <Link
              href="/pro/perfil"
              className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-bold text-zinc-700 transition hover:border-[#b9963b]/50 hover:bg-[#fafaf7]"
            >
              Minha conta
            </Link>

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
          <div className="mb-5 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setUseRange((prev) => !prev);
                setError("");
                setSuccess("");
              }}
              className="rounded-full border border-zinc-300 bg-white px-3.5 py-1.5 text-sm font-bold text-zinc-700 transition hover:border-[#b9963b]/50 hover:bg-[#fafaf7]"
            >
              {useRange ? "Usar busca por dia" : "Buscar por período"}
            </button>

            {useRange ? (
              <div className="flex flex-wrap items-center gap-1.5 border-l border-zinc-200 pl-2">
                <button
                  type="button"
                  onClick={() => {
                    const now = todayISO();
                    setDateFrom(now);
                    setDateTo(now);
                  }}
                  className="rounded-full px-3 py-1.5 text-sm font-bold text-zinc-500 transition hover:bg-[#f6f7f1] hover:text-[#7a865f]"
                >
                  Hoje
                </button>
                <button
                  type="button"
                  onClick={() => aplicarPeriodoRapido(7)}
                  className="rounded-full px-3 py-1.5 text-sm font-bold text-zinc-500 transition hover:bg-[#f6f7f1] hover:text-[#7a865f]"
                >
                  7 dias
                </button>
                <button
                  type="button"
                  onClick={() => aplicarPeriodoRapido(30)}
                  className="rounded-full px-3 py-1.5 text-sm font-bold text-zinc-500 transition hover:bg-[#f6f7f1] hover:text-[#7a865f]"
                >
                  30 dias
                </button>
              </div>
            ) : null}
          </div>

          <div
            className={`grid gap-4 ${
              useRange
                ? "lg:grid-cols-[1fr_1fr_1.45fr_auto]"
                : "md:grid-cols-[1fr_1.45fr_auto]"
            }`}
          >
            {useRange ? (
              <>
                <div className="relative group">
                  <label
                    htmlFor="date-from-input"
                    className="absolute -top-2.5 left-3 bg-white px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500 transition-colors group-focus-within:text-[#b9963b]"
                  >
                    Data inicial
                  </label>
                  <input
                    id="date-from-input"
                    type="date"
                    className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-900 outline-none transition focus:border-[#b9963b] focus:ring-2 focus:ring-[#b9963b]/10 hover:border-zinc-400"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>

                <div className="relative group">
                  <label
                    htmlFor="date-to-input"
                    className="absolute -top-2.5 left-3 bg-white px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500 transition-colors group-focus-within:text-[#b9963b]"
                  >
                    Data final
                  </label>
                  <input
                    id="date-to-input"
                    type="date"
                    className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-900 outline-none transition focus:border-[#b9963b] focus:ring-2 focus:ring-[#b9963b]/10 hover:border-zinc-400"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </>
            ) : (
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
                  className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-900 outline-none transition focus:border-[#b9963b] focus:ring-2 focus:ring-[#b9963b]/10 hover:border-zinc-400"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            )}

            <div className="relative group">
              <label
                htmlFor="search-input"
                className="absolute -top-2.5 left-3 bg-white px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500 transition-colors group-focus-within:text-[#b9963b]"
              >
                Buscar por paciente ou prontuário
              </label>
              <input
                id="search-input"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ex.: Maria ou 123456"
                className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-900 outline-none transition focus:border-[#b9963b] focus:ring-2 focus:ring-[#b9963b]/10 hover:border-zinc-400 placeholder:text-zinc-400"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-2xl bg-[#1a2718] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#22331d] shadow-md shadow-[#1a2718]/20 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading || !userId.trim()}
              >
                {loading ? "Buscando..." : "Buscar"}
              </button>
            </div>
          </div>
        </form>

        {loading ? (
          <div className="mb-8 flex items-center justify-center gap-3 rounded-[28px] border border-zinc-200 bg-white px-5 py-8 shadow-sm">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-[#b9963b]" />
            <p className="text-sm font-bold text-zinc-600">Buscando fichas...</p>
          </div>
        ) : null}

        {error ? (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-sm">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mb-8 rounded-2xl border border-[#b9963b]/30 bg-[#b9963b]/5 px-4 py-3 text-sm font-medium text-[#7a865f] shadow-sm">
            {success}
          </div>
        ) : null}

        {!hasSearched ? (
          <div className="rounded-[28px] border border-zinc-200 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f6f7f1] text-2xl border border-[#b9963b]/10">
              <span className="text-xl">🔎</span>
            </div>
            <h2 className="text-lg font-bold text-zinc-950">Busque suas fichas</h2>
            <p className="mt-2 text-sm text-zinc-500">
              {useRange
                ? "Escolha um período e, se quiser, filtre por paciente ou prontuário."
                : "Escolha a data e, se quiser, filtre por paciente ou prontuário."}
            </p>
          </div>
        ) : !loading && !error && fichasFiltradas.length === 0 ? (
          <div className="rounded-[28px] border border-zinc-200 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#f6f7f1] text-2xl border border-[#b9963b]/10">
              <span className="text-2xl">📄</span>
            </div>
            <h2 className="text-lg font-bold text-zinc-950">
              Nenhuma ficha encontrada
            </h2>
            <p className="mt-2 max-w-md mx-auto text-sm text-zinc-500">
              {useRange
                ? "Não encontramos fichas nesse período. Tente ampliar o intervalo ou ajustar o termo da busca."
                : "Não encontramos fichas nessa data. Tente outra data ou ajuste o termo da busca."}
            </p>
          </div>
        ) : null}

        {fichasFiltradas.length > 0 && !loading ? (
          <>
            <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-zinc-200 sm:overflow-hidden sm:rounded-[22px] sm:border sm:border-zinc-200 sm:bg-white sm:shadow-sm">
              <div className="rounded-[18px] border border-zinc-200 bg-white px-5 py-3.5 text-center shadow-sm sm:rounded-none sm:border-0 sm:bg-transparent sm:px-5 sm:py-4 sm:text-left sm:shadow-none">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7a865f]">
                  Total no período
                </p>
                <p className="mt-1 text-[1.7rem] font-black leading-none tracking-tight text-zinc-950">
                  {dashboardMetrics.total}
                </p>
              </div>

              <div className="rounded-[18px] border border-zinc-200 bg-white px-5 py-3.5 text-center shadow-sm sm:rounded-none sm:border-0 sm:bg-transparent sm:px-5 sm:py-4 sm:text-left sm:shadow-none">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7a865f]">
                  Tempo de anestesia
                </p>
                <p className="mt-1 text-[1.7rem] font-black leading-none tracking-tight text-zinc-950">
                  {dashboardMetrics.timeString}
                </p>
              </div>

              <div className="rounded-[18px] border border-zinc-200 bg-white px-5 py-3.5 text-center shadow-sm sm:rounded-none sm:border-0 sm:bg-transparent sm:px-5 sm:py-4 sm:text-left sm:shadow-none">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7a865f]">
                  Técnica predominante
                </p>
                <p
                  className="mt-1 truncate text-[1.35rem] font-black leading-none tracking-tight text-zinc-950"
                  title={dashboardMetrics.topType}
                >
                  {dashboardMetrics.topType}
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm">
              <div className="flex flex-col gap-2 border-b border-zinc-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-base font-bold text-zinc-950">
                  Histórico detalhado
                </h2>
                {search.trim() ? (
                  <p className="text-sm text-zinc-500">
                    Filtro ativo:{" "}
                    <span className="font-bold text-zinc-900">{search}</span>
                  </p>
                ) : null}
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-[980px] w-full">
                  <thead className="bg-zinc-50/70">
                    <tr className="text-left text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                      <th className="px-6 py-4 border-b border-zinc-200">Paciente</th>
                      <th className="px-6 py-4 border-b border-zinc-200">Anestesia / Duração</th>
                      <th className="px-6 py-4 border-b border-zinc-200">Data da ficha</th>
                      <th className="px-6 py-4 border-b border-zinc-200">Status</th>
                      <th className="px-6 py-4 border-b border-zinc-200">Disponível até</th>
                      <th className="w-[170px] px-6 py-4 text-right border-b border-zinc-200">Ações</th>
                    </tr>
                  </thead>

                  <tbody>
                    {fichasFiltradas.map((ficha, index) => {
                      const isDownloadingThis = downloadingId === ficha.id;
                      const isDeletingThis = deletingId === ficha.id;
                      const expiryTone = getExpiryTone(ficha.expires_at);
                      const duration = calculateDuration(
                        ficha.start_date_time,
                        ficha.end_date_time
                      );
                      const isNew = !ficha.last_downloaded_at;

                      return (
                        <tr
                          key={ficha.id}
                          className={`transition-colors hover:bg-zinc-50/50 ${
                            index !== fichasFiltradas.length - 1
                              ? "border-b border-zinc-100"
                              : ""
                          }`}
                        >
                          <td className="px-6 py-5">
                            <div className="min-w-[220px]">
                              <div className="text-[15px] font-bold leading-tight text-zinc-950">
                                {ficha.patient_name}
                              </div>
                              <div className="mt-1 text-sm font-medium text-zinc-500">
                                Prontuário:{" "}
                                <span className="font-bold text-zinc-700">
                                  {ficha.record_number}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex flex-col items-start gap-1.5">
                              {ficha.anesthesia_type ? (
                                <span className="inline-flex rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-bold text-zinc-700 shadow-sm">
                                  {ficha.anesthesia_type}
                                </span>
                              ) : (
                                <span className="text-zinc-400 font-bold">—</span>
                              )}

                              {duration ? (
                                <span className="flex items-center gap-1 text-xs font-bold text-zinc-500">
                                  ⏱️ {duration}
                                </span>
                              ) : null}
                            </div>
                          </td>

                          <td className="px-6 py-5 text-sm font-bold text-zinc-700">
                            {formatDateBR(ficha.procedure_date + "T00:00:00")}
                          </td>

                          <td className="whitespace-nowrap px-6 py-5 text-sm">
  {isNew ? (
    <span className="inline-flex rounded-full border border-[#b9963b]/25 bg-[#f8f6ee] px-3 py-1 text-xs font-bold text-[#7a865f]">
      Novo
    </span>
  ) : (
    <span className="inline-flex rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-bold text-zinc-500 shadow-sm">
      Baixado
    </span>
  )}
</td>

                          <td className="whitespace-nowrap px-6 py-5 text-sm text-zinc-600">
                            {ficha.expires_at ? (
                              <span
                                title="A ficha permanece disponível no painel até esta data."
                                className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold border shadow-sm ${expiryTone}`}
                              >
                                {formatDateBR(ficha.expires_at)}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>

                          <td className="w-[170px] px-6 py-5">
                            <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                              <button
                                className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-bold text-zinc-800 shadow-sm transition hover:border-[#b9963b] hover:bg-[#fafaf7] hover:text-[#7a865f] disabled:cursor-wait disabled:opacity-50"
                                onClick={() => baixarFicha(ficha)}
                                disabled={isDownloadingThis || isDeletingThis}
                              >
                                {isDownloadingThis ? "Baixando..." : "Baixar"}
                              </button>

                              <button
                                className="rounded-xl px-3 py-2 text-sm font-bold text-red-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-wait disabled:opacity-50"
                                onClick={() => abrirModalExclusao(ficha)}
                                disabled={isDeletingThis || isDownloadingThis}
                              >
                                Excluir
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
          </>
        ) : null}
      </div>

      {confirmOpen && fichaToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-[28px] border border-zinc-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-xl text-red-600">
              <span className="text-2xl">🗑️</span>
            </div>

            <h2 className="text-xl font-black tracking-tight text-zinc-950">
              Remover ficha da sua conta?
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Você está removendo a ficha de{" "}
              <span className="font-bold text-zinc-950">
                {fichaToDelete.patient_name}
              </span>
              .
            </p>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Essa ação apaga a ficha da visualização da sua Conta Anest+ e não pode ser desfeita.
            </p>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={fecharModalExclusao}
                disabled={Boolean(deletingId)}
                className="rounded-2xl border border-zinc-300 bg-white px-5 py-3 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmarExclusao}
                disabled={Boolean(deletingId)}
                className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-red-600/20 transition hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
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
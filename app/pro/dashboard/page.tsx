"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
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
  const [error, setError] = useState<string>("");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session) {
        router.replace("/pro/login");
        return;
      }

      const currentUserId = String(session.user.id ?? "").trim();
      const crmFromMetadata = String(session.user.user_metadata?.crm ?? "").trim();
      const fullNameFromMetadata = String(session.user.user_metadata?.full_name ?? "").trim();

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
      if (!session) {
        router.replace("/pro/login");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

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
    setFichas([]);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const accessToken = session?.access_token?.trim();

      if (!accessToken) {
        throw new Error("Sessão inválida. Entre novamente.");
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
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const accessToken = session?.access_token?.trim();

      if (!accessToken) {
        throw new Error("Sessão inválida. Entre novamente.");
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
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao baixar a ficha.";
      setError(message);
    } finally {
      setDownloadingId(null);
    }
  }

  async function sair() {
    setError("");

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(error.message || "Não foi possível sair.");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Não foi possível sair.";
      setError(message);
    } finally {
      window.location.href = "/pro/login";
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
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-600 shadow-sm">
            Carregando…
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
                Dashboard Pro
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
                        {" "}• CRM vinculado: <span className="font-medium text-slate-900">{crm}</span>
                      </>
                    ) : null}
                  </>
                ) : (
                  <>
                    Conta conectada
                    {crm ? (
                      <>
                        {" "}• CRM vinculado: <span className="font-medium text-slate-900">{crm}</span>
                      </>
                    ) : null}
                  </>
                )}
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
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 text-center"
              >
                Meu perfil
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
                    const today = todayISO();
                    setDateFrom(today);
                    setDateTo(today);
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
                <label htmlFor="date-from-input" className="mb-2 block text-sm font-medium text-slate-700">
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
                <label htmlFor="date-to-input" className="mb-2 block text-sm font-medium text-slate-700">
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
                <label htmlFor="search-input" className="mb-2 block text-sm font-medium text-slate-700">
                  Buscar por paciente ou prontuário
                </label>
                <input
                  id="search-input"
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
                <label htmlFor="date-input" className="mb-2 block text-sm font-medium text-slate-700">
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
                <label htmlFor="search-input" className="mb-2 block text-sm font-medium text-slate-700">
                  Buscar por paciente ou prontuário
                </label>
                <input
                  id="search-input"
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

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
            {error}
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
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
              📄
            </div>
            <h2 className="text-lg font-semibold">Nenhuma ficha encontrada</h2>
            <p className="mt-2 text-sm text-slate-600">
              {useRange
                ? "Verifique o período selecionado ou ajuste o termo de busca."
                : "Verifique a data selecionada ou ajuste o termo de busca."}
            </p>
          </div>
        ) : null}

        {fichasFiltradas.length > 0 ? (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-semibold">
                {fichasFiltradas.length} ficha{fichasFiltradas.length === 1 ? "" : "s"} encontrada
                {fichasFiltradas.length === 1 ? "" : "s"}
              </h2>
              {search.trim() ? (
                <p className="text-sm text-slate-500">
                  Filtro: <span className="font-medium text-slate-700">{search}</span>
                </p>
              ) : null}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-4">Paciente</th>
                    <th className="px-5 py-4">Prontuário</th>
                    <th className="px-5 py-4">Anestesia</th>
                    <th className="px-5 py-4">Data da ficha</th>
                    <th className="px-5 py-4">Enviado em</th>
                    <th className="px-5 py-4">Ação</th>
                  </tr>
                </thead>

                <tbody>
                  {fichasFiltradas.map((ficha, index) => {
                    const isDownloadingThis = downloadingId === ficha.id;

                    return (
                      <tr
                        key={ficha.id}
                        className={index !== fichasFiltradas.length - 1 ? "border-b border-slate-100" : ""}
                      >
                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-900">
                            {ficha.patient_name}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {ficha.record_number}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {ficha.anesthesia_type || "—"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          <span className="rounded-full bg-slate-100 px-3 py-1 whitespace-nowrap">
                            {new Date(ficha.procedure_date + "T00:00:00").toLocaleDateString("pt-BR")}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600 whitespace-nowrap">
                          {new Date(ficha.uploaded_at).toLocaleString("pt-BR")}
                        </td>

                        <td className="px-5 py-4">
                          <button
                            className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-wait w-[90px]"
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
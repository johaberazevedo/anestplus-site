"use client";

import { useMemo, useState } from "react";

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

export default function DashboardPage() {
  const [hospitalId, setHospitalId] = useState<string>("hgvitoria");
  const [crm, setCrm] = useState<string>("");
  const [date, setDate] = useState<string>(todayISO());
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const hospitalLabel = useMemo(
    () => HOSPITAIS.find((h) => h.id === hospitalId)?.label ?? hospitalId,
    [hospitalId]
  );

  async function buscarFichas() {
    setLoading(true);
    setError("");

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
      const message = err instanceof Error ? err.message : "Erro inesperado.";
      setError(message);
      setFichas([]);
    } finally {
      setLoading(false);
    }
  }

  async function baixarFicha(ficha: Ficha) {
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
        throw new Error(json.error || "Erro ao gerar download.");
      }

      window.open(json.downloadUrl, "_blank");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao baixar.";
      alert(message);
    }
  }

  async function sair() {
    try {
      await fetch("/api/auth/dashboard-logout", {
        method: "POST",
      });
    } finally {
      window.location.href = "/login";
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Dashboard hospitalar
              </p>
              <h1 className="text-2xl font-semibold tracking-tight">
                Fichas enviadas
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Selecione o hospital, informe o CRM e visualize as fichas do dia.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
                <span className="font-medium text-slate-900">{hospitalLabel}</span>
                <span className="mx-2 text-slate-400">•</span>
                <span>{date}</span>
              </div>

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

        <div className="mb-8 grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">
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
                      "rounded-2xl border px-4 py-2 text-sm font-medium transition",
                      active
                        ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {hospital.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                CRM
              </label>
              <input
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900"
                value={crm}
                onChange={(e) => setCrm(e.target.value)}
                placeholder="Digite seu CRM"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Data
              </label>
              <input
                type="date"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-900"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <button
                className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={buscarFichas}
                disabled={loading || crm.trim().length === 0}
              >
                {loading ? "Buscando..." : "Buscar"}
              </button>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        ) : null}

        {!loading && !error && fichas.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
              📄
            </div>
            <h2 className="text-lg font-semibold">Nenhuma ficha encontrada</h2>
            <p className="mt-2 text-sm text-slate-600">
              Verifique o hospital, o CRM e a data selecionada.
            </p>
          </div>
        ) : null}

        {fichas.length > 0 ? (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-base font-semibold">
                {fichas.length} ficha{fichas.length === 1 ? "" : "s"} encontrada
                {fichas.length === 1 ? "" : "s"}
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-4">Paciente</th>
                    <th className="px-5 py-4">Prontuário</th>
                    <th className="px-5 py-4">Data da ficha</th>
                    <th className="px-5 py-4">Enviado em</th>
                    <th className="px-5 py-4">Ação</th>
                  </tr>
                </thead>

                <tbody>
                  {fichas.map((ficha, index) => (
                    <tr
                      key={ficha.id}
                      className={index !== fichas.length - 1 ? "border-b border-slate-100" : ""}
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900">
                          {ficha.patient_name}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {ficha.record_number}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        <span className="rounded-full bg-slate-100 px-3 py-1">
                          {new Date(ficha.procedure_date + "T00:00:00").toLocaleDateString("pt-BR")}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {new Date(ficha.uploaded_at).toLocaleString("pt-BR")}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                          onClick={() => baixarFicha(ficha)}
                        >
                          Baixar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
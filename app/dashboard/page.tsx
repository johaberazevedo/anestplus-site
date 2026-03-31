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

  return (
    <main className="min-h-screen bg-white px-6 py-8 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">Dashboard de fichas</h1>
          <p className="mt-2 text-sm text-slate-600">
            Selecione o hospital, informe o CRM e visualize as fichas do dia.
          </p>
        </div>

        <div className="mb-8 grid gap-4 rounded-2xl border border-slate-200 p-4 md:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Hospital</label>
            <select
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              value={hospitalId}
              onChange={(e) => setHospitalId(e.target.value)}
            >
              {HOSPITAIS.map((hospital) => (
                <option key={hospital.id} value={hospital.id}>
                  {hospital.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">CRM</label>
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              value={crm}
              onChange={(e) => setCrm(e.target.value)}
              placeholder="Digite seu CRM"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Data</label>
            <input
              type="date"
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <button
              className="w-full rounded-xl bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
              onClick={buscarFichas}
              disabled={loading || crm.trim().length === 0}
            >
              {loading ? "Buscando..." : "Entrar"}
            </button>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            {hospitalLabel} • {date}
          </h2>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {!loading && !error && fichas.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 p-6 text-sm text-slate-600">
            Nenhuma ficha encontrada.
          </div>
        ) : null}

        {fichas.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr className="text-left text-sm font-medium text-slate-600">
                  <th className="px-4 py-3">Paciente</th>
                  <th className="px-4 py-3">Prontuário</th>
                  <th className="px-4 py-3">Enviado em</th>
                  <th className="px-4 py-3">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {fichas.map((ficha) => (
                  <tr key={ficha.id}>
                    <td className="px-4 py-3 text-sm">{ficha.patient_name}</td>
                    <td className="px-4 py-3 text-sm">{ficha.record_number}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(ficha.uploaded_at).toLocaleString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-50"
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
        ) : null}
      </div>
    </main>
  );
}
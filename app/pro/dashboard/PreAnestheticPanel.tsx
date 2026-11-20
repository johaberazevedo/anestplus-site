"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type RecordPDF = {
  id: string;
  institutional?: boolean;
  hospital_code?: string;
  hospital?: { name: string } | null;
  patient_name: string;
  record_number: string | null;
  export_date: string;
  exported_at: string;
  expires_at: string;
};
const button = "rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50";
const input = "mt-2 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-[#b9963b]";
function today() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
function displayDate(date: string) {
  return date.split("-").reverse().join("/");
}
async function api(operation: string, signal: AbortSignal, payload?: object, params?: URLSearchParams, institutional = false) {
  const { data: { session } } = await supabase.auth.getSession();
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");
  if (!session?.access_token) throw new Error("Sua sessão expirou. Entre novamente na conta.");
  const response = await fetch(`${institutional ? "/api/pro/conta/pre-anestesicas" : "/api/pro/pre-anestesicas"}/${operation}${params ? `?${params}` : ""}`, {
    method: payload ? "POST" : "GET", signal, cache: "no-store",
    headers: { Authorization: `Bearer ${session.access_token}`, ...(payload ? { "Content-Type": "application/json" } : {}) },
    ...(payload ? { body: JSON.stringify(payload) } : {}),
  });
  if (response.status === 401) throw new Error("Sua sessão expirou. Entre novamente na conta.");
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || "Não foi possível concluir a operação.");
  return json;
}

export default function PreAnestheticPanel() {
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState<RecordPDF[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selected, setSelected] = useState<RecordPDF | null>(null);
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const request = useRef<AbortController | null>(null);
  const action = useRef<AbortController | null>(null);
  const dialog = useRef<HTMLDialogElement | null>(null);
  const deleteButton = useRef<HTMLButtonElement | null>(null);

  useEffect(() => () => { request.current?.abort(); action.current?.abort(); }, []);
  useEffect(() => {
    if (selected) dialog.current?.showModal();
    else dialog.current?.close();
  }, [selected]);
  useEffect(() => {
    if (!downloadLink) return;
    const timer = setTimeout(() => { setDownloadLink(null); setSuccess(""); }, 55_000);
    return () => clearTimeout(timer);
  }, [downloadLink]);

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return records.filter(row => row.patient_name.toLocaleLowerCase("pt-BR").includes(term) ||
      (row.record_number ?? "").toLocaleLowerCase("pt-BR").includes(term));
  }, [records, search]);

  async function load(event: FormEvent) {
    event.preventDefault();
    if (action.current) return;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true); setError(""); setSuccess(""); setRecords([]); setSearched(true); setDownloadLink(null);
    try {
      if (!from || !to || from > to) throw new Error("Informe um período válido para a exportação.");
      const fetchRecords = async (institutional: boolean) => {
        const params = new URLSearchParams({ date_from: from, date_to: to });
        const rows: RecordPDF[] = [];
        let offset = 0;
        do {
          params.set("offset", String(offset));
          const json = await api("listar", controller.signal, undefined, params, institutional);
          if (controller.signal.aborted) return [];
          if (!Array.isArray(json.fichas)) throw new Error("Resposta inválida ao buscar pré-anestésicas.");
          rows.push(...json.fichas.map((row: RecordPDF) => ({ ...row, institutional })));
          if (json.nextOffset === null) break;
          if (!Number.isSafeInteger(json.nextOffset) || json.nextOffset <= offset) {
            throw new Error("Não foi possível completar a busca. Tente novamente.");
          }
          offset = json.nextOffset;
        } while (true);
        return rows;
      };
      const results = await Promise.allSettled([fetchRecords(false), fetchRecords(true)]);
      if (controller.signal.aborted) return;
      const rows = results.flatMap(result => result.status === "fulfilled" ? result.value : []);
      if (results.some(result => result.status === "rejected")) {
        setError("Não foi possível carregar todas as pré-anestésicas. Tente buscar novamente.");
      }
      setRecords([...new Map(rows.map(row => [`${row.institutional}:${row.id}`, row])).values()]);
    } catch (err) {
      if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Falha na busca.");
    } finally {
      if (!controller.signal.aborted) { setLoading(false); request.current = null; }
    }
  }

  async function perform(operation: "download" | "excluir", row: RecordPDF) {
    if (action.current || loading) return;
    const controller = new AbortController();
    action.current = controller;
    setBusy(true); setError(""); setSuccess(""); setDownloadLink(null);
    try {
      const json = await api(operation, controller.signal, { fichaId: row.id }, undefined, row.institutional);
      if (controller.signal.aborted) return;
      if (operation === "download") {
        if (typeof json.downloadUrl !== "string" || !json.downloadUrl.startsWith("https://")) {
          throw new Error("Link de download inválido.");
        }
        // A real link avoids popup blockers after the asynchronous request.
        setDownloadLink(json.downloadUrl);
        setSuccess(`PDF de ${row.patient_name} pronto. Toque em “Abrir PDF”.`);
      } else {
        setRecords(previous => previous.filter(item => item.id !== row.id || item.institutional !== row.institutional));
        setSelected(null);
        setSuccess("Pré-anestésica removida da conta. A ficha no aplicativo foi preservada.");
      }
    } catch (err) {
      if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Não foi possível concluir a operação.");
    } finally {
      if (!controller.signal.aborted) { setBusy(false); action.current = null; }
    }
  }

  function closeDialog() {
    if (busy) return;
    setSelected(null);
    deleteButton.current?.focus();
  }

  return (
    <section aria-label="Pré-anestésicas">
      <p className="mb-5 text-sm leading-6 text-zinc-500">
        PDFs enviados pelo aplicativo. Busque pela data de exportação; os documentos ficam disponíveis por 30 dias após o envio.
      </p>
      <form onSubmit={load} className="mb-8 rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-wrap gap-2">
          {[1, 7, 30].map(days => <button key={days} type="button" className={button} disabled={loading || busy} onClick={() => {
            const end = today(); const start = new Date(`${end}T12:00:00`); start.setDate(start.getDate() - days + 1);
            setFrom(`${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`); setTo(end);
          }}>{days === 1 ? "Hoje" : `${days} dias`}</button>)}
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1.4fr_auto]">
          <label className="text-xs font-bold text-zinc-500">Exportação — de
            <input type="date" required value={from} onChange={e => setFrom(e.target.value)} disabled={loading || busy} className={input} />
          </label>
          <label className="text-xs font-bold text-zinc-500">Até
            <input type="date" required value={to} onChange={e => setTo(e.target.value)} disabled={loading || busy} className={input} />
          </label>
          <label className="text-xs font-bold text-zinc-500">Paciente ou prontuário
            <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Ex.: Maria ou 123456" className={input} />
          </label>
          <button disabled={loading || busy} className="self-end rounded-2xl bg-[#1a2718] px-6 py-3 text-sm font-bold text-white disabled:opacity-50">{loading ? "Buscando..." : "Buscar"}</button>
        </div>
      </form>
      {error && !selected ? <p role="alert" className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
      {success ? <p role="status" className="mb-5 rounded-2xl border border-[#b9963b]/30 bg-white p-4 text-sm text-[#506047]">{success}</p> : null}
      {downloadLink ? <a href={downloadLink} target="_blank" rel="noopener noreferrer" className={`${button} mb-5 inline-block`}>Abrir PDF</a> : null}
      {loading ? <p role="status" className="py-8 text-center text-sm text-zinc-500">Buscando pré-anestésicas...</p> : null}
      {!loading && !error && !filtered.length ? <div className="rounded-[28px] border border-zinc-200 bg-white px-6 py-14 text-center shadow-sm">
        <h2 className="text-lg font-bold">{searched ? "Nenhuma pré-anestésica encontrada" : "Busque suas pré-anestésicas"}</h2>
        <p className="mt-2 text-sm text-zinc-500">{searched ? "Confira o período da exportação e o termo da busca." : "Escolha a data ou o período em que os PDFs foram exportados no aplicativo."}</p>
      </div> : null}
      {!loading && filtered.length > 0 ? <div className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm">
        <h2 className="border-b border-zinc-200 px-6 py-5 font-bold">Pré-anestésicas · {filtered.length} documento(s)</h2>
        <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500"><tr>
            <th scope="col" className="px-6 py-4">Paciente</th><th scope="col" className="px-6 py-4">Exportação</th>
            <th scope="col" className="px-6 py-4">Disponível até</th><th scope="col" className="px-6 py-4 text-right">Ações</th>
          </tr></thead>
          <tbody>{filtered.map(row => <tr key={`${row.institutional}:${row.id}`} className="border-t border-zinc-100">
            <td className="px-6 py-5"><p className="font-bold">{row.patient_name}</p><p className="mt-1 text-zinc-500">Prontuário: {row.record_number || "Não informado"}</p>{row.institutional && <p className="mt-1 text-zinc-500">Institucional · {row.hospital?.name ?? row.hospital_code}</p>}</td>
            <td className="px-6 py-5">{displayDate(row.export_date)}</td>
            <td className="px-6 py-5">{new Date(row.expires_at).toLocaleString("pt-BR")}</td>
            <td className="px-6 py-5"><div className="flex justify-end gap-2">
              <button type="button" disabled={busy} className={button} onClick={() => perform("download", row)}>Baixar</button>
              <button type="button" disabled={busy} className="rounded-xl px-3 py-2 font-bold text-red-600 hover:bg-red-50 disabled:opacity-50" onClick={e => {
                deleteButton.current = e.currentTarget; setError(""); setSuccess(""); setSelected(row);
              }}>{row.institutional ? "Remover do meu painel" : "Excluir"}</button>
            </div></td>
          </tr>)}</tbody>
        </table></div>
      </div> : null}
      <dialog ref={dialog} aria-labelledby="pre-delete-title" onCancel={e => { e.preventDefault(); closeDialog(); }} className="fixed inset-0 m-auto w-[calc(100%_-_2rem)] max-w-md rounded-[28px] border border-zinc-200 bg-white p-6 text-zinc-950 shadow-2xl backdrop:bg-zinc-950/40">
        <h2 id="pre-delete-title" className="text-xl font-black">Remover pré-anestésica da conta?</h2>
        <p className="mt-3 text-sm leading-6 text-zinc-600">O PDF de <strong>{selected?.patient_name}</strong> deixará de aparecer na sua conta. Essa ação não pode ser desfeita.</p>
        <p className="mt-2 text-sm leading-6 text-zinc-500">A ficha e seu bloqueio no aplicativo serão preservados.{selected?.institutional && " O acesso do hospital ao PDF já compartilhado será mantido até o prazo de disponibilidade."}</p>
        {error ? <p role="alert" className="mt-3 text-sm text-red-700">{error}</p> : null}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" autoFocus disabled={busy} onClick={closeDialog} className={button}>Cancelar</button>
          <button type="button" disabled={busy} onClick={() => selected && perform("excluir", selected)} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{busy ? "Excluindo..." : "Confirmar exclusão"}</button>
        </div>
      </dialog>
    </section>
  );
}

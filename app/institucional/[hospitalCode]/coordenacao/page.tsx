"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { coordinationPath } from "@/lib/institutional-hospitals";
import { supabase } from "@/lib/supabaseClient";
import HospitalIdentity from "@/components/institutional/HospitalIdentity";

type Hospital = { code: string; name: string };
type Search = { date: string; field: "patient" | "record"; term: string; page: number };
type Ficha = {
  document_id: string; patient_name: string; record_number: string;
  procedure_date: string; anesthesiologist_name: string | null; crm: string;
};
type Listing = { fichas: Ficha[]; page: number; hasMore: boolean };

const endpoint = "/api/pro/institucional/coordenacao";
const panel = "rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-7";
const input = "mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-zinc-950 focus:border-[#7a865f]";
const button = "rounded-xl border border-zinc-200 px-3 py-2 text-sm font-bold text-zinc-800 hover:bg-zinc-50 disabled:opacity-40";

class RequestError extends Error {
  constructor(readonly status: number, message: string) { super(message); }
}

async function request<T>(path: string, token: string, signal: AbortSignal, body?: object): Promise<T> {
  const headers = { Authorization: `Bearer ${token}`, ...(body && { "Content-Type": "application/json" }) };
  const response = await fetch(`${endpoint}/${path}`, {
    method: body ? "POST" : "GET", headers, signal, cache: "no-store",
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) {
    throw new RequestError(response.status, data?.error ?? "Não foi possível concluir a solicitação.");
  }
  return data;
}

function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function CoordinationPage() {
  const { hospitalCode } = useParams<{ hospitalCode: string }>();
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <main className="min-h-screen bg-[#f6f6f2] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-5">
        {!coordinationPath(hospitalCode) ? <p className={panel}>Hospital inválido.</p>
          : session === undefined ? <p className={panel} role="status">Verificando sessão…</p>
          : session ? <CoordinationDashboard key={`${session.user.id}:${hospitalCode}`} hospitalCode={hospitalCode} token={session.access_token} />
          : <section className={panel}>
              <h1 className="text-2xl font-black">Coordenação hospitalar</h1>
              <Link href={`/pro/login?coordenacao=${hospitalCode}`} className="mt-4 inline-block rounded-xl bg-[#1a2718] px-4 py-2 text-sm font-bold text-white">
                Entrar com a Conta Anest+
              </Link>
            </section>}
      </div>
    </main>
  );
}

function CoordinationDashboard({ hospitalCode, token }: { hospitalCode: string; token: string }) {
  const router = useRouter();
  const [hospitals, setHospitals] = useState<Hospital[] | null>(null);
  const [accessError, setAccessError] = useState("");
  const [date, setDate] = useState(today);
  const [field, setField] = useState<Search["field"]>("patient");
  const [term, setTerm] = useState("");
  const [submitted, setSubmitted] = useState<Search | null>(null);
  const [list, setList] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const searchRequest = useRef<AbortController | null>(null);
  const downloadRequest = useRef<AbortController | null>(null);
  const accessRevision = useRef(0);
  const hospital = hospitals?.find(({ code }) => code === hospitalCode);

  useEffect(() => {
    const controller = new AbortController();
    const revision = accessRevision.current;
    void request<{ hospitals: Hospital[] }>("hospitais", token, controller.signal)
      .then(({ hospitals }) => {
        if (controller.signal.aborted || revision !== accessRevision.current) return;
        setHospitals(hospitals);
        setAccessError("");
      }).catch((error: unknown) => {
        if (controller.signal.aborted || revision !== accessRevision.current) return;
        setHospitals(null);
        setList(null);
        setAccessError(error instanceof Error ? error.message : "Hospitais indisponíveis.");
      });
    return () => controller.abort();
  }, [token]);

  useEffect(() => () => {
    searchRequest.current?.abort();
    downloadRequest.current?.abort();
  }, []);

  function reportFailure(error: unknown) {
    if (error instanceof RequestError && (error.status === 401 || error.status === 403)) {
      accessRevision.current++;
      searchRequest.current?.abort();
      downloadRequest.current?.abort();
      setList(null);
      setLoading(false);
      setDownloading(null);
      setHospitals((items) => error.status === 401 ? [] : items?.filter(({ code }) => code !== hospitalCode) ?? []);
      setAccessError(error.message);
      return;
    }
    setError(error instanceof Error ? error.message : "Não foi possível concluir a solicitação.");
  }

  async function search(filters: Search) {
    searchRequest.current?.abort();
    const controller = new AbortController();
    searchRequest.current = controller;
    setSubmitted(filters);
    setLoading(true);
    setError("");
    setList(null);
    try {
      const result = await request<Listing>(`${hospitalCode}/fichas`, token, controller.signal, { action: "search", ...filters });
      if (!controller.signal.aborted) setList(result);
    } catch (error) {
      if (!controller.signal.aborted) reportFailure(error);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  async function download(ficha: Ficha) {
    downloadRequest.current?.abort();
    const controller = new AbortController();
    downloadRequest.current = controller;
    setDownloading(ficha.document_id);
    setError("");
    try {
      const { downloadUrl } = await request<{ downloadUrl: string }>(`${hospitalCode}/fichas`, token, controller.signal,
        { action: "download", documentId: ficha.document_id });
      if (!controller.signal.aborted) window.location.assign(downloadUrl);
    } catch (error) {
      if (!controller.signal.aborted) reportFailure(error);
    } finally {
      if (!controller.signal.aborted) setDownloading(null);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void search({ date, field, term: term.trim(), page: 1 });
  }

  return (
    <>
      <header className={`${panel} flex flex-wrap items-start justify-between gap-4`}>
        <div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Coordenação hospitalar</h1>
          {!accessError && <div className={hospital ? "mt-4" : undefined}><HospitalIdentity
            hospitalCode={hospitalCode} hospital={hospital} /></div>}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link className={button} href="/pro/dashboard">Minha Conta Anest+</Link>
          <button className={button} type="button" onClick={async () => {
            const { error } = await supabase.auth.signOut({ scope: "local" });
            if (error) setError("Não foi possível sair. Tente novamente.");
          }}>Sair</button>
        </div>
      </header>

      {!!hospitals?.length && (
        <section className={panel}>
          <label className="block max-w-sm text-sm font-semibold">Hospital
            <select className={input} value={hospital ? hospitalCode : ""} onChange={(event) => {
              const path = coordinationPath(event.target.value);
              if (path) router.push(path);
            }}>
              {!hospital && <option value="" disabled>Selecione um hospital</option>}
              {hospitals.map(({ code, name }) => <option key={code} value={code}>{name}</option>)}
            </select>
          </label>
        </section>
      )}

      {accessError ? <p className={panel} role="alert">{accessError}</p>
        : hospitals === null ? <p className={panel} role="status">Carregando hospitais…</p>
        : !hospital && <p className={panel} role="status">Você não tem acesso à coordenação deste hospital.</p>}
      {error && <p className={`${panel} text-red-700`} role="alert">{error}</p>}

      {hospital && <>
        <form className={`${panel} grid items-end gap-4 sm:grid-cols-[1fr_1fr_2fr_auto]`} onSubmit={submit}>
          <label className="text-sm font-semibold">Data do procedimento
            <input type="date" required value={date} onChange={({ target }) => setDate(target.value)} className={input} />
          </label>
          <label className="text-sm font-semibold">Buscar por
            <select className={input} value={field} onChange={({ target }) => setField(target.value === "record" ? "record" : "patient")}>
              <option value="patient">Paciente</option><option value="record">Prontuário</option>
            </select>
          </label>
          <label className="text-sm font-semibold">{field === "record" ? "Número do prontuário" : "Nome do paciente"}
            <input className={input} value={term} onChange={({ target }) => setTerm(target.value)} maxLength={120} />
          </label>
          <button type="submit" className="rounded-xl bg-[#1a2718] px-5 py-2 text-sm font-bold text-white disabled:opacity-40" disabled={loading}>Buscar</button>
        </form>

        {loading && <p className={panel} role="status">Buscando fichas…</p>}
        {list && <section className={panel}>
          <h2 className="text-xl font-bold">Fichas anestésicas</h2>
          {list.fichas.length === 0 ? <p className="mt-3 text-zinc-600">Nenhuma ficha encontrada.</p> : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-zinc-700">
                  <tr>
                    <th scope="col" className="p-3">Paciente</th>
                    <th scope="col" className="p-3">Prontuário</th>
                    <th scope="col" className="p-3">Data</th>
                    <th scope="col" className="p-3">Anestesiologista</th>
                    <th scope="col" className="p-3">PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {list.fichas.map((ficha) => <tr key={ficha.document_id} className="border-b border-zinc-100">
                    <td className="p-3 font-semibold">{ficha.patient_name}</td>
                    <td className="p-3">{ficha.record_number}</td>
                    <td className="p-3"><time dateTime={ficha.procedure_date}>{ficha.procedure_date.split("-").reverse().join("/")}</time></td>
                    <td className="p-3">{ficha.anesthesiologist_name ?? "—"}{ficha.crm && <span className="block text-zinc-500">CRM {ficha.crm}</span>}</td>
                    <td className="p-3"><button type="button" className={button} disabled={downloading !== null}
                      onClick={() => void download(ficha)}>{downloading === ficha.document_id ? "Preparando…" : "Baixar"}</button></td>
                  </tr>)}
                </tbody>
              </table>
            </div>
          )}
          {submitted && (list.page > 1 || list.hasMore) && <div className="mt-4 flex items-center gap-3 text-sm">
            <button type="button" className={button} disabled={list.page < 2} onClick={() => void search({ ...submitted, page: list.page - 1 })}>Anterior</button>
            <span>Página {list.page}</span>
            <button type="button" className={button} disabled={!list.hasMore} onClick={() => void search({ ...submitted, page: list.page + 1 })}>Próxima</button>
          </div>}
        </section>}
      </>}
    </>
  );
}

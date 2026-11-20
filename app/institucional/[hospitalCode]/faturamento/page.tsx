"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { billingPath, isHospitalCode } from "@/lib/institutional-hospitals";
import { supabase } from "@/lib/supabaseClient";
import HospitalIdentity from "@/components/institutional/HospitalIdentity";
import BillingClient from "./BillingClient";
import ProductionClient from "./ProductionClient";
import { billingRequest, RequestError } from "./billing-request";

const panel = "rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-7";
type Hospital = { code: string; name: string };

export default function HospitalBillingPage() {
  const { hospitalCode } = useParams<{ hospitalCode: string }>();
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [error, setError] = useState("");
  const validHospital = isHospitalCode(hospitalCode);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    setError("");
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) setError("Não foi possível sair. Tente novamente.");
  }

  return (
    <main className="min-h-screen bg-[#fafaf7] px-4 pb-16 pt-8 font-sans text-zinc-950 selection:bg-[#22331d] selection:text-white sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex min-w-0 items-center gap-3">
              <Image src="/brand/anest-symbol.png" alt="Anest+" width={56} height={56} priority className="h-14 w-14 shrink-0 rounded-2xl object-contain" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#7a865f]">Painel hospitalar</p>
                <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-[2.1rem]">Faturamento hospitalar</h1>
              </div>
            </div>
            {session && <button type="button" onClick={() => void signOut()}
              className="min-h-11 rounded-full border border-zinc-300 bg-white px-5 py-2 text-sm font-bold text-zinc-700 transition hover:border-[#b9963b]/50 hover:bg-[#f6f7f1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b9963b]">Sair</button>}
          </div>
          {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
        </header>
        {!validHospital ? <p className={panel} role="alert">Hospital inválido.</p>
          : session === undefined ? <p className={panel} role="status">Verificando sessão…</p>
          : session ? <BillingPanel key={`${session.user.id}:${hospitalCode}`} hospitalCode={hospitalCode} token={session.access_token} />
          : <section className={panel}>
              <Link href={`/pro/login?faturamento=${hospitalCode}`}
                className="inline-flex min-h-11 items-center rounded-2xl bg-[#1a2718] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[#1a2718]/15 transition hover:bg-[#22331d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b9963b]">
                Entrar com a Conta Anest+
              </Link>
            </section>}
      </div>
    </main>
  );
}

function BillingPanel({ hospitalCode, token }: { hospitalCode: string; token: string }) {
  const router = useRouter();
  const [section, setSection] = useState<"production" | "settings">("production");
  const [settingsOpened, setSettingsOpened] = useState(false);
  const [configurationVersion, setConfigurationVersion] = useState(0);
  const [accessError, setAccessError] = useState("");
  const [hospitals, setHospitals] = useState<Hospital[] | null>(null);
  const [hospitalError, setHospitalError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const listRequest = useRef<AbortController | null>(null);
  const hospital = hospitals?.find(({ code }) => code === hospitalCode);
  const configurationSaved = useCallback(() => setConfigurationVersion((version) => version + 1), []);
  const accessDenied = useCallback((message: string) => setAccessError(message), []);

  useEffect(() => {
    let disposed = false;
    let pending = false;
    let lastStarted = 0;
    async function load() {
      if (disposed || pending || document.visibilityState === "hidden" || Date.now() - lastStarted < 1000) return;
      pending = true;
      lastStarted = Date.now();
      const controller = new AbortController();
      listRequest.current = controller;
      try {
        const result = await billingRequest<{ hospitals: Hospital[] }>(
          "/api/pro/institucional/faturamento/hospitais", token, { signal: controller.signal },
        );
        if (disposed || controller.signal.aborted) return;
        setHospitals(result.hospitals);
        setHospitalError("");
        if (!result.hospitals.some(({ code }) => code === hospitalCode)) {
          accessDenied("Acesso ao faturamento deste hospital não autorizado.");
        }
      } catch (error) {
        if (disposed || controller.signal.aborted) return;
        if (error instanceof RequestError && (error.status === 401 || error.status === 403)) accessDenied(error.message);
        else setHospitalError(error instanceof Error ? error.message : "Hospitais indisponíveis.");
      } finally {
        pending = false;
      }
    }
    void load();
    const revalidate = () => { void load(); };
    window.addEventListener("focus", revalidate);
    document.addEventListener("visibilitychange", revalidate);
    return () => {
      disposed = true;
      listRequest.current?.abort();
      window.removeEventListener("focus", revalidate);
      document.removeEventListener("visibilitychange", revalidate);
    };
  }, [hospitalCode, token, attempt, accessDenied]);

  const button = "min-h-11 rounded-full border border-transparent px-5 py-2 text-sm font-bold text-zinc-600 transition hover:bg-[#f6f7f1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b9963b] aria-pressed:border-[#1a2718] aria-pressed:bg-[#1a2718] aria-pressed:text-white aria-pressed:shadow-sm";
  if (accessError) return <section className={panel}>
    <p role="alert" className="text-sm text-red-700">{accessError}</p>
    <button type="button" className={`${button} mt-4 border-zinc-300`} onClick={() => {
      setSettingsOpened(false);
      setSection("production");
      setAccessError("");
      setHospitals(null);
      setAttempt((value) => value + 1);
    }}>Tentar novamente</button>
  </section>;
  return (
    <>
      <section className={panel}>
        <HospitalIdentity hospitalCode={hospitalCode} hospital={hospital} />
        {hospitals && hospitals.length > 0 && <label className="mt-4 block max-w-md text-sm font-bold text-zinc-700">Hospital
          <select className="mt-2 min-h-11 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-[#b9963b] focus:ring-2 focus:ring-[#b9963b]/15"
            value={hospital ? hospitalCode : ""} onChange={(event) => {
              const path = billingPath(event.target.value);
              if (path && event.target.value !== hospitalCode) router.push(path);
            }}>
            {!hospital && <option value="" disabled>Selecione um hospital</option>}
            {hospitals.map(({ code, name }) => <option key={code} value={code}>{name}</option>)}
          </select>
        </label>}
        {!hospitals && !hospitalError && <p role="status" className="text-sm text-[#506047]">Carregando hospitais…</p>}
        {hospitalError && <div className="mt-3 text-sm">
          <p role="status" className="text-zinc-600">{hospitalError}</p>
          <button type="button" className="mt-2 font-bold text-[#506047] underline" onClick={() => setAttempt((value) => value + 1)}>Atualizar hospitais</button>
        </div>}
      </section>
      <nav aria-label="Faturamento" className="inline-flex max-w-full flex-wrap gap-1 rounded-[28px] border border-zinc-200 bg-white p-1.5 shadow-sm">
        <button type="button" className={button} aria-pressed={section === "production"} onClick={() => setSection("production")}>Produção</button>
        <button type="button" className={button} aria-pressed={section === "settings"} onClick={() => {
          setSettingsOpened(true);
          setSection("settings");
        }}>Configurações</button>
      </nav>
      <div hidden={section !== "production"} className="space-y-6">
        <ProductionClient hospitalCode={hospitalCode} token={token} active={section === "production"}
          configurationVersion={configurationVersion} onAccessDenied={accessDenied} />
      </div>
      {settingsOpened && <div hidden={section !== "settings"} className="space-y-6">
        <BillingClient hospitalCode={hospitalCode} token={token}
          onConfigurationSaved={configurationSaved} onAccessDenied={accessDenied} />
      </div>}
    </>
  );
}

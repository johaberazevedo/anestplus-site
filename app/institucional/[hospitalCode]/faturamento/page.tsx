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
import ClosingClient, { type ClosingNavigation } from "./ClosingClient";
import RetentionNotices from "./RetentionNotices";
import type { BillingRetentionNotice } from "@/app/api/pro/institucional/faturamento/[hospitalCode]/avisos-retencao/route";
import type { BillingVersionSelection } from "@/lib/institutional-billing-reading";
import { billingRequest, RequestError } from "./billing-request";

const panel = "rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-7";
const hospitalListFreshnessMs = 15_000;
type Hospital = { code: string; name: string };

function sessionId(token: string) {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const { session_id } = JSON.parse(atob(payload));
    return typeof session_id === "string" ? session_id : null;
  } catch {
    return null;
  }
}

export default function HospitalBillingPage() {
  const { hospitalCode } = useParams<{ hospitalCode: string }>();
  const [{ session, epoch }, setAuthContext] = useState<{ session: Session | null | undefined; epoch: number }>({ session: undefined, epoch: 0 });
  const [error, setError] = useState("");
  const validHospital = isHospitalCode(hospitalCode);
  const activeSessionId = session ? sessionId(session.access_token) : null;

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, next) => setAuthContext((current) => {
      const previous = current.session;
      if (!previous || !next || previous.access_token === next.access_token) return { ...current, session: next };
      // O claim identifica a instância da sessão no React. A autorização é feita pelo servidor.
      const oldId = sessionId(previous.access_token);
      const newId = sessionId(next.access_token);
      const changed = oldId && newId ? oldId !== newId : event !== "TOKEN_REFRESHED";
      return { session: next, epoch: current.epoch + Number(changed) };
    }));
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
          : session ? <BillingPanel key={`${session.user.id}:${hospitalCode}:${activeSessionId ?? epoch}`} hospitalCode={hospitalCode}
              token={session.access_token} userId={session.user.id} activeSessionId={activeSessionId} />
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

function BillingPanel({ hospitalCode, token, userId, activeSessionId }: {
  hospitalCode: string; token: string; userId: string; activeSessionId: string | null;
}) {
  const router = useRouter();
  const [section, setSection] = useState<"production" | "closing" | "settings">("production");
  const [viewedClosure, setViewedClosure] = useState<(BillingVersionSelection & { visit: number }) | null>(null);
  const [closingSelection, setClosingSelection] = useState<{ month: string; visit: number } | null>(null);
  const [retentionRevision, setRetentionRevision] = useState(0);
  const closingNavigation = useRef<ClosingNavigation | null>(null);
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
  const viewClosedVersion = useCallback((month: string, version: number) => {
    setViewedClosure((current) => ({ month, version, visit: (current?.visit ?? 0) + 1 }));
    setSection("production");
  }, []);

  function openRetentionNotice(notice: BillingRetentionNotice) {
    if (section === "closing" && closingNavigation.current && !closingNavigation.current.canLeave()) return;
    if (notice.state === "closed") {
      viewClosedVersion(notice.month, notice.version);
      return;
    }
    setClosingSelection((current) => ({ month: notice.month, visit: (current?.visit ?? 0) + 1 }));
    setSection("closing");
  }

  useEffect(() => {
    let disposed = false;
    let pending = false;
    let lastStarted = 0;
    let lastLoaded = 0;
    async function load(trigger: "inicio" | "foco" | "visibilidade") {
      const now = Date.now();
      if (disposed || pending || document.visibilityState === "hidden" || now - lastStarted < 1000
          || now - lastLoaded < hospitalListFreshnessMs) return;
      pending = true;
      lastStarted = now;
      const controller = new AbortController();
      listRequest.current = controller;
      if (process.env.NODE_ENV === "development") console.info("[faturamento.hospitais]", { gatilho: trigger });
      try {
        const result = await billingRequest<{ hospitals: Hospital[] }>(
          "/api/pro/institucional/faturamento/hospitais", token, { signal: controller.signal },
        );
        if (disposed || controller.signal.aborted) return;
        lastLoaded = Date.now();
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
    void load("inicio");
    const onFocus = () => { void load("foco"); };
    const onVisibility = () => { void load("visibilidade"); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      disposed = true;
      listRequest.current?.abort();
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
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
      <RetentionNotices hospitalCode={hospitalCode} token={token} userId={userId} activeSessionId={activeSessionId} revision={retentionRevision}
        onOpen={openRetentionNotice} onAccessDenied={accessDenied} />
      <nav aria-label="Faturamento" className="inline-flex max-w-full flex-wrap gap-1 rounded-[28px] border border-zinc-200 bg-white p-1.5 shadow-sm">
        <button type="button" className={button} aria-pressed={section === "production"} onClick={() => setSection("production")}>Produção</button>
        <button type="button" className={button} aria-pressed={section === "closing"} onClick={() => {
          if (section !== "closing") setClosingSelection(null);
          setSection("closing");
        }}>Fechamento</button>
        <button type="button" className={button} aria-pressed={section === "settings"} onClick={() => {
          setSettingsOpened(true);
          setSection("settings");
        }}>Configurações</button>
      </nav>
      <div hidden={section !== "production"} className="space-y-6">
        <ProductionClient key={viewedClosure?.visit ?? 0} hospitalCode={hospitalCode} token={token} active={section === "production"}
          initialVersion={viewedClosure ?? undefined}
          configurationVersion={configurationVersion} onAccessDenied={accessDenied} />
      </div>
      {section === "closing" && <ClosingClient key={closingSelection?.visit ?? 0} ref={closingNavigation}
        hospitalCode={hospitalCode} token={token} initialMonth={closingSelection?.month}
        onAccessDenied={accessDenied} onViewVersion={viewClosedVersion}
        onConfirmed={() => setRetentionRevision((value) => value + 1)} />}
      {settingsOpened && <div hidden={section !== "settings"} className="space-y-6">
        <BillingClient hospitalCode={hospitalCode} token={token}
          onConfigurationSaved={configurationSaved} onAccessDenied={accessDenied} />
      </div>}
    </>
  );
}

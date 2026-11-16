"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import Link from "next/link";
import { useParams } from "next/navigation";
import { isHospitalCode } from "@/lib/institutional-hospitals";
import { supabase } from "@/lib/supabaseClient";
import BillingClient from "./BillingClient";
import ProductionClient from "./ProductionClient";

const panel = "rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm";

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
    <main className="min-h-screen bg-[#f7f8f4] px-4 py-6 text-zinc-950 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <header className={panel}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-black">Faturamento hospitalar</h1>
            {session && <button type="button" onClick={() => void signOut()}
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm font-bold hover:bg-zinc-50">Sair</button>}
          </div>
          {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
        </header>
        {!validHospital ? <p className={panel} role="alert">Hospital inválido.</p>
          : session === undefined ? <p className={panel} role="status">Verificando sessão…</p>
          : session ? <BillingPanel key={`${session.user.id}:${hospitalCode}`} hospitalCode={hospitalCode} token={session.access_token} />
          : <section className={panel}>
              <Link href={`/pro/login?faturamento=${hospitalCode}`}
                className="inline-block rounded-xl bg-[#1a2718] px-4 py-2 text-sm font-bold text-white">
                Entrar com a Conta Anest+
              </Link>
            </section>}
      </div>
    </main>
  );
}

function BillingPanel({ hospitalCode, token }: { hospitalCode: string; token: string }) {
  const [section, setSection] = useState<"production" | "settings">("production");
  const button = "rounded-xl border border-zinc-200 px-3 py-2 text-sm font-bold aria-pressed:border-[#1a2718] aria-pressed:bg-[#1a2718] aria-pressed:text-white";
  return (
    <>
      <nav aria-label="Faturamento" className={`${panel} flex flex-wrap gap-2`}>
        <button type="button" className={button} aria-pressed={section === "production"} onClick={() => setSection("production")}>Produção</button>
        <button type="button" className={button} aria-pressed={section === "settings"} onClick={() => setSection("settings")}>Configurações</button>
      </nav>
      {section === "production"
        ? <ProductionClient hospitalCode={hospitalCode} token={token} />
        : <BillingClient hospitalCode={hospitalCode} token={token} />}
    </>
  );
}

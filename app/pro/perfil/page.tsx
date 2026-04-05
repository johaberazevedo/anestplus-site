"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

export default function ProPerfilPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [crm, setCrm] = useState("");
  const [rqe, setRqe] = useState("");

  const [checkingSession, setCheckingSession] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session) {
        router.replace("/pro/login");
        return;
      }

      setEmail(session.user.email ?? "");
      setFullName(String(session.user.user_metadata?.full_name ?? ""));
      setCrm(String(session.user.user_metadata?.crm ?? ""));
      setRqe(String(session.user.user_metadata?.rqe ?? ""));
      setCheckingSession(false);
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          crm: crm.trim(),
          rqe: rqe.trim(),
        },
      });

      if (error) {
        throw new Error(error.message || "Não foi possível salvar o perfil.");
      }

      setSuccessMsg("Perfil atualizado com sucesso.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Não foi possível salvar o perfil.";
      setErrorMsg(message);
    } finally {
      setSaving(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="min-h-screen bg-[#fafaf7] text-zinc-950 font-sans">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-8 sm:px-6">
          <div className="rounded-[28px] border border-zinc-200 bg-white px-8 py-7 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#b9963b]/10">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#b9963b]/30 border-t-[#b9963b]" />
            </div>
            <p className="text-sm font-bold text-zinc-950">Carregando perfil</p>
            <p className="mt-1 text-sm text-zinc-500">
              Buscando suas informações de conta.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafaf7] pb-16 text-zinc-950 font-sans selection:bg-[#22331d] selection:text-white">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl">
                <Image
                  src="/brand/anest-symbol.png"
                  alt="Anest+"
                  width={56}
                  height={56}
                  priority
                  className="h-14 w-14 rounded-2xl object-contain"
                />
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#7a865f]">
                  Conta Anest+
                </p>
                <h1 className="mt-1 text-3xl font-black tracking-tight text-zinc-950">
                  Minha conta
                </h1>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-zinc-500">
              Atualize seus dados de acesso e identificação profissional.
            </p>
          </div>

          <Link
            href="/pro/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-bold text-zinc-700 transition hover:border-[#b9963b]/50 hover:bg-[#fafaf7]"
          >
            Voltar para fichas
          </Link>
        </div>

        <div className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          {errorMsg && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-sm">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-5 rounded-2xl border border-[#b9963b]/30 bg-[#b9963b]/5 px-4 py-3 text-sm font-medium text-[#7a865f] shadow-sm">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            <div className="relative group">
              <label
                htmlFor="email"
                className="absolute -top-2.5 left-3 bg-white px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                disabled
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-500 outline-none"
              />
            </div>

            <div className="relative group">
              <label
                htmlFor="full-name"
                className="absolute -top-2.5 left-3 bg-white px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500 transition-colors group-focus-within:text-[#b9963b]"
              >
                Nome completo
              </label>
              <input
                id="full-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-900 outline-none transition hover:border-zinc-400 focus:border-[#b9963b] focus:ring-2 focus:ring-[#b9963b]/10"
                placeholder="Seu nome"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="relative group">
                <label
                  htmlFor="crm"
                  className="absolute -top-2.5 left-3 bg-white px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500 transition-colors group-focus-within:text-[#b9963b]"
                >
                  CRM
                </label>
                <input
                  id="crm"
                  type="text"
                  value={crm}
                  onChange={(e) => setCrm(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-900 outline-none transition hover:border-zinc-400 focus:border-[#b9963b] focus:ring-2 focus:ring-[#b9963b]/10"
                  placeholder="Seu CRM"
                />
              </div>

              <div className="relative group">
                <label
                  htmlFor="rqe"
                  className="absolute -top-2.5 left-3 bg-white px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500 transition-colors group-focus-within:text-[#b9963b]"
                >
                  RQE
                </label>
                <input
                  id="rqe"
                  type="text"
                  value={rqe}
                  onChange={(e) => setRqe(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-900 outline-none transition hover:border-zinc-400 focus:border-[#b9963b] focus:ring-2 focus:ring-[#b9963b]/10"
                  placeholder="Seu RQE"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-2xl bg-[#1a2718] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[#1a2718]/20 transition hover:bg-[#22331d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-8 sm:px-6">
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-600 shadow-sm">
            Carregando…
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
  Conta Anest+
</p>
<h1 className="text-2xl font-semibold tracking-tight">
  Minha conta
</h1>
<p className="mt-2 text-sm text-slate-600">
  Atualize seus dados de acesso e identificação profissional.
</p>
            </div>

            <Link
  href="/pro/dashboard"
  className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 text-center"
>
  Voltar para fichas
</Link>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {errorMsg && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Nome completo
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                CRM
              </label>
              <input
                type="text"
                value={crm}
                onChange={(e) => setCrm(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                placeholder="Seu CRM"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                RQE
              </label>
              <input
                type="text"
                value={rqe}
                onChange={(e) => setRqe(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                placeholder="Seu RQE"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function ProCadastroPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [crm, setCrm] = useState("");
  const [rqe, setRqe] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (mounted && session) {
        router.replace("/pro/dashboard");
        router.refresh();
      }
    }

    checkSession();

    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleSignUp(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
const { error } = await supabase.auth.signUp({
  email: email.trim(),
  password,
  options: {
    emailRedirectTo: "https://anestplus.com/pro/confirmado",
    data: {
      full_name: fullName.trim(),
      crm: crm.trim(),
      rqe: rqe.trim(),
    },
  },
});

      if (error) {
        throw new Error(error.message || "Não foi possível criar a conta.");
      }

      setSuccessMsg("Conta criada com sucesso. Você receberá um e-mail para confirmar seu cadastro antes de acessar o Anest+ Pro.");
      setTimeout(() => {
        router.replace("/pro/login");
      }, 1200);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Não foi possível criar a conta.";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="max-w-sm w-full bg-white border rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="flex flex-col items-center gap-3 mb-1">
            <Image
              src="/brand/anest-symbol.png"
              alt="Anest+ Pro"
              width={72}
              height={72}
              priority
              className="rounded-xl shadow-sm"
            />
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Criar conta
            </h1>
            <p className="text-sm text-slate-500">
              Configure seu acesso ao Anest+ Pro
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 bg-green-50 text-green-700 text-xs p-3 rounded-lg border border-green-100">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Nome completo
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500 focus:outline-none"
              placeholder="Seu nome"
              autoComplete="name"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              CRM
            </label>
            <input
              type="text"
              required
              value={crm}
              onChange={(e) => setCrm(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500 focus:outline-none"
              placeholder="12345"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              RQE
            </label>
            <input
              type="text"
              value={rqe}
              onChange={(e) => setRqe(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500 focus:outline-none"
              placeholder="Opcional"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500 focus:outline-none"
              placeholder="voce@email.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Senha
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500 focus:outline-none"
              placeholder="Mínimo de 6 caracteres"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 disabled:opacity-70 transition-colors"
          >
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-slate-600">
          Já tem conta?{" "}
          <Link
            href="/pro/login"
            className="font-semibold text-slate-900 hover:underline"
          >
            Entrar
          </Link>
        </div>
      </div>
    </div>
  );
}
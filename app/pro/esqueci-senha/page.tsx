"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

export default function ProEsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handleReset(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: "https://anestplus.com/pro/redefinir-senha",
      });

      if (error) {
        throw new Error(error.message || "Não foi possível enviar o e-mail de recuperação.");
      }

      setSuccessMsg("Enviamos um e-mail com o link para redefinir sua senha.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Não foi possível enviar o e-mail de recuperação.";
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
              Recuperar senha
            </h1>
            <p className="text-sm text-slate-500">
              Informe seu e-mail para receber o link de redefinição
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

        <form onSubmit={handleReset} className="space-y-4">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 disabled:opacity-70 transition-colors"
          >
            {loading ? "Enviando..." : "Enviar link de recuperação"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-slate-600">
          <Link
            href="/pro/login"
            className="font-semibold text-slate-900 hover:underline"
          >
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}
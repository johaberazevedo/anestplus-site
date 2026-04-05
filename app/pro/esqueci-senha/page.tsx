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
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf7] px-4 font-sans selection:bg-[#22331d] selection:text-white">
      <div className="w-full max-w-sm rounded-[28px] border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mb-1 flex flex-col items-center gap-3">
            <Image
              src="/brand/anest-symbol.png"
              alt="Anest+ Pro"
              width={72}
              height={72}
              priority
              className="h-[72px] w-[72px] rounded-2xl object-contain"
            />
            <h1 className="text-2xl font-black tracking-tight text-zinc-950">
              Recuperar senha
            </h1>
            <p className="text-sm text-zinc-500">
              Informe seu e-mail para receber o link de redefinição
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-sm">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 rounded-2xl border border-[#b9963b]/30 bg-[#b9963b]/5 px-4 py-3 text-sm font-medium text-[#7a865f] shadow-sm">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-5">
          <div className="relative group">
            <label
              htmlFor="email"
              className="absolute -top-2.5 left-3 bg-white px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500 transition-colors group-focus-within:text-[#b9963b]"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-900 outline-none transition hover:border-zinc-400 focus:border-[#b9963b] focus:ring-2 focus:ring-[#b9963b]/10 placeholder:text-zinc-400"
              placeholder="voce@email.com"
              autoComplete="email"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#1a2718] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[#1a2718]/20 transition hover:bg-[#22331d] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Enviando..." : "Enviar link de recuperação"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-zinc-500">
          <Link
            href="/pro/login"
            className="font-bold text-zinc-900 transition hover:text-[#7a865f] hover:underline"
          >
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}
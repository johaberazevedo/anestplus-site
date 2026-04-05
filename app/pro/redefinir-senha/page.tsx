"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

export default function ProRedefinirSenhaPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkRecoverySession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session) {
        setErrorMsg("O link de recuperação é inválido ou expirou. Solicite um novo link para continuar.");
      }

      setCheckingSession(false);
    }

    checkRecoverySession();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleUpdatePassword(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (password.length < 6) {
      setErrorMsg("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw new Error(error.message || "Não foi possível redefinir a senha.");
      }

      setSuccessMsg("Sua senha foi atualizada com sucesso.");
      setTimeout(() => {
        router.replace("/pro/login");
      }, 1200);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Não foi possível redefinir a senha.";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafaf7] px-4 font-sans selection:bg-[#22331d] selection:text-white">
        <div className="w-full max-w-sm rounded-[28px] border border-zinc-200 bg-white p-8 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#b9963b]/10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#b9963b]/30 border-t-[#b9963b]" />
          </div>
          <p className="text-sm font-bold text-zinc-950">Carregando…</p>
        </div>
      </div>
    );
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
              Conta Anest+
            </h1>
            <p className="text-sm text-zinc-500">
              Defina uma nova senha para acessar sua conta
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

        <form onSubmit={handleUpdatePassword} className="space-y-5">
          <div className="relative group">
            <label
              htmlFor="password"
              className="absolute -top-2.5 left-3 bg-white px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500 transition-colors group-focus-within:text-[#b9963b]"
            >
              Nova senha
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-900 outline-none transition hover:border-zinc-400 focus:border-[#b9963b] focus:ring-2 focus:ring-[#b9963b]/10 placeholder:text-zinc-400"
              placeholder="Mínimo de 6 caracteres"
              autoComplete="new-password"
            />
          </div>

          <div className="relative group">
            <label
              htmlFor="confirmPassword"
              className="absolute -top-2.5 left-3 bg-white px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500 transition-colors group-focus-within:text-[#b9963b]"
            >
              Confirmar nova senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-900 outline-none transition hover:border-zinc-400 focus:border-[#b9963b] focus:ring-2 focus:ring-[#b9963b]/10 placeholder:text-zinc-400"
              placeholder="Repita a nova senha"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#1a2718] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[#1a2718]/20 transition hover:bg-[#22331d] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Salvando..." : "Salvar nova senha"}
          </button>
        </form>
      </div>
    </div>
  );
}
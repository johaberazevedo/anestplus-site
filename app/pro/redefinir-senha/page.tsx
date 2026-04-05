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
      <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
        <div className="max-w-sm w-full bg-white border rounded-2xl p-8 shadow-sm text-center text-sm text-slate-600">
          Carregando…
        </div>
      </div>
    );
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
  Conta Anest+
</h1>
<p className="text-sm text-slate-500">
  Defina uma nova senha para acessar sua conta
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

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Nova senha
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

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Confirmar nova senha
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500 focus:outline-none"
              placeholder="Repita a nova senha"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 disabled:opacity-70 transition-colors"
          >
            {loading ? "Salvando..." : "Salvar nova senha"}
          </button>
        </form>
      </div>
    </div>
  );
}
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function ProLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw new Error(error.message || "Não foi possível entrar.");
      }

      router.replace("/pro/dashboard");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Não foi possível entrar.";
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
              Anest+ Pro
            </h1>
            <p className="text-sm text-slate-500">
              Dashboard pessoal de fichas
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500 focus:outline-none"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 disabled:opacity-70 transition-colors"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

                <div className="mt-5 space-y-2 text-center text-sm text-slate-600">
          <div>
            <Link
              href="/pro/esqueci-senha"
              className="font-medium text-slate-700 hover:underline"
            >
              Esqueci minha senha
            </Link>
          </div>

          <div>
            Ainda não tem conta?{" "}
            <Link
              href="/pro/cadastro"
              className="font-semibold text-slate-900 hover:underline"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

function getFriendlyLoginError(message: string) {
  const normalized = message.toLowerCase().trim();

  if (
    normalized.includes("invalid login credentials") ||
    normalized.includes("invalid_credentials")
  ) {
    return "E-mail ou senha incorretos.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.";
  }

  if (
    normalized.includes("too many requests") ||
    normalized.includes("over_email_send_rate_limit")
  ) {
    return "Muitas tentativas em pouco tempo. Aguarde um pouco e tente novamente.";
  }

  if (normalized.includes("network") || normalized.includes("fetch")) {
    return "Não foi possível conectar. Verifique sua internet e tente novamente.";
  }

  return "Não foi possível entrar. Confira seus dados e tente novamente.";
}

function ProLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null);

useEffect(() => {
  const reason = searchParams.get("reason");
  const logoutIntent = sessionStorage.getItem("pro_logout_intent");

  if (logoutIntent) {
    sessionStorage.removeItem("pro_logout_intent");
    setSessionExpiredMessage(null);
    return;
  }

  if (reason === "session-expired") {
    setSessionExpiredMessage("Sua sessão expirou. Entre novamente para continuar.");
    return;
  }

  setSessionExpiredMessage(null);
}, [searchParams]);

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
  const rawMessage =
    err instanceof Error ? err.message : "Não foi possível entrar.";
  setErrorMsg(getFriendlyLoginError(rawMessage));
} finally {
      setLoading(false);
    }
  }

  return (
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
  Acesso seguro às suas fichas.
</p>
        </div>
      </div>

      {sessionExpiredMessage && !errorMsg && (
        <div className="mb-4 rounded-lg border border-amber-100 bg-amber-50 p-3 text-xs text-amber-700">
          {sessionExpiredMessage}
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 rounded-lg border border-red-100 bg-red-50 p-3 text-xs text-red-600">
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
  );
}

function ProLoginFallback() {
  return (
    <div className="max-w-sm w-full bg-white border rounded-2xl p-8 shadow-sm">
      <div className="text-center">
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
  Preparando sua conta…
</p>
        </div>
      </div>
    </div>
  );
}

export default function ProLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <Suspense fallback={<ProLoginFallback />}>
        <ProLoginContent />
      </Suspense>
    </div>
  );
}
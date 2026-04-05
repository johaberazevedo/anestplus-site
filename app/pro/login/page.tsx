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
            Acesso seguro às suas fichas.
          </p>
        </div>
      </div>

      {sessionExpiredMessage && !errorMsg && (
        <div className="mb-4 rounded-2xl border border-[#b9963b]/30 bg-[#b9963b]/5 px-4 py-3 text-sm font-medium text-[#7a865f] shadow-sm">
          {sessionExpiredMessage}
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
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

        <div className="relative group">
          <label
            htmlFor="password"
            className="absolute -top-2.5 left-3 bg-white px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500 transition-colors group-focus-within:text-[#b9963b]"
          >
            Senha
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-900 outline-none transition hover:border-zinc-400 focus:border-[#b9963b] focus:ring-2 focus:ring-[#b9963b]/10 placeholder:text-zinc-400"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-[#1a2718] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[#1a2718]/20 transition hover:bg-[#22331d] disabled:opacity-70"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <div className="mt-5 space-y-2 text-center text-sm text-zinc-500">
        <div>
          <Link
            href="/pro/esqueci-senha"
            className="font-medium text-zinc-700 transition hover:text-[#7a865f] hover:underline"
          >
            Esqueci minha senha
          </Link>
        </div>

        <div>
          Ainda não tem conta?{" "}
          <Link
            href="/pro/cadastro"
            className="font-bold text-zinc-900 transition hover:text-[#7a865f] hover:underline"
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
    <div className="w-full max-w-sm rounded-[28px] border border-zinc-200 bg-white p-8 shadow-sm">
      <div className="text-center">
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
            Preparando sua conta…
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ProLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf7] px-4 font-sans selection:bg-[#22331d] selection:text-white">
      <Suspense fallback={<ProLoginFallback />}>
        <ProLoginContent />
      </Suspense>
    </div>
  );
}
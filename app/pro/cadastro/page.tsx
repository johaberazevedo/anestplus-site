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
  const [confirmPassword, setConfirmPassword] = useState("");

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

    if (password !== confirmPassword) {
      setErrorMsg("As senhas não coincidem.");
      setLoading(false);
      return;
    }

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

      setSuccessMsg(
        "Conta criada com sucesso. Você receberá um e-mail para confirmar seu cadastro antes de acessar sua conta."
      );
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
              Configure seu acesso seguro às suas fichas
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

        {confirmPassword.length > 0 &&
          password.length >= 6 &&
          confirmPassword.length >= password.length &&
          password !== confirmPassword && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-sm">
              As senhas não coincidem.
            </div>
          )}

        <form onSubmit={handleSignUp} className="space-y-5">
          <div className="relative group">
            <label
              htmlFor="fullName"
              className="absolute -top-2.5 left-3 bg-white px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500 transition-colors group-focus-within:text-[#b9963b]"
            >
              Nome completo
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-900 outline-none transition hover:border-zinc-400 focus:border-[#b9963b] focus:ring-2 focus:ring-[#b9963b]/10 placeholder:text-zinc-400"
              placeholder="Seu nome"
              autoComplete="name"
            />
          </div>

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
              required
              value={crm}
              onChange={(e) => setCrm(e.target.value)}
              className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-900 outline-none transition hover:border-zinc-400 focus:border-[#b9963b] focus:ring-2 focus:ring-[#b9963b]/10 placeholder:text-zinc-400"
              placeholder="12345"
              autoComplete="off"
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
              className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-900 outline-none transition hover:border-zinc-400 focus:border-[#b9963b] focus:ring-2 focus:ring-[#b9963b]/10 placeholder:text-zinc-400"
              placeholder="Opcional"
              autoComplete="off"
            />
          </div>

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
              Confirmar senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-900 outline-none transition hover:border-zinc-400 focus:border-[#b9963b] focus:ring-2 focus:ring-[#b9963b]/10 placeholder:text-zinc-400"
              placeholder="Repita sua senha"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={
              loading ||
              !fullName.trim() ||
              !crm.trim() ||
              !email.trim() ||
              password.length < 6 ||
              !confirmPassword ||
              password !== confirmPassword
            }
            className="w-full rounded-2xl bg-[#1a2718] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[#1a2718]/20 transition hover:bg-[#22331d] disabled:opacity-70"
          >
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-zinc-500">
          Já tem conta?{" "}
          <Link
            href="/pro/login"
            className="font-bold text-zinc-900 transition hover:text-[#7a865f] hover:underline"
          >
            Acessar conta
          </Link>
        </div>
      </div>
    </div>
  );
}
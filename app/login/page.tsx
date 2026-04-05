"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/auth/dashboard-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Não foi possível entrar.");
      }

      router.push("/dashboard");
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
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf7] px-4 font-sans selection:bg-[#22331d] selection:text-white">
      <div className="w-full max-w-sm rounded-[28px] border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mb-1 flex flex-col items-center gap-3">
            <Image
              src="/brand/anest-symbol.png"
              alt="Anest+"
              width={72}
              height={72}
              priority
              className="h-[72px] w-[72px] rounded-2xl object-contain"
            />
            <h1 className="text-2xl font-black tracking-tight text-zinc-950">
              Anest+
            </h1>
            <p className="text-sm text-zinc-500">Fichas anestésicas</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative group">
            <label
              htmlFor="username"
              className="absolute -top-2.5 left-3 bg-white px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500 transition-colors group-focus-within:text-[#b9963b]"
            >
              Usuário
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-900 outline-none transition hover:border-zinc-400 focus:border-[#b9963b] focus:ring-2 focus:ring-[#b9963b]/10 placeholder:text-zinc-400"
              placeholder="dashboard"
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
      </div>
    </div>
  );
}
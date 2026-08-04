"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível entrar.");
      }

      router.replace("/admin");
      router.refresh();
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Não foi possível entrar.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8f4] px-4 py-12">
      <section className="w-full max-w-md rounded-[28px] border border-zinc-200 bg-white p-7 shadow-xl shadow-zinc-900/5 sm:p-9">
        <div className="flex items-center gap-3">
          <Image
            src="/brand/anest-symbol.png"
            alt="Anest+"
            width={48}
            height={48}
            className="h-12 w-12 rounded-2xl"
            priority
          />
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a865f]">
              Área restrita
            </p>
            <h1 className="text-2xl font-black tracking-tight text-zinc-950">
              Administração Anest+
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm font-bold text-zinc-700">Usuário</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
              className="mt-2 h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-zinc-950 outline-none transition focus:border-[#7a865f] focus:ring-4 focus:ring-[#7a865f]/10"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-zinc-700">Senha</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              className="mt-2 h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-zinc-950 outline-none transition focus:border-[#7a865f] focus:ring-4 focus:ring-[#7a865f]/10"
            />
          </label>

          {error ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#162014] px-5 text-sm font-black text-white transition hover:bg-[#22331d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LockKeyhole size={18} />
            {loading ? "Entrando..." : "Entrar no painel"}
          </button>
        </form>
      </section>
    </main>
  );
}

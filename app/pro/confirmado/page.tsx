import Link from "next/link";

export default function ProConfirmedPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
            ✅
          </div>

          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Anest+ Pro
          </p>

          <h1 className="text-2xl font-semibold tracking-tight">
            Conta confirmada com sucesso
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Seu e-mail foi confirmado. Agora você já pode entrar na sua conta
            do Anest+ Pro e acessar suas fichas.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/pro/login"
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:opacity-95"
            >
              Entrar na conta
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Ir para o site
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
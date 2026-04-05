import Image from "next/image";
import Link from "next/link";

export default function ProConfirmedPage() {
  return (
    <main className="min-h-screen bg-[#fafaf7] text-zinc-950">
      <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-xl overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-100 bg-[#f6f7f1] px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-[#b9963b]/15">
                <Image
                  src="/brand/anest-symbol.png"
                  alt="Anest+ Pro"
                  width={44}
                  height={44}
                  priority
                  className="h-11 w-11 rounded-xl"
                />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a865f]">
                  Anest+ Pro
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">
                  Conta confirmada com sucesso
                </h1>
              </div>
            </div>
          </div>

          <div className="px-8 py-8">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#b9963b]/10 text-2xl ring-1 ring-[#b9963b]/20">
              ✅
            </div>

            <p className="text-sm leading-7 text-zinc-600">
              Seu e-mail foi confirmado. Agora você já pode entrar na sua conta
              do <span className="font-medium text-zinc-950">Anest+ Pro</span>{" "}
              e acessar suas fichas com segurança.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/pro/login"
                className="inline-flex items-center justify-center rounded-2xl bg-[#1a2718] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#22331d]"
              >
                Entrar na conta
              </Link>

              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-2xl border border-zinc-300 bg-white px-5 py-3 text-sm font-medium text-zinc-700 transition hover:bg-[#fafaf7]"
              >
                Ir para o site
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
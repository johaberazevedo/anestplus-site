import TrustValidatorClient from "@/components/trust/TrustValidatorClient";

export default function ValidarPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="max-w-4xl">
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              Validação oficial
            </span>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Validador de documentos Anest+
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              Envie um PDF exportado pelo Anest+ para identificar o marcador Trust
              embutido no documento, visualizar os dados da assinatura digital e
              conferir a integridade da camada de validação.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
                Leitura no navegador
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm text-slate-700">
                Sem envio automático do PDF
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm text-slate-700">
                Trust Layer Anest+
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <TrustValidatorClient />
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-950">
                Como funciona
              </h2>

              <div className="mt-4 space-y-4 text-sm text-slate-600">
                <div>
                  <p className="font-medium text-slate-800">1. Selecione o PDF</p>
                  <p className="mt-1">
                    O sistema tenta localizar automaticamente o marcador Trust
                    embutido no documento exportado pelo Anest+.
                  </p>
                </div>

                <div>
                  <p className="font-medium text-slate-800">2. Extração local</p>
                  <p className="mt-1">
                    A leitura ocorre no navegador, sem necessidade de upload
                    operacional do arquivo para um serviço externo.
                  </p>
                </div>

                <div>
                  <p className="font-medium text-slate-800">3. Decodificação</p>
                  <p className="mt-1">
                    Quando encontrado, o marcador é decodificado para exibir os
                    dados da Trust Layer e da assinatura digital.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-950">
                Privacidade
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Esta página foi pensada para validar documentos Anest+ com leitura
                local no navegador. O objetivo é permitir conferência rápida da
                assinatura digital e dos dados de validação sem transformar o fluxo
                em armazenamento desnecessário de prontuários.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
              <h2 className="text-base font-semibold">
                Trust Layer Anest+
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Cada documento validável contém um marcador Trust associado à
                assinatura criptográfica do caso, permitindo leitura, decodificação
                e futura verificação de integridade no ambiente web.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
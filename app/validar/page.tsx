import TrustValidatorClient from "@/components/trust/TrustValidatorClient";
import Image from "next/image";

export default function ValidarPage() {
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 selection:bg-[#22331d] selection:text-white">
      
      {/* Header Institucional (Paleta Anest+: Verde Escuro) */}
      <section className="border-b border-[#22331d] bg-[#162014] text-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:py-16">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-4xl">
              
              <div className="flex items-center gap-4">
                {/* Imagem do Logo inserida e alinhada */}
                <Image
                  src="/brand/anest-symbol.png"
                  alt="Logo do Anest+"
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-[12px] object-cover shadow-sm"
                  priority
                />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#d9c57d]">
                    Anest+
                  </p>
                  <p className="mt-0.5 text-sm text-[#d8dccf]/70">
                    Serviço oficial de validação
                  </p>
                </div>
              </div>

              <h1 className="mt-6 text-[2rem] font-black tracking-tight sm:text-5xl">
                Validador de assinaturas digitais Anest+
              </h1>

              {/* Texto Hero */}
              <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-[#d8dccf] sm:text-base sm:leading-8">
                Submeta seu documento ao serviço oficial de validação do Anest+ para identificar on-line o status das assinaturas digitais e da Trust Layer criptográfica associada ao arquivo.
              </p>

              {/* Tags (Paleta Anest+: Dourado/Verde transparente) */}
              <div className="mt-8 flex flex-wrap gap-2 sm:gap-3">
                <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-[13px] sm:text-sm font-medium text-[#d8dccf] backdrop-blur-sm">
                  Leitura local do PDF
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-[13px] sm:text-sm font-medium text-[#d8dccf] backdrop-blur-sm">
                  Sem armazenamento operacional
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-[13px] sm:text-sm font-medium text-[#d8dccf] backdrop-blur-sm">
                  Trust Layer Anest+
                </div>
              </div>

            </div>

            {/* Selo de Segurança Visual (Paleta Anest+) */}
            <div className="w-full max-w-sm rounded-[28px] border border-white/10 bg-white/5 p-5 sm:p-6 shadow-sm lg:mt-6 backdrop-blur-md">
              <div className="rounded-2xl border border-[#b9963b]/30 bg-[#22331d]/60 px-5 py-5 text-center text-white">
                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.22em] text-[#d9c57d]">
                  Assinatura digital
                </p>
                <p className="mt-2 text-[1.5rem] sm:text-2xl font-black tracking-tight">
                  Validável
                </p>
                <p className="mt-1 text-[13px] sm:text-sm text-[#d8dccf]/80">
                  Trust Layer identificável
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alerta de Responsabilidade (Paleta Anest+: Bege/Dourado claro) */}
      <section className="border-b border-[#b9963b]/20 bg-[#fbfaf5]">
        <div className="mx-auto flex max-w-7xl items-start gap-3 px-5 py-4 sm:px-6">
          <div className="mt-0.5 rounded-full bg-[#b9963b]/10 p-1.5 text-[#b9963b]">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[14px] leading-relaxed text-zinc-700 sm:text-sm sm:leading-6">
            <span className="font-bold text-[#7a865f]">Atenção:</span> É importante ressaltar que nenhuma informação ou arquivo é armazenado nos ambientes operacionais do Anest+. Os resultados da validação limitam-se exclusivamente a identificar o profissional titular da assinatura e confirmar se o prontuário não sofreu adulteração. A responsabilidade pelo conteúdo clínico permanece com a instituição.
          </p>
        </div>
      </section>

      {/* Corpo Principal */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr] xl:grid-cols-[1.4fr_0.6fr]">
          
          <div className="space-y-8">
            <div className="rounded-[24px] border border-zinc-200/80 bg-white shadow-sm sm:rounded-[28px]">
              <div className="border-b border-zinc-200/60 bg-[#1a2718] px-6 py-5 text-white sm:px-8 rounded-t-[24px] sm:rounded-t-[28px]">
                <h2 className="text-[1.1rem] sm:text-lg font-bold tracking-tight">Relatório de auditoria</h2>
                <p className="mt-1 text-[13px] sm:text-sm text-[#d8dccf]/80">
                  Submeta o PDF exportado para iniciar a verificação de integridade.
                </p>
              </div>

              <div className="p-6 sm:p-8">
                <TrustValidatorClient />
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            
            {/* Como Funciona */}
            <div className="rounded-[24px] border border-zinc-200/80 bg-white shadow-sm">
              <div className="border-b border-zinc-200/60 bg-zinc-50 px-6 py-4 rounded-t-[24px]">
                <h2 className="text-[1.05rem] font-bold text-zinc-950">Como funciona</h2>
              </div>

              <div className="space-y-5 p-6 text-[14px] text-zinc-600 sm:text-sm">
                <div>
                  <p className="font-bold text-zinc-900">1. Seleção do documento</p>
                  <p className="mt-1.5 leading-relaxed">
                    O sistema recebe um PDF exportado pelo Anest+ e procura o marcador Trust embutido no arquivo.
                  </p>
                </div>

                <div>
                  <p className="font-bold text-zinc-900">2. Processamento local</p>
                  <p className="mt-1.5 leading-relaxed">
  A varredura e a decodificação ocorrem diretamente no navegador, sem necessidade de envio operacional do arquivo para processamento externo.
</p>
                </div>

                <div>
                  <p className="font-bold text-zinc-900">3. Auditoria de integridade</p>
                  <p className="mt-1.5 leading-relaxed">
                    Quando encontrado, o marcador é decodificado para atestar se a assinatura digital é válida e se o arquivo se mantém autêntico.
                  </p>
                </div>
              </div>
            </div>

            {/* Informações do Serviço */}
            <div className="rounded-[24px] border border-zinc-200/80 bg-white shadow-sm">
              <div className="border-b border-zinc-200/60 bg-zinc-50 px-6 py-4 rounded-t-[24px]">
                <h2 className="text-[1.05rem] font-bold text-zinc-950">
                  Informações do serviço
                </h2>
              </div>

              <div className="space-y-5 p-6 text-[14px] text-zinc-600 sm:text-sm">
                <div>
                  <p className="font-bold text-zinc-900">Privacidade (Zero-Knowledge)</p>
                  <p className="mt-1.5 leading-relaxed">
                     Esta página foi pensada para validação local de documentos. Por operarmos estritamente no cliente, o Anest+ não tem conhecimento e não retém cópias dos prontuários que você decide auditar.
                  </p>
                </div>

                <div>
                  <p className="font-bold text-zinc-900">Escopo Técnico</p>
                  <p className="mt-1.5 leading-relaxed">
                    A ferramenta atesta a integridade matemática do documento contra o Hash criptográfico gerado no momento da assinatura original.
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Layer Anest+ */}
            <div className="rounded-[24px] border border-[#b9963b]/20 bg-[#fbfaf5] shadow-sm">
              <div className="border-b border-[#b9963b]/10 bg-[#b9963b]/5 px-6 py-4 rounded-t-[24px]">
                <h2 className="text-[1.05rem] font-bold text-[#7a865f]">
                  Trust Layer Anest+
                </h2>
              </div>
              <div className="p-6">
                <p className="text-[14px] leading-relaxed text-zinc-700 sm:text-sm">
                  Cada documento validável contém uma camada criptográfica invisível associada à assinatura do caso, permitindo leitura, decodificação e conferência técnica no ambiente web.
                </p>
              </div>
            </div>

          </aside>
        </div>
      </section>
    </main>
  );
}
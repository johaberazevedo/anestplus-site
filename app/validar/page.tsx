import TrustValidatorClient from "@/components/trust/TrustValidatorClient";
import Image from "next/image";

export default function ValidarPage() {
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 selection:bg-[#22331d] selection:text-white">
      <section className="border-b border-[#22331d] bg-[#162014] text-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:py-16">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-4xl">
              <div className="flex items-center gap-4">
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

              <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-[#d8dccf] sm:text-base sm:leading-8">
                Verifique a autenticidade da assinatura digital, a integridade
                criptográfica do payload e a identidade do profissional
                vinculado ao documento exportado pelo Anest+.
              </p>

              <div className="mt-8 flex flex-wrap gap-2 sm:gap-3">
  <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-medium text-[#d8dccf] backdrop-blur-sm transition-colors hover:bg-white/10 sm:text-sm">
    <svg className="h-4 w-4 text-[#d9c57d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    Leitura local do PDF
  </div>
  <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-medium text-[#d8dccf] backdrop-blur-sm transition-colors hover:bg-white/10 sm:text-sm">
    <svg className="h-4 w-4 text-[#d9c57d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
    Verificação criptográfica
  </div>
  <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-medium text-[#d8dccf] backdrop-blur-sm transition-colors hover:bg-white/10 sm:text-sm">
    <svg className="h-4 w-4 text-[#d9c57d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    Assinatura e integridade conferíveis
  </div>
</div>
            </div>

            <div className="w-full max-w-sm rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur-md sm:p-6 lg:mt-6 relative overflow-hidden">
  {/* Efeito de brilho de fundo */}
  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#b9963b]/20 blur-3xl"></div>
  
  <div className="relative rounded-2xl border border-[#b9963b]/30 bg-gradient-to-b from-[#22331d]/80 to-[#162014]/90 px-5 py-6 text-center text-white shadow-inner">
    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#b9963b]/20 text-[#d9c57d]">
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    </div>
    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#d9c57d] sm:text-[11px]">
      Auditoria digital
    </p>
    <p className="mt-2 text-[1.5rem] font-black tracking-tight sm:text-2xl">
      Documento verificável
    </p>
    <p className="mt-1 text-[13px] text-[#d8dccf]/80 sm:text-sm">
      Hash, assinatura e autoria conferíveis
    </p>
  </div>
</div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#b9963b]/20 bg-[#fbfaf5]">
        <div className="mx-auto flex max-w-7xl items-start gap-3 px-5 py-4 sm:px-6">
          <div className="mt-0.5 rounded-full bg-[#b9963b]/10 p-1.5 text-[#b9963b]">
            <svg
              className="h-4 w-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-[14px] leading-relaxed text-zinc-700 sm:text-sm sm:leading-6">
            <span className="font-bold text-[#7a865f]">Atenção:</span> Nenhum
            arquivo é armazenado nos ambientes operacionais do Anest+. A
            validação ocorre localmente no navegador e se limita à conferência
            da assinatura digital, da integridade criptográfica do documento e
            da identificação do profissional signatário. O conteúdo clínico
            permanece sob responsabilidade da instituição e do profissional
            responsável pelo registro.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr] xl:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-8">
            <div className="rounded-[24px] border border-zinc-200/80 bg-white shadow-sm sm:rounded-[28px]">
              <div className="rounded-t-[24px] border-b border-zinc-200/60 bg-[#1a2718] px-6 py-5 text-white sm:rounded-t-[28px] sm:px-8">
                <h2 className="text-[1.1rem] font-bold tracking-tight sm:text-lg">
                  Relatório de auditoria
                </h2>
                <p className="mt-1 text-[13px] text-[#d8dccf]/80 sm:text-sm">
                  Submeta o PDF exportado para verificar integridade do payload,
                  validade da assinatura digital e consistência dos metadados
                  Trust.
                </p>
              </div>

              <div className="p-6 sm:p-8">
                <TrustValidatorClient />
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[24px] border border-zinc-200/80 bg-white shadow-sm">
              <div className="rounded-t-[24px] border-b border-zinc-200/60 bg-zinc-50 px-6 py-4">
                <h2 className="text-[1.05rem] font-bold text-zinc-950">
                  Como funciona
                </h2>
              </div>

              <div className="space-y-5 p-6 text-[14px] text-zinc-600 sm:text-sm">
                <div>
                  <p className="font-bold text-zinc-900">
                    1. Seleção do documento
                  </p>
                  <p className="mt-1.5 leading-relaxed">
                    O sistema recebe um PDF exportado pelo Anest+ e identifica o
                    marcador Trust embutido no arquivo.
                  </p>
                </div>

                <div>
                  <p className="font-bold text-zinc-900">
                    2. Processamento local
                  </p>
                  <p className="mt-1.5 leading-relaxed">
                    A leitura, extração e análise do documento ocorrem
                    diretamente no navegador, sem envio operacional do arquivo
                    para processamento externo.
                  </p>
                </div>

                <div>
                  <p className="font-bold text-zinc-900">
                    3. Verificação criptográfica
                  </p>
                  <p className="mt-1.5 leading-relaxed">
                    O marcador é decodificado, o hash do payload é recalculado e
                    a assinatura digital é validada com a chave pública embutida
                    no próprio documento.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-zinc-200/80 bg-white shadow-sm">
              <div className="rounded-t-[24px] border-b border-zinc-200/60 bg-zinc-50 px-6 py-4">
                <h2 className="text-[1.05rem] font-bold text-zinc-950">
                  Informações do serviço
                </h2>
              </div>

              <div className="space-y-5 p-6 text-[14px] text-zinc-600 sm:text-sm">
                <div>
                  <p className="font-bold text-zinc-900">
                    Privacidade (Zero-Knowledge)
                  </p>
                  <p className="mt-1.5 leading-relaxed">
                    Esta página foi projetada para validação local de
                    documentos. Como o processamento ocorre estritamente no
                    cliente, o Anest+ não recebe nem retém cópias operacionais
                    dos arquivos auditados.
                  </p>
                </div>

                <div>
                  <p className="font-bold text-zinc-900">Escopo técnico</p>
                  <p className="mt-1.5 leading-relaxed">
                    A ferramenta confere a integridade matemática do payload
                    assinado, valida a assinatura digital com a chave pública
                    embutida e apresenta os metadados de autoria associados ao
                    documento.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-[#b9963b]/20 bg-[#fbfaf5] shadow-sm">
              <div className="rounded-t-[24px] border-b border-[#b9963b]/10 bg-[#b9963b]/5 px-6 py-4">
                <h2 className="text-[1.05rem] font-bold text-[#7a865f]">
                  Trust Layer Anest+
                </h2>
              </div>
              <div className="p-6">
                <p className="text-[14px] leading-relaxed text-zinc-700 sm:text-sm">
                  Cada documento validável contém uma camada criptográfica
                  invisível associada à assinatura do caso, permitindo extração,
                  leitura técnica, validação da assinatura e conferência de
                  integridade em ambiente web.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
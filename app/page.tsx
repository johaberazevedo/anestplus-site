import Link from "next/link";

export const metadata = {
  title: "Anest+ — Registro anestésico, sem fricção",
  description:
    "O Anest+ simplifica o registro anestésico com fluxo rápido, padronizado e PDF pronto ao final. Disponível na App Store.",
};

export default function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="py-10 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm text-zinc-600">
              De anestesiologista, para anestesiologistas.
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
  Registro anestésico, sem fricção.
</h1>

<p className="mt-4 text-zinc-600">
  Um fluxo rápido, claro e padronizado para documentar casos com menos retrabalho
  e mais tranquilidade no centro cirúrgico.
</p>
            <div id="baixar" className="mt-6 flex flex-wrap gap-3">
  <a
    href="https://apps.apple.com/br/app/anest/id6753714859"
    target="_blank"
    rel="noopener noreferrer"
    className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
  >
    Baixar na App Store
  </a>

  <Link
    href="/produto"
    className="rounded-xl border border-zinc-200 px-5 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50 transition-colors"
  >
    Ver como funciona
  </Link>

  <a
    href="https://wa.me/5571992288755"
    target="_blank"
    rel="noopener noreferrer"
    className="rounded-xl border border-zinc-200 px-5 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50 transition-colors"
  >
    Falar no WhatsApp
  </a>
</div>

            <p className="mt-4 text-xs text-zinc-500">
              iOS • PDF pronto • Fluxo pensado para centro cirúrgico
            </p>
          </div>

          {/* PLACEHOLDER VISUAL */}
          <div className="rounded-3xl border border-zinc-200/70 bg-zinc-50 p-6">
            <div className="aspect-[16/10] w-full rounded-2xl bg-white shadow-sm" />
            <p className="mt-4 text-sm text-zinc-600">
              Aqui entram screenshots do app (depois a gente coloca).
            </p>
          </div>
        </div>
      </section>
      {/* COMO FUNCIONA */}
      <section className="py-10">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            Como funciona
          </h2>
          <p className="mt-2 text-zinc-600">
            Um fluxo simples para registrar e finalizar o caso com clareza.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
            <p className="text-xs font-medium text-zinc-500">Passo 1</p>
            <p className="mt-2 font-medium">Crie a ficha</p>
            <p className="mt-2 text-sm text-zinc-600">
              Dados do paciente, ASA, cirurgia e tipo de anestesia — direto ao ponto.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
            <p className="text-xs font-medium text-zinc-500">Passo 2</p>
            <p className="mt-2 font-medium">Evolua durante o caso</p>
            <p className="mt-2 text-sm text-zinc-600">
              Atualize sinais, parâmetros, medicamentos e fluidos com poucos toques.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
            <p className="text-xs font-medium text-zinc-500">Passo 3</p>
            <p className="mt-2 font-medium">Exporte o PDF</p>
            <p className="mt-2 text-sm text-zinc-600">
              Documento pronto ao final — para arquivar, enviar ou imprimir.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-10">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">Perguntas rápidas</h2>
        </div>

        <div className="grid gap-4">
          <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
            <p className="font-medium">O Anest+ é para uso individual ou hospitalar?</p>
            <p className="mt-2 text-sm text-zinc-600">
              Ambos. Você pode usar individualmente e também existe modelo institucional para unidades.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
            <p className="font-medium">Tem PDF ao final?</p>
            <p className="mt-2 text-sm text-zinc-600">
              Sim. O app gera um relatório em PDF pronto para arquivamento e compartilhamento.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
            <p className="font-medium">Quero levar para o meu hospital. Como faço?</p>
            <p className="mt-2 text-sm text-zinc-600">
              Fala comigo no{" "}
<a
  className="underline"
  href="https://wa.me/5571992288755"
  target="_blank"
  rel="noopener noreferrer"
>
  WhatsApp
</a>{" "}
e eu te explico o modelo institucional e implantação.
            </p>
          </div>
        </div>
      </section>
      {/* PILLARS */}
      <section className="py-10">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            Os 3 pilares do Anest+
          </h2>
          <p className="mt-2 text-zinc-600">
            Foco em produtividade, conforto mental e padronização — na ordem certa.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
            <p className="font-medium">Produtividade</p>
            <p className="mt-2 text-sm text-zinc-600">
              Menos tempo preenchendo e reorganizando informações durante o caso.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
            <p className="font-medium">Conforto mental</p>
            <p className="mt-2 text-sm text-zinc-600">
              Menos decisões repetidas, menos medo de esquecer algo no meio do caos.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
            <p className="font-medium">Padronização</p>
            <p className="mt-2 text-sm text-zinc-600">
              Registro consistente e organizado, facilitando revisão e documentação.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-10">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            Feito para a rotina real do centro cirúrgico
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
            <p className="font-medium">Linha do tempo automática</p>
            <p className="mt-2 text-sm text-zinc-600">
              Sinais vitais e parâmetros em colunas para facilitar evolução durante o intraoperatório.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
            <p className="font-medium">Medicamentos estruturados</p>
            <p className="mt-2 text-sm text-zinc-600">
              Dose, via e organização clara para um resumo final coerente.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
            <p className="font-medium">Fluidos distribuídos automaticamente</p>
            <p className="mt-2 text-sm text-zinc-600">
              Você informa o total e o app distribui ao longo das colunas de forma proporcional.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
            <p className="font-medium">PDF pronto ao final</p>
            <p className="mt-2 text-sm text-zinc-600">
              Relatório exportado com identidade visual e padrão de registro.
            </p>
          </div>
        </div>
      </section>

      {/* INSTITUCIONAL */}
      <section className="py-10">
        <div className="rounded-3xl border border-zinc-200/70 bg-zinc-50 p-6 md:p-8">
          <h3 className="text-xl font-semibold tracking-tight">
            Para hospitais e instituições
          </h3>
          <p className="mt-2 text-zinc-600">
            Versão institucional com padronização e identidade do hospital.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/hospitais"
              className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
            >
              Ver modelo institucional
            </Link>

            <Link
              href="/contato"
              className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50 transition-colors"
            >
              Falar com a equipe
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
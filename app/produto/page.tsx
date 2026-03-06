import Link from "next/link";

export const metadata = {
  title: "Produto — Anest+",
  description:
    "Conheça como o Anest+ funciona na rotina real do centro cirúrgico: perfil, ficha anestésica, evolução intraoperatória, protocolos, QR Code, scanner e PDF final.",
};

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-8">
      <h1 className="max-w-5xl text-3xl font-semibold tracking-tight text-zinc-950 md:text-5xl">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-4 max-w-xl text-base leading-7 text-zinc-600 md:text-lg">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

function Card({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-3xl border border-zinc-200/70 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-medium tracking-tight text-zinc-950">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-zinc-600">{desc}</p>
    </div>
  );
}

export default function ProdutoPage() {
  return (
    <div className="-mx-4">
      {/* HERO */}
      <section className="px-4 pb-12 pt-4 md:pb-16 md:pt-8">
        <div className="mx-auto w-full max-w-6xl">
          <SectionTitle
            title="Entenda como o Anest+ funciona na rotina real do centro cirúrgico"
            subtitle="Do perfil ao PDF final, o app organiza o registro anestésico com mais clareza, menos retrabalho e um fluxo pensado para o intraoperatório."
          />

          <div className="grid gap-4 text-sm text-zinc-600 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200/70 bg-white px-4 py-2.5 shadow-sm">
              Fluxo rápido e padronizado
            </div>
            <div className="rounded-2xl border border-zinc-200/70 bg-white px-4 py-2.5 shadow-sm">
              Evolução durante o caso
            </div>
            <div className="rounded-2xl border border-zinc-200/70 bg-white px-4 py-2.5 shadow-sm">
              Resumo e PDF ao final
            </div>
          </div>
        </div>
      </section>

      {/* FLOW */}
      <section className="px-4 py-12 md:py-16">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 md:text-3xl">
              O fluxo principal do app
            </h2>
            <p className="mt-2 max-w-2xl text-zinc-600">
              Cada etapa foi desenhada para acompanhar o anestesiologista do
              início do caso até o documento final.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card
              title="Etapa 1 · Perfil e hospitais"
              desc="Cadastre nome, CRM e RQE uma vez. Depois, organize os hospitais com nome e identidade visual para usar nas fichas e relatórios."
            />
            <Card
              title="Etapa 2 · Criação da ficha"
              desc="Preencha os dados do paciente, ASA, anestesia, cirurgia, registro e plano em uma estrutura direta, validada e pronta para começar o caso."
            />
            <Card
              title="Etapa 3 · Evolução durante o caso"
              desc="Atualize sinais vitais, monitores, parâmetros, fluidos, diurese e descrição clínica conforme o caso acontece, sem reconstruir tudo no final."
            />
            <Card
              title="Etapa 4 · Resumo e PDF final"
              desc="Ao término, o app consolida as informações em um resumo claro e gera um relatório em PDF pronto para arquivar, imprimir ou compartilhar."
            />
          </div>
        </div>
      </section>

      {/* DETAILS */}
      <section className="px-4 py-12 md:py-16">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 md:text-3xl">
              O que o Anest+ organiza durante o caso
            </h2>
            <p className="mt-2 max-w-2xl text-zinc-600">
              O foco é diminuir atrito no preenchimento e manter clareza no
              registro anestésico.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card
              title="Sinais vitais"
              desc="A linha do tempo é criada automaticamente para facilitar a evolução intraoperatória com mais fluidez."
            />
            <Card
              title="Monitores e parâmetros"
              desc="Adicione gases, capnografia, saturação, oxigênio, acessos, diurese e outros dados conforme a necessidade do caso."
            />
            <Card
              title="Fluidos distribuídos"
              desc="Informe o volume total e o app distribui os dados nas colunas de forma proporcional e ordenada."
            />
            <Card
              title="Descrição da anestesia"
              desc="Registre indução, manutenção e despertar com liberdade, criando um histórico clínico completo do procedimento."
            />
            <Card
              title="Medicamentos estruturados"
              desc="Dose, via e organização clara para manter a prescrição coerente e o resumo final consistente."
            />
            <Card
              title="Resumo final"
              desc="O caso inteiro é consolidado em uma visualização clara antes da exportação do documento final."
            />
          </div>
        </div>
      </section>

      {/* EXTRA FEATURES */}
      <section className="px-4 py-12 md:py-16">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 md:text-3xl">
              Recursos que aceleram o dia a dia
            </h2>
            <p className="mt-2 max-w-2xl text-zinc-600">
              Além da ficha anestésica, o app reúne funções que tornam a rotina
              mais prática.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-zinc-200/70 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-medium tracking-tight text-zinc-950">
                Protocolos e presets
              </h3>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                Use padrões prontos de anestesia, monitores e fármacos como base
                para acelerar o início da ficha.
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-200/70 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-medium tracking-tight text-zinc-950">
                QR Code entre usuários
              </h3>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                Facilite a continuidade de casos em andamento na passagem de
                plantão entre anestesiologistas.
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-200/70 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-medium tracking-tight text-zinc-950">
                Scanner inteligente
              </h3>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                Leia identificações e documentos para preencher dados iniciais do
                paciente com mais rapidez.
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-200/70 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-medium tracking-tight text-zinc-950">
                Calendário e financeiro
              </h3>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                Organize plantões, recorrências e acompanhamento financeiro no
                mesmo ecossistema de trabalho.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="px-4 pb-14 pt-12 md:pb-20 md:pt-16">
        <div className="mx-auto w-full max-w-6xl">
          <div className="rounded-[32px] border border-zinc-200/70 bg-zinc-100/70 p-6 shadow-sm md:p-8">
            <div className="max-w-[860px]">
              <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-zinc-950 md:text-3xl">
                Um fluxo pensado para reduzir atrito e aumentar clareza no plantão
              </h2>

              <p className="mt-3 max-w-2xl text-zinc-600 leading-7">
                O Anest+ foi desenhado para acompanhar o anestesiologista na
                rotina real do centro cirúrgico, com menos retrabalho, mais
                organização e um documento final pronto ao término do caso.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="https://apps.apple.com/br/app/anest/id6753714859"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800"
                >
                  Baixar na App Store
                </a>

                <Link
                  href="/hospitais"
                  className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-900 shadow-sm transition-colors hover:bg-zinc-50"
                >
                  Ver modelo institucional
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
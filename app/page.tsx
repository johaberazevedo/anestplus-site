import Link from "next/link";
import Image from "next/image";

const APPSTORE_URL = "https://apps.apple.com/br/app/anest/id6753714859";
const WHATSAPP_URL = "https://wa.me/5571992288755";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white/70 px-3 py-1 text-xs text-zinc-700 shadow-sm backdrop-blur">
      {children}
    </span>
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
      <p className="text-base font-medium tracking-tight">{title}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{desc}</p>
    </div>
  );
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 md:text-3xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-2 max-w-2xl text-zinc-600">{subtitle}</p>
      ) : null}
    </div>
  );
}

export default function Home() {
  return (
    <div className="-mx-4">
      {/* HERO */}
      <section className="relative overflow-hidden px-4 pb-12 pt-10 md:pt-14">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-zinc-200/45 blur-3xl" />
          <div className="absolute -bottom-56 right-[-120px] h-[520px] w-[520px] rounded-full bg-zinc-100 blur-3xl" />
        </div>

        <div className="relative mx-auto grid w-full max-w-6xl gap-6 md:grid-cols-[1.08fr_0.92fr] md:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Pill>iPhone e iPad</Pill>
              <Pill>PDF pronto ao final</Pill>
              <Pill>Feito por anestesiologista</Pill>
            </div>

            <h1 className="mt-6 max-w-[11ch] text-5xl font-semibold tracking-tight text-zinc-950 md:text-6xl">
  O registro anestésico,
  <span className="block">do jeito que a rotina pede.</span>
</h1>

<p className="mt-6 max-w-lg text-xl leading-8 text-zinc-700">
  Você cuida do paciente. O Anest+ cuida do resto.
</p>

<p className="mt-4 max-w-lg text-base leading-7 text-zinc-500">
  Fluxo rápido, padronizado e pronto para evoluir o caso e gerar o PDF final com mais clareza no centro cirúrgico.
</p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href={APPSTORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-2xl bg-zinc-950 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-zinc-800 hover:shadow-md"
              >
                Baixar na App Store
              </a>

              <Link
                href="/produto"
                className="text-sm font-medium text-zinc-900 hover:underline"
              >
                Ver como funciona →
              </Link>
            </div>

<p className="mt-4 text-sm text-zinc-600">
  Use o código{" "}
  <span className="rounded-md bg-zinc-100 px-2 py-1 font-medium text-zinc-950">
    ANESTFRIEND
  </span>{" "}
  e teste o Anest+ grátis por 7 dias.
</p>

            <div className="mt-8 grid max-w-xl gap-3 text-sm text-zinc-600 sm:grid-cols-3">
              <div className="rounded-2xl border border-zinc-200/70 bg-white/80 px-4 py-3 shadow-sm">
                Fluxo padronizado
              </div>
              <div className="rounded-2xl border border-zinc-200/70 bg-white/80 px-4 py-3 shadow-sm">
                Evolução durante o caso
              </div>
              <div className="rounded-2xl border border-zinc-200/70 bg-white/80 px-4 py-3 shadow-sm">
                Resumo e PDF final
              </div>
            </div>

            <p className="mt-8 text-sm text-zinc-500">
              De anestesiologista, para anestesiologistas.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-[360px] md:ml-auto md:mr-0 md:-translate-y-6">
  <div className="rounded-[32px] border border-zinc-200/70 bg-white/90 p-3 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)]">
    <div className="overflow-hidden rounded-[24px] border border-zinc-200/70 bg-white">
      <Image
  src="/screens/app-hero-case-summary.jpg"
  alt="Resumo do caso no Anest+"
  width={886}
  height={1536}
  className="h-auto w-full"
  priority
/>
    </div>
  </div>

  <p className="mt-4 text-center text-xs text-zinc-500 md:text-left">
    Screenshot real do app.
  </p>
</div>
        </div>
      </section>

      {/* VALUE */}
      <section className="px-4 py-12 md:py-16">
        <div className="mx-auto w-full max-w-6xl">
          <SectionTitle
            title="Por que o Anest+ faz diferença no plantão"
            subtitle="Produtividade primeiro. Conforto mental em seguida. Padronização como consequência."
          />

          <div className="grid gap-4 md:grid-cols-3">
            <Card
  title="Produtividade"
  desc="Menos tempo preenchendo a ficha, reorganizando dados e reconstruindo o caso no final."
/>
<Card
  title="Conforto mental"
  desc="Menos decisões repetidas durante o intraoperatório e mais clareza no fluxo do caso."
/>
<Card
  title="Padronização"
  desc="Um registro mais consistente, limpo e fácil de revisar, arquivar e compartilhar."
/>
          </div>
        </div>
      </section>

      {/* PRODUCT DEPTH */}
      <section className="px-4 py-12 md:py-16">
        <div className="mx-auto w-full max-w-6xl">
          <SectionTitle
            title="Tudo o que você precisa para documentar com clareza"
            subtitle="Mais do que uma ficha digital: um fluxo completo para a rotina anestésica."
          />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card
  title="Perfil e hospitais"
  desc="Cadastre seus dados uma vez e organize hospitais com nome e identidade visual para usar nas fichas e relatórios."
/>
<Card
  title="Ficha anestésica completa"
  desc="Cabeçalho, sinais vitais, parâmetros, fluidos, medicamentos e descrição clínica em um fluxo único."
/>
<Card
  title="Protocolos e presets"
  desc="Acelere o início da ficha com padrões prontos de anestesia, monitores e fármacos usuais."
/>
<Card
  title="QR Code entre usuários"
  desc="Facilite a continuidade de casos em andamento na passagem de plantão entre anestesiologistas."
/>
<Card
  title="Scanner inteligente"
  desc="Leia identificações e documentos para preencher dados iniciais do paciente com mais rapidez."
/>
<Card
  title="Calendário e financeiro"
  desc="Organize plantões, recorrências e acompanhamento financeiro no mesmo ecossistema de trabalho."
/>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-4 py-12 md:py-16">
        <div className="mx-auto w-full max-w-6xl">
          <SectionTitle
            title="Como funciona"
            subtitle="Um fluxo simples para começar rápido e terminar com um registro claro."
          />

          <div className="grid gap-4 md:grid-cols-3">
            <Card
              title="1. Configure seu perfil e hospitais"
              desc="Cadastre seus dados fixos e deixe o ambiente pronto para criar fichas com mais agilidade."
            />
            <Card
              title="2. Evolua o caso durante o intraoperatório"
              desc="Atualize sinais, parâmetros, fluidos e medicamentos conforme o caso acontece."
            />
            <Card
              title="3. Finalize com resumo e PDF"
              desc="O app consolida o registro e gera um documento pronto para arquivar, enviar ou imprimir."
            />
          </div>
        </div>
      </section>

{/* PDF RESULT */}
<section className="px-4 py-12 md:py-16">
  <div className="mx-auto grid w-full max-w-6xl gap-8 md:grid-cols-[1.08fr_0.92fr] md:items-center">
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 md:text-3xl">
        Do caso ao documento final
      </h2>
      <p className="mt-4 max-w-xl text-zinc-600 leading-7">
        Ao final do preenchimento, o Anest+ consolida as informações em um
        relatório limpo, padronizado e pronto para arquivar, imprimir ou
        compartilhar.
      </p>

      <div className="mt-6 grid gap-3 text-sm text-zinc-600">
  <div className="rounded-2xl border border-zinc-200/70 bg-white px-4 py-2.5 shadow-sm">
    Cabeçalho, sinais vitais, parâmetros e fármacos organizados no mesmo documento.
  </div>
  <div className="rounded-2xl border border-zinc-200/70 bg-white px-4 py-2.5 shadow-sm">
    Identidade visual institucional e estrutura pronta para o fluxo hospitalar.
  </div>
  <div className="rounded-2xl border border-zinc-200/70 bg-white px-4 py-2.5 shadow-sm">
    Resultado final claro, consistente e fácil de revisar.
  </div>
</div>
    </div>

    <div className="mx-auto w-full max-w-[420px] rounded-[28px] border border-zinc-200/70 bg-white p-3 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.22)] md:ml-auto md:-translate-y-2">
  <div className="overflow-hidden rounded-[20px] border border-zinc-200/70 bg-zinc-50">
    <Image
      src="/screens/app-pdf-final.jpg"
      alt="Relatório final exportado pelo Anest+"
      width={1133}
      height={1536}
      className="h-auto w-full"
    />
  </div>
</div>
  </div>
</section>

      {/* FEATURES */}
      <section className="px-4 py-12 md:py-16">
        <div className="mx-auto w-full max-w-6xl">
          <SectionTitle
            title="Feito para a rotina real do centro cirúrgico"
            subtitle="Recursos pensados para diminuir atrito no preenchimento e aumentar clareza no registro."
          />

          <div className="grid gap-4 md:grid-cols-2">
            <Card
              title="Linha do tempo automática"
              desc="Ao inserir os dados iniciais, o sistema cria a progressão do caso para facilitar a evolução intraoperatória."
            />
            <Card
              title="Monitores e parâmetros editáveis"
              desc="Adicione e ajuste gases, parâmetros e colunas conforme a necessidade de cada paciente e procedimento."
            />
            <Card
              title="Fluidos distribuídos automaticamente"
              desc="Informe o volume total e o app organiza a distribuição nas colunas de forma proporcional e ordenada."
            />
            <Card
              title="Medicamentos estruturados"
              desc="Dose, via e organização clara para manter a prescrição coerente e o resumo final consistente."
            />
            <Card
              title="Protocolos por tipo de anestesia"
              desc="Use descrições, monitores e fármacos base como ponto de partida para diferentes técnicas anestésicas."
            />
            <Card
              title="PDF pronto ao final"
              desc="Exporte um relatório limpo, padronizado e pronto para arquivamento, impressão ou compartilhamento."
            />
          </div>
        </div>
      </section>

      {/* INSTITUTIONAL CTA */}
<section className="px-4 pb-12 md:pb-16">
  <div className="mx-auto w-full max-w-6xl">
    <div className="rounded-[32px] border border-zinc-200/70 bg-zinc-100/70 p-6 shadow-sm md:p-8 lg:p-10">
  <div className="max-w-[860px]">
    <h3 className="max-w-3xl text-xl font-semibold tracking-tight text-zinc-950 md:text-3xl">
      Leve o Anest+ para a rotina da sua instituição
    </h3>

    <p className="mt-3 max-w-2xl text-zinc-600 leading-7">
      Implantação orientada ao fluxo local, com padronização do registro
      anestésico, identidade visual institucional e estrutura pronta para o
      uso da equipe.
    </p>

    <div className="mt-6 grid max-w-3xl gap-3 text-sm text-zinc-600 md:grid-cols-2 xl:grid-cols-3">
      <div className="rounded-2xl border border-zinc-200/70 bg-white px-4 py-2.5 shadow-sm">
        Padronização do registro
      </div>
      <div className="rounded-2xl border border-zinc-200/70 bg-white px-4 py-2.5 shadow-sm">
        Identidade visual do hospital
      </div>
      <div className="rounded-2xl border border-zinc-200/70 bg-white px-4 py-2.5 shadow-sm">
        Implantação orientada ao fluxo local
      </div>
    </div>

    <div className="mt-6 flex flex-wrap gap-3">
      <Link
        href="/hospitais"
        className="inline-flex items-center justify-center rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800"
      >
        Ver modelo institucional
      </Link>

      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-900 shadow-sm transition-colors hover:bg-zinc-50"
      >
        Falar no WhatsApp
      </a>
    </div>
  </div>
</div>
  </div>
</section>

      {/* FAQ */}
      <section className="px-4 pb-14">
        <div className="mx-auto w-full max-w-6xl">
          <SectionTitle
  title="Dúvidas frequentes"
  subtitle="Respostas diretas sobre uso individual, modelo institucional e fluxo do app."
/>

          <div className="grid gap-4">
            <Card
              title="O Anest+ é para uso individual ou hospitalar?"
              desc="Ambos. Você pode usar individualmente e também existe modelo institucional para unidades e equipes."
            />
            <Card
              title="Tem PDF ao final?"
              desc="Sim. O app gera um relatório em PDF pronto para arquivamento, impressão e compartilhamento."
            />
            <Card
              title="O app ajuda só no final ou durante o caso também?"
              desc="Durante o caso. A proposta é registrar e evoluir a ficha em tempo real, com menos atrito no intraoperatório."
            />
            <div className="rounded-3xl border border-zinc-200/70 bg-zinc-50 p-6 shadow-sm">
  <p className="text-base font-medium tracking-tight text-zinc-950">
    Quero levar para o meu hospital. Como faço?
  </p>
  <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
    Fale comigo no{" "}
    <a
      className="font-medium underline"
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
    >
      WhatsApp
    </a>{" "}
    e eu explico o modelo institucional, a implantação e a adaptação ao fluxo local.
  </p>
</div>
          </div>
        </div>
      </section>
    </div>
  );
}
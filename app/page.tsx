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
      {/* HERO (Apple-like) */}
      <section className="relative overflow-hidden px-4 pb-10 pt-10 md:pt-14">
        {/* subtle background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-zinc-200/45 blur-3xl" />
          <div className="absolute -bottom-56 right-[-120px] h-[520px] w-[520px] rounded-full bg-zinc-100 blur-3xl" />
        </div>

        <div className="relative mx-auto grid w-full max-w-6xl gap-10 md:grid-cols-2 md:items-center">
          <div>
  <div className="flex flex-wrap items-center gap-2">
    <Pill>iOS</Pill>
    <Pill>PDF pronto ao final</Pill>
    <Pill>Fluxo padronizado</Pill>
  </div>

  <h1 className="mt-6 text-5xl font-semibold tracking-tight text-zinc-950 md:text-7xl">
    Registro anestésico.
    <span className="block">Sem fricção.</span>
  </h1>

  <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600">
    Documente casos com rapidez e clareza no centro cirúrgico —
    menos retrabalho, mais tranquilidade no plantão.
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

  <p className="mt-8 text-sm text-zinc-500">
    De anestesiologista, para anestesiologistas.
  </p>
</div>

          {/* device mock */}
<div className="relative">
  <div className="rounded-[36px] border border-zinc-200/70 bg-white/90 p-3 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)]">
    <div className="overflow-hidden rounded-[28px] border border-zinc-200/70 bg-white">
      <Image
        src="/screens/app-hero-v2.png"
        alt="Interface do Anest+"
        width={800}
        height={1600}
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

      {/* TRUST / VALUE */}
      <section className="px-4 py-12 md:py-16">
        <div className="mx-auto w-full max-w-6xl">
          <SectionTitle
            title="Os 3 pilares do Anest+"
            subtitle="Produtividade primeiro. Conforto mental em seguida. Padronização como consequência."
          />

          <div className="grid gap-4 md:grid-cols-3">
            <Card
              title="Produtividade"
              desc="Menos tempo preenchendo e reorganizando dados durante o caso."
            />
            <Card
              title="Conforto mental"
              desc="Menos decisões repetidas e mais tranquilidade no fluxo do centro cirúrgico."
            />
            <Card
              title="Padronização"
              desc="Registro consistente e organizado, facilitando revisão e documentação."
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-4 py-12 md:py-16">
        <div className="mx-auto w-full max-w-6xl">
          <SectionTitle
            title="Como funciona"
            subtitle="Um fluxo simples para registrar e finalizar o caso com clareza."
          />

          <div className="grid gap-4 md:grid-cols-3">
            <Card
              title="1) Crie a ficha"
              desc="Dados do paciente, ASA, cirurgia e tipo de anestesia — direto ao ponto."
            />
            <Card
              title="2) Evolua durante o caso"
              desc="Atualize sinais, parâmetros, medicamentos e fluidos com poucos toques."
            />
            <Card
              title="3) Exporte o PDF"
              desc="Documento pronto ao final — para arquivar, enviar ou imprimir."
            />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-4 py-12 md:py-16">
        <div className="mx-auto w-full max-w-6xl">
          <SectionTitle title="Feito para a rotina real do centro cirúrgico" />

          <div className="grid gap-4 md:grid-cols-2">
            <Card
              title="Linha do tempo automática"
              desc="Sinais vitais e parâmetros em colunas para facilitar evolução durante o intraoperatório."
            />
            <Card
              title="Medicamentos estruturados"
              desc="Dose, via e organização clara para um resumo final coerente."
            />
            <Card
              title="Fluidos distribuídos automaticamente"
              desc="Você informa o total e o app distribui ao longo das colunas de forma proporcional."
            />
            <Card
              title="PDF pronto ao final"
              desc="Relatório exportado com identidade visual e padrão de registro."
            />
          </div>
        </div>
      </section>

      {/* INSTITUTIONAL CTA */}
      <section className="px-4 pb-12 md:pb-16">
        <div className="mx-auto w-full max-w-6xl">
          <div className="rounded-[32px] border border-zinc-200/70 bg-zinc-50 p-6 shadow-sm md:p-10">
            <h3 className="text-xl font-semibold tracking-tight text-zinc-950 md:text-2xl">
              Para hospitais e instituições
            </h3>
            <p className="mt-2 max-w-2xl text-zinc-600">
              Modelo institucional com padronização, identidade visual e implantação orientada ao fluxo local.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/hospitais"
                className="inline-flex items-center justify-center rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800"
              >
                Ver modelo institucional
              </Link>

              <Link
                href="/contato"
                className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-900 shadow-sm transition-colors hover:bg-zinc-50"
              >
                Falar com a equipe
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 pb-14">
        <div className="mx-auto w-full max-w-6xl">
          <SectionTitle title="Perguntas rápidas" />

          <div className="grid gap-4">
            <Card
              title="O Anest+ é para uso individual ou hospitalar?"
              desc="Ambos. Você pode usar individualmente e também existe modelo institucional para unidades."
            />
            <Card
              title="Tem PDF ao final?"
              desc="Sim. O app gera um relatório em PDF pronto para arquivamento e compartilhamento."
            />
            <div className="rounded-3xl border border-zinc-200/70 bg-white p-6 shadow-sm">
              <p className="text-base font-medium tracking-tight">
                Quero levar para o meu hospital. Como faço?
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                Fala comigo no{" "}
                <a
                  className="underline"
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>{" "}
                e eu te explico o modelo institucional e implantação.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
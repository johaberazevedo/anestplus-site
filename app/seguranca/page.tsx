import {
  ShieldCheck,
  EyeOff,
  FileText,
  ClipboardList,
  Lock,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";

export const metadata = {
  title: "Segurança & Privacidade — Anest+",
  description:
    "Entenda os princípios de segurança, privacidade e previsibilidade do Anest+.",
};

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#b9963b]/25 bg-[#f6f7f1] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[#506047] shadow-sm">
      {children}
    </span>
  );
}

function SectionTitle({
  title,
  subtitle,
  align = "left",
}: {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={`mb-10 md:mb-14 ${align === "center" ? "mx-auto text-center" : ""}`}>
      <h2 className="max-w-4xl text-4xl font-black tracking-tight text-zinc-950 md:text-5xl lg:text-6xl lg:leading-[0.98]">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-500">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

function Card({
  title,
  desc,
  icon: Icon,
  className = "",
}: {
  title: string;
  desc: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-[32px] border border-zinc-200/80 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#b9963b]/35 hover:shadow-md ${className}`}
    >
      <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-[#b9963b]/5 blur-2xl transition-all group-hover:bg-[#b9963b]/10" />
      {Icon ? (
        <Icon className="mb-5 text-[#7a865f]" size={24} strokeWidth={1.5} />
      ) : null}
      <h3 className="text-lg font-semibold tracking-tight text-zinc-950">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-7 text-zinc-500">{desc}</p>
    </div>
  );
}

export default function SegurancaPage() {
  return (
    <div className="-mx-4 bg-white text-zinc-950">
      {/* HERO */}
      <section className="relative overflow-hidden px-4 pb-14 pt-4 md:pb-20 md:pt-8">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-44 left-1/2 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-[#22331d]/10 blur-3xl" />
          <div className="absolute top-8 right-[-100px] h-[420px] w-[420px] rounded-full bg-[#8f9c69]/12 blur-3xl" />
          <div className="absolute left-[8%] top-[22%] h-[220px] w-[220px] rounded-full bg-[#d7b65a]/10 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-6xl">
          <div className="flex flex-wrap gap-2">
            <Pill>Segurança com clareza</Pill>
            <Pill>Privacidade no uso</Pill>
            <Pill>Fluxo previsível</Pill>
          </div>

          <div className="mt-8 max-w-5xl">
            <h1 className="text-4xl font-black tracking-tight text-zinc-950 md:text-6xl lg:leading-[0.98]">
              Segurança e privacidade com clareza e previsibilidade
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-500 md:text-xl">
              Em um produto voltado à rotina anestésica, organização e confiança
              precisam caminhar juntas.
            </p>
          </div>

          <div className="mt-10 grid gap-3 text-sm sm:grid-cols-3">
            {[
              "Menos exposição desnecessária",
              "Fluxo previsível de documentação",
              "Mais clareza no registro final",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 rounded-2xl border border-[#b9963b]/20 bg-[#fafaf7] px-4 py-3 font-semibold text-zinc-700 shadow-sm"
              >
                <CheckCircle2 size={16} className="text-[#7a865f]" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRINCIPLES */}
      <section className="px-4 py-20 md:py-24">
        <div className="mx-auto w-full max-w-6xl">
          <SectionTitle
            title="Princípios do Anest+"
            subtitle="A proposta do app é apoiar o registro anestésico com uma estrutura organizada, reduzindo atrito e favorecendo uma documentação mais consistente."
          />

          <div className="grid gap-4 md:grid-cols-2">
            <Card
              icon={ClipboardList}
              title="Clareza no preenchimento"
              desc="A interface foi pensada para reduzir improviso no registro e facilitar uma documentação mais organizada durante o caso."
            />
            <Card
              icon={FileText}
              title="Previsibilidade no fluxo"
              desc="O app busca manter um caminho de uso claro, do início da ficha à ficha anestésica finalizada, sem etapas confusas ou desnecessárias."
            />
            <Card
              icon={EyeOff}
              title="Menos exposição desnecessária"
              desc="A lógica do produto prioriza o uso objetivo das informações necessárias para a rotina de documentação anestésica."
            />
            <Card
              icon={ShieldCheck}
              title="Padronização como apoio"
              desc="Estruturar melhor o registro também ajuda na revisão, no arquivamento e na consistência final dos documentos."
            />
          </div>
        </div>
      </section>

      {/* PRIVACY */}
      <section className="bg-zinc-50/50 px-4 py-20 md:py-24">
        <div className="mx-auto w-full max-w-6xl">
          <SectionTitle
            title="Privacidade na rotina de uso"
            subtitle="Em saúde, confiança depende de transparência sobre como o fluxo é organizado e como o uso do app se encaixa na realidade do serviço."
          />

          <div className="grid gap-4 md:grid-cols-3">
            <Card
              icon={FileText}
              title="Uso orientado à documentação"
              desc="O foco do Anest+ é apoiar a construção e a organização do registro anestésico ao longo do caso."
            />
            <Card
              icon={ClipboardList}
              title="Documentos mais consistentes"
              desc="Ao final do fluxo, o objetivo é entregar um material mais claro, padronizado e fácil de revisar."
            />
            <Card
              icon={Lock}
              title="Transparência no propósito"
              desc="O Anest+ foi pensado com responsabilidade, previsibilidade de uso e foco na rotina real da documentação anestésica."
            />
          </div>
        </div>
      </section>

      {/* EXPORT / FINAL DOCUMENT */}
      <section className="px-4 py-20 md:py-24">
        <div className="mx-auto w-full max-w-6xl">
          <SectionTitle
            title="Ficha anestésica finalizada com mais organização"
            subtitle="O resultado esperado ao final do fluxo é um registro mais claro, consistente e preparado para arquivamento, impressão ou compartilhamento."
          />

          <div className="grid gap-4 md:grid-cols-2">
            <Card
              icon={FileText}
              title="Estrutura padronizada"
              desc="Cabeçalho, sinais, parâmetros, descrição e medicamentos organizados em um formato mais uniforme."
            />
            <Card
              icon={CheckCircle2}
              title="Melhor legibilidade"
              desc="Uma ficha anestésica mais clara facilita revisão posterior e reduz a sensação de registro fragmentado."
            />
          </div>
        </div>
      </section>

      {/* CLOSING */}
      <section className="px-4 pb-16 pt-4 md:pb-24">
        <div className="mx-auto w-full max-w-6xl">
          <div className="rounded-[40px] border border-[#b9963b]/15 bg-[#f6f7f1] p-8 shadow-sm md:p-12">
            <div className="max-w-3xl">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#7a865f]">
                Fechamento
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-zinc-950 md:text-5xl lg:leading-[1.02]">
                Segurança e privacidade também fazem parte de um bom fluxo
              </h2>

              <p className="mt-6 text-lg leading-8 text-zinc-600">
                No Anest+, organização, padronização e clareza caminham junto
                com uma proposta de uso responsável e previsível no contexto da
                documentação anestésica.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
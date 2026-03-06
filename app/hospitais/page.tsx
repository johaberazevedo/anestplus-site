import Link from "next/link";
import {
  CheckCircle2,
  ShieldCheck,
  LayoutPanelTop,
  Settings2,
  Building2,
  Users,
  ClipboardList,
  Clock3,
  type LucideIcon,
} from "lucide-react";

const WHATSAPP_URL = "https://wa.me/5571992288755";

export const metadata = {
  title: "Hospitais — Anest+",
  description:
    "Modelo institucional do Anest+ para padronização do registro anestésico, identidade visual por unidade e implantação orientada ao fluxo local.",
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

function StepCard({
  step,
  title,
  desc,
}: {
  step: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-[36px] border border-zinc-200/70 bg-white p-8 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#b9963b]/25 hover:shadow-md">
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#b9963b]">
        {step}
      </p>
      <h3 className="mt-4 text-xl font-semibold tracking-tight text-zinc-950">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-7 text-zinc-600">{desc}</p>
    </div>
  );
}

export default function HospitaisPage() {
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
            <Pill>Modelo institucional</Pill>
            <Pill>Padronização do registro</Pill>
            <Pill>Adaptação ao fluxo local</Pill>
          </div>

          <div className="mt-8 max-w-5xl">
            <h1 className="text-4xl font-black tracking-tight text-zinc-950 md:text-6xl lg:leading-[0.98]">
              Leve o Anest+ para a rotina da sua instituição
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-500 md:text-xl">
              Um modelo institucional pensado para padronizar o registro anestésico,
              aplicar a identidade visual da unidade e adaptar o uso ao fluxo local
              da equipe.
            </p>
          </div>

          <div className="mt-10 grid gap-3 text-sm sm:grid-cols-3">
            {[
              "Padronização do registro",
              "Identidade visual por unidade",
              "Implantação orientada ao fluxo local",
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

      {/* VALUE */}
      <section className="px-4 py-20 md:py-24">
        <div className="mx-auto w-full max-w-6xl">
          <SectionTitle
            title="O que o modelo institucional entrega"
            subtitle="A proposta é unir organização, padronização e adoção prática no dia a dia da equipe anestésica."
          />

          <div className="grid gap-4 md:grid-cols-2">
            <Card
              icon={ShieldCheck}
              title="Registro padronizado"
              desc="Estrutura única para documentar casos com mais consistência, clareza e menos variação entre profissionais."
            />
            <Card
              icon={LayoutPanelTop}
              title="Identidade visual do hospital"
              desc="Relatórios e documentos podem refletir a unidade, reforçando apresentação institucional e organização local."
            />
            <Card
              icon={Settings2}
              title="Fluxo adaptado à rotina da equipe"
              desc="A implantação considera a realidade do serviço, com ajustes orientados ao modo como a unidade já opera."
            />
            <Card
              icon={Clock3}
              title="Adoção mais simples"
              desc="O objetivo não é complicar o fluxo, mas reduzir atrito no preenchimento e facilitar o uso no centro cirúrgico."
            />
          </div>
        </div>
      </section>

      {/* IMPLEMENTATION */}
      <section className="bg-zinc-50/50 px-4 py-20 md:py-24">
        <div className="mx-auto w-full max-w-6xl">
          <SectionTitle
            title="Como funciona a implantação"
            subtitle="Um processo simples, direto e orientado à realidade de cada instituição."
          />

          <div className="grid gap-6 md:grid-cols-3">
            <StepCard
              step="Etapa 1"
              title="Diagnóstico"
              desc="Entendimento do fluxo atual da unidade, do padrão desejado de registro e das necessidades da equipe."
            />
            <StepCard
              step="Etapa 2"
              title="Configuração"
              desc="Ajuste da identidade visual institucional e da estrutura de uso conforme o contexto local."
            />
            <StepCard
              step="Etapa 3"
              title="Implantação"
              desc="Apresentação prática do fluxo, treinamento inicial e acompanhamento da adoção no começo do uso."
            />
          </div>
        </div>
      </section>

      {/* FIT */}
      <section className="px-4 py-20 md:py-24">
        <div className="mx-auto w-full max-w-6xl">
          <SectionTitle
            title="Para quem esse modelo faz sentido"
            subtitle="Especialmente para instituições que querem mais organização sem aumentar a complexidade do trabalho da equipe."
          />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card
              icon={Users}
              title="Hospitais com múltiplos anestesiologistas"
              desc="Quando há mais de um profissional registrando casos e a consistência entre fichas se torna importante."
            />
            <Card
              icon={ClipboardList}
              title="Serviços que buscam padronização"
              desc="Quando a instituição deseja um fluxo mais uniforme de documentação anestésica."
            />
            <Card
              icon={Building2}
              title="Unidades com foco em organização"
              desc="Quando o objetivo é reduzir retrabalho, melhorar clareza e facilitar revisão dos registros."
            />
            <Card
              icon={Settings2}
              title="Implantação por unidade"
              desc="Modelo pensado para adaptação à realidade específica de cada hospital ou serviço."
            />
            <Card
              icon={Clock3}
              title="Equipes que precisam de agilidade"
              desc="Para contextos em que o preenchimento precisa acompanhar a rotina real do centro cirúrgico."
            />
            <Card
              icon={LayoutPanelTop}
              title="Hospitais que valorizam apresentação institucional"
              desc="Com identidade visual aplicada aos documentos finais e maior consistência na entrega."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-16 pt-4 md:pb-24">
        <div className="mx-auto w-full max-w-6xl">
          <div className="rounded-[40px] border border-[#b9963b]/15 bg-[#f6f7f1] p-8 shadow-sm md:p-12">
            <div className="max-w-3xl">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#7a865f]">
                Conversa inicial
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-zinc-950 md:text-5xl lg:leading-[1.02]">
                Quer entender como o Anest+ pode se adaptar ao fluxo da sua instituição?
              </h2>

              <p className="mt-6 text-lg leading-8 text-zinc-600">
                Fale comigo para avaliar o contexto da unidade, o modelo de implantação
                e a melhor forma de levar o Anest+ para a rotina da equipe.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-2xl bg-[#1a2718] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#22331d]"
                >
                  Falar no WhatsApp
                </a>

                <Link
                  href="/contato"
                  className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-6 py-3.5 text-sm font-bold text-zinc-900 shadow-sm transition-colors hover:bg-zinc-50"
                >
                  Ir para contato
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
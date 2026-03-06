import {
  CheckCircle2,
  Mail,
  MessageCircle,
  Building2,
  type LucideIcon,
} from "lucide-react";

const WHATSAPP_URL = "https://wa.me/5571992288755";
const APPSTORE_URL = "https://apps.apple.com/br/app/anest/id6753714859";
const EMAIL = "anestplus@outlook.com";

export const metadata = {
  title: "Contato — Anest+",
  description:
    "Fale com a equipe do Anest+ por e-mail ou WhatsApp para suporte, dúvidas e propostas institucionais.",
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

function ContactCard({
  title,
  desc,
  value,
  href,
  icon: Icon,
  external = false,
}: {
  title: string;
  desc: string;
  value: string;
  href: string;
  icon: LucideIcon;
  external?: boolean;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[32px] border border-zinc-200/80 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#b9963b]/35 hover:shadow-md">
      <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-[#b9963b]/5 blur-2xl transition-all group-hover:bg-[#b9963b]/10" />
      <Icon className="mb-5 text-[#7a865f]" size={24} strokeWidth={1.5} />
      <h3 className="text-lg font-semibold tracking-tight text-zinc-950">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-7 text-zinc-500">{desc}</p>
      <p className="mt-5 text-zinc-900">
        <a
          className="font-medium underline decoration-zinc-300 underline-offset-4 transition-colors hover:text-zinc-950"
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
        >
          {value}
        </a>
      </p>
    </div>
  );
}

export default function ContatoPage() {
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
            <Pill>Suporte e dúvidas</Pill>
            <Pill>Modelo institucional</Pill>
            <Pill>Contato direto e simples</Pill>
          </div>

          <div className="mt-8 max-w-5xl">
            <h1 className="text-4xl font-black tracking-tight text-zinc-950 md:text-6xl lg:leading-[0.98]">
              Fale com a equipe do Anest+
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-500 md:text-xl">
              Suporte, dúvidas sobre o app e conversas sobre implantação
              institucional em um só lugar.
            </p>
          </div>

          <div className="mt-10 grid gap-3 text-sm sm:grid-cols-3">
            {[
              "Suporte e dúvidas",
              "Modelo institucional",
              "Contato direto e simples",
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

      {/* CONTACT OPTIONS */}
      <section className="px-4 py-20 md:py-24">
        <div className="mx-auto w-full max-w-6xl">
          <SectionTitle
            title="Canais de contato"
            subtitle="Escolha o caminho mais adequado para suporte, dúvidas gerais ou conversas sobre implantação institucional."
          />

          <div className="grid gap-4 md:grid-cols-2">
            <ContactCard
              icon={Mail}
              title="E-mail"
              value={EMAIL}
              href={`mailto:${EMAIL}`}
              desc="Melhor para suporte, dúvidas gerais e solicitações mais formais."
            />

            <ContactCard
              icon={MessageCircle}
              title="WhatsApp"
              value="(71) 99228-8755"
              href={WHATSAPP_URL}
              external
              desc="Caminho mais rápido para conversar sobre implantação institucional, parcerias e dúvidas práticas."
            />
          </div>
        </div>
      </section>

      {/* INSTITUTIONAL CTA */}
      <section className="bg-zinc-50/50 px-4 py-20 md:py-24">
        <div className="mx-auto w-full max-w-6xl">
          <SectionTitle
            title="Contato institucional"
            subtitle="Para hospitais, grupos anestésicos e serviços que querem entender melhor o modelo de implantação."
          />

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[32px] border border-zinc-200/80 bg-white p-6 shadow-sm">
              <Building2 className="mb-5 text-[#7a865f]" size={24} strokeWidth={1.5} />
              <h3 className="text-lg font-semibold tracking-tight text-zinc-950">
                Avaliação do contexto da unidade
              </h3>
              <p className="mt-3 text-sm leading-7 text-zinc-500">
                Entendimento do fluxo atual, do perfil da equipe e do tipo de adaptação necessária.
              </p>
            </div>

            <div className="rounded-[32px] border border-zinc-200/80 bg-white p-6 shadow-sm">
              <CheckCircle2 className="mb-5 text-[#7a865f]" size={24} strokeWidth={1.5} />
              <h3 className="text-lg font-semibold tracking-tight text-zinc-950">
                Modelo institucional
              </h3>
              <p className="mt-3 text-sm leading-7 text-zinc-500">
                Conversa direta sobre padronização do registro, identidade visual e implantação por unidade.
              </p>
            </div>

            <div className="rounded-[32px] border border-zinc-200/80 bg-white p-6 shadow-sm">
              <MessageCircle className="mb-5 text-[#7a865f]" size={24} strokeWidth={1.5} />
              <h3 className="text-lg font-semibold tracking-tight text-zinc-950">
                Próximos passos
              </h3>
              <p className="mt-3 text-sm leading-7 text-zinc-500">
                Definição do melhor caminho para levar o Anest+ à rotina da equipe com mais clareza e menos atrito.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-4 pb-16 pt-4 md:pb-24">
        <div className="mx-auto w-full max-w-6xl">
          <div className="rounded-[40px] border border-[#b9963b]/15 bg-[#f6f7f1] p-8 shadow-sm md:p-12">
            <div className="max-w-3xl">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#7a865f]">
                Conversa inicial
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-zinc-950 md:text-5xl lg:leading-[1.02]">
                Quer levar o Anest+ para o seu hospital?
              </h2>

              <p className="mt-6 text-lg leading-8 text-zinc-600">
                Eu explico o modelo institucional, a implantação e como adaptar
                o fluxo do Anest+ à realidade da sua unidade.
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

                <a
                  href={APPSTORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-6 py-3.5 text-sm font-bold text-zinc-900 shadow-sm transition-colors hover:bg-zinc-50"
                >
                  Ver na App Store
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
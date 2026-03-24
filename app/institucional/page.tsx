"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  MessageCircle,
  Settings2,
  ShieldCheck,
  LayoutPanelTop,
  Users,
  Building2,
  ClipboardList,
  FileCheck2,
  HardDrive,
  Scale,
  Mail,
  ArrowRight,
  TrendingUp,
  EyeOff,
  type LucideIcon,
} from "lucide-react";

const WHATSAPP_URL = "https://wa.me/5571992288755";
const EMAIL = "anestplus@outlook.com";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#b9963b]/25 bg-[#f6f7f1] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#506047] shadow-sm backdrop-blur-sm sm:text-[11px]">
      {children}
    </span>
  );
}

function SectionHeading({
  eyebrow,
  title,
  desc,
  center = false,
  light = false,
  compact = false,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
  center?: boolean;
  light?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-4xl text-center" : "max-w-4xl"}>
      {eyebrow ? (
        <p
          className={`text-[10px] font-semibold uppercase tracking-[0.22em] sm:text-[11px] ${
            light ? "text-[#d9c57d]" : "text-[#7a865f]"
          }`}
        >
          {eyebrow}
        </p>
      ) : null}

      <h2
        className={`mt-3 font-black tracking-tight sm:mt-4 ${
          compact
            ? "text-[1.5rem] leading-[1.15] md:text-4xl md:leading-[1.04]"
            : "text-[1.75rem] leading-[1.1] md:text-[2.8rem] md:leading-[1.04]"
        } ${light ? "text-white" : "text-zinc-950"}`}
      >
        {title}
      </h2>

      {desc ? (
        <p
          className={`mt-4 text-[14px] leading-relaxed sm:text-base md:text-lg md:leading-8 ${
            light ? "text-zinc-300" : "text-zinc-500"
          } ${center ? "mx-auto max-w-3xl" : "max-w-3xl"}`}
        >
          {desc}
        </p>
      ) : null}
    </div>
  );
}

function FeatureCard({
  title,
  desc,
  icon: Icon,
  compact = false,
  light = false,
}: {
  title: string;
  desc: string;
  icon: LucideIcon;
  compact?: boolean;
  light?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className={`group relative overflow-hidden rounded-[24px] border shadow-sm transition-all md:rounded-[28px] ${
        light
          ? "border-white/10 bg-white/5 hover:border-[#b9963b]/35 hover:bg-white/[0.07]"
          : "border-zinc-200/80 bg-white hover:border-[#b9963b]/35 hover:shadow-[0_18px_38px_-22px_rgba(26,39,24,0.14)]"
      } ${compact ? "p-5" : "p-6 md:p-7"}`}
    >
      {!light ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-[#b9963b]/0 to-[#b9963b]/[0.03] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#b9963b]/5 blur-2xl transition-all duration-500 group-hover:bg-[#b9963b]/10" />
        </>
      ) : null}

      <div
        className={`relative z-10 mb-4 inline-flex rounded-2xl p-2.5 transition-colors duration-500 sm:p-3 ${
          light
            ? "bg-white/10 text-[#e0bf62]"
            : "bg-zinc-50 text-[#7a865f] group-hover:bg-[#b9963b]/10 group-hover:text-[#b9963b]"
        }`}
      >
        <Icon size={20} className="sm:h-[22px] sm:w-[22px]" strokeWidth={1.7} />
      </div>

      <h3
        className={`relative z-10 font-bold tracking-tight ${
          compact ? "text-[1.1rem] md:text-[1.28rem]" : "text-[1.15rem] md:text-[1.35rem]"
        } ${light ? "text-white" : "text-zinc-950"}`}
      >
        {title}
      </h3>

      <p
        className={`relative z-10 mt-2 text-[14px] leading-relaxed md:text-[15px] md:leading-7 ${
          light ? "text-zinc-300" : "text-zinc-500"
        }`}
      >
        {desc}
      </p>
    </motion.div>
  );
}

function ScreenFrame({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={`overflow-hidden rounded-[20px] border border-[#b9963b]/15 bg-black shadow-[0_24px_60px_-24px_rgba(26,39,24,0.32)] sm:rounded-[26px] sm:shadow-[0_24px_80px_-36px_rgba(26,39,24,0.32)] ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        width={1290}
        height={2796}
        className="h-auto w-full object-cover"
        priority={priority}
      />
    </div>
  );
}

export default function Institucional() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const navLinks = [
    { href: "#vantagens", label: "Vantagens" },
    { href: "#seguranca", label: "Segurança" },
    { href: "#implantacao", label: "Implantação" },
    { href: "#contato", label: "Contato" },
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-950 selection:bg-[#22331d] selection:text-white">
      <header className="fixed top-0 z-[100] w-full border-b border-zinc-200/60 bg-white/90 backdrop-blur-xl print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-6">
          <Link
  href="/"
  className="flex items-center gap-3 text-zinc-950 transition-opacity hover:opacity-90"
>
  <Image
    src="/brand/anest-symbol.png"
    alt="Logo do Anest+"
    width={44}
    height={44}
    className="h-10 w-10 rounded-[10px] object-cover sm:h-11 sm:w-11"
    priority
  />

  <div className="flex items-baseline gap-2">
    <span className="text-[1.5rem] font-black tracking-[-0.06em] sm:text-[1.7rem]">
      ANEST<span className="text-[#b9963b]">+</span>
    </span>

    <span className="hidden text-sm font-medium tracking-normal text-zinc-500 sm:inline-block">
      Institucional
    </span>
  </div>
</Link>

          <nav className="hidden items-center gap-8 text-[13px] font-bold uppercase tracking-wider text-zinc-500 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-zinc-950"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden h-10 items-center rounded-xl border border-zinc-200 bg-white px-5 text-[13px] font-bold text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 lg:inline-flex"
            >
              Para Médicos
            </Link>

            <button
              type="button"
              aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-900 shadow-sm lg:hidden"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <div
          aria-hidden={!isMenuOpen}
          className={`fixed bottom-0 left-0 right-0 top-[60px] z-40 overflow-y-auto bg-white p-6 transition-[transform,opacity] duration-300 sm:p-8 lg:hidden ${
            isMenuOpen
              ? "pointer-events-auto translate-x-0 opacity-100"
              : "pointer-events-none translate-x-full opacity-0"
          }`}
        >
          <div className="flex flex-col gap-6 pt-2 text-2xl font-black text-zinc-900 sm:pt-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="transition-colors hover:text-[#b9963b]"
              >
                {link.label}
              </a>
            ))}
            <div className="my-2 h-px w-full bg-zinc-100" />
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="text-lg text-zinc-500 transition-colors hover:text-zinc-900"
            >
              Para Médicos (Uso Individual)
            </Link>
          </div>

          <div className="space-y-4 pt-10">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-14 items-center justify-center rounded-2xl bg-[#1a2718] text-base font-bold text-white"
            >
              Agendar demonstração
            </a>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden px-5 pb-14 pt-28 sm:px-6 md:pb-24 md:pt-36">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-44 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#b9963b]/10 blur-3xl sm:h-[620px] sm:w-[620px]" />
        </div>

        <div className="mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6 flex justify-center gap-2">
              <Pill>Hospitais</Pill>
              <Pill>Clínicas</Pill>
              <Pill>Grupos de Anestesia</Pill>
            </div>

            <h1 className="mt-6 text-[2.5rem] font-black leading-[1.05] tracking-tight text-zinc-950 sm:mt-7 sm:text-5xl md:text-[5rem]">
              Mais padrão, clareza e segurança para o seu{" "}
              <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-[#7b8461] to-[#b9963b] bg-clip-text text-transparent">
                centro cirúrgico.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-[15px] leading-relaxed text-zinc-500 sm:text-base sm:leading-7 md:text-[1.25rem] md:leading-8">
              Leve mais consistência ao registro anestésico da equipe, reduza
              perdas por falhas de preenchimento e fortaleça a segurança das
              informações do seu serviço com o Anest+.
            </p>

            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-14 items-center justify-center rounded-2xl bg-[#1a2718] px-8 text-[15px] font-black text-white shadow-xl transition-all hover:scale-[1.02] hover:bg-[#22331d] sm:text-base"
              >
                Agendar demonstração
                <ArrowRight className="ml-2" size={18} />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-zinc-50/60 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            center
            eyebrow="O Problema"
            title="O custo silencioso da ficha manual"
            desc="Falta de padronização, caligrafia ilegível e campos em branco não são apenas um incômodo operacional — eles aumentam perdas financeiras, dificultam auditorias e expõem a instituição a riscos desnecessários."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <div className="rounded-[24px] border border-red-500/10 bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex rounded-2xl bg-red-500/10 p-3 text-red-500">
                <TrendingUp size={24} className="rotate-180" />
              </div>
              <h3 className="text-xl font-bold text-zinc-950">
                Aumento de glosas
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-zinc-600">
                Fichas incompletas, rasuradas ou inconsistentes dificultam a
                auditoria e aumentam o risco de glosas e atrasos no faturamento.
              </p>
            </div>

            <div className="rounded-[24px] border border-orange-500/10 bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex rounded-2xl bg-orange-500/10 p-3 text-orange-500">
                <Scale size={24} />
              </div>
              <h3 className="text-xl font-bold text-zinc-950">Risco jurídico</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-zinc-600">
                O registro anestésico é um documento médico-legal. O improviso
                no papel enfraquece a posição da instituição em questionamentos
                assistenciais e jurídicos.
              </p>
            </div>

            <div className="rounded-[24px] border border-zinc-200/80 bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex rounded-2xl bg-zinc-100 p-3 text-zinc-600">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-bold text-zinc-950">
                Falta de padrão
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-zinc-600">
                Em equipes grandes, cada profissional registra de um jeito. Isso
                compromete a consistência das informações e dificulta a leitura
                do centro cirúrgico como um todo.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="vantagens" className="px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div>
              <SectionHeading
                eyebrow="Solução Anest+"
                title="Um padrão único de registro para toda a equipe"
              />
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-zinc-500 sm:mt-5 sm:text-base sm:leading-8 md:text-lg">
                Com o Anest+, sua instituição oferece uma ferramenta moderna
                para o anestesiologista, ao mesmo tempo em que garante mais
                consistência, clareza e padronização no resultado final.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <FeatureCard
                  compact
                  icon={LayoutPanelTop}
                  title="Identidade visual"
                  desc="Fichas geradas com o logotipo, cabeçalho e dados oficiais do seu hospital ou grupo."
                />
                <FeatureCard
                  compact
                  icon={ClipboardList}
                  title="Padrão único"
                  desc="Fim das variações. Todos os profissionais entregam o mesmo padrão de registro."
                />
                <FeatureCard
                  compact
                  icon={FileCheck2}
                  title="Mais agilidade para faturamento"
                  desc="Campos estruturados ajudam a acelerar auditoria, conferência e cobrança."
                />
                <FeatureCard
                  compact
                  icon={Settings2}
                  title="Protocolos do serviço"
                  desc="Incorpore os protocolos de anestesia específicos da sua unidade direto no app."
                />
              </div>
            </div>

            <div className="relative flex justify-center overflow-hidden rounded-[24px] border border-[#b9963b]/15 bg-[#f6f7f1] p-3 shadow-sm sm:rounded-[36px] sm:p-5 md:p-6">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-0 top-0 h-40 w-40 rounded-full bg-[#b9963b]/5 blur-3xl" />
                <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-[#22331d]/5 blur-3xl" />
              </div>
              <ScreenFrame
                src="/screens/app-pdf-final.jpg"
                alt="Ficha anestésica padronizada"
                className="relative z-10 max-w-[280px] md:max-w-[340px]"
              />
            </div>
          </div>
        </div>
      </section>

<section className="bg-zinc-50/60 px-5 py-16 sm:px-6 md:py-24">
  <div className="mx-auto max-w-6xl">
    <SectionHeading
      center
      eyebrow="O que muda na prática"
      title="Ganho real para quem opera, coordena e audita"
      desc="O Anest+ melhora a experiência do anestesiologista na sala, dá mais previsibilidade para a coordenação e entrega mais clareza para revisão e faturamento."
    />

    <div className="mt-12 grid gap-6 md:grid-cols-3">
      <FeatureCard
        compact
        icon={Users}
        title="Para o anestesiologista"
        desc="Menos atrito no preenchimento, mais fluidez durante o caso e um registro final mais organizado, sem depender do improviso do papel."
      />

      <FeatureCard
        compact
        icon={Building2}
        title="Para a coordenação"
        desc="Mais consistência entre os registros da equipe, menos variação de preenchimento e uma rotina mais padronizada no serviço."
      />

      <FeatureCard
        compact
        icon={ClipboardList}
        title="Para auditoria e faturamento"
        desc="Mais clareza na leitura das fichas, menos inconsistências de preenchimento e mais agilidade na conferência e cobrança."
      />
    </div>
  </div>
</section>

      <section
        id="seguranca"
        className="mx-4 my-6 rounded-[32px] bg-zinc-950 px-5 py-12 text-white shadow-2xl sm:my-8 sm:rounded-[40px] sm:px-6 sm:py-16 md:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            light
            center
            eyebrow="Privacidade e segurança"
            title="Sua instituição mais protegida"
            desc="O Anest+ foi pensado para reduzir exposição desnecessária, manter informações sensíveis sob controle e oferecer mais tranquilidade para a instituição e para a equipe."
          />

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <FeatureCard
              light
              compact
              icon={HardDrive}
              title="Armazenamento 100% local"
              desc="O Anest+ não envia dados sensíveis de pacientes para nuvens de terceiros. As informações permanecem restritas ao dispositivo em uso."
            />
            <FeatureCard
              light
              compact
              icon={ShieldCheck}
              title="Menos exposição de dados"
              desc="Ao evitar trânsito desnecessário de informações em serviços externos, o app reduz a superfície de risco para a instituição."
            />
            <FeatureCard
              light
              compact
              icon={EyeOff}
              title="Sem compartilhamentos soltos"
              desc="O fluxo do app evita improvisos e compartilhamentos inseguros, concentrando a geração do registro final em um processo mais controlado e padronizado."
            />
          </div>
        </div>
      </section>

      <section id="implantacao" className="px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <SectionHeading
              center
              eyebrow="Jornada de adoção"
              title="Como implantar no seu serviço"
              desc="O processo é rápido, não exige integração complexa com sistemas antigos e é conduzido para gerar zero atrito com a sua equipe médica."
            />
          </div>

          <div className="relative">
            <div className="absolute left-[10%] right-[10%] top-1/2 z-0 hidden h-0.5 -translate-y-1/2 bg-zinc-100 md:block" />

            <div className="relative z-10 grid gap-6 md:grid-cols-3">
              <div className="relative rounded-[24px] border border-zinc-200/80 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#f6f7f1] text-xl font-black text-[#b9963b]">
                  1
                </div>
                <h3 className="text-xl font-bold text-zinc-950">Diagnóstico</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-zinc-500">
                  Mapeamos o fluxo atual do seu centro cirúrgico e entendemos as
                  necessidades específicas do corpo clínico e da auditoria.
                </p>
              </div>

              <div className="relative rounded-[24px] border border-zinc-200/80 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#f6f7f1] text-xl font-black text-[#b9963b]">
                  2
                </div>
                <h3 className="text-xl font-bold text-zinc-950">Configuração</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-zinc-500">
                  Adaptamos a ferramenta com a logomarca do hospital e os
                  protocolos internos, deixando o app pronto para o seu
                  ambiente.
                </p>
              </div>

              <div className="relative rounded-[24px] border border-zinc-200/80 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#f6f7f1] text-xl font-black text-[#b9963b]">
                  3
                </div>
                <h3 className="text-xl font-bold text-zinc-950">
                  Treinamento e adesão
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-zinc-500">
                  Conduzimos o onboarding da equipe médica com foco em rapidez
                  de adaptação e baixo atrito no dia a dia.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contato" className="px-4 pb-16 pt-6 sm:px-6 sm:pb-20 sm:pt-8">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[32px] bg-[#162014] px-6 py-14 text-center text-white shadow-2xl sm:rounded-[40px] sm:px-10 sm:py-20 md:px-16"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,180,74,0.18),transparent_45%)]" />
            <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(#d9b44a_1px,transparent_1px)] [background-size:24px_24px]" />

            <div className="relative z-10 mx-auto max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#d9c57d] sm:px-4 sm:py-2 sm:text-[11px]">
                <Building2 size={12} className="sm:h-[14px] sm:w-[14px]" />
                Solução corporativa
              </div>

              <h2 className="text-[2rem] font-black leading-[1.05] tracking-tight text-white sm:text-4xl md:text-[3.2rem] lg:leading-[1.04]">
                Pronto para modernizar o seu centro cirúrgico?
              </h2>

              <p className="mt-4 text-[15px] leading-relaxed text-[#d8dccf] sm:mt-6 sm:text-lg sm:leading-8 md:text-xl">
                Fale com nossos especialistas, agende uma demonstração focada na
                sua operação e descubra como o Anest+ pode levar mais padrão,
                clareza e agilidade ao seu serviço.
              </p>

              <div className="mt-8 flex flex-col flex-wrap justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-[14px] bg-[#d9b44a] px-6 py-3.5 text-[15px] font-black text-[#162014] shadow-2xl transition-transform hover:scale-[1.02] sm:rounded-2xl sm:px-8 sm:py-4 sm:text-base"
                >
                  <MessageCircle size={20} className="mr-2" />
                  Agendar demonstração
                </a>
                <a
                  href={`mailto:${EMAIL}`}
                  className="inline-flex items-center justify-center rounded-[14px] border border-white/10 bg-white/5 px-6 py-3.5 text-[15px] font-bold backdrop-blur-md transition-colors hover:bg-white/10 sm:rounded-2xl sm:px-8 sm:py-4 sm:text-base"
                >
                  <Mail size={20} className="mr-2" />
                  Enviar e-mail
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-zinc-200/70 bg-white px-5 py-6 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-center text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p>© {new Date().getFullYear()} Anest+. Todos os direitos reservados.</p>

          <div className="flex items-center justify-center gap-4 sm:justify-end">
            <Link
              href="/termos"
              className="transition-colors hover:text-zinc-900"
            >
              Termos de Uso
            </Link>
            <span className="text-zinc-300">•</span>
            <Link
              href="/privacidade"
              className="transition-colors hover:text-zinc-900"
            >
              Política de Privacidade
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
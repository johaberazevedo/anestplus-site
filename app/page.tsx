"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  ChevronRight,
  MessageCircle,
  CheckCircle2,
  Activity,
  Settings2,
  QrCode,
  Scan,
  Calendar,
  FileText,
  Clock,
  ShieldCheck,
  Droplets,
  Lock,
  User,
  Building2,
  ClipboardPen,
  ClipboardList,
  Wallet,
  FileCheck2,
  AlertCircle,
  EyeOff,
  HardDrive,
  Scale,
  Mail,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const APPSTORE_URL = "https://apps.apple.com/br/app/anest/id6753714859";
const OFFER_CODE_URL =
  "https://apps.apple.com/redeem?ctx=offercodes&id=6753714859&code=ANESTFRIEND";
const WHATSAPP_URL = "https://wa.me/5571992288755";
const INSTAGRAM_URL = "https://instagram.com/anestplus";
const EMAIL = "anestplus@outlook.com";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#b9963b]/25 bg-[#f6f7f1] px-3 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-[#506047] shadow-sm backdrop-blur-sm">
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
          className={`text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.22em] ${
            light ? "text-[#d9c57d]" : "text-[#7a865f]"
          }`}
        >
          {eyebrow}
        </p>
      ) : null}

      <h2
        className={`mt-3 sm:mt-4 font-black tracking-tight ${
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
      className={`group relative overflow-hidden rounded-[24px] md:rounded-[28px] border shadow-sm transition-all ${
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
        className={`relative z-10 mb-4 inline-flex rounded-2xl p-2.5 sm:p-3 transition-colors duration-500 ${
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

function FlowStepCard({
  step,
  title,
  desc,
}: {
  step: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-[20px] md:rounded-[24px] border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#b9963b]/30 hover:shadow-md">
      <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[#b9963b]">
        {step}
      </p>
      <h3 className="mt-3 text-[1.08rem] sm:text-[1.15rem] md:text-[1.2rem] font-bold tracking-tight text-zinc-950">
        {title}
      </h3>
      <p className="mt-2 text-[14px] leading-relaxed text-zinc-600 md:text-[15px] md:leading-7">
        {desc}
      </p>
    </div>
  );
}

function TestimonialCard({
  quote,
  author,
}: {
  quote: string;
  author: string;
}) {
  return (
    <div className="rounded-[20px] md:rounded-[24px] border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#b9963b]/30 hover:shadow-md">
      <p className="text-[15px] leading-relaxed text-zinc-700 md:text-[16px] md:leading-8">
        “{quote}”
      </p>
      <p className="mt-4 text-[12px] sm:text-[13px] font-bold uppercase tracking-[0.16em] text-[#7a865f]">
        {author}
      </p>
    </div>
  );
}

function InfoRow({
  title,
  desc,
  dark = false,
}: {
  title: string;
  desc: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`flex gap-3 sm:gap-4 rounded-[20px] md:rounded-[24px] border px-4 py-4 sm:px-5 sm:py-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
        dark ? "border-white/10 bg-white/5" : "border-zinc-200/80 bg-white"
      }`}
    >
      <div className="mt-0.5 flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-[#b9963b]/12 text-[#b9963b]">
        <CheckCircle2 size={16} strokeWidth={2.4} />
      </div>
      <div>
        <h3
          className={`text-[1.05rem] sm:text-lg font-bold leading-snug ${
            dark ? "text-white" : "text-zinc-950"
          }`}
        >
          {title}
        </h3>
        <p
          className={`mt-1 text-[13px] sm:text-[15px] leading-relaxed sm:leading-7 ${
            dark ? "text-zinc-300" : "text-zinc-500"
          }`}
        >
          {desc}
        </p>
      </div>
    </div>
  );
}

function FAQCard({
  title,
  desc,
}: {
  title: string;
  desc: string | React.ReactNode;
}) {
  return (
    <div className="rounded-[20px] md:rounded-[24px] border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-sm transition-all hover:border-[#b9963b]/30 hover:shadow-md">
      <h3 className="text-[1.05rem] font-bold tracking-tight text-zinc-950 md:text-lg">
        {title}
      </h3>
      <p className="mt-2 text-[14px] leading-relaxed text-zinc-600 md:text-[15px] md:leading-7">
        {desc}
      </p>
    </div>
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
      className={`overflow-hidden rounded-[20px] sm:rounded-[26px] border border-[#b9963b]/15 bg-black shadow-[0_24px_60px_-24px_rgba(26,39,24,0.32)] sm:shadow-[0_24px_80px_-36px_rgba(26,39,24,0.32)] ${className}`}
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

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const navLinks = [
    { href: "#produto", label: "Produto" },
    { href: "#como-funciona", label: "Como funciona" },
    { href: "#seguranca", label: "Segurança" },
    { href: "#faq", label: "FAQ" },
    { href: "#contato", label: "Contato" },
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-950 selection:bg-[#22331d] selection:text-white">
      {/* HEADER */}
      <header className="fixed top-0 z-[100] w-full border-b border-zinc-200/60 bg-white/90 backdrop-blur-xl print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 sm:px-6 py-3">
          <Link
  href="/"
  className="flex items-center gap-3 text-zinc-950"
>
  <Image
    src="/brand/anest-symbol.png"
    alt="Logo do Anest+"
    width={44}
    height={44}
    className="h-10 w-10 rounded-[10px] object-cover sm:h-11 sm:w-11"
    priority
  />
  <span className="text-[1.5rem] font-black tracking-[-0.06em] sm:text-[1.7rem]">
    ANEST<span className="text-[#b9963b]">+</span>
  </span>
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
              href="/institucional"
              className="hidden h-10 items-center rounded-xl border border-zinc-200 bg-white px-5 text-[13px] font-bold text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 lg:inline-flex"
            >
              Solução para Hospitais
            </Link>

            <a
              href={APPSTORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-10 items-center rounded-xl bg-[#1a2718] px-5 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-zinc-800 lg:inline-flex"
>
  Baixar na App Store
</a>

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
          className={`fixed bottom-0 left-0 right-0 top-[60px] z-40 overflow-y-auto bg-white p-6 sm:p-8 transition-[transform,opacity] duration-300 lg:hidden ${
            isMenuOpen
              ? "pointer-events-auto translate-x-0 opacity-100"
              : "pointer-events-none translate-x-full opacity-0"
          }`}
        >
          <div className="flex flex-col gap-6 pt-2 sm:pt-4 text-2xl font-black text-zinc-900">
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
            <div className="h-px w-full bg-zinc-100 my-2" />
            <Link
              href="/institucional"
              onClick={() => setIsMenuOpen(false)}
              className="text-lg text-zinc-500 transition-colors hover:text-zinc-900"
            >
              Para Hospitais (Institucional)
            </Link>
          </div>

          <div className="space-y-4 pt-10">
            <a
              href={APPSTORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-14 items-center justify-center rounded-2xl bg-[#1a2718] text-base font-bold text-white"
            >
              Baixar na App Store
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-14 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-base font-bold text-zinc-900"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden px-5 sm:px-6 pb-14 pt-28 md:pb-18 md:pt-36">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-44 left-1/2 h-[500px] w-[500px] sm:h-[620px] sm:w-[620px] -translate-x-1/2 rounded-full bg-[#22331d]/10 blur-3xl" />
          <div className="absolute right-[-100px] top-8 h-[300px] w-[300px] sm:h-[420px] sm:w-[420px] rounded-full bg-[#8f9c69]/12 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45 }}
            >
              <div className="flex flex-wrap gap-2">
                <Pill>De anestesiologista para anestesiologista</Pill>
                <Pill>Registro anestésico sem fricção</Pill>
                <Pill>iPhone e iPad</Pill>
              </div>

              <h1 className="mt-6 sm:mt-7 text-[2.4rem] leading-[1.05] sm:text-5xl font-black tracking-tight text-zinc-950 md:text-[4.5rem]">
                Você cuida do paciente.
                <br />
                <span className="bg-gradient-to-r from-[#7b8461] to-[#b9963b] bg-clip-text text-transparent">
                  O Anest+ cuida do resto.
                </span>
              </h1>

              <p className="mt-5 sm:mt-7 max-w-3xl text-[15px] sm:text-base leading-relaxed sm:leading-7 text-zinc-500 md:text-[1.22rem] md:leading-8">
                Organize seus plantões, crie a ficha com agilidade, registre o caso sem quebrar o ritmo do intraoperatório e termine com um registro mais claro, padronizado e pronto para usar.
              </p>

              <div className="mt-8">
  <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:flex-wrap">
    <a
      href={APPSTORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-14 items-center justify-center rounded-2xl bg-[#1a2718] px-7 text-[15px] font-black text-white shadow-xl transition-all hover:scale-[1.02] hover:bg-[#22331d] sm:text-base"
    >
      Baixar na App Store
      <ChevronRight className="ml-2" size={18} />
    </a>

    <a
      href={OFFER_CODE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-14 items-center justify-center rounded-2xl border border-[#b9963b]/25 bg-[#fbfaf5] px-7 text-[15px] font-bold text-zinc-900 shadow-sm transition-all hover:bg-[#f6f4eb] sm:text-base"
    >
      Ativar 7 dias grátis
    </a>
  </div>

  <p className="mt-3 text-[13px] sm:text-sm text-zinc-500">
    Disponível para iPhone e iPad.
  </p>

  <p className="mt-2 text-[13px] sm:text-sm text-zinc-500">
    O código <span className="font-bold text-zinc-800">ANESTFRIEND</span> já vai aplicado no resgate.
  </p>
</div>

              <div className="mt-8 flex flex-wrap gap-2 sm:gap-3 text-[13px] sm:text-sm">
                {[
                  "Calendário de plantões",
                  "Ficha anestésica completa",
                  "Registro durante o caso",
                ].map((item) => (
                  <div
                    key={item}
                    className="inline-flex items-center gap-2 rounded-full border border-[#b9963b]/18 bg-[#fafaf7] px-3 py-2 sm:px-4 sm:py-2.5 font-semibold text-zinc-700 shadow-sm"
                  >
                    <CheckCircle2 size={15} className="text-[#7a865f] shrink-0" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-6">
  <p className="max-w-2xl text-[13px] sm:text-sm leading-6 text-zinc-500">
    Quer ver o app em uso? No{" "}
    <a
      href={INSTAGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold text-zinc-800 underline decoration-[#b9963b]/60 underline-offset-4 transition-colors hover:text-zinc-950 hover:decoration-[#b9963b]"
    >
      Instagram do Anest+
    </a>{" "}
    você encontra vídeos mostrando o fluxo real do app.
  </p>
</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="relative mx-auto w-full max-w-[260px] sm:max-w-[300px] md:max-w-[320px] mt-8 lg:mt-0"
            >
              <div className="absolute inset-0 rounded-[32px] sm:rounded-[46px] bg-[radial-gradient(circle_at_center,rgba(185,150,59,0.22),transparent_68%)] blur-xl sm:blur-2xl" />
              <div className="relative rounded-[24px] sm:rounded-[36px] border border-[#b9963b]/25 bg-white/90 p-2.5 sm:p-3 md:p-4 shadow-[0_24px_60px_-24px_rgba(26,39,24,0.45)]">
                <ScreenFrame
                  src="/screens/app-hero-case-summary.jpg"
                  alt="Resumo da ficha anestésica"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* QUEBRA DE OBJEÇÃO DO INTRAOPERATÓRIO */}
      <section className="px-5 sm:px-6 py-14 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] border border-[#b9963b]/15 bg-[#f8f8f4] px-5 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12 shadow-[0_24px_60px_-40px_rgba(26,39,24,0.16)]">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-0 top-0 h-36 w-36 rounded-full bg-[#b9963b]/8 blur-3xl" />
              <div className="absolute bottom-0 right-0 h-36 w-36 rounded-full bg-[#22331d]/6 blur-3xl" />
            </div>

            <div className="relative z-10">
              <SectionHeading
                center
                eyebrow="Sem complicar seu fluxo"
                title="Em poucos minutos você entende por que não vai querer voltar para o papel"
                desc="Não é para deixar para depois. É para registrar enquanto o caso acontece, com poucos toques, menos digitação e menos retrabalho no fim do plantão."
              />

              <div className="mt-8 sm:mt-10 grid gap-4 md:grid-cols-3">
                <FlowStepCard
                  step="Passo 1"
                  title="Monte a ficha sem começar do zero"
                  desc="Paciente, hospital e base do caso entram de forma rápida, sem começar do zero a cada procedimento."
                />

                <FlowStepCard
                  step="Passo 2"
                  title="Atualize a ficha no ritmo do caso"
                  desc="Sinais vitais, parâmetros, fluidos e descrição podem ser atualizados no fluxo, sem transformar o registro em mais uma tarefa pesada."
                />

                <FlowStepCard
                  step="Passo 3"
                  title="Feche o caso com a ficha já pronta"
                  desc="No fim do caso, a ficha já está organizada, legível e pronta para revisar, imprimir e guardar."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

{/* VALIDAÇÃO EM HOSPITAIS */}
<section className="px-5 pt-12 pb-4 sm:px-6 md:pt-16">
  <div className="mx-auto max-w-5xl text-center">
    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 sm:text-[12px]">
      Validado na prática nos hospitais
    </p>

    <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-6">
      <div className="flex h-[140px] items-center justify-center rounded-[28px] border border-zinc-200 bg-white px-4 shadow-[0_10px_30px_-20px_rgba(26,39,24,0.18)]">
        <Image
          src="/brand/logo-hgvc2.png"
          alt="HGVC"
          width={320}
          height={110}
          className="h-auto max-h-[180px] w-auto object-contain"
        />
      </div>

      <div className="flex h-[140px] items-center justify-center rounded-[28px] border border-zinc-200 bg-white px-4 shadow-[0_10px_30px_-20px_rgba(26,39,24,0.18)]">
        <Image
          src="/brand/logo-afranio-peixoto2.png"
          alt="Hospital Afrânio Peixoto"
          width={320}
          height={110}
          className="h-auto max-h-[160px] w-auto object-contain"
        />
      </div>
    </div>
  </div>
</section>

      {/* PROVA SOCIAL */}
      <section className="bg-zinc-50/60 px-5 sm:px-6 py-14 md:py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            center
            eyebrow="Quem usa percebe na rotina"
            title="O que muda quando o Anest+ entra no plantão"
            desc="Relatos curtos, práticos e diretos sobre o impacto no dia a dia do anestesiologista."
          />

          <div className="mt-8 sm:mt-10 grid gap-4 md:grid-cols-3">
            <TestimonialCard
              quote="Parei de terminar caso pensando na ficha que ainda faltava organizar. O fluxo do plantão ficou muito mais leve."
              author="Daniel M. — Anestesiologista"
            />
            <TestimonialCard
  quote="O calendário de plantões me ajudou a organizar melhor a rotina e trouxe muito mais clareza para os meus compromissos."
  author="Isabela T. — Anestesiologista."
/>
            <TestimonialCard
              quote="A ficha final ficou mais clara, mais rápida de revisar e com muito menos retrabalho no fim do caso."
              author="Iago G. — Anestesiologista"
            />
          </div>
        </div>
      </section>



      {/* ORIGEM DO PRODUTO */}
      <section id="problema" className="bg-zinc-50/60 px-5 sm:px-6 py-12 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-start gap-10 sm:gap-12 lg:grid-cols-[0.94fr_1.06fr]">
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] text-[#7a865f]">
                A origem do produto
              </p>

              <h2 className="mt-3 sm:mt-4 text-[2rem] leading-[1.1] sm:text-4xl font-black tracking-tight text-zinc-950 md:text-5xl">
                Não é um software genérico.
                <br />
                É a vivência real do centro cirúrgico.
              </h2>

              <p className="mt-4 sm:mt-5 max-w-2xl text-[14px] leading-relaxed sm:text-base sm:leading-8 text-zinc-600 md:text-lg">
                O Anest+ nasceu da necessidade de substituir o improviso do papel por
                uma ferramenta que reduz atrito no preenchimento, acompanha melhor o
                fluxo do intraoperatório e fortalece a qualidade do registro clínico no
                dia a dia.
              </p>

              <p className="mt-4 sm:mt-5 max-w-2xl text-[14px] leading-relaxed sm:text-base sm:leading-8 text-zinc-500">
                Em vez de adaptar a rotina da anestesia a um software genérico, a ideia
                foi fazer o contrário: criar um produto que respeita a lógica real do
                plantão.
              </p>

              <div className="mt-6 sm:mt-7 inline-flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-[#b9963b]/20 bg-white px-4 py-2.5 sm:px-5 sm:py-3 shadow-sm">
                <Lock size={16} className="text-[#7a865f] sm:h-[18px] sm:w-[18px]" />
                <span className="text-[12px] sm:text-sm font-bold uppercase tracking-wide text-zinc-700">
                  100% offline e privado
                </span>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[24px] sm:rounded-[28px] border border-red-500/10 bg-white p-5 sm:p-6 shadow-sm">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="mt-0.5 rounded-2xl bg-red-500/10 p-2.5 sm:p-3 text-red-400">
                    <AlertCircle size={18} className="sm:h-[20px] sm:w-[20px]" />
                  </div>
                  <div>
                    <h3 className="text-[1.1rem] sm:text-lg font-bold tracking-tight text-zinc-950">
                      Processo manual e cansativo
                    </h3>
                    <p className="mt-1.5 sm:mt-2 text-[14px] leading-relaxed sm:text-sm sm:leading-7 text-zinc-500">
                      Papel, digitação excessiva e reconstrução mental ao final do caso
                      transformam a ficha em mais uma carga dentro do plantão.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] sm:rounded-[28px] border border-orange-500/10 bg-white p-5 sm:p-6 shadow-sm">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="mt-0.5 rounded-2xl bg-orange-500/10 p-2.5 sm:p-3 text-orange-400">
                    <Clock size={18} className="sm:h-[20px] sm:w-[20px]" />
                  </div>
                  <div>
                    <h3 className="text-[1.1rem] sm:text-lg font-bold tracking-tight text-zinc-950">
                      Peso durante o caso
                    </h3>
                    <p className="mt-1.5 sm:mt-2 text-[14px] leading-relaxed sm:text-sm sm:leading-7 text-zinc-500">
                      Quando o registro não acompanha o fluxo real do intraoperatório,
                      ele compete com a rotina em vez de ajudar.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] sm:rounded-[28px] border border-[#b9963b]/10 bg-white p-5 sm:p-6 shadow-sm">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="mt-0.5 rounded-2xl bg-[#b9963b]/10 p-2.5 sm:p-3 text-[#b9963b]">
                    <FileText size={18} className="sm:h-[20px] sm:w-[20px]" />
                  </div>
                  <div>
                    <h3 className="text-[1.1rem] sm:text-lg font-bold tracking-tight text-zinc-950">
                      Documento final frágil
                    </h3>
                    <p className="mt-1.5 sm:mt-2 text-[14px] leading-relaxed sm:text-sm sm:leading-7 text-zinc-500">
                      Ficha pouco legível, inconsistências de preenchimento e menor
                      padronização enfraquecem a qualidade do resultado final.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- */}
      {/* INÍCIO DO BLOCO PRODUTO (PRIORIDADE 4 - HIERARQUIA)         */}
      {/* ----------------------------------------------------------- */}

      {/* POSICIONAMENTO FOCADO NA FICHA */}
      <section className="px-5 sm:px-6 py-16 md:py-24 text-center">
        <div className="mx-auto max-w-4xl">
          <SectionHeading
            center
            eyebrow="A sala de cirurgia é o centro"
            title="Sua ficha anestésica sem atrito, do início ao fim."
            desc="O Anest+ resolve o que mais pesa na rotina: criar a ficha com rapidez, registrar o caso sem atrapalhar o intraoperatório e terminar com um registro final claro, sem retrabalho."
          />
        </div>
      </section>

      {/* 1. NOVO CASO (AGORA É O PRIMEIRO) */}
      <section id="produto" className="bg-zinc-50/60 px-5 sm:px-6 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div className="order-2 lg:order-1 flex justify-center lg:justify-start">
              <ScreenFrame
                src="/screens/produto-novo-caso.jpg"
                alt="Criação de novo caso no Anest+"
                className="max-w-[260px] md:max-w-[320px]"
              />
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-[2rem] leading-[1.1] sm:text-4xl font-black tracking-tight text-zinc-950 md:text-[2.8rem]">
                Abra a ficha com rapidez e sem fricção
              </h2>
              <p className="mt-4 sm:mt-5 max-w-2xl text-[15px] sm:text-base leading-relaxed sm:leading-8 text-zinc-500 md:text-lg">
                Os dados do paciente e do procedimento entram em uma estrutura clara e validada, criando a base perfeita para acompanhar o caso desde o primeiro minuto.
              </p>

              <div className="mt-8 grid gap-3 sm:gap-4 sm:grid-cols-2">
                {[
                  "Paciente e registro",
                  "ASA, cirurgia e técnica",
                  "Hospital e plano",
                  "Dados iniciais com mais agilidade",
                  "Alergias detalhadas",
                  "Início estruturado",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-[16px] sm:rounded-2xl border border-[#b9963b]/15 bg-white px-4 py-3.5 sm:px-5 sm:py-4 text-[13px] sm:text-sm font-semibold text-zinc-800 shadow-sm"
                  >
                    <CheckCircle2 size={18} className="text-[#b9963b] shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DURANTE O CASO */}
      <section className="px-5 sm:px-6 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 md:mb-14">
            <SectionHeading
              title="Registre o caso sem quebrar o ritmo da cirurgia"
              desc="O Anest+ entra no fluxo do intraoperatório sem pesar na rotina. Menos digitação, menos retrabalho e menos sensação de estar preenchendo ficha fora de hora."
            />
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.96fr_1.04fr] lg:items-start">
            <div className="grid gap-4 md:grid-cols-2">
              <FeatureCard
                icon={Activity}
                title="Sinais vitais por deslize"
                desc="Ajuste parâmetros rapidamente apenas deslizando os campos. Zero digitação desnecessária."
              />
              <FeatureCard
                icon={Settings2}
                title="Parâmetros e alergias na hora"
desc="Adicione parâmetros, acessos e colunas extras no fluxo, sem sair da tela principal."
              />
              <FeatureCard
                icon={Droplets}
                title="Fluidos automáticos"
                desc="Informe o volume total e o app distribui fluidos e soluções contínuas de forma inteligente."
              />
              <FeatureCard
                icon={ClipboardPen}
                title="Descrição contínua"
                desc="Registre indução, manutenção e despertar no tempo certo, criando um histórico preciso."
              />
              <FeatureCard
                icon={ShieldCheck}
                title="Dose e via organizadas"
desc="A medicação fica estruturada de forma clara para facilitar o registro e a revisão."
              />
              <FeatureCard
                icon={CheckCircle2}
                title="Visão clara do caso"
desc="A ficha se mantém organizada para você bater o olho e entender o cenário com rapidez."
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:justify-items-center">
              <ScreenFrame
                src="/screens/produto-descricao.jpg"
                alt="Descrição da anestesia no Anest+"
                className="mx-auto max-w-[260px] md:max-w-[280px]"
              />
              <ScreenFrame
                src="/screens/produto-farmacos.jpg"
                alt="Fármacos organizados na ficha anestésica do Anest+"
                className="mx-auto max-w-[260px] md:max-w-[280px] hidden md:block"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. FECHAMENTO DA FICHA */}
      <section className="bg-zinc-50/60 px-5 sm:px-6 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.22em] text-[#b9963b]">
                O Alívio no final do plantão
              </p>

              <h2 className="mt-3 sm:mt-4 text-[2rem] leading-[1.1] sm:text-4xl font-black tracking-tight text-zinc-950 md:text-[2.8rem]">
                Uma ficha clara e pronta, sem reconstruir de memória
              </h2>

              <p className="mt-4 sm:mt-5 max-w-2xl text-[14px] leading-relaxed sm:text-base sm:leading-8 text-zinc-500 md:text-lg">
                Esqueça o retrabalho. Ao término do caso, o Anest+ já consolidou cabeçalho, fármacos e evolução em uma estrutura limpa, padronizada e pronta para ser exportada.
              </p>

              <div className="mt-6 sm:mt-8 grid gap-4 sm:grid-cols-2">
                <FeatureCard
                  compact
                  icon={FileCheck2}
                  title="Ficha pronta no final"
desc="Os blocos do caso já ficam organizados em uma estrutura clara para revisão e exportação."
                />
                <FeatureCard
                  compact
                  icon={ShieldCheck}
                  title="Mais clareza na leitura"
desc="A ficha fica mais legível e reduz problemas comuns do papel, como rasura e dificuldade de leitura."
                />
                <FeatureCard
                  compact
                  icon={CheckCircle2}
                  title="Revisão rápida"
desc="Bata o olho, confira a evolução do caso e feche o registro com muito menos retrabalho."
                />
                <FeatureCard
                  compact
                  icon={Activity}
                  title="Registro mais consistente"
desc="A ficha reflete melhor a evolução do caso e fortalece o registro final."
                />
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[24px] sm:rounded-[36px] border border-[#b9963b]/15 bg-white p-3 sm:p-5 shadow-sm md:p-6">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-0 top-0 h-40 w-40 rounded-full bg-[#b9963b]/5 blur-3xl" />
                <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-[#22331d]/5 blur-3xl" />
              </div>
              <div className="relative z-10">
                <ScreenFrame
                  src="/screens/app-pdf-final.jpg"
                  alt="Ficha anestésica finalizada em PDF no Anest+"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TRANSIÇÃO PARA EXTRAS */}
      <section className="px-5 sm:px-6 py-16 md:py-24 text-center">
        <div className="mx-auto max-w-4xl">
          <SectionHeading
  center
  eyebrow="Além da ficha"
  title="Recursos que continuam ajudando fora da sala"
  desc="Depois de resolver o que mais pesa no intraoperatório, o Anest+ também organiza plantões, protocolos e outros pontos da rotina do anestesiologista."
/>
        </div>
      </section>

      {/* 5. CALENDÁRIO (BÔNUS) */}
      <section className="bg-zinc-50/60 px-5 sm:px-6 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div>
              <h2 className="text-[2rem] leading-[1.1] sm:text-4xl font-black tracking-tight text-zinc-950 md:text-[2.8rem]">
  Plantões organizados no mesmo ecossistema
</h2>
              <p className="mt-4 sm:mt-5 max-w-2xl text-[15px] sm:text-base leading-relaxed sm:leading-8 text-zinc-500 md:text-lg">
  Além da ficha anestésica, o app também ajuda a visualizar sua agenda, organizar plantões e manter a rotina menos espalhada.
</p>

              <div className="mt-8 grid gap-3 sm:gap-4 sm:grid-cols-2">
                {[
                  "Visão clara da agenda",
                  "Recorrência automática",
                  "Atividades por hospital",
                  "Fim da escala espalhada",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-[16px] sm:rounded-2xl border border-[#b9963b]/15 bg-white px-4 py-3.5 sm:px-5 sm:py-4 text-[13px] sm:text-sm font-semibold text-zinc-800 shadow-sm"
                  >
                    <CheckCircle2 size={18} className="text-[#b9963b] shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <ScreenFrame
                src="/screens/produto-calendario.jpg"
                alt="Calendário de plantões no Anest+"
                className="max-w-[260px] md:max-w-[320px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 6. BASE E RECURSOS EXTRAS AGLUTINADOS */}
      <section className="px-5 sm:px-6 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
  eyebrow="Recursos de apoio"
  title="Recursos que deixam a rotina mais leve"
  desc="Hospitais salvos, textos dinâmicos, presets e outros recursos deixam a rotina mais leve sem tirar o foco da ficha anestésica."
/>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div className="grid gap-4 md:grid-cols-2">
              <FeatureCard
                compact
                icon={Building2}
                title="Hospitais salvos"
                desc="Identidade e logo dos locais onde você atua, sempre à mão."
              />
              <FeatureCard
                compact
                icon={ClipboardPen}
                title="Descrição dinâmica"
                desc="Inicie a evolução na ficha apenas tocando em blocos de texto-base."
              />
              <FeatureCard
                compact
                icon={Settings2}
                title="Presets próprios"
                desc="Crie protocolos baseados nas técnicas que você mais usa."
              />
              <FeatureCard
                compact
                icon={Activity}
                title="Grades de monitorização"
                desc="Aplique estruturas de acompanhamento por técnica anestésica."
              />
              <FeatureCard
                compact
                icon={QrCode}
                title="Passagem via QR Code"
                desc="Transfira casos complexos em andamento com um toque de câmera."
              />
              <FeatureCard
                compact
                icon={Wallet}
                title="Controle financeiro"
                desc="Acompanhe seus plantões e faturamentos junto da sua rotina clínica."
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:justify-items-center">
              <ScreenFrame
                src="/screens/produto-protocolos.jpg"
                alt="Tela de protocolos do Anest+"
                className="mx-auto max-w-[260px] md:max-w-[280px]"
              />
              <ScreenFrame
                src="/screens/produto-financeiro.jpg"
                alt="Tela de financeiro do Anest+"
                className="mx-auto max-w-[260px] md:max-w-[280px] hidden sm:block"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SEGURANÇA */}
      <section
        id="seguranca"
        className="mx-4 my-6 sm:my-8 rounded-[32px] sm:rounded-[40px] bg-zinc-950 px-5 sm:px-6 py-12 sm:py-16 text-white shadow-2xl md:py-20"
      >
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            light
            eyebrow="Mais confiança no registro"
            title="Mais clareza, mais controle e mais confiança no seu registro anestésico"
            desc="No Anest+, segurança se traduz em ficha mais legível, dados locais e mais controle sobre o registro final."
          />

          <div className="mt-8 sm:mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <FeatureCard
              light
              compact
              icon={HardDrive}
              title="Dados locais"
              desc="Os dados permanecem no próprio dispositivo, sem comunicação com nuvem ou servidores."
            />
            <FeatureCard
              light
              compact
              icon={ShieldCheck}
              title="Camada extra de confiança"
desc="Um reforço a mais de confiança e consistência no registro final gerado pelo app."
            />
            <FeatureCard
              light
              compact
              icon={FileText}
              title="Ficha legível e padronizada"
              desc="Ao sair do papel manuscrito, o registro ganha mais clareza visual e leitura consistente."
            />
            <FeatureCard
              light
              compact
              icon={ClipboardList}
              title="Menos risco de erro manual"
              desc="Campos estruturados e fluxo organizado ajudam a reduzir falhas comuns da ficha."
            />
            <FeatureCard
              light
              compact
              icon={Scale}
              title="Mais força no registro"
desc="Uma ficha mais clara e organizada fortalece o registro e reduz fragilidades."
            />
            <FeatureCard
              light
              compact
              icon={EyeOff}
              title="Sem exposição desnecessária"
              desc="O fluxo do app evita dependência de compartilhamentos e caminhos externos soltos."
            />
          </div>

          <div className="mt-8 sm:mt-10 grid gap-3 sm:gap-4 md:grid-cols-2">
            <InfoRow
              dark
              title="Menos risco de glosa"
              desc="Preenchimento mais claro reduz inconsistências e problemas de leitura."
            />
            <InfoRow
              dark
              title="Cópias acessíveis"
              desc="Guarde seus registros com você, sem depender apenas do papel arquivado no hospital."
            />
            <InfoRow
              dark
              title="Privacidade por desenho"
              desc="A privacidade faz parte da própria lógica estrutural do produto."
            />
            <InfoRow
              dark
              title="Confiança no final"
              desc="Documento preparado de forma limpa para revisão, impressão e guarda."
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-5 sm:px-6 py-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          <SectionHeading
            center
            eyebrow="Dúvidas frequentes"
            title="Respostas diretas sobre uso e rotina"
            desc="As perguntas mais comuns sobre funcionamento, privacidade e uso do Anest+."
          />

          <div className="mt-8 sm:mt-10 grid gap-3 sm:gap-4 md:grid-cols-2">
            <FAQCard
              title="O Anest+ é só uma ficha anestésica digital?"
              desc="Não. Ele também ajuda a organizar plantões, rotina profissional, produção financeira e o preenchimento da ficha com menos peso."
            />
            <FAQCard
              title="Preciso parar o caso para usar o app?"
              desc="Não. O app foi pensado para entrar no fluxo do intraoperatório com praticidade, ajudando no registro sem virar uma tarefa paralela pesada."
            />
            <FAQCard
              title="Serve para uso individual e institucional?"
              desc={
                <>
                  Sim. O app funciona muito bem no uso individual do médico, mas também oferecemos uma{" "}
                  <Link href="/institucional" className="text-[#b9963b] underline underline-offset-2">
                    solução institucional
                  </Link>{" "}
                  focada em padronização para hospitais e grupos anestésicos.
                </>
              }
            />
            <FAQCard
              title="Os dados ficam na nuvem?"
              desc="Não. A proposta do Anest+ é manter fichas, plantões e dados financeiros armazenados localmente no próprio dispositivo do usuário, garantindo privacidade."
            />
          </div>
        </div>
      </section>

      {/* CONTATO */}
      <section id="contato" className="border-t border-zinc-200/60 bg-zinc-50 px-5 sm:px-6 py-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          <SectionHeading
            center
            eyebrow="Contato"
            title="Fale com o Anest+"
            desc="Tire dúvidas, envie feedbacks ou peça suporte direto para nossa equipe."
          />

          <div className="mt-8 sm:mt-10 grid gap-4 sm:gap-5 sm:grid-cols-2">
            <a
              href={`mailto:${EMAIL}`}
              className="group flex flex-col items-center rounded-[24px] sm:rounded-[28px] border border-zinc-200/80 bg-white p-5 sm:p-7 text-center shadow-sm transition-all hover:border-[#b9963b]/40 hover:shadow-md"
            >
              <div className="mb-3 sm:mb-4 inline-flex rounded-[14px] sm:rounded-2xl bg-zinc-50 p-2.5 sm:p-3 transition-colors group-hover:bg-[#b9963b]/10">
                <Mail className="text-[#b9963b] sm:h-[24px] sm:w-[24px]" size={22} />
              </div>
              <h3 className="text-[1.1rem] sm:text-lg font-bold text-zinc-950">E-mail</h3>
              <p className="mt-1.5 sm:mt-2 text-[14px] leading-relaxed sm:text-sm sm:leading-7 text-zinc-500">
                Parcerias e solicitações formais.
              </p>
              <span className="mt-2.5 sm:mt-3 text-[14px] sm:text-sm font-bold text-[#b9963b] underline decoration-[#b9963b]/30 underline-offset-4">
                {EMAIL}
              </span>
            </a>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center rounded-[24px] sm:rounded-[28px] border border-zinc-200/80 bg-white p-5 sm:p-7 text-center shadow-sm transition-all hover:border-[#b9963b]/40 hover:shadow-md"
            >
              <div className="mb-3 sm:mb-4 inline-flex rounded-[14px] sm:rounded-2xl bg-zinc-50 p-2.5 sm:p-3 transition-colors group-hover:bg-[#b9963b]/10">
                <MessageCircle className="text-[#7a865f] sm:h-[24px] sm:w-[24px]" size={22} />
              </div>
              <h3 className="text-[1.1rem] sm:text-lg font-bold text-zinc-950">WhatsApp</h3>
              <p className="mt-1.5 sm:mt-2 text-[14px] leading-relaxed sm:text-sm sm:leading-7 text-zinc-500">
                Dúvidas rápidas, sugestões e suporte.
              </p>
              <span className="mt-2.5 sm:mt-3 text-[14px] sm:text-sm font-bold text-[#b9963b] underline decoration-[#b9963b]/30 underline-offset-4">
                (71) 99228-8755
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="px-4 sm:px-6 pb-16 sm:pb-20 pt-6 sm:pt-8">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[32px] sm:rounded-[40px] bg-[#162014] px-6 py-12 sm:px-8 sm:py-16 text-center text-white shadow-2xl md:px-14"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,180,74,0.18),transparent_45%)]" />
            <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(#d9b44a_1px,transparent_1px)] [background-size:24px_24px]" />

            <div className="relative z-10 mx-auto max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 sm:px-4 sm:py-2 text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-[#d9c57d]">
                De anestesiologista para anestesiologista
              </div>

              <h2 className="text-[2rem] leading-[1.05] sm:text-4xl font-black tracking-tight text-white md:text-[3.5rem] lg:leading-[1.04]">
                Você cuida do paciente.
                <br />
                O Anest+ cuida do resto.
              </h2>

              <p className="mt-4 sm:mt-6 text-[15px] sm:text-lg leading-relaxed sm:leading-8 text-[#d8dccf] md:text-xl">
  Teste no seu fluxo real por 7 dias e veja como fica mais leve criar a ficha,
  registrar o caso durante o intraoperatório e terminar o plantão sem retrabalho.
</p>

              {/* PRIORIDADE 2: REFORÇO DO TRIAL */}
              <div className="mt-8 flex flex-col items-center justify-center">
                <div className="inline-flex flex-col gap-3 rounded-2xl border border-[#b9963b]/30 bg-black/20 p-2 shadow-sm backdrop-blur-md sm:flex-row sm:items-center sm:pr-5">
                  <span className="flex h-9 items-center justify-center rounded-xl bg-[#d9b44a] px-4 text-[12px] sm:text-[13px] font-black text-[#162014] shadow-sm">
                    ANESTFRIEND
                  </span>
                  <span className="text-center text-[14px] sm:text-left sm:text-[15px] font-medium text-[#d8dccf]">
                    Ative 7 dias grátis e teste no seu fluxo real, sem compromisso.
                  </span>
                </div>
              </div>

              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
  <a
    href={OFFER_CODE_URL}
    target="_blank"
    rel="noopener noreferrer"
    className="rounded-[14px] bg-[#d9b44a] px-6 py-3.5 text-[15px] font-black text-[#162014] shadow-2xl transition-transform hover:scale-[1.02] sm:rounded-2xl sm:px-8 sm:py-4 sm:text-base"
  >
    Ativar 7 dias grátis
  </a>

  <a
    href={APPSTORE_URL}
    target="_blank"
    rel="noopener noreferrer"
    className="rounded-[14px] border border-white/10 bg-white/5 px-6 py-3.5 text-[15px] font-bold text-white backdrop-blur-md transition-colors hover:bg-white/10 sm:rounded-2xl sm:px-8 sm:py-4 sm:text-base"
  >
    Ver na App Store
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
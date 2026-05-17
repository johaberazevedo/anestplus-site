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
  Play,
  Activity,
  Settings2,
  QrCode,
  FileText,
  Clock,
  ShieldCheck,
  Droplets,
  Building2,
  ClipboardPen,
  ClipboardList,
  Wallet,
  FileCheck2,
  AlertCircle,
  EyeOff,
  HardDrive,
  Mail,
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
    <span className="inline-flex items-center rounded-full border border-[#B9963B]/25 bg-[#FAFAF7] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#506047] shadow-sm backdrop-blur-sm sm:text-[11px]">
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
            light ? "text-[#D9C57D]" : "text-[#7A865F]"
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
            light ? "text-zinc-300" : "text-[#71717A]"
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
    <div
      className={`group relative overflow-hidden rounded-[24px] border shadow-sm transition-colors duration-300 md:rounded-[28px] ${
        light
          ? "border-white/10 bg-white/5 hover:border-[#B9963B]/35 hover:bg-white/[0.07]"
          : "border-zinc-200/80 bg-white hover:border-[#B9963B]/35"
      } ${compact ? "p-5" : "p-6 md:p-7"}`}
    >
      {!light ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-[#B9963B]/0 to-[#B9963B]/[0.03] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#B9963B]/5 blur-2xl transition-colors duration-300 group-hover:bg-[#B9963B]/10" />
        </>
      ) : null}

      <div
        className={`relative z-10 mb-4 inline-flex rounded-2xl p-2.5 transition-colors duration-300 sm:p-3 ${
          light
            ? "bg-white/10 text-[#D9C57D]"
            : "bg-zinc-50 text-[#7A865F] group-hover:bg-[#B9963B]/10 group-hover:text-[#B9963B]"
        }`}
      >
        <Icon size={20} className="sm:h-[22px] sm:w-[22px]" strokeWidth={1.7} />
      </div>

      <h3
        className={`relative z-10 font-bold tracking-tight ${
          compact
            ? "text-[1.1rem] md:text-[1.28rem]"
            : "text-[1.15rem] md:text-[1.35rem]"
        } ${light ? "text-white" : "text-zinc-950"}`}
      >
        {title}
      </h3>

      <p
        className={`relative z-10 mt-2 text-[14px] leading-relaxed md:text-[15px] md:leading-7 ${
          light ? "text-zinc-300" : "text-[#71717A]"
        }`}
      >
        {desc}
      </p>
    </div>
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
    <div className="rounded-[20px] border border-zinc-200/80 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#B9963B]/30 hover:shadow-md sm:p-6 md:rounded-[24px]">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B9963B] sm:text-[11px]">
        {step}
      </p>
      <h3 className="mt-3 text-[1.08rem] font-bold tracking-tight text-zinc-950 sm:text-[1.15rem] md:text-[1.2rem]">
        {title}
      </h3>
      <p className="mt-2 text-[14px] leading-relaxed text-zinc-600 md:text-[15px] md:leading-7">
        {desc}
      </p>
    </div>
  );
}

function TestimonialCard({ quote, author }: { quote: string; author: string }) {
  return (
    <div className="rounded-[20px] border border-zinc-200/80 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#B9963B]/30 hover:shadow-md sm:p-6 md:rounded-[24px]">
      <p className="text-[15px] leading-relaxed text-zinc-700 md:text-[16px] md:leading-8">
        “{quote}”
      </p>
      <p className="mt-4 text-[12px] font-bold uppercase tracking-[0.16em] text-[#7A865F] sm:text-[13px]">
        {author}
      </p>
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
    <div className="rounded-[20px] border border-zinc-200/80 bg-white p-5 shadow-sm transition-all hover:border-[#B9963B]/30 hover:shadow-md sm:p-6 md:rounded-[24px]">
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
      className={`overflow-hidden rounded-[20px] border border-[#B9963B]/15 bg-black shadow-[0_24px_60px_-24px_rgba(11,42,58,0.32)] sm:rounded-[26px] sm:shadow-[0_24px_80px_-36px_rgba(11,42,58,0.32)] ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        width={1290}
        height={2796}
        sizes="(max-width: 640px) 260px, (max-width: 1024px) 320px, 360px"
        className="h-auto w-full object-cover"
        priority={priority}
      />
    </div>
  );
}

function VideoDemo() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative mx-auto w-full max-w-[280px] overflow-hidden rounded-[28px] border border-[#B9963B]/20 bg-black shadow-[0_24px_80px_-36px_rgba(11,42,58,0.42)] sm:max-w-[320px] sm:rounded-[36px]">
      {!isPlaying ? (
        <button
          type="button"
          onClick={() => setIsPlaying(true)}
          className="group relative block w-full cursor-pointer text-left"
          aria-label="Ver o Anest+ em ação"
        >
          <Image
            src="/screens/app-hero-case-summary.jpg"
            alt="Demonstração do Anest+ em uso"
            width={900}
            height={1600}
            className="max-h-[720px] w-full object-cover opacity-90 transition-opacity group-hover:opacity-70"
          />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#B9963B] text-white shadow-2xl transition-transform group-hover:scale-110 sm:h-20 sm:w-20">
              <Play size={34} className="ml-1" fill="currentColor" />
            </div>
          </div>

          <div className="absolute bottom-3 left-3 right-3 rounded-2xl border border-white/10 bg-black/45 p-3 text-white backdrop-blur-md sm:bottom-4 sm:left-4 sm:right-4 sm:p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#D9C57D]">
              Veja em ação
            </p>
            <p className="mt-1 text-sm font-black leading-tight sm:text-base">
              Video real do app.
            </p>
          </div>
        </button>
      ) : (
        <video
          autoPlay
          controls
          playsInline
          preload="metadata"
          className="max-h-[720px] w-full object-contain"
        >
          <source
            src="https://assets.anestplus.com/videos/video-anestplus.mp4"
            type="video/mp4"
          />
        </video>
      )}
    </div>
  );
}

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showStickyCta, setShowStickyCta] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    function handleScroll() {
      setShowStickyCta(window.scrollY > 620);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navLinks = [
    { href: "#produto", label: "Produto" },
    { href: "#como-funciona", label: "Como funciona" },
    { href: "#seguranca", label: "Segurança" },
    { href: "#faq", label: "FAQ" },
    { href: "#contato", label: "Contato" },
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-950 selection:bg-[#162014] selection:text-white">
      {/* HEADER */}
      <header className="fixed top-0 z-[100] w-full border-b border-zinc-200/60 bg-white/90 backdrop-blur-xl print:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-3 text-zinc-950">
            <Image
              src="/brand/anest-symbol.png"
              alt="Logo do Anest+"
              width={44}
              height={44}
              className="h-10 w-10 rounded-[10px] object-cover sm:h-11 sm:w-11"
              priority
            />
            <span className="text-[1.5rem] font-black tracking-[-0.06em] sm:text-[1.7rem]">
              ANEST<span className="text-[#B9963B]">+</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-5 text-[12px] font-bold uppercase tracking-wider text-zinc-500 xl:flex xl:gap-8 xl:text-[13px]">
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

          <div className="flex shrink-0 items-center gap-2 xl:gap-3">
<Link
  href="/institucional"
  className="hidden h-10 items-center rounded-xl border border-zinc-200 bg-white px-4 text-[13px] font-bold text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 lg:inline-flex xl:px-5"
>
  Solução para Hospitais
</Link>

<Link
  href="/pro/login"
  className="hidden h-10 items-center whitespace-nowrap rounded-xl border border-[#B9963B]/25 bg-[#FAFAF7] px-4 text-[13px] font-bold text-zinc-800 shadow-sm transition-all hover:bg-[#F6F4EB] lg:inline-flex xl:px-5"
>
  Conta Anest+
</Link>

<a
  href={APPSTORE_URL}
  target="_blank"
  rel="noopener noreferrer"
  className="hidden h-10 items-center rounded-xl bg-[#162014] px-5 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-[#22331D] lg:inline-flex"
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
                className="transition-colors hover:text-[#B9963B]"
              >
                {link.label}
              </a>
            ))}
            <div className="my-2 h-px w-full bg-zinc-100" />
<Link
  href="/institucional"
  onClick={() => setIsMenuOpen(false)}
  className="text-lg text-zinc-500 transition-colors hover:text-zinc-900"
>
  Para Hospitais (Institucional)
</Link>

<Link
  href="/pro/login"
  onClick={() => setIsMenuOpen(false)}
  className="text-lg text-zinc-500 transition-colors hover:text-zinc-900"
>
  Acessar Conta Anest+
</Link>
          </div>

          <div className="space-y-4 pt-10">
            <a
              href={OFFER_CODE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-14 items-center justify-center rounded-2xl bg-[#162014] text-base font-bold text-white"
            >
              Testar no próximo plantão
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

      {showStickyCta && !isMenuOpen ? (
  <a
    href={OFFER_CODE_URL}
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-4 right-4 z-[90] flex h-12 items-center justify-center rounded-2xl bg-[#162014] text-sm font-black text-white shadow-xl shadow-black/20 transition-all lg:hidden"
  >
    Testar no próximo plantão
  </a>
) : null}

      {/* HERO */}
<section className="relative overflow-hidden px-5 pb-14 pt-28 sm:px-6 md:pb-18 md:pt-36">
  <div className="pointer-events-none absolute inset-0 -z-10">
    <div className="absolute -top-44 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#22331d]/10 blur-3xl sm:h-[620px] sm:w-[620px]" />
    <div className="absolute right-[-100px] top-8 h-[300px] w-[300px] rounded-full bg-[#8f9c69]/12 blur-3xl sm:h-[420px] sm:w-[420px]" />
  </div>

  <div className="mx-auto max-w-7xl">
    <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
      <motion.div
        initial={{ opacity: 0, x: -18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="flex flex-wrap gap-2">
<Pill>Criado por um anestesiologista</Pill>
<Pill>Registro anestésico mais fluido</Pill>
<Pill>iPhone e iPad</Pill>
        </div>

        <h1 className="mt-6 text-[2.4rem] font-black leading-[1.05] tracking-tight text-zinc-950 sm:mt-7 sm:text-5xl md:text-[4.5rem]">
          Você cuida do paciente.
          <br />
          <span className="bg-gradient-to-r from-[#7b8461] to-[#b9963b] bg-clip-text text-transparent">
            O Anest+ cuida da sua rotina.
          </span>
        </h1>

<p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-zinc-500 sm:mt-7 sm:text-base sm:leading-7 md:text-[1.22rem] md:leading-8">
  Registre a anestesia durante o caso, assine e exporte uma ficha final clara,
legível e organizada — com menos digitação e mais tranquilidade no plantão.
</p>

        <div className="mt-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            <a
              href={OFFER_CODE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-14 items-center justify-center rounded-2xl bg-[#1a2718] px-7 text-[15px] font-black text-white shadow-xl transition-all hover:scale-[1.02] hover:bg-[#22331d] sm:text-base"
            >
              Testar no próximo plantão
              <ChevronRight className="ml-2" size={18} />
            </a>

            <a
              href={APPSTORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-14 items-center justify-center rounded-2xl border border-[#b9963b]/25 bg-[#fbfaf5] px-7 text-[15px] font-bold text-zinc-900 shadow-sm transition-all hover:bg-[#f6f4eb] sm:text-base"
            >
              Ver na App Store
            </a>
          </div>

          <p className="mt-3 text-[13px] text-zinc-500 sm:text-sm">
            Disponível para iPhone e iPad.
          </p>

          <p className="mt-2 text-[13px] leading-6 text-zinc-500 sm:text-sm">
            Use em um plantão real e avalie se o Anest+ se adapta à sua rotina.
            O código{" "}
            <span className="font-bold text-zinc-800">ANESTFRIEND</span>{" "}
            já vai aplicado no resgate.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-2 text-[13px] sm:gap-3 sm:text-sm">
          {[
  "Ficha pronta no fim do caso",
  "Registro durante a anestesia",
  "Assinatura e validação",
].map((item) => (
            <div
              key={item}
              className="inline-flex items-center gap-2 rounded-full border border-[#b9963b]/18 bg-[#fafaf7] px-3 py-2 font-semibold text-zinc-700 shadow-sm sm:px-4 sm:py-2.5"
            >
              <CheckCircle2
                size={15}
                className="shrink-0 text-[#7a865f]"
              />
              {item}
            </div>
          ))}
        </div>

        <div className="mt-6">
          <p className="max-w-2xl text-[13px] leading-6 text-zinc-500 sm:text-sm">
            Quer conhecer ainda mais do app? No{" "}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-zinc-800 underline decoration-[#b9963b]/60 underline-offset-4 transition-colors hover:text-zinc-950 hover:decoration-[#b9963b]"
            >
              Instagram do Anest+
            </a>{" "}
            você encontra vídeos explicando as principais funções, telas
e recursos do Anest+.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.08 }}
        className="relative mx-auto mt-8 w-full max-w-[280px] sm:max-w-[320px] lg:mt-0"
      >
        <div className="absolute inset-0 rounded-[32px] bg-[radial-gradient(circle_at_center,rgba(185,150,59,0.22),transparent_68%)] blur-xl sm:rounded-[46px] sm:blur-2xl" />
        <div className="relative">
          <VideoDemo />
        </div>
      </motion.div>
    </div>
  </div>
</section>

      {/* QUEBRA DE OBJEÇÃO DO INTRAOPERATÓRIO */}
      <section id="como-funciona" className="px-5 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-[28px] border border-[#B9963B]/15 bg-[#FAFAF7] px-5 py-8 shadow-[0_24px_60px_-40px_rgba(11,42,58,0.16)] sm:rounded-[36px] sm:px-8 sm:py-10 md:px-10 md:py-12">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-0 top-0 h-36 w-36 rounded-full bg-[#B9963B]/8 blur-3xl" />
              <div className="absolute bottom-0 right-0 h-36 w-36 rounded-full bg-[#22331D]/6 blur-3xl" />
            </div>

            <div className="relative z-10">
<SectionHeading
  center
  eyebrow="Feito para o intraoperatório"
  title="Controle o caso com precisão. Registre sem tirar o foco do paciente."
  desc="Da hemodinâmica aos fármacos, dos parâmetros à evolução, o Anest+ acompanha o ritmo do intraoperatório para transformar dados clínicos em uma ficha clara e organizada."
/>

              <div className="mt-8 grid gap-4 sm:mt-10 md:grid-cols-3">
                <FlowStepCard
                  step="Passo 1"
                  title="Abra o caso com uma estrutura pronta"
                  desc="Paciente, hospital, técnica e dados iniciais entram em uma ficha já organizada para acompanhar a anestesia desde o início."
                />

                <FlowStepCard
                  step="Passo 2"
                  title="Registre sem quebrar o ritmo"
                  desc="Sinais vitais, parâmetros, fluidos, fármacos e evolução são atualizados com poucos toques durante o caso."
                />

                <FlowStepCard
                  step="Passo 3"
                  title="Finalize com clareza"
                  desc="Ao fim do procedimento, a ficha já está legível, padronizada e pronta para revisão, assinatura e exportação."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALIDAÇÃO EM HOSPITAIS */}
      <section className="px-5 pb-4 pt-12 sm:px-6 md:pt-16">
        <div className="mx-auto max-w-5xl text-center">
<p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 sm:text-[12px]">
  Já utilizado em rotina real de centro cirúrgico
</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-6">
            <div className="flex h-[140px] items-center justify-center rounded-[28px] border border-zinc-200 bg-white px-4 shadow-[0_10px_30px_-20px_rgba(11,42,58,0.18)]">
              <Image
                src="/brand/logo-hgvc2.png"
                alt="HGVC"
                width={320}
                height={110}
                sizes="(max-width: 640px) 260px, 320px"
                className="h-auto max-h-[180px] w-auto object-contain"
              />
            </div>

            <div className="flex h-[140px] items-center justify-center rounded-[28px] border border-zinc-200 bg-white px-4 shadow-[0_10px_30px_-20px_rgba(11,42,58,0.18)]">
              <Image
                src="/brand/logo-afranio-peixoto2.png"
                alt="Hospital Afrânio Peixoto"
                width={320}
                height={110}
                sizes="(max-width: 640px) 260px, 320px"
                className="h-auto max-h-[160px] w-auto object-contain"
              />
            </div>
          </div>
<p className="mx-auto mt-5 max-w-2xl text-sm font-medium leading-6 text-zinc-500 sm:text-base">
  Mais de 10 mil fichas anestésicas já registradas em uso individual e institucional.
</p>
        </div>
      </section>

      {/* PROVA SOCIAL */}
<section className="bg-zinc-50/60 px-5 py-14 sm:px-6 md:py-20">
  <div className="mx-auto max-w-6xl">
<SectionHeading
  center
  eyebrow="Uso real na rotina"
  title="Feito para entrar no dia a dia do anestesiologista"
  desc="Na prática, o Anest+ precisa ser rápido, claro e discreto o suficiente para acompanhar o caso sem atrapalhar a condução anestésica."
/>

    <div className="mt-8 grid gap-4 sm:mt-10 md:grid-cols-3">
      <TestimonialCard
        quote="O maior ganho foi chegar ao fim do caso com a ficha praticamente pronta para revisar e exportar."
        author="Daniel M. — Anestesiologista"
      />

      <TestimonialCard
        quote="A leitura final ficou mais clara. Fármacos, horários e descrição aparecem organizados, sem depender da correria do papel."
        author="Isabela T. — Anestesiologista"
      />

      <TestimonialCard
        quote="No plantão, o app ajudou a manter o registro do caso em ordem sem mudar a forma como conduzo a anestesia."
        author="Iago G. — Anestesiologista"
      />
    </div>
  </div>
</section>

      {/* ORIGEM DO PRODUTO */}
<section
  id="problema"
  className="bg-zinc-50/60 px-5 py-12 sm:px-6 md:py-24"
>
  <div className="mx-auto max-w-6xl">
    <div className="grid items-start gap-10 sm:gap-12 lg:grid-cols-[0.94fr_1.06fr]">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7A865F] sm:text-[11px]">
          A origem do produto
        </p>

        <h2 className="mt-3 text-[2rem] font-black leading-[1.1] tracking-tight text-zinc-950 sm:mt-4 sm:text-4xl md:text-5xl">
          Feito por quem conhece a anestesia por dentro.
        </h2>

<p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-zinc-600 sm:mt-5 sm:text-base sm:leading-8 md:text-lg">
  O Anest+ nasceu da rotina do centro cirúrgico: enquanto a atenção principal
  permanece no paciente, sinais, parâmetros, fármacos, horários, evolução e
  detalhes do caso também precisam ser registrados com clareza, precisão e
  continuidade.
</p>

        <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-zinc-500 sm:mt-5 sm:text-base sm:leading-8">
          Em vez de tentar transformar a anestesia em um formulário rígido, o
          app organiza o registro em etapas compatíveis com a prática real:
          abertura do caso, acompanhamento, descrição, assinatura e exportação.
        </p>

        <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#B9963B]/20 bg-white px-4 py-2.5 shadow-sm sm:mt-7 sm:gap-3 sm:rounded-2xl sm:px-5 sm:py-3">
          <ShieldCheck
            size={16}
            className="text-[#7A865F] sm:h-[18px] sm:w-[18px]"
          />
          <span className="text-[12px] font-bold uppercase tracking-wide text-zinc-700 sm:text-sm">
            Local-first, privado e com acesso seguro pela conta Anest+
          </span>
        </div>
      </div>

      <div className="grid gap-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 sm:text-[11px]">
          O que o Anest+ ajuda a reduzir
        </p>

        <div className="rounded-[24px] border border-red-500/10 bg-white p-5 shadow-sm sm:rounded-[28px] sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="mt-0.5 rounded-2xl bg-red-500/10 p-2.5 text-red-400 sm:p-3">
              <AlertCircle
                size={18}
                className="sm:h-[20px] sm:w-[20px]"
              />
            </div>
            <div>
              <h3 className="text-[1.1rem] font-bold tracking-tight text-zinc-950 sm:text-lg">
                Registro disperso
              </h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-zinc-500 sm:mt-2 sm:text-sm sm:leading-7">
                Quando dados do caso ficam espalhados entre memória, papel e
                anotações rápidas, a revisão final se torna mais lenta e menos
                previsível.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-orange-500/10 bg-white p-5 shadow-sm sm:rounded-[28px] sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="mt-0.5 rounded-2xl bg-orange-500/10 p-2.5 text-orange-400 sm:p-3">
              <Clock size={18} className="sm:h-[20px] sm:w-[20px]" />
            </div>
            <div>
              <h3 className="text-[1.1rem] font-bold tracking-tight text-zinc-950 sm:text-lg">
                Fechamento mais demorado
              </h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-zinc-500 sm:mt-2 sm:text-sm sm:leading-7">
                O fim do procedimento costuma concentrar despertar, passagem,
organização da sala e documentação. A ficha não precisa ser
mais um ponto de atraso nesse momento.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#B9963B]/10 bg-white p-5 shadow-sm sm:rounded-[28px] sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="mt-0.5 rounded-2xl bg-[#B9963B]/10 p-2.5 text-[#B9963B] sm:p-3">
              <FileText size={18} className="sm:h-[20px] sm:w-[20px]" />
            </div>
            <div>
              <h3 className="text-[1.1rem] font-bold tracking-tight text-zinc-950 sm:text-lg">
                Documento final pouco padronizado
              </h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-zinc-500 sm:mt-2 sm:text-sm sm:leading-7">
                A legibilidade, a sequência dos dados e a consistência do registro
impactam diretamente a revisão, a guarda do documento e a rotina do hospital.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* 1. NOVO CASO */}
      <section
        id="produto"
        className="bg-zinc-50/60 px-5 py-16 sm:px-6 md:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div className="order-2 flex justify-center lg:order-1 lg:justify-start">
              <ScreenFrame
                src="/screens/produto-novo-caso.jpg"
                alt="Criação de novo caso no Anest+"
                className="max-w-[260px] md:max-w-[320px]"
              />
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-[2rem] font-black leading-[1.1] tracking-tight text-zinc-950 sm:text-4xl md:text-[2.8rem]">
  Abra o caso em poucos passos e siga com a ficha já estruturada
</h2>

<p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#71717A] sm:mt-5 sm:text-base sm:leading-8 md:text-lg">
  O Anest+ organiza os dados iniciais do paciente, procedimento, técnica
  anestésica, hospital e plano em uma ficha pronta para acompanhar o caso
  desde o início.
</p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4">
 {[
  "Paciente e prontuário",
  "ASA, técnica e procedimento",
  "Hospital, plano e identificação",
  "Alergias e observações iniciais",
  "Horário de início do caso",
  "Estrutura pronta para evoluir",
].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-[16px] border border-[#B9963B]/15 bg-white px-4 py-3.5 text-[13px] font-semibold text-zinc-800 shadow-sm sm:rounded-2xl sm:px-5 sm:py-4 sm:text-sm"
                  >
                    <CheckCircle2
                      size={18}
                      className="shrink-0 text-[#B9963B]"
                    />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DURANTE O CASO */}
      <section className="px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 md:mb-14">
            <SectionHeading
              title="Da monitorização à evolução, cada detalhe no lugar certo"
              desc="Durante a anestesia, o Anest+ ajuda a registrar sinais, parâmetros, fluidos, fármacos e evolução com poucos toques — mantendo a ficha organizada enquanto sua atenção permanece na condução clínica."
/>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.96fr_1.04fr] lg:items-start">
            <div className="grid gap-4 md:grid-cols-2">
<FeatureCard
  icon={Activity}
title="Monitorização traduzida em registro"
desc="Frequência, pressão e demais parâmetros acompanham o caso com atualizações rápidas, mantendo a ficha coerente com a condução anestésica."
/>

<FeatureCard
  icon={Settings2}
  title="Parâmetros na mesma tela"
  desc="Monitores, gases, acessos, alergias e ajustes do caso ficam acessíveis sem tirar o anestesiologista da tela principal."
/>

<FeatureCard
  icon={Droplets}
  title="Fluidos com distribuição automática"
  desc="Informe o volume administrado e deixe o app organizar a distribuição na ficha, mantendo o registro mais claro e proporcional."
/>

<FeatureCard
  icon={ClipboardPen}
  title="Evolução construída durante o caso"
  desc="Registre indução, manutenção, intercorrências e destino enquanto o caso acontece, sem depender só da memória no final."
/>

<FeatureCard
  icon={ShieldCheck}
  title="Fármacos com dose e via"
  desc="As medicações ficam registradas de forma estruturada, facilitando conferência, revisão e leitura do documento final."
/>

<FeatureCard
  icon={CheckCircle2}
  title="Sem pendências na saída de sala"
  desc="O registro vai sendo formado durante o caso, eliminando o esforço de puxar tudo da memória no fim da cirurgia."
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
                className="mx-auto hidden max-w-[260px] md:block md:max-w-[280px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. FECHAMENTO DA FICHA */}
      <section className="bg-zinc-50/60 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#B9963B] sm:text-[11px]">
                O alívio no final do plantão
              </p>

              <h2 className="mt-3 text-[2rem] font-black leading-[1.1] tracking-tight text-zinc-950 sm:mt-4 sm:text-4xl md:text-[2.8rem]">
                Termine o caso com a ficha pronta, não com mais trabalho
              </h2>

              <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-[#71717A] sm:mt-5 sm:text-base sm:leading-8 md:text-lg">
                Ao término do procedimento, o registro já está consolidado em
                uma estrutura limpa, legível e padronizada — pronto para
                revisar, assinar, exportar e seguir para a rotina do hospital.
              </p>

              <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2">
<FeatureCard
  compact
  icon={FileCheck2}
  title="Um documento à altura do caso"
  desc="Técnica, fármacos, parâmetros, sinais vitais e descrição ficam reunidos em um PDF claro, coerente e pronto para revisão."
/>

<FeatureCard
  compact
  icon={ShieldCheck}
  title="Menos fragilidade do papel"
  desc="O registro digital reduz rasuras, melhora a leitura e deixa a ficha mais consistente para conferência."
/>

<FeatureCard
  compact
  icon={CheckCircle2}
  title="Revisão mais objetiva"
  desc="Com os dados estruturados, fica mais fácil conferir o caso antes de assinar e exportar."
/>

<FeatureCard
  compact
  icon={Activity}
  title="Pronto para o próximo passo"
  desc="A ficha pode ser impressa, baixada, enviada ou anexada conforme a rotina definida pelo serviço."
/>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[24px] border border-[#B9963B]/15 bg-white p-3 shadow-sm sm:rounded-[36px] sm:p-5 md:p-6">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-0 top-0 h-40 w-40 rounded-full bg-[#B9963B]/5 blur-3xl" />
                <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-[#22331D]/5 blur-3xl" />
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

           {/* ASSINATURA ELETRÔNICA AVANÇADA E VALIDAÇÃO */}
      <section className="px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#B9963B] sm:text-[11px]">
                Assinatura eletrônica avançada
              </p>

		<h2 className="mt-3 text-[2rem] font-black leading-[1.1] tracking-tight text-zinc-950 sm:mt-4 sm:text-4xl md:text-[2.8rem]">
		  Assine, exporte e valide a ficha sem sair do app.
		</h2>

<p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-[#71717A] sm:mt-5 sm:text-base sm:leading-8 md:text-lg">
  Ao finalizar o registro, o Anest+ permite aplicar uma assinatura eletrônica avançada vinculada ao profissional responsável, após autenticação no próprio dispositivo, como Face ID, Touch ID ou código do aparelho.
</p>

<p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-[#71717A] sm:text-base sm:leading-8 md:text-lg">
  O PDF exportado recebe um marcador técnico de confiança com dados de autoria, assinatura e conteúdo assinado. Depois, o arquivo pode ser conferido no validador do Anest+, diretamente pelo site.
</p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/validar"
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-[#B9963B]/25 bg-[#FAFAF7] px-6 text-[14px] font-bold text-zinc-900 shadow-sm transition-all hover:bg-[#F6F4EB]"
                >
                  Validar uma ficha
                  <ChevronRight className="ml-2" size={17} />
                </Link>

                <a
                  href={OFFER_CODE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#162014] px-6 text-[14px] font-bold text-white shadow-sm transition-all hover:bg-[#22331D]"
                >
                  Testar no próximo plantão
                </a>
              </div>
            </div>

            <div className="grid gap-4">
<FeatureCard
  compact
  icon={ShieldCheck}
  title="Autenticação do profissional"
  desc="A assinatura é aplicada somente após confirmação no dispositivo, como Face ID, Touch ID ou código do aparelho."
/>

              <FeatureCard
                compact
                icon={FileCheck2}
                title="Camada criptográfica no PDF"
                desc="O Anest+ gera uma assinatura digital vinculada ao conteúdo da ficha, ao profissional e ao momento da assinatura."
              />

              <FeatureCard
                compact
                icon={QrCode}
                title="Validador Anest+"
                desc="O PDF pode ser enviado ao validador do site para conferir os dados técnicos da assinatura e a integridade esperada do documento."
              />

              <FeatureCard
                compact
                icon={ClipboardList}
                title="Rastreabilidade do registro"
                desc="A ficha assinada carrega informações técnicas de autoria, assinatura, data, chave pública e conteúdo assinado."
              />
            </div>
          </div>
        </div>
      </section>

 {/* CONTA ANEST+ */}
<section className="bg-zinc-50/60 px-5 py-16 sm:px-6 md:py-24">
  <div className="mx-auto max-w-6xl">
    <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
      <div>
<SectionHeading
  eyebrow="Conta Anest+"
  title="A ponte entre o seu celular e o sistema do hospital"
  desc="Quando a sincronização estiver ativada, seus casos concluídos ficam disponíveis em um painel web seguro por tempo limitado. Assim, você pode localizar, revisar, imprimir ou encaminhar a ficha ao prontuário eletrônico do hospital com mais facilidade."
/>

<div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
  <Link
    href="/pro/login"
    className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#162014] px-6 text-[14px] font-bold text-white shadow-sm transition-all hover:bg-[#22331D]"
  >
    Acessar Conta Anest+
    <ChevronRight className="ml-2" size={17} />
  </Link>

  <Link
    href="/validar"
    className="inline-flex h-12 items-center justify-center rounded-2xl border border-[#B9963B]/25 bg-[#FAFAF7] px-6 text-[14px] font-bold text-zinc-900 shadow-sm transition-all hover:bg-[#F6F4EB]"
  >
    Validar uma ficha
  </Link>
</div>

<div className="mt-8 grid gap-4 sm:grid-cols-2">
          <FeatureCard
            compact
            icon={FileText}
            title="Histórico de fichas"
            desc="Acesse os casos exportados recentemente, organizados por data e status."
          />

          <FeatureCard
            compact
            icon={ClipboardList}
            title="Busca rápida"
            desc="Localize a ficha certa por nome do paciente ou número do prontuário."
          />

          <FeatureCard
            compact
            icon={HardDrive}
            title="Download pelo computador"
            desc="Baixe seus PDFs para impressão, revisão ou anexação no sistema utilizado pelo hospital."
          />

          <FeatureCard
            compact
            icon={EyeOff}
            title="Disponibilidade temporária"
            desc="As fichas sincronizadas ficam disponíveis por até 30 dias e depois são removidas da infraestrutura do Anest+."
          />
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[28px] border border-[#B9963B]/15 bg-white p-4 shadow-[0_24px_70px_-42px_rgba(11,42,58,0.22)] sm:rounded-[36px] sm:p-6">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-0 h-40 w-40 rounded-full bg-[#B9963B]/5 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-[#22331D]/5 blur-3xl" />
        </div>

        <div className="relative z-10 rounded-[24px] border border-zinc-200 bg-[#FAFAF7] p-4 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7A865F]">
                Conta Anest+
              </p>
              <h3 className="mt-1 text-xl font-black tracking-tight text-zinc-950">
                Painel de fichas
              </h3>
            </div>

            <div className="rounded-full border border-[#B9963B]/20 bg-[#FAFAF7] px-3 py-1.5 text-xs font-bold text-[#506047]">
              Sincronizado
            </div>
          </div>

          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
                Fichas
              </p>
              <p className="mt-2 text-3xl font-black text-zinc-950">24</p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
                Janela
              </p>
              <p className="mt-2 text-xl font-black text-zinc-950">
                30 dias
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
                Formato
              </p>
              <p className="mt-2 text-xl font-black text-zinc-950">PDF</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            <div className="grid grid-cols-[1.3fr_1fr_1fr] gap-3 border-b border-zinc-100 bg-zinc-50 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400">
              <span>Paciente</span>
              <span>Status</span>
              <span className="text-right">Ação</span>
            </div>

            {[
              ["Paciente A.", "Pronto", "Baixar"],
              ["Paciente B.", "Baixado", "Baixar"],
              ["Paciente C.", "Pronto", "Baixar"],
            ].map((row) => (
              <div
                key={row.join("-")}
                className="grid grid-cols-[1.3fr_1fr_1fr] gap-3 border-b border-zinc-100 px-4 py-3 text-xs text-zinc-700 last:border-b-0"
              >
                <span className="font-bold">{row[0]}</span>
                <span
                  className={
                    row[1] === "Pronto"
                      ? "font-bold text-[#7A865F]"
                      : "font-bold text-zinc-400"
                  }
                >
                  {row[1]}
                </span>
                <span className="text-right font-bold text-[#B9963B]">
                  {row[2]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* 4. TRANSIÇÃO PARA EXTRAS */}
      <section className="px-5 py-16 text-center sm:px-6 md:py-24">
        <div className="mx-auto max-w-4xl">
          <SectionHeading
            center
            eyebrow="Recursos complementares"
            title="O Anest+ continua te ajudando fora da sala"
            desc="Depois de resolver o que mais pesa no intraoperatório, o Anest+ também organiza plantões, protocolos e outros pontos da rotina do anestesiologista."
          />
        </div>
      </section>

      {/* 5. CALENDÁRIO */}
      <section className="bg-zinc-50/60 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div>
              <h2 className="text-[2rem] font-black leading-[1.1] tracking-tight text-zinc-950 sm:text-4xl md:text-[2.8rem]">
                Plantões organizados no mesmo ecossistema
              </h2>
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#71717A] sm:mt-5 sm:text-base sm:leading-8 md:text-lg">
                Além da ficha anestésica, o app também ajuda a visualizar sua
                agenda, organizar plantões e manter a rotina menos espalhada.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4">
{[
  "Agenda de plantões",
  "Recorrências configuráveis",
  "Atividades por hospital",
  "Rotina menos espalhada",
].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-[16px] border border-[#B9963B]/15 bg-white px-4 py-3.5 text-[13px] font-semibold text-zinc-800 shadow-sm sm:rounded-2xl sm:px-5 sm:py-4 sm:text-sm"
                  >
                    <CheckCircle2
                      size={18}
                      className="shrink-0 text-[#B9963B]"
                    />
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

      {/* 6. BASE E RECURSOS EXTRAS */}
      <section className="px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
<SectionHeading
  eyebrow="Recursos de apoio"
  title="Protocolos, hospitais e atalhos para uma rotina mais fluida"
  desc="Além do registro anestésico, o Anest+ reúne recursos que ajudam no dia a dia: hospitais salvos, textos dinâmicos, presets próprios, grades de monitorização, passagem por QR Code e controle financeiro."
/>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div className="grid gap-4 md:grid-cols-2">
              <FeatureCard
  compact
  icon={Building2}
  title="Hospitais salvos"
  desc="Mantenha identidade, nome e logotipo dos locais onde você atua prontos para aparecer no PDF."
/>

<FeatureCard
  compact
  icon={ClipboardPen}
  title="Descrição dinâmica"
  desc="Use textos-base para iniciar a evolução anestésica com mais rapidez, sem escrever tudo do zero."
/>

<FeatureCard
  compact
  icon={Settings2}
  title="Presets próprios"
  desc="Salve estruturas de técnicas, medicamentos e parâmetros usados com frequência na sua rotina."
/>

<FeatureCard
  compact
  icon={Activity}
  title="Grades de monitorização"
  desc="Monte modelos de acompanhamento compatíveis com diferentes técnicas anestésicas."
/>

<FeatureCard
  compact
  icon={QrCode}
  title="Passagem via QR Code"
  desc="Compartilhe dados de casos em andamento de forma rápida quando houver necessidade de passagem."
/>

<FeatureCard
  compact
  icon={Wallet}
  title="Controle financeiro"
  desc="Acompanhe plantões e valores da sua rotina profissional junto ao restante do ecossistema."
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
                className="mx-auto hidden max-w-[260px] sm:block md:max-w-[280px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SEGURANÇA */}
<section
  id="seguranca"
  className="mx-4 my-6 rounded-[32px] bg-zinc-950 px-5 py-12 text-white shadow-2xl sm:my-8 sm:rounded-[40px] sm:px-6 sm:py-16 md:py-20"
>
  <div className="mx-auto max-w-6xl">
    <SectionHeading
      light
      eyebrow="Segurança e privacidade"
      title="Precisão no cuidado. Clareza no documento."
      desc="O Anest+ combina registro local-first, autenticação do profissional, assinatura eletrônica avançada, validação do PDF e disponibilidade temporária das fichas sincronizadas."
    />

    <div className="mt-8 grid gap-4 sm:mt-10 md:grid-cols-3">
      <FeatureCard
        light
        compact
        icon={HardDrive}
        title="Registro local-first"
        desc="A ficha é criada e atualizada no dispositivo, mantendo o uso rápido durante o caso e reduzindo dependência de conexão no intraoperatório."
      />

      <FeatureCard
        light
        compact
        icon={ShieldCheck}
        title="Assinatura eletrônica avançada"
        desc="O PDF pode ser assinado após autenticação do profissional e conferido posteriormente pelo validador do Anest+."
      />

      <FeatureCard
        light
        compact
        icon={EyeOff}
        title="Retenção limitada"
        desc="Quando sincronizadas, as fichas ficam disponíveis por até 30 dias para revisão e download, sendo removidas depois desse período."
      />
    </div>

    <div className="mt-8 rounded-[24px] border border-[#B9963B]/20 bg-[#B9963B]/5 p-5 text-center text-[13px] leading-6 text-zinc-300 sm:mt-10 sm:p-6 sm:text-sm sm:leading-7">
      O Anest+ organiza o registro e gera um documento técnico mais claro, mas não substitui a avaliação clínica do anestesiologista nem a guarda documental definitiva pelo hospital ou serviço responsável.
    </div>
  </div>
</section>

      {/* FAQ */}
<section id="faq" className="px-5 py-12 sm:px-6 md:py-16">
  <div className="mx-auto max-w-4xl">
    <SectionHeading
      center
      eyebrow="Dúvidas frequentes"
      title="Respostas diretas sobre uso e rotina"
    />

    <div className="mt-8 grid gap-3 sm:mt-10 sm:gap-4 md:grid-cols-2">
      <FAQCard
        title="O Anest+ substitui a ficha de papel do hospital?"
        desc="Ele foi criado para organizar o registro anestésico e gerar um PDF final claro, legível e assinável. Em ambientes institucionais, o uso deve seguir a rotina definida pelo hospital ou serviço."
      />

      <FAQCard
        title="Vou perder tempo olhando para a tela durante o caso?"
        desc="Não. A interface foi pensada para interações rápidas, com poucos toques, para que o registro acompanhe o caso sem virar uma tarefa paralela pesada."
      />

      <FAQCard
        title="Onde e por quanto tempo ficam salvas minhas fichas?"
        desc="O registro é criado no dispositivo. Quando a sincronização estiver ativada, uma cópia fica disponível na Conta Anest+ por até 30 dias para revisão, download ou impressão. Após esse prazo, ela é removida da infraestrutura do Anest+."
      />

      <FAQCard
        title="Como funciona a assinatura eletrônica avançada?"
        desc="Antes de assinar, o profissional autentica no dispositivo. Depois, o Anest+ aplica uma camada técnica ao PDF com dados de autoria, assinatura e conteúdo assinado, permitindo conferência posterior no validador do site."
      />
    </div>
  </div>
</section>

      {/* CONTATO */}
      <section
        id="contato"
        className="border-t border-zinc-200/60 bg-zinc-50 px-5 py-12 sm:px-6 md:py-16"
      >
        <div className="mx-auto max-w-4xl">
          <SectionHeading
            center
            eyebrow="Contato"
            title="Fale com o Anest+"
            desc="Tire dúvidas, envie feedbacks ou peça suporte direto para nossa equipe."
          />

          <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5">
            <a
              href={`mailto:${EMAIL}`}
              className="group flex flex-col items-center rounded-[24px] border border-zinc-200/80 bg-white p-5 text-center shadow-sm transition-all hover:border-[#B9963B]/40 hover:shadow-md sm:rounded-[28px] sm:p-7"
            >
              <div className="mb-3 inline-flex rounded-[14px] bg-zinc-50 p-2.5 transition-colors group-hover:bg-[#B9963B]/10 sm:mb-4 sm:rounded-2xl sm:p-3">
                <Mail
                  className="text-[#B9963B] sm:h-[24px] sm:w-[24px]"
                  size={22}
                />
              </div>
              <h3 className="text-[1.1rem] font-bold text-zinc-950 sm:text-lg">
                E-mail
              </h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-zinc-500 sm:mt-2 sm:text-sm sm:leading-7">
                Parcerias e solicitações formais.
              </p>
              <span className="mt-2.5 text-[14px] font-bold text-[#B9963B] underline decoration-[#B9963B]/30 underline-offset-4 sm:mt-3 sm:text-sm">
                {EMAIL}
              </span>
            </a>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center rounded-[24px] border border-zinc-200/80 bg-white p-5 text-center shadow-sm transition-all hover:border-[#B9963B]/40 hover:shadow-md sm:rounded-[28px] sm:p-7"
            >
              <div className="mb-3 inline-flex rounded-[14px] bg-zinc-50 p-2.5 transition-colors group-hover:bg-[#B9963B]/10 sm:mb-4 sm:rounded-2xl sm:p-3">
                <MessageCircle
                  className="text-[#7A865F] sm:h-[24px] sm:w-[24px]"
                  size={22}
                />
              </div>
              <h3 className="text-[1.1rem] font-bold text-zinc-950 sm:text-lg">
                WhatsApp
              </h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-zinc-500 sm:mt-2 sm:text-sm sm:leading-7">
                Dúvidas rápidas, sugestões e suporte.
              </p>
              <span className="mt-2.5 text-[14px] font-bold text-[#B9963B] underline decoration-[#B9963B]/30 underline-offset-4 sm:mt-3 sm:text-sm">
                (71) 99228-8755
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="px-4 pb-16 pt-6 sm:px-6 sm:pb-20 sm:pt-8">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[32px] bg-[#22331D] px-6 py-12 text-center text-white shadow-2xl sm:rounded-[40px] sm:px-8 sm:py-16 md:px-14"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(185,150,59,0.18),transparent_45%)]" />
            <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(#B9963B_1px,transparent_1px)] [background-size:24px_24px]" />

            <div className="relative z-10 mx-auto max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#D9C57D] sm:px-4 sm:py-2 sm:text-[11px]">
                Criado por quem vive o centro cirúrgico
              </div>

              <h2 className="text-[2rem] font-black leading-[1.05] tracking-tight text-white sm:text-4xl md:text-[3.5rem] lg:leading-[1.04]">
                Leve o Anest+ para um plantão real.
                <br />
                Finalize o caso com um registro à altura da sua anestesia.
              </h2>

<p className="mt-4 text-[15px] leading-relaxed text-[#d8dccf] sm:mt-6 sm:text-lg sm:leading-8 md:text-xl">
  Use o Anest+ em um plantão real e veja a ficha ganhar forma ao longo do caso:
  dados organizados, revisão objetiva, assinatura, validação e exportação.
</p>

              <div className="mt-8 flex flex-col items-center justify-center">
                <div className="inline-flex flex-col gap-3 rounded-2xl border border-[#B9963B]/30 bg-black/20 p-2 shadow-sm backdrop-blur-md sm:flex-row sm:items-center sm:pr-5">
                  <span className="flex h-9 items-center justify-center rounded-xl bg-[#B9963B] px-4 text-[12px] font-black text-[#162014] shadow-sm sm:text-[13px]">
                    ANESTFRIEND
                  </span>
                  <span className="text-center text-[14px] font-medium text-[#d8dccf] sm:text-left sm:text-[15px]">
                    Ative 7 dias grátis e teste em um plantão real, sem compromisso.
                  </span>
                </div>
              </div>

              <div className="mt-8 flex flex-col flex-wrap justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
                <a
                  href={OFFER_CODE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-[14px] bg-[#B9963B] px-6 py-3.5 text-[15px] font-black text-[#162014] shadow-2xl transition-transform hover:scale-[1.02] sm:rounded-2xl sm:px-8 sm:py-4 sm:text-base"
                >
                  Testar no próximo plantão
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
          <p>
            © {new Date().getFullYear()} Anest+. Todos os direitos reservados.
          </p>

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

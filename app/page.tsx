"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { gsap, useGSAP } from "@/lib/animations/gsap";
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
const WHATSAPP_URL =
  "https://wa.me/5571992288755?text=Ol%C3%A1%2C%20estava%20no%20site%20do%20Anest%2B%20e%20queria%20tirar%20uma%20d%C3%BAvida.";
const INSTAGRAM_URL = "https://instagram.com/anestplus";
const EMAIL = "anestplus@outlook.com";

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
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
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
          } ${center ? "mx-auto max-w-2xl" : "max-w-2xl"}`}
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
  className = "",
}: {
  title: string;
  desc: string;
  icon: LucideIcon;
  compact?: boolean;
  light?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`group relative flex h-full flex-col overflow-hidden rounded-[24px] border shadow-sm transition-colors duration-300 md:rounded-[28px] ${
        light
          ? "border-white/10 bg-white/5 hover:border-[#B9963B]/35 hover:bg-white/[0.07]"
          : "border-zinc-200/80 bg-white hover:border-[#B9963B]/35"
      } ${compact ? "p-5" : "p-6 md:p-7"} ${className}`}
    >
      {!light ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-[#B9963B]/0 to-[#B9963B]/[0.03] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#B9963B]/5 blur-2xl transition-colors duration-300 group-hover:bg-[#B9963B]/10" />
        </>
      ) : null}

      <div
        className={`relative z-10 mb-5 flex items-center gap-3 rounded-2xl px-3.5 py-2.5 transition-colors duration-300 sm:px-4 sm:py-3 ${
          light
            ? "bg-white/10 text-[#D9C57D]"
            : "bg-zinc-50 text-[#7A865F] group-hover:bg-[#B9963B]/10 group-hover:text-[#B9963B]"
        }`}
      >
        <Icon
          size={20}
          className="shrink-0 sm:h-[22px] sm:w-[22px]"
          strokeWidth={1.7}
        />

        <h3
          className={`font-bold tracking-tight ${
            compact
              ? "text-[1rem] leading-snug md:text-[1.12rem]"
              : "text-[1.05rem] leading-snug md:text-[1.18rem]"
          } ${light ? "text-white" : "text-zinc-950"}`}
        >
          {title}
        </h3>
      </div>

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
    <div className="h-full rounded-[20px] border border-zinc-200/80 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#B9963B]/30 hover:shadow-md sm:p-6 md:rounded-[24px]">
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
    <div className="h-full rounded-[20px] border border-zinc-200/80 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#B9963B]/30 hover:shadow-md sm:p-6 md:rounded-[24px]">
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
  className = "",
}: {
  title: string;
  desc: string;
  className?: string;
}) {
  return (
    <div className={`h-full rounded-[20px] border border-zinc-200/80 bg-white p-5 shadow-sm transition-all hover:border-[#B9963B]/30 hover:shadow-md sm:p-6 md:rounded-[24px] ${className}`}>
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

          <div className="absolute bottom-3 left-3 right-3 rounded-2xl border border-[#B9963B]/25 bg-[#FAFAF7]/95 p-3 text-zinc-950 shadow-lg backdrop-blur-md sm:bottom-4 sm:left-4 sm:right-4 sm:p-4">
  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7A865F]">
    Veja em ação
  </p>
  <p className="mt-1 text-sm font-black leading-tight text-zinc-950 sm:text-base">
    Vídeo real do app.
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
  const [isHeaderSolid, setIsHeaderSolid] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);
  const heroMediaRef = useRef<HTMLVideoElement | null>(null);
  const tensionLayerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  useEffect(() => {
  function handleScroll() {
    const scrollY = window.scrollY;
    const heroBottom = heroRef.current?.offsetHeight ?? window.innerHeight;

    setShowStickyCta(scrollY > 620);
    setIsHeaderSolid(scrollY >= heroBottom - 88);
  }

  handleScroll();

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", handleScroll);

  return () => {
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("resize", handleScroll);
  };
}, []);

  const navLinks = [
    { href: "#produto", label: "Produto" },
    { href: "#como-funciona", label: "Como funciona" },
    { href: "#seguranca", label: "Segurança" },
    { href: "#faq", label: "FAQ" },
    { href: "#contato", label: "Contato" },
  ];

const isLightHeader = isMenuOpen || isHeaderSolid;

  useGSAP(
    () => {
      const hero = heroRef.current;
      const tensionLayer = tensionLayerRef.current;

      if (!hero) {
        return;
      }

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const words = gsap.utils.toArray<HTMLElement>(".hero-word", hero);
      const introItems = gsap.utils.toArray<HTMLElement>(
        ".hero-intro-item",
        hero,
      );

      if (reducedMotion) {
        gsap.set([words, introItems], {
          clearProps: "all",
          opacity: 1,
        });
        gsap.set(tensionLayer, { opacity: 0 });
        return;
      }

      gsap.set(words, { yPercent: 110, opacity: 0 });
      gsap.set(introItems, { y: 20, opacity: 0 });
      gsap.set(tensionLayer, { opacity: 1 });

      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

      timeline
        .to(tensionLayer, {
          opacity: 0,
          duration: 1,
          ease: "expo.out",
          delay: 0.28,
        })
        .to(
          words,
          {
            yPercent: 0,
            opacity: 1,
            duration: 1.05,
            stagger: 0.055,
            ease: "expo.out",
          },
          "-=0.48",
        )
        .to(
          introItems,
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            stagger: 0.08,
          },
          "-=0.55",
        );

      return () => {
        timeline.kill();
      };
    },
    { scope: heroRef },
  );

  return (
    <div className="min-h-screen bg-white text-zinc-950 selection:bg-[#162014] selection:text-white">
      {/* HEADER */}
<header
  className={`fixed top-0 z-[100] w-full border-b transition-colors duration-300 print:hidden ${
    isMenuOpen
      ? "border-zinc-200 bg-white text-zinc-950"
      : isHeaderSolid
      ? "border-zinc-200/55 bg-white/58 text-zinc-950 backdrop-blur-md"
      : "border-white/10 bg-black/[0.08] text-white backdrop-blur-sm"
  }`}
>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 sm:px-6">
          <Link
            href="/"
            className={`flex items-center gap-3 ${
  isLightHeader ? "text-zinc-950" : "text-white"
}`}
          >
            <Image
              src="/brand/anest-symbol.png"
              alt="Logo do Anest+"
              width={44}
              height={44}
              className={`h-10 w-10 rounded-[10px] object-cover ring-1 sm:h-11 sm:w-11 ${
  isLightHeader ? "ring-zinc-200" : "ring-white/20"
}`}
              priority
            />
            <span className="text-[1.5rem] font-black tracking-[-0.06em] sm:text-[1.7rem]">
              ANEST<span className="text-[#B9963B]">+</span>
            </span>
          </Link>

          <nav
            className={`hidden items-center gap-5 text-[12px] font-bold uppercase tracking-wider xl:flex xl:gap-8 xl:text-[13px] ${
  isLightHeader ? "text-zinc-500" : "text-white/64"
}`}
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`transition-colors ${
  isLightHeader ? "hover:text-zinc-950" : "hover:text-white"
}`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 xl:gap-3">
<Link
  href="/institucional"
  className={`hidden h-10 items-center rounded-xl border px-4 text-[13px] font-bold shadow-sm transition-all lg:inline-flex xl:px-5 ${
  isLightHeader
    ? "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
    : "border-white/14 bg-white/[0.07] text-white/80 hover:bg-white/[0.12] hover:text-white"
}`}
>
  Para Grupos e Hospitais
</Link>

<Link
  href="/pro/login"
  className={`hidden h-10 items-center whitespace-nowrap rounded-xl border px-4 text-[13px] font-bold shadow-sm transition-all lg:inline-flex xl:px-5 ${
  isLightHeader
    ? "border-[#B9963B]/25 bg-[#FAFAF7] text-zinc-800 hover:bg-[#F6F4EB]"
    : "border-[#D9C57D]/30 bg-[#D9C57D]/10 text-white hover:bg-[#D9C57D]/16"
}`}
>
  Conta Anest+
</Link>

<a
  href={OFFER_CODE_URL}
  target="_blank"
  rel="noopener noreferrer"
  className={`hidden h-10 items-center rounded-xl px-5 text-[13px] font-bold shadow-sm transition-all lg:inline-flex ${
  isLightHeader
    ? "bg-[#162014] text-white hover:bg-[#22331D]"
    : "border border-white/16 bg-white/[0.10] text-white hover:bg-white/[0.16]"
}`}
>
  Testar 7 dias grátis
</a>

            <button
              type="button"
              aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`relative z-50 flex h-10 w-10 items-center justify-center rounded-xl border shadow-sm lg:hidden ${
  isLightHeader
    ? "border-zinc-200 bg-white text-zinc-900"
    : "border-white/15 bg-white/10 text-white"
}`}
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
  Para grupos e serviços
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
              Testar 7 dias grátis
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
    Testar 7 dias grátis
  </a>
) : null}

      {/* HERO */}
<section
  ref={heroRef}
  className="relative flex min-h-[94svh] overflow-hidden bg-[#08100d] px-5 pb-10 pt-28 text-white sm:px-6 md:min-h-[92svh] md:pt-32 lg:min-h-[92svh]"
>
  <div className="absolute inset-0">
<video
  ref={heroMediaRef}
  className="absolute inset-0 h-full w-full object-cover object-[86%_center] opacity-90 md:object-[76%_center] lg:object-[82%_center] xl:object-center"
  autoPlay
  muted
  loop
  playsInline
  preload="metadata"
  poster="/screens/anest-hero-generated.png"
  aria-label="Ambiente de centro cirúrgico com monitorização anestésica"
>
  <source src="/videos/anest-hero-atmosphere.mp4" type="video/mp4" />
</video>
    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,8,6,0.94)_0%,rgba(4,8,6,0.76)_34%,rgba(4,8,6,0.24)_68%,rgba(4,8,6,0.48)_100%)]" />
    <div
      ref={tensionLayerRef}
      className="absolute inset-0 bg-[#050907]"
      aria-hidden="true"
    />
  </div>

  <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 items-end pb-10 sm:pb-12 lg:items-center lg:pb-0">
    <div className="max-w-5xl">
      <div className="hero-intro-item flex flex-wrap gap-2">
        {[
          "Anest+",
          "Criado por um anestesiologista",
          "Feito para a rotina real da anestesia",
        ].map((item) => (
          <span
            key={item}
            className="inline-flex items-center rounded-full border border-white/14 bg-white/[0.08] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#E7D79A] backdrop-blur-md sm:px-4 sm:text-[11px]"
          >
            {item}
          </span>
        ))}
      </div>

      <h1 className="mt-5 max-w-5xl text-[clamp(2.35rem,5vw,5rem)] font-black leading-[0.98] tracking-tight text-white sm:mt-6">
  <span className="block">
    {["Uma", "anestesia", "bem", "conduzida"].map((word) => (
      <span
        key={word}
        className="mr-[0.16em] inline-block overflow-hidden pb-[0.08em]"
      >
        <span className="hero-word inline-block will-change-transform">
          {word}
        </span>
      </span>
    ))}
  </span>

  <span className="block">
  {["merece", "uma", "ficha", "à", "altura."].map((word) => (
    <span
      key={word}
      className="mr-[0.16em] inline-block overflow-hidden pb-[0.08em]"
    >
      <span className="hero-word inline-block text-[#E0CF8A] will-change-transform">
        {word}
      </span>
    </span>
  ))}
</span>
</h1>

<p className="hero-intro-item mt-4 max-w-2xl text-base leading-7 text-white/76 sm:text-lg sm:leading-8 md:text-xl">
  O Anest+ ajuda você a registrar sinais, fármacos, parâmetros, evolução e
  eventos importantes enquanto o caso acontece. No final, revise, assine e
  exporte uma ficha clara, legível e compatível com a qualidade da sua anestesia.
</p>

      <div className="hero-intro-item mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <a
          href={OFFER_CODE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-14 items-center justify-center rounded-2xl bg-white px-7 text-[15px] font-black text-[#111A0F] shadow-2xl shadow-black/20 transition-all hover:bg-[#F4E8C1] sm:text-base"
        >
          Testar 7 dias grátis
          <ChevronRight className="ml-2" size={18} />
        </a>

        <a
          href={APPSTORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-14 items-center justify-center rounded-2xl border border-white/16 bg-white/[0.08] px-7 text-[15px] font-bold text-white backdrop-blur-md transition-all hover:bg-white/[0.14] sm:text-base"
        >
          Ver na App Store
        </a>
      </div>

      <div className="hero-intro-item mt-5 flex max-w-4xl flex-wrap gap-2 text-[12px] text-white/76 sm:gap-3 sm:text-sm">
        {[
          "Ficha pronta no fim do caso",
          "Detalhes clínicos preservados",
          "Assinatura e rastreabilidade",
        ].map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-2 rounded-full border border-white/13 bg-white/[0.07] px-3 py-2 font-semibold backdrop-blur-md sm:px-4"
          >
            <CheckCircle2 size={15} className="shrink-0 text-[#D9C57D]" />
            {item}
          </span>
        ))}
      </div>
    </div>
  </div>

</section>

      {/* PROVA REAL DO APP */}
      <section className="border-b border-zinc-200/70 bg-white px-5 py-14 sm:px-6 md:py-18">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_0.7fr] lg:items-center">
          <div>
            

            <h2 className="mt-5 max-w-3xl text-[1.9rem] font-black leading-[1.08] tracking-tight text-zinc-950 sm:text-4xl md:text-[2.8rem]">
              Veja o Anest+ funcionando antes de baixar.
            </h2>

            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-zinc-600 sm:text-base sm:leading-8 md:text-lg">
              O vídeo real do app mostra a criação da ficha na prática, com
              telas, fluxos e recursos que sustentam o registro anestésico
              durante o caso.
            </p>

            <div className="mt-6 space-y-2 text-[13px] leading-6 text-zinc-500 sm:text-sm">
              <p>
                Disponível para iPhone e iPad. Use em um plantão real antes de
                decidir.
              </p>
              <p>
                7 dias grátis. Depois, R$ 89,90/mês. Cancele quando quiser pela
                App Store.
              </p>
              <p>
                O código{" "}
                <span className="font-bold text-zinc-800">ANESTFRIEND</span>{" "}
                já vai aplicado no resgate para liberar 7 dias grátis.
              </p>
            </div>

            <p className="mt-5 max-w-2xl text-[13px] leading-6 text-zinc-500 sm:text-sm">
              Quer ver mais do app em uso real? No{" "}
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-zinc-800 underline decoration-[#b9963b]/60 underline-offset-4 transition-colors hover:text-zinc-950 hover:decoration-[#b9963b]"
              >
                Instagram do Anest+
              </a>{" "}
              você encontra vídeos curtos mostrando telas, fluxos e recursos do
              Anest+ na prática.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            viewport={{ once: true, margin: "-80px" }}
            className="relative mx-auto w-full max-w-[320px]"
          >
            <div className="absolute inset-0 rounded-[36px] bg-[radial-gradient(circle_at_center,rgba(185,150,59,0.2),transparent_68%)] blur-2xl" />
            <div className="relative">
              <VideoDemo />
            </div>
          </motion.div>
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
  desc="Da hemodinâmica aos fármacos, dos parâmetros à evolução, o Anest+ acompanha o ritmo da sua anestesia e ajuda a transformar detalhes relevantes em uma ficha clara, organizada e fácil de revisar."
/>

              <div className="mt-8 grid gap-4 sm:mt-10 md:grid-cols-3">
                <FlowStepCard
                  step="Passo 1"
                  title="Comece com contexto clínico organizado"
                  desc="Paciente, hospital, técnica, procedimento, ASA, alergias e dados iniciais entram em uma ficha preparada para acompanhar a anestesia desde a indução."
                />

                <FlowStepCard
                  step="Passo 2"
                  title="Registre sem quebrar o ritmo do caso"
desc="Sinais vitais, parâmetros, fluidos, fármacos, intercorrências e decisões ficam organizados com poucos toques enquanto o paciente está sob seus cuidados."
                />

                <FlowStepCard
                  step="Passo 3"
                  title="Finalize com uma ficha à altura da sua anestesia"
                  desc="Ao fim do procedimento, o registro já está organizado para revisar, assinar, validar e exportar com mais fluidez na saída de sala."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALIDAÇÃO EM HOSPITAIS */}
      <section className="px-5 pb-4 pt-10 sm:px-6 md:pt-14">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 sm:text-[12px]">
            Já em uso na rotina de centros cirúrgicos como:
          </p>

          <div className="mx-auto mt-6 flex max-w-3xl flex-col items-center justify-center gap-8 sm:flex-row sm:gap-14">
            <div className="flex h-16 items-center justify-center opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0 sm:h-20">
              <Image
                src="/brand/logo-hgvc2.png"
                alt="HGVC"
                width={320}
                height={110}
                sizes="(max-width: 640px) 260px, 320px"
                className="h-auto max-h-16 w-auto object-contain sm:max-h-20"
              />
            </div>

            <div className="flex h-16 items-center justify-center opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0 sm:h-20">
              <Image
                src="/brand/logo-afranio-peixoto2.png"
                alt="Hospital Afrânio Peixoto"
                width={320}
                height={110}
                sizes="(max-width: 640px) 260px, 320px"
                className="h-auto max-h-14 w-auto object-contain sm:max-h-16"
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
  title="Feito para quem leva cada detalhe do caso a sério"
  desc="No centro cirúrgico, o registro precisa acompanhar a anestesia sem tomar o lugar da vigilância clínica. O Anest+ foi pensado para quem quer chegar ao fim do caso com a ficha praticamente pronta para revisar e exportar."
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

      {/* PARA QUEM E */}
<section className="px-5 py-14 sm:px-6 md:py-20">
  <div className="mx-auto max-w-6xl">
<SectionHeading
  center
  eyebrow="Para quem é"
  title="Para anestesiologistas que tratam o registro como parte da qualidade do cuidado."
  desc="O Anest+ foi feito para quem registra casos com frequência, atua em plantões, circula por diferentes hospitais e entende que a ficha também precisa acompanhar o padrão da sua conduta."
/>

    <div className="mt-8 grid gap-4 sm:mt-10 md:grid-cols-2 lg:grid-cols-4">
<FeatureCard
  compact
  icon={Clock}
  title="Para quem quer agilidade"
  desc="Abra, conduza e finalize casos com mais fluidez, sem deixar toda a ficha para o fim do procedimento."
/>

<FeatureCard
  compact
  icon={Building2}
  title="Para quem atua em vários hospitais"
  desc="Mantenha hospitais, logos e padrões de identificação prontos para gerar fichas compatíveis com cada local de atuação."
/>

<FeatureCard
  compact
  icon={FileText}
  title="Para quem registra muitos casos"
  desc="Transforme sinais, fármacos, horários, parâmetros e evolução em um PDF final claro, com leitura mais limpa para revisão e rotina do serviço."
/>

<FeatureCard
  compact
  icon={ShieldCheck}
  title="Para quem valoriza autoria"
  desc="Assinatura, validação e rastreabilidade reforçam a identificação do profissional responsável pela ficha."
/>
    </div>
  </div>
</section>


      {/* PONTE INSTITUCIONAL */}
      <section className="px-5 pb-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-[28px] border border-[#B9963B]/15 bg-[#FAFAF7] px-5 py-7 shadow-[0_18px_50px_-36px_rgba(22,32,20,0.18)] sm:rounded-[32px] sm:px-7 sm:py-8 md:px-8">
            <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#B9963B]/10 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7A865F] sm:text-[11px]">
                  Para equipes
                </p>

                <h2 className="mt-2 text-[1.45rem] font-black leading-tight tracking-tight text-zinc-950 sm:text-2xl md:text-[1.9rem]">
                  Coordena um grupo ou serviço de anestesiologia?
                </h2>

                <p className="mt-3 text-[14px] leading-7 text-zinc-600 sm:text-base">
                  Conheça o fluxo institucional do Anest+ para padronizar fichas,
                  presets, assinatura, produção e conferência em uma rotina de equipe.
                </p>
              </div>

              <Link
                href="/institucional"
                className="inline-flex h-12 shrink-0 items-center justify-center rounded-2xl bg-[#162014] px-5 text-[14px] font-bold text-white shadow-sm transition-all hover:bg-[#22331D] sm:px-6"
              >
                Ver solução para grupos e serviços
                <ChevronRight className="ml-2" size={17} />
              </Link>
            </div>
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
          Feito por quem sabe que anestesia é controle fino, não improviso.
        </h2>

<p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-zinc-600 sm:mt-5 sm:text-base sm:leading-8 md:text-lg">
  O Anest+ nasceu da rotina do centro cirúrgico: enquanto a atenção principal
  permanece no paciente, sinais, parâmetros, fármacos, horários, evolução e
  detalhes do caso precisam ser registrados com a mesma precisão e disciplina
  que orientam a condução anestésica.
</p>

        <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-zinc-500 sm:mt-5 sm:text-base sm:leading-8">
          Em vez de transformar a anestesia em um formulário rígido, o app
          organiza o registro em etapas compatíveis com a prática real:
          abertura do caso, monitorização, fármacos, descrição, assinatura e
          exportação, respeitando o jeito como o caso acontece.
        </p>

        <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#B9963B]/20 bg-white px-4 py-2.5 shadow-sm sm:mt-7 sm:gap-3 sm:rounded-2xl sm:px-5 sm:py-3">
          <ShieldCheck
            size={16}
            className="text-[#7A865F] sm:h-[18px] sm:w-[18px]"
          />
          <span className="text-[12px] font-bold uppercase tracking-wide text-zinc-700 sm:text-sm">
            Local-first, privado e pensado para a rotina real do centro cirúrgico
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
                Detalhe clínico disperso
              </h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-zinc-500 sm:mt-2 sm:text-sm sm:leading-7">
                Quando dados do caso ficam espalhados entre memória, papel e
                anotações rápidas, a sequência técnica perde nitidez na revisão final.
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
                Fim do caso com muita coisa acontecendo
              </h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-zinc-500 sm:mt-2 sm:text-sm sm:leading-7">
                O fim do procedimento costuma concentrar despertar, passagem,
organização da sala e revisão do registro. A ficha não precisa ser
mais uma carga mental nesse momento.
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
                Registro que não acompanha a qualidade da sua anestesia
              </h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-zinc-500 sm:mt-2 sm:text-sm sm:leading-7">
                Uma anestesia bem conduzida merece um registro legível,
                sequencial e consistente para revisão, guarda e rotina hospitalar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* PRÉ-ANESTÉSICA PRO */}
      <section className="bg-white px-5 py-12 sm:px-6 md:py-18">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div className="max-w-2xl">
              <SectionHeading
                eyebrow="Antes da sala"
                title="Pré-anestésica com contexto clínico, escores e saída pronta para o caso."
                desc="Registre história, exame, via aérea, exames complementares, riscos e planejamento em um fluxo guiado. O Anest+ Pro organiza escores selecionados, destaca pontos de atenção e permite gerar o PDF da avaliação ou iniciar a ficha anestésica com os dados principais já estruturados."
              />

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {[
                  {
                    icon: ClipboardList,
                    title: "Fluxo guiado",
                    desc: "Paciente, procedimento, história, sistemas, exame físico, escores, planejamento e consentimento em etapas.",
                  },
                  {
                    icon: AlertCircle,
                    title: "Escores do seu dia a dia",
                    desc: "STOP-Bang, Apfel, RCRI, ARISCAT, CFS, AUB-HAS2, VSG-CRI, PRPS modificado e DASI/METs quando aplicáveis.",
                  },
                  {
                    icon: FileCheck2,
                    title: "Alertas e conferência",
                    desc: "Pontos de atenção para SAOS, NVPO, risco cardíaco, pulmonar, fragilidade, TEV, aspiração, GLP-1/GIP e jejum.",
                  },
                  {
                    icon: FileText,
                    title: "PDF e ficha",
                    desc: "Exporte a avaliação pré-anestésica ou use a pré para iniciar a ficha anestésica com contexto clínico preservado.",
                  },
                ].map(({ icon: Icon, title, desc }) => (
                  <div
                    key={title}
                    className="rounded-[20px] border border-zinc-200/80 bg-white p-4 shadow-sm transition-colors hover:border-[#B9963B]/30 sm:p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F6F7F1] text-[#7A865F]">
                        <Icon size={19} strokeWidth={1.8} />
                      </div>
                      <div>
                        <h3 className="text-[1rem] font-black leading-snug tracking-tight text-zinc-950">
                          {title}
                        </h3>
                        <p className="mt-1.5 text-[13px] leading-6 text-zinc-500">
                          {desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[28px] border border-[#B9963B]/15 bg-[#FAFAF7] p-5 shadow-[0_24px_60px_-42px_rgba(22,32,20,0.22)] sm:p-6 md:p-8">
              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#B9963B]/10 blur-3xl" />
              <div className="relative">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7A865F] sm:text-[11px]">
                  Fluxo conectado
                </p>
                <h3 className="mt-3 text-[1.8rem] font-black leading-tight tracking-tight text-zinc-950 sm:text-4xl">
                  Da avaliação pré-anestésica ao registro intraoperatório.
                </h3>
                <p className="mt-4 max-w-2xl text-[14px] leading-7 text-zinc-600 sm:text-base sm:leading-8">
                  A pré-anestésica documenta o planejamento, reúne escores e
                  pontos de atenção, gera um PDF próprio e pode ajudar a iniciar
                  a ficha quando o paciente chegar ao centro cirúrgico.
                </p>

                <div className="mt-6 grid gap-3">
                  {[
                    ["1", "Avaliação guiada", "Dados clínicos, sistemas, via aérea, exames e contexto especial do paciente."],
                    ["2", "Escores e alertas", "Cálculos e pontos de atenção aparecem como apoio para conferência profissional."],
                    ["3", "PDF ou ficha", "A avaliação pode ser exportada em PDF ou usada para iniciar a ficha anestésica."],
                  ].map(([step, title, desc]) => (
                    <div
                      key={step}
                      className="flex gap-4 rounded-[18px] border border-white/70 bg-white/72 p-4 shadow-sm backdrop-blur"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#162014] text-sm font-black text-white">
                        {step}
                      </div>
                      <div>
                        <p className="font-black tracking-tight text-zinc-950">
                          {title}
                        </p>
                        <p className="mt-1 text-[13px] leading-6 text-zinc-500">
                          {desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

<p className="mt-5 text-[12px] leading-5 text-zinc-500 sm:text-[13px]">
  Recurso disponível no Anest+ Pro. Escores, alertas e informações
  de apoio têm finalidade informativa e auxiliar, sempre sujeitos à
  conferência, interpretação e validação do profissional responsável.
</p>
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
  Comece com uma ficha estruturada para acompanhar o caso desde a indução
</h2>

<p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#71717A] sm:mt-5 sm:text-base sm:leading-8 md:text-lg">
  O Anest+ organiza os dados iniciais do paciente, procedimento, técnica
  anestésica, hospital e plano em uma ficha pronta para sustentar o registro
  desde a indução até a saída de sala.
</p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4">
 {[
  "Paciente e prontuário",
  "ASA, técnica e procedimento",
  "Hospital, plano e identificação",
  "Alergias e observações iniciais",
  "Horário de início do caso",
  "Estrutura pronta para evoluir",
  "Leitura auxiliar de dados iniciais",
].map((item, index, arr) => (
                  <div
                    key={item}
                    className={`flex items-center gap-3 rounded-[16px] border border-[#B9963B]/15 bg-white px-4 py-3.5 text-[13px] font-semibold text-zinc-800 shadow-sm sm:rounded-2xl sm:px-5 sm:py-4 sm:text-sm ${
                      index === arr.length - 1 ? "sm:col-span-2" : ""
                    }`}
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
              desc="Durante a anestesia, o Anest+ ajuda a registrar sinais, parâmetros, fluidos, fármacos e evolução com poucos toques, mantendo a ficha organizada enquanto sua atenção permanece no paciente e na condução clínica."
/>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.96fr_1.04fr] lg:items-start">
            <div className="grid gap-5 md:grid-cols-2">
<FeatureCard
  icon={Activity}
title="Monitorização traduzida em registro"
desc="Frequência, pressão e demais parâmetros acompanham o caso com atualizações rápidas, mantendo o registro coerente com a hemodinâmica observada."
/>

<FeatureCard
  icon={Settings2}
  title="Parâmetros na mesma tela"
  desc="Monitores, gases, acessos, alergias e ajustes ficam acessíveis para preservar contexto e reduzir perda de informação."
/>

<FeatureCard
  icon={Droplets}
  title="Fluidos com distribuição automática"
  desc="Informe o volume administrado e deixe o app organizar a distribuição na ficha, mantendo o balanço mais claro e proporcional."
/>

<FeatureCard
  icon={ClipboardPen}
  title="Evolução construída durante o caso"
  desc="Registre indução, manutenção, intercorrências e destino enquanto o caso acontece, sem depender da memória no final."
/>

<FeatureCard
  icon={ShieldCheck}
  title="Fármacos com dose e via"
  desc="As medicações ficam registradas com dose, via e sequência, facilitando conferência, revisão e leitura do documento final."
/>

<FeatureCard
  icon={CheckCircle2}
  title="Sua ficha criada durante a anestesia"
  desc="O caso vai sendo documentado ao longo da condução, deixando a revisão final mais simples, clara e direta."
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

      {/* 3. REVISÃO E EXPORTAÇÃO */}
      <section className="bg-zinc-50/60 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#B9963B] sm:text-[11px]">
                A paz no final do seu plantão
              </p>

              <h2 className="mt-3 text-[2rem] font-black leading-[1.1] tracking-tight text-zinc-950 sm:mt-4 sm:text-4xl md:text-[2.8rem]">
                Finalize com uma ficha à altura da sua anestesia
              </h2>

              <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-[#71717A] sm:mt-5 sm:text-base sm:leading-8 md:text-lg">
  Ao término do procedimento, a ficha já está organizada em uma estrutura limpa,
  legível e fácil de revisar. O registro foi construído ao longo do caso,
  deixando revisão, assinatura, validação e exportação mais diretas na saída de sala.
</p>

              <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2">
<FeatureCard
  compact
  icon={FileCheck2}
  title="Um documento à altura do caso"
  desc="Técnica, fármacos, parâmetros, sinais vitais e descrição ficam reunidos em um PDF claro, coerente e fácil de conferir."
/>

<FeatureCard
  compact
  icon={ShieldCheck}
  title="Menos fragilidade do papel"
  desc="O registro digital reduz rasuras, melhora a leitura e deixa a ficha mais consistente para conferência técnica."
/>

<FeatureCard
  compact
  icon={CheckCircle2}
  title="Revisão criteriosa"
  desc="Com os dados estruturados, fica mais fácil conferir sequência, coerência e completude antes de assinar."
/>

<FeatureCard
  compact
  icon={Activity}
  title="Ficha pronta para a rotina"
  desc="Depois de revisada, a ficha pode ser impressa, baixada ou enviada conforme a rotina definida pelo serviço."
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
		  A sua ficha merece seguir seu padrão de qualidade.
		</h2>

<p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-[#71717A] sm:mt-5 sm:text-base sm:leading-8 md:text-lg">
  Ao finalizar a ficha, o Anest+ permite aplicar assinatura eletrônica avançada vinculada ao profissional responsável, após autenticação no próprio dispositivo, como Face ID, Touch ID ou código do aparelho.
</p>

<p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-[#71717A] sm:text-base sm:leading-8 md:text-lg">
  O PDF exportado recebe uma camada técnica vinculando autoria, assinatura,
  momento da assinatura e conteúdo registrado. Depois, o arquivo pode ser
  conferido no validador do Anest+, diretamente pelo site.
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
                  Testar 7 dias grátis
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
                desc="O Anest+ vincula a assinatura ao conteúdo da ficha, ao profissional e ao momento da assinatura."
              />

              <FeatureCard
                compact
                icon={QrCode}
                title="Validador Anest+"
                desc="O PDF pode ser enviado ao validador do site para conferir dados técnicos da assinatura e integridade esperada do documento."
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
  title="A ponte entre o app e o sistema do hospital"
  desc="Com a sincronização ativada, as fichas exportadas podem ficar disponíveis por tempo limitado na Conta Anest+. Assim, você localiza, revisa, baixa, imprime ou encaminha o PDF conforme a rotina do hospital com mais facilidade."
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
            desc="Acesse fichas exportadas recentemente, organizadas por data, paciente e status."
          />

          <FeatureCard
            compact
            icon={ClipboardList}
            title="Busca rápida"
            desc="Localize a ficha certa por nome do paciente ou número do prontuário, sem vasculhar arquivos soltos."
          />

          <FeatureCard
            compact
            icon={HardDrive}
            title="Download pelo computador"
            desc="Baixe PDFs para impressão, revisão ou envio ao sistema utilizado pelo hospital."
          />

          <FeatureCard
            compact
            icon={EyeOff}
            title="Disponibilidade temporária"
            desc="A cópia sincronizada fica disponível por até 30 dias na Conta Anest+. A ficha original permanece salva no dispositivo."
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
            title="Além da ficha, ferramentas para a rotina real da anestesia"
            desc="Depois de resolver o que mais pesa no intraoperatório, o Anest+ Pro também conecta pré-anestésica, plantões, hospitais, presets, protocolos, QR Code e controle financeiro em um ecossistema feito para quem vive a rotina da anestesia."
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
                Além da ficha anestésica, o app também ajuda a visualizar sua agenda, acompanhar recorrências, organizar atividades por hospital e manter informações importantes no mesmo ecossistema.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4">
{[
  "Agenda de plantões",
  "Recorrências configuráveis",
  "Atividades por hospital",
  "Rotina profissional centralizada",
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
  title="Atalhos para padronizar sua rotina sem engessar sua prática"
  desc="Além do registro anestésico, o Anest+ Pro reúne pré-anestésica, hospitais salvos, textos dinâmicos, presets próprios, grades de monitorização, passagem por QR Code, leitura auxiliar de dados iniciais e controle financeiro para apoiar sua rotina."
/>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div className="grid gap-4 md:grid-cols-2">
<FeatureCard
  compact
  icon={ClipboardList}
  title="Pré-anestésica"
  desc="Estruture avaliação pré-operatória, escores, pontos de atenção e PDF antes do procedimento."
/>
              <FeatureCard
  compact
  icon={Building2}
  title="Hospitais salvos"
  desc="Mantenha identidade, nome e logotipo dos locais onde você atua prontos para aparecer no documento final."
/>

<FeatureCard
  compact
  icon={ClipboardPen}
  title="Descrição dinâmica"
  desc="Use textos-base para iniciar uma descrição bem estruturada, preservando espaço para as nuances de cada caso."
/>

<FeatureCard
  compact
  icon={Settings2}
  title="Presets próprios"
  desc="Salve estruturas de técnicas, medicamentos e parâmetros que refletem sua prática e seus protocolos."
/>

<FeatureCard
  compact
  icon={Activity}
  title="Grades de monitorização"
  desc="Monte modelos de acompanhamento compatíveis com diferentes técnicas, durações e necessidades de registro."
/>

<FeatureCard
  compact
  icon={QrCode}
  title="Passagem via QR Code"
  desc="Compartilhe dados de casos em andamento de forma rápida quando houver necessidade de continuidade ou passagem."
/>

<FeatureCard
  compact
  icon={Wallet}
  title="Controle financeiro"
  desc="Acompanhe plantões e valores da rotina profissional junto ao restante do ecossistema."
/>

<FeatureCard
  compact
  icon={FileText}
  title="Leitura auxiliar de dados iniciais"
  desc="Use leitura auxiliar para preencher dados iniciais quando disponível, sempre com conferência manual antes de salvar."
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
      title="Precisão no cuidado. Rigor no registro."
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
        desc="A janela de 30 dias vale apenas para a cópia web sincronizada, reduzindo exposição de dados sem apagar o registro local."
      />
    </div>

    <div className="mt-8 rounded-[24px] border border-[#B9963B]/20 bg-[#B9963B]/5 p-5 text-center text-[13px] leading-6 text-zinc-300 sm:mt-10 sm:p-6 sm:text-sm sm:leading-7">
      <p className="mx-auto max-w-4xl">
        O Anest+ organiza o registro e gera um documento técnico mais claro, mas não ocupa o lugar do julgamento clínico, da vigilância anestésica nem da guarda definitiva pelo hospital ou serviço responsável.
      </p>
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
    title="O Anest+ toma o lugar da ficha de papel do hospital?"
    desc="O Anest+ organiza o registro anestésico e gera um PDF claro, legível e assinável. Em ambientes institucionais, o uso deve seguir a rotina definida pelo hospital ou serviço."
  />

  <FAQCard
    title="E se meu hospital já usa prontuário eletrônico?"
    desc="O Anest+ não tenta ocupar o lugar do sistema do hospital. Ele apoia a criação da ficha anestésica e a geração do PDF quando o serviço precisa imprimir, baixar, anexar ou encaminhar o arquivo."
  />

  <FAQCard
    title="Vou perder tempo olhando para a tela durante o caso?"
    desc="A proposta é acompanhar o caso com interações rápidas e poucos toques. O app foi pensado para registrar sem tirar o foco da condução anestésica."
  />

  <FAQCard
    title="Funciona sem internet durante o caso?"
    desc="Sim. A ficha principal é criada e atualizada no dispositivo. A conexão entra nos recursos que dependem de conta, sincronização, validação ou acesso web."
  />

  <FAQCard
    title="Onde e por quanto tempo ficam salvas minhas fichas?"
    desc="O registro principal fica salvo no dispositivo. Com a sincronização ativada, uma cópia fica disponível na Conta Anest+ por até 30 dias para revisão, download ou impressão. Depois desse prazo, a cópia web é removida da infraestrutura do Anest+."
  />

  <FAQCard
    title="A pré-anestésica toma o lugar da avaliação clínica?"
    desc="Não. A pré-anestésica do Anest+ Pro organiza dados, escores, alertas e pontos de atenção como apoio à avaliação. A interpretação e a validação permanecem sob responsabilidade do profissional."
  />

  <FAQCard
    title="Como funciona a assinatura eletrônica avançada?"
    desc="Antes de assinar, o profissional autentica no dispositivo. Depois, o Anest+ aplica uma camada técnica ao PDF com autoria, assinatura e conteúdo assinado, permitindo conferência posterior pelo validador do site."
  />

  <FAQCard
    title="Como funciona o teste de 7 dias grátis?"
    desc="Use o código ANESTFRIEND no resgate pela App Store para ativar 7 dias grátis e testar o Anest+ em um plantão real. Depois, a assinatura segue pela App Store e pode ser cancelada por lá."
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
                Criado para quem vive a anestesia com rigor
              </div>

              <h2 className="text-[2rem] font-black leading-[1.05] tracking-tight text-white sm:text-4xl md:text-[3.5rem] lg:leading-[1.04]">
                Teste o Anest+ em um plantão real.
                <br />
                Finalize com uma ficha à altura da sua anestesia.
              </h2>

<p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-[#d8dccf] sm:mt-6 sm:text-lg sm:leading-8 md:text-xl">
  Use o Anest+ em um plantão real e veja a ficha ganhar forma ao longo do caso:
  detalhes clínicos organizados, revisão criteriosa,
  assinatura, validação e exportação no fim do procedimento.
</p>

              <div className="mt-8 flex flex-col items-center justify-center">
                <div className="inline-flex flex-col gap-3 rounded-2xl border border-[#B9963B]/30 bg-black/20 p-2 shadow-sm backdrop-blur-md sm:flex-row sm:items-center sm:pr-5">
                  <span className="flex h-9 items-center justify-center rounded-xl bg-[#B9963B] px-4 text-[12px] font-black text-[#162014] shadow-sm sm:text-[13px]">
                    ANESTFRIEND
                  </span>
                  <span className="text-center text-[14px] font-medium text-[#d8dccf] sm:text-left sm:text-[15px]">
                    Ative 7 dias grátis e teste em um plantão real. Depois, R$ 89,90/mês.
                  </span>
                </div>
              </div>

              <p className="mt-3 text-center text-[12px] leading-5 text-[#d8dccf]/70 sm:text-[13px]">
                Cancele quando quiser pela App Store.
              </p>

              <div className="mt-8 flex flex-col flex-wrap justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
                <a
                  href={OFFER_CODE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-[14px] bg-[#B9963B] px-6 py-3.5 text-[15px] font-black text-[#162014] shadow-2xl transition-transform hover:scale-[1.02] sm:rounded-2xl sm:px-8 sm:py-4 sm:text-base"
                >
                  Testar 7 dias grátis
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

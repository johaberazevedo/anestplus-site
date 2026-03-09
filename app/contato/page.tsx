"use client";

import { motion, Variants } from "framer-motion";
import {
  CheckCircle2,
  Mail,
  MessageCircle,
  Building2,
  ShieldCheck,
  Settings2,
  type LucideIcon,
} from "lucide-react";

const WHATSAPP_URL = "https://wa.me/5571992288755";
const APPSTORE_URL = "https://apps.apple.com/br/app/anest/id6753714859";
const EMAIL = "anestplus@outlook.com";

// ⚠️ AVISO: O Next.js não permite exportar metadata em arquivos "use client".
// Mova este bloco para um arquivo app/contato/layout.tsx
/*
export const metadata = {
  title: "Contato — Anest+",
  description:
    "Fale com o Anest+ para suporte, dúvidas sobre o app, demonstração e propostas institucionais.",
};
*/

// --- VARIANTS DE ANIMAÇÃO ---
const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 100, damping: 20 } 
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <motion.span 
      whileHover={{ scale: 1.05, backgroundColor: "#eef0e5" }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      className="inline-flex cursor-default items-center rounded-full border border-[#b9963b]/25 bg-[#f6f7f1] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#506047] shadow-sm backdrop-blur-md"
    >
      {children}
    </motion.span>
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
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className={`mb-10 md:mb-14 ${align === "center" ? "mx-auto text-center" : ""}`}
    >
      <motion.h2 variants={fadeUpVariants} className="max-w-4xl text-4xl font-black tracking-tight text-zinc-950 md:text-5xl lg:text-6xl lg:leading-[0.98]">
        {title}
      </motion.h2>
      {subtitle ? (
        <motion.p variants={fadeUpVariants} className="mt-5 max-w-2xl text-lg leading-8 text-zinc-500">
          {subtitle}
        </motion.p>
      ) : null}
    </motion.div>
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
    <motion.div 
      variants={fadeUpVariants}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative overflow-hidden rounded-[32px] border border-zinc-200/80 bg-white p-8 shadow-sm transition-all hover:border-[#b9963b]/40 hover:shadow-xl hover:shadow-[#b9963b]/5"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#b9963b]/0 to-[#b9963b]/[0.03] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#b9963b]/5 blur-2xl transition-all duration-700 group-hover:bg-[#b9963b]/15" />
      
      <div className="mb-6 inline-flex rounded-2xl bg-zinc-50 p-3 transition-colors duration-500 group-hover:bg-[#b9963b]/10">
        <Icon className="text-[#7a865f] transition-colors duration-500 group-hover:text-[#b9963b]" size={28} strokeWidth={1.5} />
      </div>
      
      <h3 className="relative z-10 text-xl font-bold tracking-tight text-zinc-950">
        {title}
      </h3>
      <p className="relative z-10 mt-3 text-base leading-7 text-zinc-500">{desc}</p>
      <p className="relative z-10 mt-6 text-zinc-900">
        <a
          className="inline-flex items-center font-bold text-[#b9963b] underline decoration-[#b9963b]/30 underline-offset-4 transition-colors hover:text-[#8a6f2b] hover:decoration-[#8a6f2b]"
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
        >
          {value}
        </a>
      </p>
    </motion.div>
  );
}

function InfoCard({
  title,
  desc,
  icon: Icon,
}: {
  title: string;
  desc: string;
  icon: LucideIcon;
}) {
  return (
    <motion.div 
      variants={fadeUpVariants}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative overflow-hidden rounded-[32px] border border-zinc-200/80 bg-white p-8 shadow-sm transition-all hover:border-[#b9963b]/40 hover:shadow-xl hover:shadow-[#b9963b]/5"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#b9963b]/0 to-[#b9963b]/[0.03] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="mb-5 inline-flex rounded-2xl bg-zinc-50 p-3 transition-colors duration-500 group-hover:bg-[#b9963b]/10">
        <Icon className="text-[#7a865f] transition-colors group-hover:text-[#b9963b]" size={24} strokeWidth={1.5} />
      </div>
      <h3 className="relative z-10 text-lg font-bold tracking-tight text-zinc-950">
        {title}
      </h3>
      <p className="relative z-10 mt-3 text-sm leading-7 text-zinc-500">{desc}</p>
    </motion.div>
  );
}

export default function ContatoPage() {
  return (
    <div className="-mx-4 bg-white text-zinc-950 selection:bg-[#162014] selection:text-[#e0bf62]">
      {/* HERO */}
      <section className="relative overflow-hidden px-4 pb-14 pt-4 md:pb-20 md:pt-8">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-44 left-1/2 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-[#22331d] blur-3xl" 
          />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.12, 0.18, 0.12] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-8 right-[-100px] h-[420px] w-[420px] rounded-full bg-[#8f9c69] blur-3xl" 
          />
          <motion.div 
            animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute left-[8%] top-[22%] h-[220px] w-[220px] rounded-full bg-[#d7b65a] blur-3xl" 
          />
        </div>

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mx-auto w-full max-w-6xl"
        >
          <motion.div variants={fadeUpVariants} className="flex flex-wrap gap-2">
            <Pill>Suporte e dúvidas</Pill>
            <Pill>Demonstração institucional</Pill>
            <Pill>Contato direto</Pill>
          </motion.div>

          <motion.div variants={fadeUpVariants} className="mt-8 max-w-5xl">
            <h1 className="text-4xl font-black tracking-tight text-zinc-950 md:text-6xl lg:leading-[0.98]">
              Fale com o Anest+
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-500 md:text-xl">
              Tire dúvidas, peça suporte ou converse sobre implantação
              institucional, demonstração do fluxo do app e adaptação à realidade
              da sua equipe.
            </p>
          </motion.div>

          <motion.div variants={fadeUpVariants} className="mt-10 grid gap-3 text-sm sm:grid-cols-3">
            {[
              "Suporte e dúvidas",
              "Demonstração institucional",
              "Contato direto e simples",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 rounded-2xl border border-zinc-200/80 bg-white/60 px-4 py-3 font-semibold text-zinc-700 shadow-sm backdrop-blur-md"
              >
                <CheckCircle2 size={16} className="text-[#7a865f]" />
                {item}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* CONTACT OPTIONS */}
      <section className="px-4 py-20 md:py-24">
        <div className="mx-auto w-full max-w-6xl">
          <SectionTitle
            title="Canais de contato"
            subtitle="Escolha o melhor caminho para suporte, dúvidas gerais, demonstração do app ou conversas sobre implantação institucional."
          />

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid gap-6 md:grid-cols-2"
          >
            <ContactCard
              icon={Mail}
              title="E-mail"
              value={EMAIL}
              href={`mailto:${EMAIL}`}
              desc="Melhor para suporte, dúvidas gerais, solicitações mais formais e contatos que exigem mais contexto."
            />

            <ContactCard
              icon={MessageCircle}
              title="WhatsApp"
              value="(71) 99228-8755"
              href={WHATSAPP_URL}
              external
              desc="O caminho mais rápido para conversar sobre o app, implantação institucional, demonstração e dúvidas práticas."
            />
          </motion.div>
        </div>
      </section>

      {/* INSTITUTIONAL CTA */}
      <section className="relative px-4 py-20 md:py-24">
        <div className="absolute inset-0 -z-10 bg-zinc-50/50" />
        <div className="mx-auto w-full max-w-6xl">
          <SectionTitle
            title="Contato institucional"
            subtitle="Para hospitais, grupos anestésicos e serviços que querem entender como o Anest+ pode se adaptar ao fluxo local da equipe."
          />

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid gap-6 md:grid-cols-3"
          >
            <InfoCard
              icon={Building2}
              title="Avaliação do contexto da unidade"
              desc="Entendimento do fluxo atual, do perfil da equipe e dos pontos em que mais clareza, padronização e organização podem fazer diferença."
            />

            <InfoCard
              icon={ShieldCheck}
              title="Modelo institucional"
              desc="Conversa direta sobre padronização do registro, identidade visual do hospital, legibilidade documental e implantação por unidade."
            />

            <InfoCard
              icon={Settings2}
              title="Próximos passos"
              desc="Definição da melhor forma de apresentar o app, adaptar o fluxo à rotina local e iniciar a implantação com menos atrito."
            />
          </motion.div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-4 pb-16 pt-10 md:pb-24 md:pt-16">
        <div className="mx-auto w-full max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100 }}
            className="group relative overflow-hidden rounded-[40px] border border-[#b9963b]/20 bg-gradient-to-br from-[#fbfaf5] to-white p-8 shadow-lg md:p-14"
          >
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#b9963b]/10 blur-3xl transition-opacity duration-700 group-hover:opacity-70" />
            
            <div className="relative z-10 max-w-3xl">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#7a865f]">
                Conversa inicial
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-zinc-950 md:text-5xl lg:leading-[1.02]">
                Quer levar mais segurança no registro anestésico e padronização para sua equipe?
              </h2>

              <p className="mt-6 text-lg leading-8 text-zinc-600">
                Eu explico o modelo institucional, apresento o fluxo do app e
                avalio com você a melhor forma de adaptar o Anest+ à realidade da
                sua unidade.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-14 items-center justify-center rounded-2xl bg-[#1a2718] px-8 text-sm font-bold text-white shadow-xl shadow-[#1a2718]/20 transition-all hover:-translate-y-0.5 hover:bg-[#22331d]"
                >
                  Falar no WhatsApp
                </a>

                <a
                  href={APPSTORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-14 items-center justify-center rounded-2xl border border-zinc-200 bg-white px-8 text-sm font-bold text-zinc-900 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-zinc-50 hover:shadow-md"
                >
                  Ver na App Store
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
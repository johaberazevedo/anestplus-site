"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
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
const APPSTORE_URL = "https://apps.apple.com/br/app/anest/id6753714859";

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
    <motion.div
      variants={fadeUpVariants}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`group relative overflow-hidden rounded-[32px] border border-zinc-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:shadow-[#b9963b]/5 ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#b9963b]/0 to-[#b9963b]/[0.03] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#b9963b]/5 blur-2xl transition-all duration-700 group-hover:bg-[#b9963b]/15" />
      
      {Icon && (
        <div className="mb-5 inline-flex rounded-2xl bg-zinc-50 p-3 transition-colors duration-500 group-hover:bg-[#b9963b]/10">
          <Icon className="text-[#7a865f] transition-colors duration-500 group-hover:text-[#b9963b]" size={24} strokeWidth={1.5} />
        </div>
      )}
      <h3 className="relative z-10 text-lg font-bold tracking-tight text-zinc-950">
        {title}
      </h3>
      <p className="relative z-10 mt-3 text-sm leading-7 text-zinc-500 transition-colors group-hover:text-zinc-600">{desc}</p>
    </motion.div>
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
    <motion.div
      variants={fadeUpVariants}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="group relative rounded-[36px] border border-zinc-200/70 bg-white p-8 shadow-sm transition-all hover:border-[#b9963b]/40 hover:shadow-xl hover:shadow-[#b9963b]/5"
    >
      <div className="absolute -inset-px rounded-[36px] bg-gradient-to-b from-[#b9963b]/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <p className="relative z-10 text-[11px] font-black uppercase tracking-[0.22em] text-[#b9963b]">
        {step}
      </p>
      <h3 className="relative z-10 mt-4 text-xl font-bold tracking-tight text-zinc-950">
        {title}
      </h3>
      <p className="relative z-10 mt-3 text-sm leading-7 text-zinc-600">{desc}</p>
    </motion.div>
  );
}

export default function HospitaisPage() {
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
            <Pill>Modelo institucional</Pill>
            <Pill>Padronização do registro</Pill>
            <Pill>Adaptação ao fluxo local</Pill>
          </motion.div>

          <motion.div variants={fadeUpVariants} className="mt-8 max-w-5xl">
            <h1 className="text-4xl font-black tracking-tight text-zinc-950 md:text-6xl lg:leading-[0.98]">
              Leve o Anest+ para a rotina da sua instituição
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-500 md:text-xl">
              Um modelo institucional pensado para padronizar o registro anestésico,
              aplicar a identidade visual da unidade e adaptar o uso ao fluxo local
              da equipe.
            </p>
          </motion.div>

          <motion.div variants={fadeUpVariants} className="mt-10 grid gap-3 text-sm sm:grid-cols-3">
            {[
              "Padronização do registro",
              "Identidade visual por unidade",
              "Implantação orientada ao fluxo local",
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

      {/* VALUE */}
      <section className="px-4 py-20 md:py-24">
        <div className="mx-auto w-full max-w-6xl">
          <SectionTitle
            title="O que o modelo institucional entrega"
            subtitle="A proposta é unir organização, padronização e adoção prática no dia a dia da equipe anestésica."
          />

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid gap-6 md:grid-cols-2"
          >
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
          </motion.div>
        </div>
      </section>

      {/* IMPLEMENTATION */}
      <section className="relative px-4 py-20 md:py-24">
        <div className="absolute inset-0 -z-10 bg-zinc-50/50" />
        <div className="mx-auto w-full max-w-6xl">
          <SectionTitle
            title="Como funciona a implantação"
            subtitle="Um processo simples, direto e orientado à realidade de cada instituição."
          />

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid gap-6 md:grid-cols-3"
          >
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
          </motion.div>
        </div>
      </section>

      {/* FIT */}
      <section className="px-4 py-20 md:py-24">
        <div className="mx-auto w-full max-w-6xl">
          <SectionTitle
            title="Para quem esse modelo faz sentido"
            subtitle="Especialmente para instituições que querem mais organização sem aumentar a complexidade do trabalho da equipe."
          />

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            <Card
              icon={Users}
              title="Múltiplos profissionais"
              desc="Quando há mais de um profissional registrando casos e a consistência entre fichas se torna importante."
            />
            <Card
              icon={ClipboardList}
              title="Busca por padronização"
              desc="Quando a instituição deseja um fluxo mais uniforme e profissional de documentação anestésica."
            />
            <Card
              icon={Building2}
              title="Foco em organização"
              desc="Quando o objetivo é fortalecer o registro anestésico, melhorar a consistência documental da equipe e facilitar revisão dos registros."
            />
            <Card
              icon={Settings2}
              title="Implantação por unidade"
desc="Modelo pensado para adaptação à realidade específica de cada hospital, grupo anestésico ou serviço."
            />
            <Card
              icon={Clock3}
              title="Equipes dinâmicas"
              desc="Para contextos em que o preenchimento precisa acompanhar a rotina acelerada do centro cirúrgico."
            />
            <Card
              icon={LayoutPanelTop}
              title="Identidade visual institucional"
desc="Com aplicação da identidade da unidade nos documentos finais e uma apresentação mais consistente para o serviço."
            />
          </motion.div>
        </div>
      </section>

      {/* CTA */}
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
                Fale comigo para avaliar o contexto da unidade, o modelo de implantação
                e a melhor forma de levar o Anest+ para a rotina da equipe.
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

                <Link
                  href="/contato"
                  className="inline-flex h-14 items-center justify-center rounded-2xl border border-zinc-200 bg-white px-8 text-sm font-bold text-zinc-900 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-zinc-50 hover:shadow-md"
                >
                  Ir para contato
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
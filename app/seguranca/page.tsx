"use client";

import { motion, Variants } from "framer-motion";
import {
  ShieldCheck,
  EyeOff,
  FileText,
  ClipboardList,
  Lock,
  CheckCircle2,
  HardDrive,
  Scale,
  Files,
  type LucideIcon,
} from "lucide-react";

// ⚠️ AVISO: O Next.js não permite exportar metadata em arquivos "use client".
// Recomendado criar um arquivo app/seguranca/layout.tsx para esta metadata:
/*
export const metadata = {
  title: "Segurança & Privacidade — Anest+",
  description:
    "Conheça as principais características de segurança documental, privacidade e Trust Layer do Anest+.",
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
      className={`group relative overflow-hidden rounded-[32px] border border-zinc-200/80 bg-white p-8 shadow-sm transition-all hover:border-[#b9963b]/30 hover:shadow-xl hover:shadow-[#b9963b]/5 ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#b9963b]/0 to-[#b9963b]/[0.03] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#b9963b]/5 blur-2xl transition-all duration-700 group-hover:bg-[#b9963b]/15" />
      
      {Icon ? (
        <div className="mb-6 inline-flex rounded-2xl bg-zinc-50 p-3 transition-colors duration-500 group-hover:bg-[#b9963b]/10">
          <Icon className="text-[#7a865f] transition-colors duration-500 group-hover:text-[#b9963b]" size={28} strokeWidth={1.5} />
        </div>
      ) : null}
      
      <h3 className="relative z-10 text-xl font-bold tracking-tight text-zinc-950">
        {title}
      </h3>
      <p className="relative z-10 mt-3 text-base leading-7 text-zinc-500 transition-colors group-hover:text-zinc-600">{desc}</p>
    </motion.div>
  );
}

export default function SegurancaPage() {
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
            <Pill>Trust Layer ativa</Pill>
            <Pill>Dados só no dispositivo</Pill>
            <Pill>Mais segurança no registro</Pill>
          </motion.div>

          <motion.div variants={fadeUpVariants} className="mt-8 max-w-5xl">
            <h1 className="text-4xl font-black tracking-tight text-zinc-950 md:text-6xl lg:leading-[0.98]">
              Segurança nos documentos para uma rotina que não pode depender nem da calma do plantão nem da caligrafia
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-500 md:text-xl">
              No Anest+, segurança e privacidade não aparecem só como conceito
              técnico. Elas se traduzem em ficha legível, documentação mais
              padronizada, cópias acessíveis e mais confiança no registro
              anestésico.
            </p>
          </motion.div>

          <motion.div variants={fadeUpVariants} className="mt-10 grid gap-3 text-sm sm:grid-cols-3">
            {[
              "Dados sem comunicação com nuvem ou servidores",
              "Menos risco de glosa por erros de preenchimento",
              "Mais clareza e confiança no documento final",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 rounded-2xl border border-zinc-200/80 bg-white/60 px-4 py-3 font-semibold text-zinc-700 shadow-sm backdrop-blur-md"
              >
                <CheckCircle2 size={16} className="text-[#7a865f] shrink-0" />
                <span className="leading-snug">{item}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* PRINCIPAIS CARACTERÍSTICAS */}
      <section className="px-4 py-20 md:py-24">
        <div className="mx-auto w-full max-w-6xl">
          <SectionTitle
            title="Principais características de segurança do Anest+"
            subtitle="A proposta do app é fortalecer a documentação anestésica com mais legibilidade, previsibilidade e domínio dos dados pelo próprio anestesiologista."
          />

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            <Card
              icon={HardDrive}
              title="Dados no domínio do anestesiologista"
              desc="Os dados permanecem no próprio dispositivo, sem comunicação com nuvem ou servidores, mantendo o conteúdo sempre sob controle direto do usuário."
            />
            <Card
              icon={ShieldCheck}
              title="Trust Layer ativa"
              desc="A Trust Layer adiciona uma camada extra de confiança documental ao material gerado pelo app, reforçando a integridade do registro."
            />
            <Card
              icon={FileText}
              title="Ficha anestésica legível e padronizada"
              desc="Ao sair do papel manuscrito, o registro ganha mais clareza visual, menos ambiguidade e uma leitura muito mais consistente."
            />
            <Card
              icon={ClipboardList}
              title="Menos risco de erro por preenchimento manual"
              desc="Campos estruturados e fluxo mais organizado ajudam a reduzir falhas comuns da ficha feita à mão, especialmente em contextos de plantões conturbados."
            />
            <Card
              icon={Scale}
              title="Mais segurança documental"
              desc="Uma ficha mais clara, organizada e legível fortalece a documentação anestésica e reduz fragilidades típicas do registro manuscrito."
            />
            <Card
              icon={EyeOff}
              title="Menos exposição desnecessária"
              desc="O app foi pensado para apoiar a documentação do caso com foco objetivo no registro, sem depender de compartilhamentos ou fluxos externos desnecessários."
            />
          </motion.div>
        </div>
      </section>

      {/* IMPACTO PRÁTICO */}
      <section className="relative px-4 py-20 md:py-24">
        <div className="absolute inset-0 -z-10 bg-zinc-50/50" />
        <div className="mx-auto w-full max-w-6xl">
          <SectionTitle
            title="Como isso ajuda na prática"
            subtitle="No dia a dia do centro cirúrgico, segurança também significa reduzir fragilidades que começam no papel, no plantão agitado e na dificuldade de acessar o registro depois."
          />

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid gap-6 md:grid-cols-2"
          >
            <Card
              icon={ClipboardList}
              title="Menos risco de glosa"
              desc="Preenchimento mais claro e estruturado ajuda a reduzir inconsistências, dados mal interpretados e problemas de leitura que podem enfraquecer a ficha."
            />
            <Card
              icon={FileText}
              title="Mais legibilidade no registro"
              desc="Uma ficha anestésica legível facilita revisão, entendimento posterior e leitura por outros profissionais, sem depender da caligrafia ou da urgência do momento."
            />
            <Card
              icon={Scale}
              title="Menos fragilidade do manuscrito"
              desc="Fichas feitas à mão podem sofrer com preenchimento incompleto, letra difícil e menor segurança no registro. O Anest+ ajuda a estruturar melhor esse processo."
            />
            <Card
              icon={Files}
              title="Cópias acessíveis"
              desc="Depois que o anestesiologista sai do hospital, ele não precisa depender apenas do papel arquivado na instituição para ter acesso ao próprio registro."
            />
          </motion.div>
        </div>
      </section>

      {/* PRIVACIDADE */}
      <section className="px-4 py-20 md:py-24">
        <div className="mx-auto w-full max-w-6xl">
          <SectionTitle
            title="Privacidade por desenho de uso"
            subtitle="No Anest+, privacidade não é um detalhe escondido. Ela faz parte da própria lógica do produto."
          />

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid gap-6 md:grid-cols-3"
          >
            <Card
              icon={Lock}
              title="Sem dependência de servidores"
              desc="O fluxo do app não depende de comunicação com servidores para guardar os dados do anestesiologista e das fichas."
            />
            <Card
              icon={HardDrive}
              title="Uso local"
              desc="As informações permanecem no dispositivo do próprio usuário, reforçando autonomia e controle sobre o conteúdo gerado."
            />
            <Card
              icon={ShieldCheck}
              title="Responsabilidade no contexto real"
              desc="A experiência foi pensada para unir praticidade, privacidade e mais segurança no registro dentro da rotina real da anestesiologia."
            />
          </motion.div>
        </div>
      </section>

      {/* DOCUMENTO FINAL */}
      <section className="relative px-4 py-20 md:py-24">
        <div className="absolute inset-0 -z-10 bg-zinc-50/50" />
        <div className="mx-auto w-full max-w-6xl">
          <SectionTitle
            title="Ficha anestésica finalizada com mais confiança"
            subtitle="Segurança também aparece no resultado final: um documento mais claro, consistente e preparado para o fluxo real de revisão, impressão e guarda."
          />

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid gap-6 md:grid-cols-2"
          >
            <Card
              icon={FileText}
              title="Estrutura padronizada"
              desc="Cabeçalho, sinais, parâmetros, descrição e medicamentos aparecem organizados em um formato mais uniforme e previsível."
            />
            <Card
              icon={CheckCircle2}
              title="Melhor leitura e rastreabilidade"
              desc="Uma ficha anestésica mais clara e apoiada pela Trust Layer reforça a confiança documental no material final gerado pelo app."
            />
          </motion.div>
        </div>
      </section>

      {/* FECHAMENTO CTA */}
      <section className="px-4 pb-16 pt-10 md:pb-24 md:pt-16">
        <div className="mx-auto w-full max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100 }}
            className="group relative overflow-hidden rounded-[40px] border border-[#b9963b]/20 bg-gradient-to-br from-[#fbfaf5] to-white p-8 shadow-lg md:p-14"
          >
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#b9963b]/10 blur-3xl transition-opacity duration-700 group-hover:opacity-50" />
            
            <div className="relative z-10 max-w-4xl">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#7a865f]">
                Fechamento
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-zinc-950 md:text-5xl lg:leading-[1.02]">
                Mais do que digitalizar a ficha: fortalecer a documentação anestésica
              </h2>

              <p className="mt-6 text-lg leading-8 text-zinc-600">
                NNo Anest+, segurança significa dados no domínio do anestesiologista,
ficha legível, menos fragilidade do papel manuscrito, cópias
acessíveis e mais segurança no registro com apoio da Trust Layer.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
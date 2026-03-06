"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Activity,
  Settings2,
  QrCode,
  Scan,
  Calendar,
  FileText,
  Clock,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

const APPSTORE_URL = "https://apps.apple.com/br/app/anest/id6753714859";

// --- VARIAÇÕES DE ANIMAÇÃO ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

// --- COMPONENTES ---

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#b9963b]/30 bg-[#f6f7f1]/80 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#42513c] shadow-sm backdrop-blur-xl">
      {children}
    </span>
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
      className={`group relative overflow-hidden rounded-[32px] border border-zinc-200/80 bg-white p-8 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#b9963b]/40 hover:shadow-[0_20px_40px_-15px_rgba(26,39,24,0.1)] ${className}`}
    >
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#b9963b]/5 blur-2xl transition-all group-hover:bg-[#b9963b]/10" />
      {Icon && (
        <Icon
          className="mb-5 text-[#7a865f] transition-colors duration-500 group-hover:text-[#b9963b]"
          size={24}
          strokeWidth={1.5}
        />
      )}
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

export default function ProdutoClient() {
  return (
    <div className="-mx-4 bg-[#FCFCFC] text-zinc-950 selection:bg-[#162014] selection:text-[#e0bf62]">
      {/* HERO */}
      <section className="relative overflow-hidden px-6 pb-20 pt-12 md:pb-24 md:pt-16">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-44 left-1/2 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-[#22331d]/12 blur-[90px]" />
          <div className="absolute top-8 right-[-100px] h-[420px] w-[420px] rounded-full bg-[#8f9c69]/10 blur-[72px]" />
        </div>

        <div className="mx-auto max-w-6xl">
          <motion.div initial="hidden" animate="visible" variants={containerVariants}>
            <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
              <Pill>Fluxo clínico completo</Pill>
              <Pill>Ficha anestésica digital</Pill>
              <Pill>Feito por anestesiologista</Pill>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="mt-10 text-4xl font-black tracking-tight text-zinc-950 md:text-6xl lg:leading-[0.98]"
            >
              Entenda como o Anest+ funciona na <br />
              <span className="bg-gradient-to-r from-[#7b8461] to-[#b9963b] bg-clip-text text-transparent">
                rotina real do centro cirúrgico
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-8 max-w-2xl text-lg leading-8 text-zinc-500 md:text-xl"
            >
              Do perfil à ficha anestésica finalizada, o app organiza o registro
              com mais clareza, menos retrabalho e um fluxo pensado para o
              intraoperatório.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="mt-10 grid gap-3 text-sm sm:grid-cols-3"
            >
              {[
                "Fluxo rápido e padronizado",
                "Evolução durante o caso",
                "Ficha anestésica finalizada",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-2xl border border-[#b9963b]/20 bg-white/60 px-5 py-4 font-black uppercase tracking-[0.16em] text-zinc-700 shadow-sm backdrop-blur-xl"
                >
                  <CheckCircle2 size={16} className="text-[#b9963b]" />
                  {item}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FLOW */}
      <section className="px-6 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14">
            <h2 className="text-4xl font-black tracking-tight text-zinc-950 md:text-5xl">
              O fluxo principal do app
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-500 md:text-xl">
              Cada etapa foi desenhada para acompanhar o anestesiologista do
              início do caso até a ficha anestésica finalizada.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <StepCard
              step="Etapa 1"
              title="Perfil e hospitais"
              desc="Cadastre nome, CRM e RQE uma vez. Depois, organize os hospitais com nome e identidade visual para usar nas fichas e relatórios."
            />
            <StepCard
              step="Etapa 2"
              title="Criação da ficha anestésica"
              desc="Preencha os dados do paciente, ASA, anestesia, cirurgia, registro e plano em uma estrutura direta, validada e pronta para começar o caso."
            />
            <StepCard
              step="Etapa 3"
              title="Evolua o caso durante o intraoperatório"
              desc="Atualize sinais vitais, monitores, parâmetros, fluidos, diurese e descrição clínica conforme o caso acontece, sem reconstruir tudo no final."
            />
            <StepCard
              step="Etapa 4"
              title="Ficha anestésica finalizada"
              desc="Ao término, o app consolida o registro em uma ficha anestésica clara, organizada e pronta para imprimir, exportar ou compartilhar."
            />
          </div>
        </div>
      </section>

      {/* DETAILS */}
      <section className="bg-zinc-50/50 px-6 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14">
            <h2 className="text-4xl font-black tracking-tight text-zinc-950 md:text-5xl">
              O que o Anest+ organiza durante o caso
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-500 md:text-xl">
              O foco é diminuir atrito no preenchimento e manter clareza no
              registro anestésico.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  <Card
    icon={Activity}
    title="Sinais vitais"
    desc="A linha do tempo é criada automaticamente para facilitar a evolução intraoperatória com mais fluidez."
  />
  <Card
    icon={Settings2}
    title="Monitores e parâmetros"
    desc="Adicione gases, capnografia, saturação, oxigênio, acessos, diurese e outros dados conforme a necessidade do caso."
  />
  <Card
    icon={Clock}
    title="Fluidos distribuídos"
    desc="Informe o volume total e o app distribui os dados nas colunas de forma proporcional e ordenada."
  />
  <Card
    icon={FileText}
    title="Descrição da anestesia"
    desc="Registre indução, manutenção e despertar com liberdade, criando um histórico clínico completo do procedimento."
  />
  <Card
    icon={ShieldCheck}
    title="Medicamentos estruturados"
    desc="Dose, via e organização clara para manter a prescrição coerente e o registro final consistente."
  />
  <Card
    icon={CheckCircle2}
    title="Ficha anestésica finalizada"
    desc="O caso inteiro é consolidado em uma visualização clara ao final, pronta para revisão, impressão, exportação ou compartilhamento."
  />
</div>
        </div>
      </section>

      {/* EXTRA FEATURES */}
      <section className="px-6 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <h2 className="text-4xl font-black tracking-tight text-zinc-950 md:text-5xl">
              Recursos que aceleram o dia a dia
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-500 md:text-xl">
              Além da ficha anestésica, o app reúne funções que tornam a rotina mais prática.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card
              icon={Settings2}
              title="Protocolos e presets"
              desc="Use padrões prontos de anestesia, monitores e fármacos como base para acelerar o início da ficha."
            />
            <Card
              icon={QrCode}
              title="QR Code entre usuários"
              desc="Facilite a continuidade de casos em andamento na passagem de plantão entre anestesiologistas."
            />
            <Card
              icon={Scan}
              title="Scanner inteligente"
              desc="Leia identificações e documentos para preencher dados iniciais do paciente com mais rapidez."
            />
            <Card
              icon={Calendar}
              title="Calendário e financeiro"
              desc="Organize plantões, recorrências e acompanhamento financeiro no mesmo ecossistema de trabalho."
            />
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="px-6 pb-24 pt-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[48px] bg-[#162014] px-10 py-20 text-white shadow-2xl md:px-16 md:py-20"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,180,74,0.18),transparent_45%)]" />
            <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(#d9b44a_1px,transparent_1px)] [background-size:24px_24px]" />

            <div className="relative z-10 max-w-4xl">
              <h2 className="text-4xl font-black tracking-tight md:text-6xl lg:leading-[1.04]">
                Um fluxo pensado para reduzir atrito e aumentar clareza no plantão
              </h2>
              <p className="mt-8 text-lg leading-8 text-[#d8dccf] md:text-xl">
                O Anest+ foi desenhado para acompanhar o anestesiologista na rotina real
                do centro cirúrgico, com menos retrabalho, mais organização e uma ficha
                anestésica finalizada ao término do caso.
              </p>

              <div className="mt-12 flex flex-wrap gap-4">
                <a
                  href={APPSTORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl bg-[#d9b44a] px-10 py-4 text-base font-black text-[#162014] shadow-2xl transition-transform hover:scale-[1.02]"
                >
                  Baixar o Anest+ na App Store
                </a>
                <Link
                  href="/hospitais"
                  className="rounded-2xl border border-white/10 bg-white/5 px-10 py-4 text-base font-bold backdrop-blur-md transition-colors hover:bg-white/10"
                >
                  Ver modelo institucional
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
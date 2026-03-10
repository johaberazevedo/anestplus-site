"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
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
  Zap,
  ShieldCheck,
  SlidersHorizontal,
  Droplets,
  Lock,
  Layout as LayoutIcon,
  User,
  Building2,
  ClipboardPen,
  Wallet,
  type LucideIcon,
} from "lucide-react";

const APPSTORE_URL = "https://apps.apple.com/br/app/anest/id6753714859";
const WHATSAPP_URL = "https://wa.me/5571992288755";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#b9963b]/25 bg-[#f6f7f1] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[#506047] shadow-sm backdrop-blur-sm">
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
    <motion.div
      whileHover={{ y: -3 }}
      className={`group rounded-3xl border border-zinc-200/70 bg-white p-6 shadow-sm transition-all hover:shadow-md ${className}`}
    >
      {Icon && (
        <Icon
          className="mb-5 text-[#7a865f] transition-colors duration-500 group-hover:text-[#b9963b]"
          size={24}
          strokeWidth={1.5}
        />
      )}
      <h3 className="text-lg font-semibold tracking-tight text-zinc-950">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-zinc-500">{desc}</p>
    </motion.div>
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
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-4xl text-4xl font-black tracking-tight text-zinc-950 md:text-5xl lg:text-6xl lg:leading-[0.98]"
      >
        {title}
      </motion.h2>
      {subtitle ? (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-5 max-w-2xl text-lg leading-8 text-zinc-500"
        >
          {subtitle}
        </motion.p>
      ) : null}
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-[36px] border border-zinc-200/70 bg-white p-8 shadow-sm transition-all hover:border-[#b9963b]/25"
    >
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#b9963b]">{step}</p>
      <h3 className="mt-4 text-xl font-semibold tracking-tight text-zinc-950">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-zinc-600">{desc}</p>
    </motion.div>
  );
}

export default function Home() {
  return (
    <div className="-mx-4 bg-white text-zinc-950 selection:bg-[#22331d] selection:text-white">
      {/* HERO */}
      <section className="relative overflow-hidden px-4 pb-14 pt-6 md:pb-16 md:pt-10">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-44 left-1/2 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-[#22331d]/10 blur-3xl" />
          <div className="absolute top-8 right-[-100px] h-[420px] w-[420px] rounded-full bg-[#8f9c69]/12 blur-3xl" />
          <div className="absolute left-[8%] top-[22%] h-[220px] w-[220px] rounded-full bg-[#d7b65a]/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-wrap gap-2">
                <Pill>De anestesiologista para anestesiologista</Pill>
                <Pill>Assistente pessoal em anestesia</Pill>
                <Pill>iPhone e iPad</Pill>
              </div>

              <h1 className="mt-6 text-5xl font-semibold tracking-tight text-zinc-950 md:text-7xl lg:leading-[1.03]">
                Sua rotina anestésica, <br />
                <span className="text-[#7b8461]">com menos carga mental.</span>
              </h1>

              <div className="mt-6 space-y-4">
                <p className="text-[1.6rem] font-medium tracking-tight text-zinc-800 md:text-2xl">
                  Organize seus plantões, acompanhe seus casos e registre com mais clareza.
                </p>
                <p className="max-w-xl text-lg leading-8 text-zinc-500">
                  O Anest+ transforma um processo manual e cansativo em um fluxo mais rápido,
organizado e confiável, mantendo a ficha anestésica no centro da rotina clínica.

                </p>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href={APPSTORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-14 items-center justify-center rounded-2xl bg-[#1a2718] px-8 text-sm font-bold text-white shadow-xl transition-all hover:scale-[1.02] hover:bg-[#22331d]"
                >
                  Baixar o Anest+ na App Store
                </a>

                <Link
                  href="/produto"
                  className="group flex items-center gap-1 text-sm font-bold text-zinc-900"
                >
                  Ver como funciona
                  <ChevronRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </div>

              <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
                {[
                  "Calendário de plantões",
                  "Ficha anestésica completa",
                  "Registro durante o caso",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-2xl border border-[#b9963b]/20 bg-[#fafaf7] px-4 py-3 text-sm font-semibold text-zinc-700 shadow-sm"
                  >
                    <CheckCircle2 size={16} className="text-[#7a865f]" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-3">
                <div className="inline-flex items-center gap-3 rounded-2xl border border-[#b9963b]/25 bg-[#fbfaf5] p-1.5 pr-4 shadow-sm">
                  <span className="flex h-8 items-center rounded-xl bg-[#1a2718] px-3 text-xs font-bold text-[#e0bf62] shadow-sm">
                    ANESTFRIEND
                  </span>
                  <span className="text-sm font-medium text-zinc-600">
                    Ative 7 dias grátis com este código
                  </span>
                </div>

                <p className="text-sm leading-6 text-zinc-500">
                  Quer ver o app em uso? No{" "}
                  <a
                    href="https://instagram.com/anestplus"
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative lg:ml-auto"
            >
              <div className="absolute inset-0 rounded-[42px] bg-[radial-gradient(circle_at_center,rgba(185,150,59,0.18),transparent_65%)] blur-2xl" />

              <div className="relative rounded-[36px] border border-[#b9963b]/25 bg-white/90 p-3 shadow-[0_24px_80px_-36px_rgba(26,39,24,0.45)]">
                <div className="overflow-hidden rounded-[28px] border border-zinc-200/70 bg-white">
                  <Image
                    src="/screens/app-hero-case-summary.jpg"
                    alt="Resumo da ficha anestésica no Anest+"
                    width={400}
                    height={800}
                    className="h-auto w-full object-cover"
                    priority
                  />
                </div>
              </div>

              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -left-14 top-2 hidden max-w-[290px] rounded-2xl border border-[#b9963b]/20 bg-white/95 px-5 py-4 shadow-xl backdrop-blur-md lg:block"
              >
<p className="mt-1 text-sm font-bold leading-5 text-zinc-950">
  Mais fluidez no registro anestésico.
</p>
              </motion.div>

              <p className="mt-6 text-center text-xs font-medium text-zinc-500 lg:text-left">
                Screenshot real do app.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* VALOR CENTRAL */}
      <section className="bg-zinc-50/50 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#7a865f]">
              Valor central
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950 md:text-5xl">
              Mais produtividade, mais clareza e menos peso na rotina
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-4">
            <Card
              icon={Calendar}
              title="Rotina organizada"
              desc="Calendário de plantões, recorrência automática e visão mais clara da sua agenda profissional."
            />
            <Card
              icon={Zap}
              title="Produtividade"
              desc="Menos tempo preenchendo manualmente, reorganizando dados e reconstruindo o caso ao final."
            />
            <Card
              icon={Activity}
              title="Conforto mental"
              desc="Menos improviso, menos microdecisões repetidas e mais clareza no fluxo intraoperatório."
            />
            <Card
              icon={Lock}
              title="Privacidade total"
              desc="Sem banco de dados na nuvem. Suas fichas, plantões e dados financeiros ficam apenas no seu dispositivo."
            />
          </div>
        </div>
      </section>

      {/* ORIGEM */}
      <section className="px-4 py-20 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7a865f]">
            A origem do produto
          </p>
          <h2 className="mt-6 text-4xl font-black tracking-tight leading-tight text-zinc-950 md:text-5xl">
            Não é um software genérico. <br />
            É a vivência real do centro cirúrgico.
          </h2>
          <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-zinc-600">
            O Anest+ nasceu da necessidade de substituir o improviso do papel por uma ferramenta
            que auxilia o anestesiologista, reduz onde ele perde tempo e melhora o que mais pesa no registro clínico do dia a dia.
          </p>

          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-3 rounded-2xl border border-[#b9963b]/20 bg-[#fbfaf5] px-6 py-3 shadow-sm">
              <Lock size={18} className="text-[#7a865f]" />
              <span className="text-sm font-bold uppercase tracking-wide text-zinc-700">
                100% offline e privado
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUTO */}
      <section className="px-4 py-14 md:py-16">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            title="Mais do que uma ficha digital"
            subtitle="Um assistente completo para organizar a rotina anestésica, auxiliar no recebimento dos plantões, acompanhar o caso com mais fluidez e terminar com uma ficha anestésica mais clara e consistente."
          />

          <div className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
            <div className="rounded-[40px] border border-[#b9963b]/15 bg-[#f6f7f1] p-8 shadow-sm md:p-12">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#7a865f]">
                Núcleo do produto
              </p>
              <h3 className="mt-8 text-4xl font-bold tracking-tight text-zinc-950 md:text-5xl">
                Calendário, ficha anestésica e evolução do caso em um só fluxo
              </h3>
              <p className="mt-6 text-lg leading-relaxed text-zinc-600">
                O Anest+ centraliza a rotina do anestesiologista: organiza plantões,
                acelera o início do caso, acompanha o intraoperatório e deixa o registro
                anestésico muito mais fluido ao longo do procedimento.
              </p>

              <div className="mt-10 grid gap-4 md:grid-cols-2">
                {[
                  "Perfil e hospitais com identidade visual",
                  "Calendário com recorrência automática",
                  "Linha do tempo do caso",
                  "Ficha anestésica mais clara ao final",
                ].map((f) => (
                  <div
                    key={f}
                    className="flex items-center gap-4 rounded-3xl border border-[#b9963b]/15 bg-white p-6 text-sm font-semibold text-zinc-800 transition-all hover:bg-zinc-50 hover:shadow-md"
                  >
                    <CheckCircle2 size={18} className="text-[#b9963b]" />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid content-start gap-4">
              <Card
                icon={Settings2}
                title="Protocolos e presets"
                desc="Acelere o início da ficha com padrões prontos de anestesia, monitores e fármacos usuais."
              />
              <Card
                icon={QrCode}
                title="QR Code entre usuários"
                desc="Facilite a continuidade de casos em andamento na passagem de plantão entre anestesiologistas."
              />
              <Card
                icon={Scan}
                title="Scanner inteligente"
                desc="Leia identificações e cabeçalhos de exames para preencher Nome, Idade e Registro na hora."
              />
              <Card
                icon={Wallet}
                title="Calendário e financeiro"
                desc="Organize plantões, acompanhe sua produção por hospital e concentre sua rotina profissional no mesmo ecossistema."
              />
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="bg-zinc-50/50 px-4 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            title="Como funciona"
            subtitle="Um fluxo simples para organizar sua rotina, acompanhar o caso e terminar com uma ficha anestésica mais consistente."
          />

          <div className="grid gap-6 md:grid-cols-3">
            <StepCard
              step="Etapa 1"
              title="Organize sua base profissional"
              desc="Configure perfil, hospitais e calendário para deixar o app pronto para a sua rotina real."
            />
            <StepCard
              step="Etapa 2"
              title="Acompanhe o caso durante o intraoperatório"
              desc="Atualize sinais vitais, parâmetros, fluidos, descrição clínica e medicações conforme o caso acontece."
            />
            <StepCard
              step="Etapa 3"
              title="Finalize com uma ficha mais clara"
              desc="Ao término, o app consolida o caso em uma ficha anestésica organizada, legível e fácil de revisar."
            />
          </div>
        </div>
      </section>

      {/* DURANTE O CASO */}
      <section className="px-4 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <motion.div
              initial={{ opacity: 0, rotate: -2 }}
              whileInView={{ opacity: 1, rotate: 0 }}
              viewport={{ once: true }}
              className="relative mx-auto w-full max-w-[460px] lg:mx-0"
            >
              <div className="rounded-[40px] border border-[#b9963b]/18 bg-white p-4 shadow-2xl transition-transform hover:rotate-1">
                <div className="overflow-hidden rounded-[28px] border border-zinc-200/70 bg-zinc-50">
                  <Image
                    src="/screens/app-pdf-final.jpg"
                    alt="Ficha anestésica finalizada no Anest+"
                    width={600}
                    height={800}
                    className="h-auto w-full"
                  />
                </div>
              </div>
            </motion.div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#7a865f]">
                Durante e ao final do caso
              </p>
              <h2 className="mt-6 text-4xl font-black tracking-tight text-zinc-950 md:text-6xl lg:leading-[1.02]">
                Um registro mais fluido no intraoperatório e mais claro ao final
              </h2>
              <p className="mt-8 text-lg leading-8 text-zinc-600 md:text-xl">
                O foco do Anest+ é facilitar sua rotina. Ele otimiza o preenchimento e mantém coerência no registro clínico. Menos improviso durante o caso, mais organização
                no seu plantão.
              </p>

              <div className="mt-10 space-y-4">
                {[
                  "Ajuste sinais vitais apenas deslizando os campos, sem depender de digitação constante.",
                  "Distribuição automática de fluidos, diurese e infusões contínuas ao longo da evolução.",
                  "Medicações, parâmetros e descrição anestésica em um fluxo mais claro e estruturado.",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-4 rounded-3xl border border-[#b9963b]/15 bg-white px-5 py-4 shadow-sm"
                  >
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#b9963b] text-white">
                      <CheckCircle2 size={14} strokeWidth={3} />
                    </div>
                    <p className="text-sm font-semibold leading-relaxed text-zinc-700">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RECURSOS CLÍNICOS */}
      <section className="bg-zinc-50/50 px-4 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            title="Feito para a rotina real do centro cirúrgico"
            subtitle="Recursos pensados para facilitar o preenchimento e manter mais clareza na ficha anestésica."
          />

          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[40px] border border-[#b9963b]/15 bg-[#f6f7f1] p-8 shadow-sm md:p-10">
              <h3 className="max-w-md text-2xl font-semibold tracking-tight text-zinc-950">
                Estrutura para acompanhar o caso com mais fluidez
              </h3>
              <p className="mt-6 text-lg leading-relaxed text-zinc-600">
                Tudo foi pensado para que a ficha anestésica acompanhe o caso enquanto ele acontece,
                sem pesar mais do que o necessário no seu fluxo de trabalho.
              </p>

              <div className="mt-10 space-y-4">
                {[
                  {
                    t: "Linha do tempo automática para facilitar a evolução intraoperatória",
                    i: Clock,
                  },
                  {
                    t: "Ajuste dos sinais vitais apenas deslizando o dedo",
                    i: SlidersHorizontal,
                  },
                  {
                    t: "Fluidos, diurese e infusões contínuas distribuídos automaticamente",
                    i: Droplets,
                  },
                ].map((item) => (
                  <div
                    key={item.t}
                    className="flex items-center gap-4 rounded-2xl border border-[#b9963b]/15 bg-white px-5 py-4 text-sm font-semibold text-zinc-800 shadow-sm"
                  >
                    <item.i size={20} className="text-[#7a865f] shrink-0" />
                    <span className="leading-snug">{item.t}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <Card
                icon={FileText}
                title="Medicamentos estruturados"
                desc="Dose, via e organização clara para manter a prescrição coerente e o caso mais consistente."
              />
              <Card
                icon={ClipboardPen}
                title="Descrição anestésica"
                desc="Registre indução, manutenção e despertar com liberdade clínica e mais organização."
              />
              <Card
                icon={User}
                title="Perfil profissional pronto"
                desc="Nome, CRM e RQE sempre preparados para o fluxo das fichas e do seu contexto clínico."
              />
              <Card
                icon={Building2}
                title="Hospitais personalizados"
                desc="Adapte o uso do app à realidade de cada serviço, com mais contexto e identidade visual."
              />
            </div>
          </div>
        </div>
      </section>

      {/* INSTITUCIONAL CTA */}
      <section className="px-4 py-14 md:py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[48px] bg-[#162014] px-8 py-10 text-white shadow-2xl md:px-14 md:py-14"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(217,180,74,0.14),transparent_35%)]" />
            <div className="absolute inset-0 opacity-15 [background-image:radial-gradient(#d9b44a_1px,transparent_1px)] [background-size:24px_24px]" />

            <div className="relative z-10">
              <p className="mb-6 text-[11px] font-black uppercase tracking-[0.4em] text-[#d9c57d]">
                Modelo institucional
              </p>
              <h3 className="text-4xl font-black tracking-tight md:text-6xl lg:leading-[1.04]">
                Leve mais padronização e clareza para sua equipe
              </h3>
              <p className="mt-8 text-lg leading-8 text-[#d8dccf] md:text-xl">
                Implantação orientada ao fluxo local, com ficha anestésica mais legível,
                identidade institucional e uma estrutura pronta para fortalecer a documentação da equipe.
              </p>

              <div className="mt-12 flex flex-wrap gap-4">
                {[
                  { t: "Padronização do registro", i: ShieldCheck },
                  { t: "Identidade visual do hospital", i: LayoutIcon },
                  { t: "Implantação orientada ao fluxo local", i: Settings2 },
                ].map((f) => (
                  <div
                    key={f.t}
                    className="flex items-center gap-3 rounded-2xl border border-[#d9b44a]/20 bg-white/5 px-5 py-3 text-sm font-bold backdrop-blur-md"
                  >
                    <f.i size={16} className="shrink-0 text-[#d9b44a]" />
                    <span>{f.t}</span>
                  </div>
                ))}
              </div>

              <div className="mt-12 flex flex-wrap gap-6">
                <Link
                  href="/hospitais"
                  className="inline-flex h-14 items-center justify-center rounded-2xl bg-[#d9b44a] px-10 text-sm font-bold text-[#162014] shadow-lg shadow-black/20 transition-transform hover:scale-105"
                >
                  Ver modelo institucional
                </Link>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-14 items-center gap-2 rounded-2xl border border-[#d9b44a]/25 bg-white/5 px-10 text-sm font-bold backdrop-blur-md transition-colors hover:bg-white/10"
                >
                  <MessageCircle size={20} /> Falar no WhatsApp
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ LIGHT */}
      <section className="px-4 pb-16 md:pb-20">
        <div className="mx-auto max-w-5xl">
          <SectionTitle
            align="center"
            title="Dúvidas frequentes"
            subtitle="Respostas diretas sobre uso individual, modelo institucional e fluxo do app."
          />

          <div className="grid gap-6 md:grid-cols-2">
            <Card
              title="O Anest+ é só uma ficha anestésica digital?"
              desc="Não. O Anest+ é seu assistente pessoal em anestesia, ajudando a organizar plantões, rotina profissional e o preenchimento da ficha anestésica, com menos peso no plantão."
            />
            <Card
  title="Preciso parar o caso para ficar mexendo no app?"
  desc="Não. O app foi pensado para entrar no fluxo do intraoperatório com praticidade, ajudando no registro sem virar uma tarefa paralela pesada."
/>
            <Card
              title="Serve para uso individual e institucional?"
              desc="Sim. Você pode usar o Anest+ individualmente, mas também existe um modelo institucional para hospitais e equipes. Fale conosco para agendar uma demonstração."
            />
            <div className="group rounded-[36px] border border-[#b9963b]/20 bg-[#fbfaf5] p-8 shadow-sm transition-all hover:border-[#b9963b]/40">
              <p className="text-xl font-bold tracking-tight text-zinc-950">
                Quero levar para o meu hospital. Como faço?
              </p>
              <p className="mt-4 text-base leading-relaxed text-zinc-600">
                Fale comigo no{" "}
                <a
                  className="font-bold text-zinc-950 underline decoration-[#b9963b]/60 underline-offset-4 transition-colors hover:decoration-[#b9963b]"
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>{" "}
                e eu explico o modelo institucional, a implantação e a adaptação do
                Anest+ ao fluxo da sua instituição.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FECHAMENTO */}
      <section className="px-4 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mx-auto max-w-md"
        >
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-300">
              De anestesiologista, para anestesiologista.
            </p>
            <p className="text-sm font-medium text-zinc-500">
              Anest+. Seu assistente pessoal em anestesia.
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
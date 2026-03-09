"use client";

import Link from "next/link";
import Image from "next/image";
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
  User,
  Building2,
  ClipboardPen,
  Wallet,
  FileCheck2,
  type LucideIcon,
} from "lucide-react";

const APPSTORE_URL = "https://apps.apple.com/br/app/anest/id6753714859";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

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
      className={`overflow-hidden rounded-[28px] border border-[#b9963b]/15 bg-black shadow-[0_24px_80px_-36px_rgba(26,39,24,0.32)] ${className}`}
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

export default function ProdutoClient() {
  return (
    <div className="-mx-4 bg-[#FCFCFC] text-zinc-950 selection:bg-[#162014] selection:text-[#e0bf62]">
      {/* HERO */}
      <section className="relative overflow-hidden px-6 pb-12 pt-8 md:pb-16 md:pt-10">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-44 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#22331d]/12 blur-[90px]" />
          <div className="absolute top-8 right-[-100px] h-[350px] w-[350px] rounded-full bg-[#8f9c69]/10 blur-[72px]" />
        </div>

        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <motion.div initial="hidden" animate="visible" variants={containerVariants}>
              <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
                <Pill>Fluxo clínico completo</Pill>
                <Pill>Ficha anestésica digital</Pill>
                <Pill>Feito por anestesiologista</Pill>
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="mt-8 text-4xl font-black tracking-tight text-zinc-950 md:text-5xl lg:text-6xl lg:leading-[1.05]"
              >
                Entenda como o Anest+ funciona na <br />
                <span className="bg-gradient-to-r from-[#7b8461] to-[#b9963b] bg-clip-text text-transparent">
                  rotina real do centro cirúrgico
                </span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="mt-6 max-w-2xl text-lg leading-8 text-zinc-500 md:text-xl"
              >
                Do perfil à ficha anestésica finalizada, o app organiza o registro
                com mais clareza, menos retrabalho e um fluxo pensado para o
                intraoperatório.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="mt-8 grid gap-3 text-sm sm:grid-cols-3"
              >
                {[
                  "Fluxo rápido e padronizado",
                  "Evolução durante o caso",
                  "Ficha anestésica finalizada",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-2xl border border-[#b9963b]/20 bg-white/60 px-4 py-3 font-black uppercase tracking-[0.16em] text-zinc-700 shadow-sm backdrop-blur-xl"
                  >
                    <CheckCircle2 size={16} className="text-[#b9963b] shrink-0" />
                    <span className="leading-snug">{item}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45 }}
              className="relative mx-auto w-full max-w-[260px] sm:max-w-[300px] lg:max-w-[340px]"
            >
              <div className="absolute inset-0 rounded-[36px] bg-[radial-gradient(circle_at_center,rgba(185,150,59,0.16),transparent_68%)] blur-2xl" />
              <ScreenFrame
                src="/screens/app-hero-case-summary.jpg"
                alt="Resumo do caso e gráfico de sinais vitais no Anest+"
                className="relative"
                priority
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* BASE PRONTA */}
      <section className="px-6 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14">
            <h2 className="text-4xl font-black tracking-tight text-zinc-950 md:text-5xl">
              Comece com sua base pronta
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-500 md:text-xl">
              Antes da primeira ficha, você organiza o que é fixo na sua rotina:
              perfil, assinatura e hospitais.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
              <Card
                icon={User}
                title="Perfil do anestesiologista"
                desc="Cadastre nome, CRM e RQE uma vez para manter sua identificação pronta em todas as fichas."
              />
              <Card
                icon={Building2}
                title="Hospitais e identidade visual"
                desc="Use hospitais personalizados ou oficiais, com nome e logotipo, para adaptar o fluxo à realidade de cada serviço."
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:justify-items-center">
              <ScreenFrame
                src="/screens/produto-perfil.jpg"
                alt="Tela de perfil do usuário no Anest+"
                className="mx-auto max-w-[320px]"
              />
              <ScreenFrame
                src="/screens/produto-hospitais.jpg"
                alt="Seleção de hospitais no Anest+"
                className="mx-auto max-w-[320px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* NOVO CASO */}
      <section className="bg-zinc-50/50 px-6 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div>
              <h2 className="text-4xl font-black tracking-tight text-zinc-950 md:text-5xl">
                Crie sua ficha anestésica com rapidez
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-500 md:text-xl">
                Os dados do paciente e do procedimento entram em uma estrutura
                clara, validada e pronta para acompanhar o caso desde o início.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  "Paciente, idade, sexo e registro",
                  "ASA, cirurgia e anestesia",
                  "Hospital e plano",
                  "Base pronta para começar o caso",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-[#b9963b]/15 bg-white px-5 py-4 text-sm font-semibold text-zinc-800 shadow-sm"
                  >
                    <CheckCircle2 size={18} className="text-[#b9963b]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <ScreenFrame
                src="/screens/produto-novo-caso.jpg"
                alt="Criação de novo caso no Anest+"
                className="max-w-[320px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FLUXO */}
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

          <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-start">
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

            <div className="flex justify-center lg:justify-end">
              <ScreenFrame
                src="/screens/produto-monitores-parametros.jpg"
                alt="Monitores, parâmetros, acessos e descrição anestésica no Anest+"
                className="max-w-[320px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* DURANTE O CASO */}
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

          <div className="grid gap-8 lg:grid-cols-[0.96fr_1.04fr] lg:items-start">
            <div className="grid gap-6 md:grid-cols-2">
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

            <div className="grid gap-6 md:grid-cols-2 lg:justify-items-center">
              <ScreenFrame
                src="/screens/produto-descricao.jpg"
                alt="Descrição da anestesia no Anest+"
                className="mx-auto max-w-[320px]"
              />
              <ScreenFrame
                src="/screens/produto-farmacos.jpg"
                alt="Fármacos organizados na ficha anestésica do Anest+"
                className="mx-auto max-w-[320px]"
              />
            </div>
          </div>
        </div>
            </section>

      {/* FICHA FINALIZADA */}
      <section className="px-6 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[0.98fr_1.02fr] lg:items-center">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#b9963b]">
                Ficha anestésica finalizada
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-tight text-zinc-950 md:text-5xl">
                Do intraoperatório ao documento final, sem complicação
              </h2>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-500 md:text-xl">
                Ao término do caso, o Anest+ consolida cabeçalho, parâmetros,
                fármacos, sinais vitais e descrição anestésica em uma ficha
                anestésica clara, padronizada e pronta para impressão,
                exportação ou compartilhamento.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <Card
                  icon={FileCheck2}
                  title="Documento organizado"
                  desc="Todos os blocos do caso são reunidos em uma estrutura limpa e fácil de revisar."
                />
                <Card
                  icon={ShieldCheck}
                  title="Padronização visual"
                  desc="A ficha mantém consistência de leitura e apresentação, inclusive no contexto institucional."
                />
                <Card
                  icon={CheckCircle2}
                  title="Pronta para o fluxo real"
                  desc="Você pode imprimir, exportar ou compartilhar conforme a necessidade do serviço."
                />
                <Card
                  icon={Activity}
                  title="Resumo fiel do caso"
                  desc="O documento final reflete a evolução registrada durante o intraoperatório."
                />
              </div>
            </div>

            <div className="rounded-[36px] border border-[#b9963b]/15 bg-[#f6f7f1] p-4 md:p-5">
              <ScreenFrame
                src="/screens/app-pdf-final.jpg"
                alt="Ficha anestésica finalizada no Anest+"
              />
            </div>
          </div>
        </div>
      </section>

      {/* PROTOCOLOS */}
      <section className="px-6 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div>
              <h2 className="text-4xl font-black tracking-tight text-zinc-950 md:text-5xl">
                Protocolos que aceleram a ficha
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-500 md:text-xl">
                Use padrões prontos de anestesia como ponto de partida e mantenha
                mais consistência no registro, sem abrir mão da personalização do caso.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <Card
                  icon={ClipboardPen}
                  title="Descrição pronta"
                  desc="Textos-base ajudam a iniciar a ficha com mais rapidez e padronização."
                />
                <Card
                  icon={ShieldCheck}
                  title="Fármacos usuais"
                  desc="Itens recorrentes podem entrar como base, mantendo a coerência do registro."
                />
                <Card
                  icon={Activity}
                  title="Grade de monitores"
                  desc="Aplique estruturas prontas conforme a técnica anestésica escolhida."
                />
                <Card
                  icon={Settings2}
                  title="Presets próprios"
                  desc="Além dos padrões, você pode criar seus próprios fluxos para diferentes rotinas."
                />
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <ScreenFrame
                src="/screens/produto-protocolos.jpg"
                alt="Tela de protocolos no Anest+"
                className="max-w-[320px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* EXTRA FEATURES */}
      <section className="bg-zinc-50/50 px-6 py-20 md:py-24">
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

      {/* CALENDÁRIO + FINANCEIRO */}
      <section className="px-6 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14">
            <h2 className="text-4xl font-black tracking-tight text-zinc-950 md:text-5xl">
              Organização além da ficha
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-500 md:text-xl">
              O Anest+ também ajuda a visualizar plantões, recorrências e pagamentos
              no mesmo ecossistema de trabalho.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.96fr_1.04fr] lg:items-start">
            <div className="grid gap-6 md:grid-cols-2">
              <Card
                icon={Calendar}
                title="Calendário de plantões"
                desc="Visualize a escala em uma estrutura clara, com recorrências e datas organizadas no mesmo ambiente."
              />
              <Card
                icon={Wallet}
                title="Controle financeiro"
                desc="Acompanhe pagamentos, valores pendentes e uma visão mais clara da produção por período."
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:justify-items-center">
              <ScreenFrame
                src="/screens/produto-calendario.jpg"
                alt="Calendário de plantões no Anest+"
                className="mx-auto max-w-[320px]"
              />
              <ScreenFrame
                src="/screens/produto-financeiro.jpg"
                alt="Tela de financeiro no Anest+"
                className="mx-auto max-w-[320px]"
              />
            </div>
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
  Anest+. Seu assistente pessoal em anestesia.
</h2>
<p className="mt-8 text-lg leading-8 text-[#d8dccf] md:text-xl">
  Organize casos, crie fichas anestésicas, aplique protocolos, acompanhe seu calendário de
  plantões e visualize seu relatório financeiro, tudo em um só lugar.
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
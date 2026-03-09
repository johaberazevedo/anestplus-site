"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { CheckCircle2, Info, HelpCircle, Bug, Mail, MessageCircle } from "lucide-react";

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

export default function SuportePage() {
  return (
    <div className="-mx-4 overflow-hidden bg-white text-zinc-950 selection:bg-[#162014] selection:text-[#e0bf62]">
      {/* HERO */}
      <section className="relative px-6 pb-12 pt-12 md:pb-20 md:pt-20">
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
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mx-auto max-w-6xl"
        >
          <motion.div variants={fadeUpVariants} className="flex justify-center md:justify-start">
            <Pill>Central de Ajuda</Pill>
          </motion.div>
          <motion.h1 variants={fadeUpVariants} className="mt-6 text-center text-4xl font-black tracking-tight text-zinc-950 md:text-left md:text-6xl lg:leading-[0.98]">
            Suporte Anest+
          </motion.h1>
          <motion.p variants={fadeUpVariants} className="mt-6 text-center text-lg leading-8 text-zinc-500 md:text-left md:max-w-2xl md:text-xl">
            O Anest+ foi criado para facilitar, padronizar e dar segurança ao registro anestésico. 
            Se algo não estiver claro ou você encontrou um problema, estamos aqui para ajudar.
          </motion.p>
        </motion.div>
      </section>

      {/* CONTENT */}
      <section className="px-6 pb-24">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1fr_320px] lg:gap-20"
        >
          {/* COLUNA PRINCIPAL */}
          <div className="space-y-16">
            
            {/* COMEÇANDO */}
            <motion.section variants={fadeUpVariants}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b9963b]/10 text-[#b9963b]">
                  <Info size={20} strokeWidth={2} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-950">
                  Começando
                </h2>
              </div>
              <div className="mt-6 rounded-[32px] border border-zinc-200/80 bg-white p-8 shadow-sm">
                <ul className="space-y-5">
                  {[
                    "Permita o uso de Localização “Durante o uso do app” para auxiliar a seleção do hospital por geofencing institucional.",
                    "Selecione o hospital ativo para padronizar a ficha e aplicar a identidade visual no relatório final.",
                    "Crie um novo caso e preencha os dados iniciais do paciente (ou use o scanner inteligente) para montar sua linha do tempo.",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4 text-zinc-600">
                      <CheckCircle2 className="mt-0.5 shrink-0 text-[#7a865f]" size={20} />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.section>

            {/* RECURSOS ÚTEIS */}
            <motion.section variants={fadeUpVariants}>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-950">
                Recursos úteis
              </h2>
              <div className="mt-6 rounded-[32px] border border-zinc-200/80 bg-white p-8 shadow-sm">
                <ul className="space-y-5">
                  {[
                    "Ajuste os valores de sinais vitais apenas deslizando os campos (sliding), sem precisar digitar.",
                    "Personalize monitores e parâmetros: adicione gases, acessos e detalhe alergias.",
                    "Distribuição automática nas colunas para diurese, fluidos e marcação de infusões contínuas.",
                    "Acelere o início do caso aplicando Protocolos prontos (Raqui, Geral, Sedação) ou crie seus próprios Presets.",
                    "Exporte, imprima ou compartilhe o PDF completo e organizado para integração ao prontuário.",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4 text-zinc-600">
                      <CheckCircle2 className="mt-0.5 shrink-0 text-[#7a865f]" size={20} />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.section>

            {/* FAQ */}
            <motion.section variants={fadeUpVariants}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b9963b]/10 text-[#b9963b]">
                  <HelpCircle size={20} strokeWidth={2} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-950">
                  Perguntas Frequentes (FAQ)
                </h2>
              </div>
              <div className="mt-6 grid gap-4">
                {[
                  {
                    q: "Meus dados ou dados de pacientes são enviados para alguma nuvem?",
                    a: "Não. O Anest+ é 100% local-first. Seus registros clínicos (sinais vitais, fármacos, relatórios) ficam apenas no dispositivo. Nós não coletamos nem transmitimos dados clínicos para servidores."
                  },
                  {
                    q: "Para que o aplicativo usa a minha localização?",
                    a: "A permissão de localização (Ao usar o app) serve exclusivamente para o geofencing institucional. Ela auxilia a sugerir o hospital correto em que você está. O processamento é feito localmente no celular."
                  },
                  {
                    q: "O app funciona sem internet?",
                    a: "Sim. Como o banco de dados é interno no seu dispositivo, a internet é necessária apenas para enviar relatórios por e-mail/WhatsApp ou baixar atualizações pela App Store."
                  },
                  {
                    q: "O hospital pode ter acesso às minhas fichas pelo app?",
                    a: "Em ambiente institucional, o hospital é responsável pelas diretrizes e guarda dos documentos. O aplicativo gera o PDF final e cabe ao profissional exportar e integrar ao prontuário do paciente conforme a regra da unidade."
                  },
                  {
                    q: "E se eu trocar de iPhone?",
                    a: "Como o armazenamento é local, recomendamos que você faça o backup completo e criptografado do seu dispositivo (via iCloud) ou utilize a função de exportação manual antes de trocar de aparelho."
                  }
                ].map((faq, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ y: -2, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="group rounded-3xl border border-zinc-200/70 bg-zinc-50/50 p-6 transition-colors hover:border-[#b9963b]/30 hover:bg-white hover:shadow-md"
                  >
                    <h3 className="font-bold text-zinc-950 transition-colors group-hover:text-[#b9963b]">{faq.q}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-600">{faq.a}</p>
                  </motion.div>
                ))}
              </div>
            </motion.section>

          </div>

          {/* SIDEBAR */}
          <motion.div variants={fadeUpVariants} className="space-y-6">
            <div className="rounded-[32px] border border-[#b9963b]/20 bg-gradient-to-br from-[#fbfaf5] to-white p-8 shadow-md">
              <h3 className="text-xl font-bold text-zinc-950">Precisa de ajuda?</h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                Fale com a gente para dúvidas, feedbacks ou para solicitar novas funções.
              </p>
              <div className="mt-8 space-y-3">
                <a
                  href="mailto:anestplus@outlook.com"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1a2718] px-4 py-3.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#22331d] hover:shadow-lg hover:shadow-[#1a2718]/20"
                >
                  <Mail size={18} /> Enviar E-mail
                </a>
                <a
                  href="https://wa.me/5571992288755"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-sm font-bold text-zinc-900 transition-all hover:-translate-y-0.5 hover:bg-zinc-50 hover:shadow-md"
                >
                  <MessageCircle size={18} /> Chamar no WhatsApp
                </a>
              </div>
              <p className="mt-6 text-center text-xs font-medium uppercase tracking-wider text-zinc-400">
                Tempo de resposta: 1–2 dias
              </p>
            </div>

            <div className="rounded-[32px] border border-zinc-200/80 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
                  <Bug size={20} strokeWidth={2} />
                </div>
                <h3 className="font-bold text-zinc-950">Reportar bug</h3>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-zinc-600">
                Ao nos contatar sobre um erro, inclua:
              </p>
              <ul className="mt-4 space-y-3 text-sm font-medium text-zinc-500">
                <li className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#b9963b]" />
                  Modelo do iPhone / iOS
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#b9963b]" />
                  Versão do app
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#b9963b]" />
                  Passo a passo do erro
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#b9963b]" />
                  Captura de tela (se possível)
                </li>
              </ul>
            </div>
            
            <div className="flex flex-col gap-3 pt-4">
              <Link href="/privacidade" className="inline-flex items-center text-sm font-semibold text-zinc-500 transition-colors hover:text-[#b9963b]">
                Ler Política de Privacidade <span className="ml-1 text-lg leading-none">→</span>
              </Link>
              <Link href="/termos" className="inline-flex items-center text-sm font-semibold text-zinc-500 transition-colors hover:text-[#b9963b]">
                Ler Termos de Uso <span className="ml-1 text-lg leading-none">→</span>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
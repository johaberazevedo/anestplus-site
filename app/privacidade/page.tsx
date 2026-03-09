"use client";

import { motion, Variants } from "framer-motion";
import { Database, MapPin, Share2, ShieldAlert, Lock, UserCog, Settings2, Scale } from "lucide-react";

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

function PolicySection({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) {
  return (
    <motion.section 
      variants={fadeUpVariants}
      className="group relative overflow-hidden rounded-[32px] border border-zinc-200/80 bg-white p-8 shadow-sm transition-all hover:border-[#b9963b]/30 hover:shadow-md"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#b9963b]/0 to-[#b9963b]/[0.03] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-50 text-[#7a865f] transition-colors duration-500 group-hover:bg-[#b9963b]/10 group-hover:text-[#b9963b]">
          <Icon size={24} strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-zinc-950">
          {title}
        </h2>
      </div>
      <div className="relative z-10 mt-6 text-base leading-8 text-zinc-600">
        {children}
      </div>
    </motion.section>
  );
}

export default function PrivacidadePage() {
  return (
    <div className="-mx-4 overflow-hidden bg-[#FCFCFC] px-6 py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-44 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#b9963b]/5 blur-[100px]" />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="mx-auto max-w-3xl"
      >
        <motion.div variants={fadeUpVariants} className="mb-4">
          <span className="inline-flex items-center rounded-full border border-[#b9963b]/25 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#b9963b] shadow-sm">
            Documentação Oficial
          </span>
        </motion.div>
        
        <motion.h1 variants={fadeUpVariants} className="text-4xl font-black tracking-tight text-zinc-950 md:text-5xl lg:text-6xl">
          Política de Privacidade
        </motion.h1>
        <motion.p variants={fadeUpVariants} className="mt-6 text-lg leading-8 text-zinc-500">
          Levamos a privacidade a sério. O aplicativo Anest+ é controlado pela equipe de desenvolvimento do app. Contato Oficial: <strong>anestplus@outlook.com</strong>.
        </motion.p>

        <div className="mt-14 space-y-6">
          <PolicySection title="Coleta e natureza dos dados" icon={Database}>
            <div className="space-y-4">
              <p>O Anest+ foi projetado para funcionar <strong>localmente</strong>, sem coleta de dados pelo desenvolvedor e <strong>sem envio</strong> de informações a servidores do controlador. O app <strong>não utiliza</strong> SDKs de analytics de terceiros.</p>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <ShieldAlert className="mt-1 shrink-0 text-zinc-400" size={18} />
                  <span><strong>Dados locais (não saem do dispositivo):</strong> prontuários, sinais vitais, fármacos, anotações e PDFs exportados. Esses dados são armazenados apenas localmente, sem envio a servidores externos.</span>
                </li>
                <li className="flex gap-3">
                  <MapPin className="mt-1 shrink-0 text-zinc-400" size={18} />
                  <span><strong>Permissão de Localização (“Ao usar o app”):</strong> utilizada <strong>exclusivamente</strong> para geofencing institucional, a fim de auxiliar a seleção do hospital; processamento no dispositivo e <strong>sem transmissão</strong> ao desenvolvedor.</span>
                </li>
                <li className="flex gap-3">
                  <Share2 className="mt-1 shrink-0 text-zinc-400" size={18} />
                  <span><strong>Permissão de Arquivos/Fotos:</strong> apenas para salvar ou compartilhar PDFs gerados pelo próprio aplicativo, mediante ação explícita do usuário.</span>
                </li>
              </ul>
            </div>
          </PolicySection>

          <PolicySection title="Finalidade do tratamento" icon={Settings2}>
            <ul className="list-inside list-disc space-y-2 marker:text-[#b9963b]">
              <li>Gerar e manter o <strong>registro anestésico digital</strong> do profissional.</li>
              <li>Identificar o <strong>hospital</strong> selecionado para aplicação do logotipo institucional no relatório.</li>
              <li>Sugerir a seleção de hospital por <strong>geofencing institucional</strong>, quando a permissão de localização estiver ativa, assim como limitar o uso do aplicativo ao ambiente hospitalar.</li>
            </ul>
          </PolicySection>

          <PolicySection title="Armazenamento e segurança" icon={Lock}>
            <div className="space-y-4">
              <p>Todos os dados clínicos são armazenados <strong>apenas no dispositivo</strong>, protegidos pelos mecanismos do iOS (PIN, Touch ID ou Face ID). O desenvolvedor <strong>não tem acesso remoto</strong> aos registros médicos. Não há sincronização em nuvem pelo aplicativo, nem compartilhamento com terceiros.</p>
              <p>O aplicativo oferece, <strong>por iniciativa exclusiva do usuário</strong>, a funcionalidade de exportação e importação de dados (backup local), permitindo que o próprio usuário gere arquivos para cópia, restauração ou migração entre dispositivos.</p>
              <p>Esses arquivos <strong>não são enviados, armazenados ou acessados pelo desenvolvedor</strong>, permanecendo sob controle exclusivo do usuário, que é responsável por sua guarda, armazenamento e eventual compartilhamento em serviços de sua escolha.</p>
            </div>
          </PolicySection>

          <PolicySection title="Contexto institucional e responsabilidade" icon={Scale}>
            <p>
              Em ambiente institucional, os <strong>hospitais</strong> são <strong>responsáveis pela governança e pelo tratamento</strong> dos dados clínicos gerados sob sua custódia (por exemplo, retenção, acesso interno e integrações locais), em conformidade com a <strong>LGPD (Lei nº 13.709/2018)</strong> e normas aplicáveis.
            </p>
          </PolicySection>

          <PolicySection title="Direitos do titular (LGPD) e Base Legal" icon={UserCog}>
            <div className="space-y-4">
              <p>O usuário pode, a qualquer momento: <strong>confirmar</strong> a existência de tratamento; solicitar <strong>acesso, correção, portabilidade ou exclusão</strong>; <strong>revogar consentimentos</strong>; e pedir informações adicionais sobre o tratamento.</p>
              <p>Para dados sob sua guarda no dispositivo, use os recursos do app (ex.: exclusão) e/ou entre em contato pelo e-mail <strong>anestplus@outlook.com</strong>. Em contexto institucional, contate também o hospital responsável quando os dados estiverem sob sua governança.</p>
              <p><strong>Base Legal:</strong> O Anest+ não realiza tratamento de dados clínicos como controlador. Quando aplicável, o tratamento de dados pessoais não sensíveis (como dados de contato para suporte) fundamenta-se no art. 7º, incisos I, V e IX da LGPD. O Anest+ <strong>não realiza transferências internacionais</strong> de dados.</p>
            </div>
          </PolicySection>

          <motion.div variants={fadeUpVariants} className="pt-8 text-center text-sm font-medium text-zinc-400">
            Última atualização: Março de 2026 • Versão 1.3.0
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
"use client";

import { motion, Variants } from "framer-motion";
import { Scale, ShieldAlert, Copyright, LifeBuoy, MapPin, CheckCircle2 } from "lucide-react";

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

function TermSection({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) {
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

export default function TermosPage() {
  return (
    <div className="-mx-4 overflow-hidden bg-[#FCFCFC] px-6 py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-44 right-1/4 h-[500px] w-[500px] rounded-full bg-[#8f9c69]/5 blur-[100px]" />
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
          Termos de Uso
        </motion.h1>
        <motion.p variants={fadeUpVariants} className="mt-6 text-lg leading-8 text-zinc-500">
          Ao baixar, instalar ou utilizar o Anest+, você declara ter lido, compreendido e aceitado integralmente estes Termos de Uso e a Política de Privacidade.
        </motion.p>

        <div className="mt-14 space-y-6">

          <TermSection title="Objeto" icon={Scale}>
            <div className="space-y-4">
              <p>O Anest+ é um software destinado a auxiliar profissionais de saúde no registro anestésico digital, organização de informações do ato anestésico e exportação de relatórios em PDF, podendo incluir identificação do hospital/local selecionado (como nome e/ou logotipo).</p>
              <p>O Anest+ não substitui prontuários oficiais da instituição, não realiza diagnóstico, prescrição ou conduta clínica, e não substitui o julgamento do profissional. O conteúdo registrado e o documento exportado são de responsabilidade exclusiva do usuário que os produz e assina.</p>
              <p><strong>Geofencing institucional:</strong> quando a permissão de localização estiver ativa, o app pode auxiliar a seleção do hospital por meio de geofencing processado <strong>no dispositivo</strong>, exclusivamente para fins institucionais.</p>
              <p><strong>Integração ao prontuário:</strong> ao imprimir/exportar o relatório gerado pelo Anest+ e assiná-lo e carimbá-lo, o documento pode passar a integrar o prontuário do paciente, conforme normas da instituição e legislação aplicável. O conteúdo é de responsabilidade do profissional anestesiologista que o assinou.</p>
            </div>
          </TermSection>

          <TermSection title="Licença de uso" icon={Copyright}>
            <div className="space-y-4">
              <p>Concede-se ao usuário uma licença pessoal, revogável, intransferível e não exclusiva para uso do aplicativo. É proibida a reprodução, engenharia reversa, decompilação, cópia, redistribuição ou modificação do app.</p>
              <p>O Anest+ é disponibilizado “no estado em que se encontra”. O desenvolvedor não garante disponibilidade contínua, ausência de erros nem adequação a finalidades clínicas específicas.</p>
              <p>O Anest+ (incluindo código, design, fluxos, modelos de dados e funcionalidades) é de titularidade exclusiva do desenvolvedor e protegido pela legislação aplicável (Lei do Software e Direitos Autorais).</p>
              <p>É proibido: (i) engenharia reversa, descompilação, desmontagem ou tentativa de extração de código-fonte; (ii) copiar, modificar, sublicenciar, vender, redistribuir ou disponibilizar o app ou partes dele; (iii) utilizar marcas e identidade visual do Anest+ para fins promocionais sem autorização.</p>
            </div>
          </TermSection>

          <TermSection title="Responsabilidades do usuário" icon={ShieldAlert}>
            <div className="space-y-4">
              <p>O usuário é exclusivamente responsável por: (i) conteúdo, exatidão e completude das informações registradas; (ii) guarda do dispositivo e sigilo de credenciais; (iii) procedimentos de segurança e backup locais; (iv) conformidade com normas éticas e regulatórias aplicáveis.</p>
              <p>É responsabilidade do usuário <strong>conferir, assinar e carimbar</strong> o relatório antes de integrá-lo ao prontuário.</p>
              <p>O app é fornecido “no estado em que se encontra” (“as is”). O desenvolvedor não se responsabiliza por decisões clínicas, condutas médicas, interpretação de dados, nem por desfechos assistenciais.</p>
              <p>Também não se responsabiliza por perdas decorrentes de: uso inadequado do app; erros/omissões de digitação; falhas do dispositivo, do sistema operacional, de rede, impressoras ou infraestrutura; ou perda de dados por desinstalação, troca de aparelho e ausência de backup local.</p>
            </div>
          </TermSection>

          <TermSection title="Contexto institucional e responsabilidade" icon={Scale}>
            <div className="space-y-4">
              <p>Em ambiente institucional, os <strong>hospitais</strong> são <strong>responsáveis por suas diretrizes, padronizações, guarda, acesso e governança</strong> dos dados clínicos gerados em suas unidades, em conformidade com a <strong>LGPD (Lei nº 13.709/2018)</strong> e demais normas aplicáveis.</p>
              <p>Quando utilizado em contexto institucional, o hospital/serviço de saúde é responsável por suas diretrizes internas, governança, acesso e guarda de documentos clínicos gerados no ambiente de trabalho, bem como por adequação à LGPD e demais normas aplicáveis.</p>
            </div>
          </TermSection>

          <TermSection title="Limitação de responsabilidade" icon={ShieldAlert}>
            <p>O desenvolvedor não se responsabiliza por <strong>decisões clínicas</strong>, desfechos assistenciais, danos ou perdas decorrentes de: (i) uso inadequado do aplicativo; (ii) erros de inserção, omissão ou interpretação de dados; (iii) falhas do dispositivo ou do sistema operacional; (iv) perda de dados por desinstalação, troca de aparelho ou ausência de procedimentos de backup locais. O aplicativo é fornecido “no estado em que se encontra”, sem garantias de adequação a propósitos específicos.</p>
          </TermSection>

          <TermSection title="Privacidade e proteção de dados" icon={Scale}>
            <p>A coleta e o tratamento de dados seguem a <strong>Política de Privacidade</strong> vigente. Os dados clínicos permanecem <strong>apenas no dispositivo</strong> do usuário; o desenvolvedor <strong>não acessa, não armazena e não processa</strong> registros clínicos em servidores próprios.</p>
          </TermSection>

          <TermSection title="Disposições Finais" icon={MapPin}>
            <div className="space-y-4">
              <p><strong>Suporte:</strong> Dúvidas e solicitações devem ser enviadas para <strong>anestplus@outlook.com</strong>. O atendimento é prestado em até 5 dias úteis, considerando a complexidade da demanda.</p>
              <p><strong>Alterações:</strong> Os Termos poderão ser modificados a qualquer momento. Em caso de mudança relevante, o app exigirá novo aceite antes de prosseguir.</p>
              <p><strong>Encerramento:</strong> O usuário pode encerrar o uso do aplicativo a qualquer momento, removendo-o do dispositivo. O desenvolvedor poderá suspender ou encerrar contas que violem estes Termos.</p>
              <p><strong>Foro:</strong> Estes Termos são regidos pelas leis da República Federativa do Brasil. </p>
            </div>
          </TermSection>

          <motion.div variants={fadeUpVariants} className="pt-8 text-center text-sm font-medium text-zinc-400">
            Última atualização: Janeiro de 2026 • Versão 1.3.0
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
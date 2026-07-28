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
          Levamos a privacidade a sério. O aplicativo e os serviços Anest+ são operados por Johaber Medrado Azevedo. Contato oficial: <strong>anestplus@outlook.com</strong>.
        </motion.p>

        <div className="mt-14 space-y-6">
          <PolicySection title="Coleta e natureza dos dados" icon={Database}>
            <div className="space-y-4">
              <p>O Anest+ individual foi projetado para funcionar <strong>localmente por padrão</strong>. Determinados recursos do Anest+ Pro ou de fluxos institucionais, quando utilizados pelo usuário ou pela instituição, podem envolver conta autenticada, sincronização opcional, cópia web temporária, listagem, download e tratamento técnico de arquivos e metadados necessários ao funcionamento do serviço. O app <strong>não utiliza</strong> SDKs de analytics de terceiros.</p>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <ShieldAlert className="mt-1 shrink-0 text-zinc-400" size={18} />
                  <span><strong>Dados locais por padrão:</strong> fichas anestésicas, avaliações pré-anestésicas do Pro individual, sinais vitais, fármacos, anotações, hospitais personalizados, logos e PDFs exportados permanecem no dispositivo salvo ação do usuário ou uso de funcionalidade opcional de sincronização, compartilhamento, exportação ou dashboard.</span>
                </li>
                <li className="flex gap-3">
                  <Database className="mt-1 shrink-0 text-zinc-400" size={18} />
                  <span><strong>Dados de pré-anestésica no Pro individual:</strong> podem incluir identificação do paciente, procedimento previsto, comorbidades, alergias, medicações, hábitos, exame físico, via aérea, exames, escalas de risco, alertas, recomendações, orientações e informações de consentimento/responsável quando preenchidas.</span>
                </li>
                <li className="flex gap-3">
                  <UserCog className="mt-1 shrink-0 text-zinc-400" size={18} />
                  <span><strong>Conta, assinatura e acesso Pro:</strong> dados de conta como nome, e-mail, CRM/RQE e metadados necessários à autenticação podem ser tratados. A assinatura individual é verificada pela App Store/StoreKit; dados completos de pagamento e cartão são processados pela Apple, não pelo Anest+.</span>
                </li>
                <li className="flex gap-3">
                  <Lock className="mt-1 shrink-0 text-zinc-400" size={18} />
                  <span><strong>Dados sincronizados opcionalmente:</strong> quando o usuário usa recursos Pro de dashboard, uma cópia web temporária de arquivos e metadados pode ser enviada para infraestrutura vinculada ao serviço. No fluxo Pro, essa cópia fica disponível na Conta Anest+ por até 30 dias para consulta, revisão, download ou impressão, enquanto o registro original permanece no dispositivo. Em fluxo institucional, arquivos e metadados podem ser tratados conforme a implantação autorizada.</span>
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

          <PolicySection title="Finalidades de uso dos dados" icon={Settings2}>
            <ul className="list-inside list-disc space-y-2 marker:text-[#b9963b]">
              <li>Gerar e manter o <strong>registro anestésico digital</strong> do profissional.</li>
              <li>Criar, manter, exportar e converter <strong>avaliações pré-anestésicas</strong> no Anest+ Pro individual.</li>
              <li>Identificar o <strong>hospital</strong> selecionado para aplicação do logotipo institucional no relatório.</li>
              <li>Sugerir a seleção de hospital por <strong>geofencing institucional</strong>, quando a permissão de localização estiver ativa, e apoiar regras de acesso vinculadas a fluxos institucionais quando aplicável.</li>
              <li>Verificar assinatura, compras e direito de acesso Pro por meio da App Store.</li>
              <li>Viabilizar sincronização opcional, dashboard autenticado, listagem, download, conferência e produção quando o usuário ou a instituição utiliza esses recursos.</li>
            </ul>
          </PolicySection>

          <PolicySection title="Armazenamento e segurança" icon={Lock}>
            <div className="space-y-4">
              <p>No uso individual sem sincronização, os dados clínicos permanecem no dispositivo, protegidos pelos mecanismos do iOS (PIN, Touch ID ou Face ID). Quando o usuário conecta sua conta, sincroniza fichas ou utiliza dashboard Pro, determinados arquivos e metadados podem ser tratados em infraestrutura de apoio necessária ao serviço.</p>
              <p>No fluxo Pro com sincronização ativada, a cópia web tem finalidade operacional e temporária, permitindo revisão, download ou impressão pela Conta Anest+. Essa cópia fica disponível por até 30 dias e, após esse prazo, é removida da infraestrutura do Anest+. O registro original permanece salvo no dispositivo.</p>
              <p>Nos fluxos institucionais, a sincronização, listagem, conferência, produção e download de fichas podem ocorrer em ambiente autenticado e vinculado ao serviço. Esses recursos são distintos da assinatura Pro individual e dependem do contexto de implantação institucional.</p>
              <p>O aplicativo oferece, <strong>por iniciativa exclusiva do usuário</strong>, a funcionalidade de exportação e importação de dados (backup local), permitindo que o próprio usuário gere arquivos para cópia, restauração ou migração entre dispositivos.</p>
              <p>Arquivos exportados, compartilhados ou armazenados pelo próprio usuário fora do app permanecem sob responsabilidade do usuário. Arquivos sincronizados opcionalmente possuem finalidade operacional, especialmente consulta, download, conferência e posterior integração ao fluxo documental do hospital ou serviço de saúde quando aplicável.</p>
              <p>No uso individual, inclusive em atendimento particular ou on-line, cabe ao profissional destinar o documento ao prontuário correspondente e adotar medidas adequadas de guarda, integridade, disponibilidade, sigilo, backup e conservação. Quando o atendimento ocorrer em instituição de saúde, a custódia e a governança seguem as responsabilidades e os procedimentos da instituição que assiste o paciente.</p>
              <p>Quando o Anest+ apresenta orientação para assinatura externa com o Certificado Digital do CFM pelo VIDaaS, não ocorre integração automática nem compartilhamento de dados com esse serviço. O Anest+ não recebe nem armazena certificado, senha, PIN ou credenciais do VIDaaS. Os documentos exportados pelo Anest+ não retornam automaticamente ao aplicativo após a assinatura. Cabe ao profissional ou à instituição responsável pelo atendimento destiná-los ao prontuário correspondente e mantê-los conforme o fluxo de guarda adotado em cada contexto.</p>
            </div>
          </PolicySection>

          <PolicySection title="Contexto institucional e responsabilidade" icon={Scale}>
            <p>
              Em ambiente institucional, os <strong>hospitais</strong> são <strong>responsáveis pela governança e pelo tratamento</strong> dos dados clínicos gerados sob sua custódia (por exemplo, retenção, acesso interno, integração ao prontuário oficial, produção e rotinas administrativas), em conformidade com a <strong>LGPD (Lei nº 13.709/2018)</strong> e normas aplicáveis. A avaliação pré-anestésica do Anest+ Pro individual não faz parte do fluxo institucional descrito nesta Política.
            </p>
          </PolicySection>

          <PolicySection title="Direitos do titular (LGPD) e Base Legal" icon={UserCog}>
            <div className="space-y-4">
              <p>O usuário pode, a qualquer momento: <strong>confirmar</strong> a existência de tratamento; solicitar <strong>acesso, correção, portabilidade ou exclusão</strong>; <strong>revogar consentimentos</strong>; e pedir informações adicionais sobre o tratamento.</p>
              <p>Para dados sob sua guarda no dispositivo, use os recursos do app (ex.: exclusão) e/ou entre em contato pelo e-mail <strong>anestplus@outlook.com</strong>. Em contexto institucional, contate também o hospital responsável quando os dados estiverem sob sua governança.</p>
              <p><strong>Base Legal:</strong> O tratamento de dados pessoais ocorre conforme as bases legais aplicáveis previstas na legislação brasileira, inclusive execução do serviço, cumprimento de obrigações legais, exercício regular de direitos, proteção da vida, tutela da saúde e legítimo interesse, sempre observados finalidade e necessidade. Determinados provedores técnicos podem possuir infraestrutura fora do Brasil; quando aplicável, eventual transferência internacional observará salvaguardas compatíveis com a legislação aplicável.</p>
            </div>
          </PolicySection>

          <motion.div variants={fadeUpVariants} className="pt-8 text-center text-sm font-medium text-zinc-400">
            Última atualização: Julho de 2026 • Versão 1.5.0
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

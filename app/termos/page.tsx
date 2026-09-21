"use client";

import { motion, Variants } from "framer-motion";
import { Scale, ShieldAlert, Copyright, MapPin, CheckCircle2, type LucideIcon } from "lucide-react";

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

function TermSection({ title, icon: Icon, children }: { title: string, icon: LucideIcon, children: React.ReactNode }) {
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
          Ao baixar, instalar, criar conta ou utilizar o Anest+, você declara ter lido, compreendido e aceitado integralmente estes Termos de Uso e a Política de Privacidade.
        </motion.p>

        <div className="mt-14 space-y-6">

          <TermSection title="Abrangência e responsável" icon={Scale}>
            <div className="space-y-4">
              <p>Estes Termos abrangem o <strong>Anest+ para uso institucional</strong>, o <strong>Anest+ Pro individual</strong> e os serviços web associados. Os recursos disponíveis, as condições de acesso e os fluxos de envio de dados variam conforme a modalidade e a implantação utilizada.</p>
              <p>O aplicativo e os serviços Anest+ são operados por <strong>Johaber Medrado Azevedo</strong>, com atuação em <strong>Vitória da Conquista/BA</strong>. Contato: <strong>anestplus@outlook.com</strong>.</p>
              <p>No uso compartilhado, cada profissional deve ler os Termos de Uso e a Política de Privacidade antes de utilizar o aplicativo. Ao utilizar o Anest+, o profissional declara ter ciência e concordar com esses documentos, que ficam sempre disponíveis para consulta no aplicativo ou no site.</p>
            </div>
          </TermSection>

          <TermSection title="Objeto" icon={Scale}>
            <div className="space-y-4">
              <p>O Anest+ é um software destinado a auxiliar profissionais de saúde no registro anestésico digital, organização de informações do ato anestésico, avaliação pré-anestésica no Anest+ Pro individual, planejamento pré-operatório, exportação de relatórios em PDF e disponibilização de documentos em área autenticada, pelo envio institucional ou pela sincronização opcional do Pro, conforme a modalidade.</p>
              <p>O Anest+ não substitui prontuários oficiais da instituição, não realiza diagnóstico, prescrição ou definição autônoma de conduta clínica, e não substitui o julgamento do profissional. Alertas, sugestões, interpretações automatizadas, campos de apoio, escalas, classificações e informações geradas no contexto da avaliação pré-anestésica possuem finalidade de apoio ao registro e caráter auxiliar, devendo ser conferidos, interpretados e validados pelo profissional responsável. O conteúdo registrado, exportado ou sincronizado é de responsabilidade exclusiva do usuário que o produz, confere e assina.</p>
              <p><strong>Geofencing institucional:</strong> quando a permissão de localização estiver ativa, o app pode auxiliar a seleção do hospital por meio de geofencing processado <strong>no dispositivo</strong>, para auxiliar também a autorização de determinadas operações, conforme as regras institucionais. Sem assinatura Pro ativa, determinadas ações podem ficar limitadas ao ambiente hospitalar autorizado; com assinatura Pro ativa, pode haver uso ampliado fora desse ambiente, conforme as regras vigentes no app.</p>
              <p><strong>Integração ao prontuário:</strong> o relatório impresso ou exportado deve conter assinatura e carimbo do profissional ou assinatura digital válida antes de sua integração ao prontuário, observadas as normas da instituição e a legislação aplicável. O conteúdo é de responsabilidade do profissional anestesiologista que o assinou.</p>
            </div>
          </TermSection>

          <TermSection title="Licença de uso" icon={Copyright}>
            <div className="space-y-4">
              <p>Concede-se ao usuário uma licença pessoal, revogável, intransferível e não exclusiva para uso do aplicativo e, quando disponível, da área autenticada associada à sua conta. É proibida a reprodução, engenharia reversa, decompilação, cópia, redistribuição ou modificação do app, ressalvadas as hipóteses previstas em lei.</p>
              <p>O Anest+ é disponibilizado “no estado em que se encontra”. O desenvolvedor não garante disponibilidade contínua, ausência de erros nem adequação a finalidades clínicas específicas.</p>
              <p>O Anest+ (incluindo código, design, fluxos, modelos de dados e funcionalidades) é de titularidade exclusiva do desenvolvedor e protegido pela legislação aplicável (Lei do Software e Direitos Autorais).</p>
              <p>Ressalvadas as hipóteses previstas em lei, é proibido: (i) engenharia reversa, descompilação, desmontagem ou tentativa de extração de código-fonte; (ii) copiar, modificar, sublicenciar, vender, redistribuir ou disponibilizar o app ou partes dele; (iii) utilizar marcas e identidade visual do Anest+ para fins promocionais sem autorização.</p>
            </div>
          </TermSection>

          <TermSection title="Anest+ Pro e assinatura" icon={CheckCircle2}>
            <div className="space-y-4">
              <p>O Anest+ Pro individual é uma modalidade pessoal do aplicativo, destinada ao uso do próprio anestesiologista. Determinadas funcionalidades podem exigir assinatura Pro ativa, incluindo, conforme disponibilidade técnica, versão do aplicativo e regras comerciais vigentes, avaliação pré-anestésica, PDF da avaliação pré-anestésica, conversão da pré-anestésica em ficha anestésica, hospitais personalizados, calendário, produção pessoal e uso ampliado.</p>
              <p>O Anest+ Pro pode ser oferecido por assinatura autorrenovável processada pela App Store. Cobrança, renovação, cancelamento, reembolso, restauração de compras e gerenciamento do método de pagamento seguem as regras da Apple e devem ser administrados pelo usuário em sua conta da App Store.</p>
              <p>Algumas funcionalidades, incluindo sincronização opcional e acesso ao dashboard Pro, dependem de criação de conta, autenticação e confirmação de e-mail. O acesso é pessoal, destinado ao titular, que deve manter suas credenciais confidenciais. O direito de uso Pro depende de confirmação pela App Store; preços, periodicidade e disponibilidade seguem a oferta vigente.</p>
              <p>Recursos institucionais, dashboards hospitalares, produção institucional, implantação por unidade e fluxos multiusuário não integram automaticamente a assinatura Pro individual e dependem de arranjo específico com o hospital, grupo ou serviço de saúde.</p>
            </div>
          </TermSection>

          <TermSection title="Responsabilidades do usuário" icon={ShieldAlert}>
            <div className="space-y-4">
              <p>O usuário é responsável, no âmbito de sua atuação, por: (i) conteúdo, exatidão e completude das informações registradas; (ii) guarda do dispositivo e sigilo de credenciais; (iii) procedimentos de segurança e backup locais; (iv) conformidade com normas éticas e regulatórias aplicáveis.</p>
              <p>Cabe ao profissional <strong>conferir os dados, os textos predefinidos e o documento final</strong> e providenciar <strong>assinatura e carimbo ou assinatura digital válida</strong> antes de integrá-lo ao prontuário, conforme as normas aplicáveis.</p>
              <p>No uso individual, inclusive em atendimento particular ou on-line, cabe ao profissional responsável providenciar a inclusão do documento no prontuário correspondente e assegurar sua guarda, integridade, disponibilidade, sigilo e conservação pelo prazo aplicável. Quando o atendimento ocorrer em instituição de saúde, a guarda seguirá as responsabilidades e os procedimentos da instituição que assiste o paciente.</p>
              <p>O Anest+ pode orientar o usuário a assinar externamente o PDF com certificado digital, inclusive o Certificado Digital do CFM em nuvem utilizado pelo VIDaaS. Essa orientação não constitui integração com o serviço externo. A assinatura digital do arquivo não transfere ao Anest+ a responsabilidade por sua guarda nem transforma recursos temporários de sincronização em repositório definitivo de prontuários.</p>
            </div>
          </TermSection>

          <TermSection title="Exportação institucional e sincronização Pro" icon={CheckCircle2}>
            <div className="space-y-4">
              <p><strong>Anest+ institucional:</strong> ao exportar uma ficha, o aplicativo tenta enviar automaticamente o PDF e os metadados necessários ao serviço institucional, quando atendidos os requisitos do aplicativo e de conexão. Esse envio integra o fluxo de exportação e não depende da ativação de uma opção de sincronização pelo usuário. A geração do PDF no aparelho não comprova, por si só, o recebimento pelo serviço; o usuário deve observar o resultado informado e, quando necessário, confirmar a disponibilidade no painel.</p>
              <p><strong>Anest+ Pro:</strong> a sincronização é opcional, vem desativada e utiliza um mesmo controle para fichas anestésicas e avaliações pré-anestésicas. Quando ativada e atendidos os requisitos de acesso e conexão, os PDFs exportados e os metadados necessários podem ser enviados à Conta Anest. Desativá-la impede novos envios por esse fluxo, mas não exclui documentos anteriormente enviados.</p>
              <p>Esses fluxos de documentos são independentes do backup local e não correspondem ao envio integral da base local do aplicativo. Os dados necessários à criação, autenticação e manutenção da conta seguem a Política de Privacidade.</p>
              <p>Os documentos enviados ficam disponíveis por até <strong>30 dias</strong>, conforme as regras de retenção de cada fluxo descritas na Política de Privacidade. Essa disponibilidade tem finalidade temporária de consulta, download e destinação ao prontuário; não constitui arquivo histórico permanente ou guarda definitiva. Cabe ao profissional e à instituição, conforme suas atribuições, providenciar o download e a destinação antes do término desse prazo.</p>
            </div>
          </TermSection>

          <TermSection title="Backup, restauração e dados locais" icon={ShieldAlert}>
            <div className="space-y-4">
              <p>O Anest+ institucional e o Anest+ Pro disponibilizam backup local criptografado, protegido por senha definida pelo usuário. No iPhone, a criação e a restauração exigem autenticação do proprietário do aparelho. A guarda do arquivo e da senha, o destino de armazenamento e os destinatários do compartilhamento são de responsabilidade do usuário ou da instituição responsável, nos limites da legislação aplicável. Recomenda-se guardar arquivo e senha em locais separados e seguros.</p>
              <p>O serviço Anest+ não recebe nem mantém uma cópia do backup ou de sua senha por essas operações. A senha não pode ser recuperada pelo aplicativo; sua perda impede a restauração. O backup não inclui os PDFs originais e não substitui sua guarda. O conteúdo e as exclusões de cada modalidade estão descritos na Política de Privacidade.</p>
              <p>A restauração adiciona registros conforme as regras de compatibilidade, identificação de duplicados e conflitos, preservando os registros existentes. Dados do perfil podem ser atualizados conforme as opções e confirmações apresentadas, respeitadas as restrições de identidade e de modalidade. A restauração não recupera sessões de login, não concede direitos de acesso e não sincroniza automaticamente os documentos restaurados com a Conta Anest.</p>
              <p>Outros recursos de transferência e compartilhamento são distintos do backup protegido. Alterações e exclusões posteriores no aplicativo não atualizam nem eliminam backups já criados.</p>
              <p><strong>Agenda do Pro:</strong> locais, horários, valores e estados de pagamento dos plantões são utilizados exclusivamente no dispositivo e não são sincronizados com a Conta Anest nem enviados aos servidores do Anest+. Podem integrar o backup local protegido.</p>
            </div>
          </TermSection>

          <TermSection title="Proteção de acesso e exclusão" icon={ShieldAlert}>
            <div className="space-y-4">
              <p>No iPhone, o aplicativo utiliza autenticação do proprietário pelos mecanismos disponibilizados pelo sistema, como Face ID, Touch ID ou código do aparelho, e bloqueio por inatividade. Essas medidas não eliminam todos os riscos de acesso indevido; o usuário deve proteger o dispositivo e suas credenciais.</p>
              <p>A exclusão local de fichas, inclusive por mês, não exclui automaticamente documentos enviados ao serviço, arquivos de backup ou cópias anteriormente exportadas e compartilhadas. Cada cópia deve ser administrada no respectivo local de armazenamento. Antes de excluir, o usuário deve verificar a destinação dos documentos ao prontuário e à guarda correspondente.</p>
            </div>
          </TermSection>

          <TermSection title="Contexto institucional e responsabilidade" icon={Scale}>
            <div className="space-y-4">
              <p>Em ambiente institucional, os <strong>hospitais</strong> são <strong>responsáveis por suas diretrizes, padronizações, guarda, acesso e governança</strong> dos dados clínicos gerados em suas unidades, em conformidade com a <strong>LGPD (Lei nº 13.709/2018)</strong> e demais normas aplicáveis.</p>
              <p>A empresa de anestesia responsável pelo serviço autoriza os acessos ao painel e articula com o hospital os procedimentos de encaminhamento e integração dos documentos ao prontuário. Cada anestesista acessa suas próprias fichas, e administradores médicos autorizados acessam as fichas das instituições abrangidas por suas permissões. Essas atribuições não afastam as responsabilidades do Anest+ e dos prestadores pelas operações que realizam.</p>
              <p>O uso institucional pode envolver implantação por unidade, identidade visual institucional, painel de produção, listagem, conferência, download de fichas e fluxos operacionais próprios. A avaliação pré-anestésica do Anest+ Pro não integra automaticamente o fluxo institucional, salvo contratação, implantação ou habilitação específica.</p>
            </div>
          </TermSection>

          <TermSection title="Limitação de responsabilidade" icon={ShieldAlert}>
            <div className="space-y-4">
              <p>Nos limites da legislação aplicável, o desenvolvedor não se responsabiliza por decisões clínicas, condutas médicas, interpretação de dados, desfechos assistenciais, danos ou perdas decorrentes de: (i) uso inadequado do aplicativo; (ii) erros de inserção, omissão ou interpretação de dados; (iii) falhas do dispositivo, sistema operacional, rede, impressoras, infraestrutura ou serviços de terceiros; (iv) perda de dados por desinstalação, troca de aparelho, ausência de backup local ou dos cuidados de guarda e proteção descritos nestes Termos, ou indisponibilidade temporária dos serviços.</p>
              <p>O aplicativo é fornecido “no estado em que se encontra”, sem garantias de adequação a propósitos específicos. Estas disposições não afastam responsabilidades que não possam ser excluídas ou limitadas por lei.</p>
            </div>
          </TermSection>

          <TermSection title="Privacidade e proteção de dados" icon={Scale}>
            <div className="space-y-4">
              <p>O tratamento de dados segue a <a href="/privacidade" className="underline underline-offset-4">Política de Privacidade</a>, que descreve os dados mantidos no aparelho, o envio institucional, a sincronização opcional do Pro, os serviços web, os provedores e a possibilidade de armazenamento de dados fora do Brasil quando utilizados os fluxos remotos.</p>
            </div>
          </TermSection>

          <TermSection title="Disposições Finais" icon={MapPin}>
            <div className="space-y-4">
              <p><strong>Suporte:</strong> Dúvidas e solicitações devem ser enviadas para <strong>anestplus@outlook.com</strong>. O atendimento é prestado em até 5 dias úteis, considerando a complexidade da demanda. Solicitações sobre dados clínicos institucionais devem ser encaminhadas à empresa de anestesia responsável, que fará a articulação com o hospital quando necessário.</p>
              <p><strong>Alterações:</strong> Os Termos poderão ser modificados a qualquer momento. Em caso de mudança relevante, o app exigirá novo aceite antes de prosseguir.</p>
              <p><strong>Encerramento:</strong> O usuário pode encerrar o uso do aplicativo a qualquer momento, removendo-o do dispositivo. Essa remoção não exclui automaticamente a conta, documentos enviados ou cópias mantidas em outros locais e não cancela a assinatura da App Store, que deve ser gerenciada na conta Apple. O desenvolvedor poderá suspender ou encerrar contas que violem estes Termos. Os acessos institucionais também poderão ser revogados pela empresa responsável, conforme suas atribuições e as condições do serviço.</p>
              <p><strong>Foro:</strong> Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de Vitória da Conquista/BA para resolver disputas, ressalvadas as hipóteses legais de competência diversa.</p>
            </div>
          </TermSection>

          <motion.div variants={fadeUpVariants} className="pt-8 text-center text-sm font-medium text-zinc-400">
            Última atualização: 21 de setembro de 2026 • Versão dos documentos do site: 1.6.0
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

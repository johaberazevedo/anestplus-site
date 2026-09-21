"use client";

import { motion, Variants } from "framer-motion";
import { Database, MapPin, Share2, ShieldAlert, Lock, UserCog, Settings2, Scale, type LucideIcon } from "lucide-react";

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

function PolicySection({ title, icon: Icon, children }: { title: string, icon: LucideIcon, children: React.ReactNode }) {
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
          Levamos a privacidade a sério. O aplicativo e os serviços Anest+ são operados por Johaber Medrado Azevedo, com atuação em Vitória da Conquista/BA. Contato oficial: <strong>anestplus@outlook.com</strong>.
        </motion.p>

        <div className="mt-14 space-y-6">
          <PolicySection title="Abrangência" icon={Scale}>
            <div className="space-y-4">
              <p>Esta Política abrange o <strong>Anest+ para uso institucional</strong>, o <strong>Anest+ Pro individual</strong> e os serviços web associados. Recursos, condições de acesso e fluxos de envio variam conforme a modalidade e a implantação utilizada.</p>
              <p>As responsabilidades pelo tratamento dependem das operações realizadas pelo profissional, pela empresa de anestesia, pelo hospital e pelos prestadores envolvidos, conforme o contexto e os instrumentos aplicáveis.</p>
            </div>
          </PolicySection>

          <PolicySection title="Coleta e natureza dos dados" icon={Database}>
            <div className="space-y-4">
              <p>Os aplicativos mantêm dados no dispositivo para funcionamento dos recursos locais. Documentos podem ser enviados pelo fluxo institucional ou pela sincronização opcional do Pro, descritos abaixo. Os aplicativos não utilizam SDKs de analytics de terceiros.</p>
              <p><strong>Dados clínicos locais:</strong> identificação do paciente, registro, procedimento, informações anestésicas, alergias, medicamentos, monitorização, sinais vitais, descrição, anotações, PDFs e demais campos preenchidos. Dados de saúde são dados pessoais sensíveis.</p>
              <p><strong>Avaliação pré-anestésica no Pro:</strong> identificação do paciente, procedimento previsto, comorbidades, alergias, medicações, hábitos, dados de gestação ou pediatria quando preenchidos, exame físico, via aérea, exames, escalas de risco, alertas, recomendações, orientações e informações de consentimento ou responsável. Esse módulo não integra o Anest+ institucional para iPhone aqui descrito.</p>
              <p><strong>Perfil e conta:</strong> nome, e-mail, CRM, RQE e informações necessárias à criação, autenticação, confirmação e manutenção da conta. Dados de identificação, foto e assinatura visual podem ser mantidos no perfil local; os dados utilizados pela conta conectada seguem seu fluxo próprio de atualização.</p>
              <p><strong>Assinatura Pro:</strong> a App Store é consultada por meio do StoreKit para produtos, compras, restauração e direito de acesso. Dados completos de pagamento, cartão e faturamento são processados pela Apple, não pelo Anest+.</p>
              <p><strong>Hospitais personalizados e logos no Pro:</strong> nome, código local e imagem escolhida podem ser armazenados no dispositivo para uso nas telas e nos PDFs.</p>
              <p><strong>Documentos enviados:</strong> PDFs e metadados necessários à identificação, organização e disponibilização, incluindo hospital, profissional, paciente, registro, data e, conforme o fluxo, horários e técnica anestésica. Informações de integridade, identificadores e metadados também podem integrar registros operacionais e de auditoria.</p>
            </div>
          </PolicySection>

          <PolicySection title="Finalidades de uso dos dados" icon={Settings2}>
            <div className="space-y-4">
              <p>Os dados são utilizados para registrar e organizar informações do ato anestésico; gerar PDFs; identificar profissional e hospital; apoiar a assinatura e a verificação dos documentos; proteger o acesso; disponibilizar documentos aos usuários autorizados; apoiar segurança, rastreabilidade e atendimento de solicitações.</p>
              <p>No Pro, também permitem criar, manter, exportar e converter avaliações pré-anestésicas em fichas anestésicas, registrar o planejamento pré-operatório e os campos de apoio, gerenciar a agenda local, autenticar a conta e verificar o direito de acesso pela App Store.</p>
              <p>No serviço institucional, os dados permitem listagem, conferência, download e rotinas de produção conforme a implantação e as permissões de acesso. Esses recursos não integram automaticamente a assinatura Pro individual.</p>
            </div>
          </PolicySection>

          <PolicySection title="Dados locais e agenda do Pro" icon={Database}>
            <div className="space-y-4">
              <p>Os dados locais são mantidos no dispositivo e protegidos pelos mecanismos de segurança do iOS. No Pro, o usuário pode utilizar as funcionalidades locais sem conectar uma conta, observadas as condições de acesso aos recursos.</p>
              <p><strong>Agenda de plantões do Pro:</strong> locais, horários, valores e estados de pagamento são armazenados e utilizados exclusivamente no dispositivo. Não são sincronizados com a Conta Anest nem enviados aos servidores do Anest+, mas podem integrar o backup local protegido. Essa regra da agenda não se confunde com os fluxos de produção institucional.</p>
            </div>
          </PolicySection>

          <PolicySection title="Envio institucional" icon={Share2}>
            <div className="space-y-4">
              <p>Ao exportar uma ficha no Anest+ institucional, o aplicativo tenta enviar automaticamente o PDF e os metadados necessários ao serviço, quando atendidos os requisitos do aplicativo e de conexão. O envio integra a exportação e não depende da ativação de uma opção de sincronização pelo usuário.</p>
              <p>Esse fluxo abrange o documento exportado e suas informações de identificação e organização; não corresponde ao envio integral da base local. A geração local do PDF não comprova, por si só, seu recebimento pelo serviço.</p>
              <p>Cada anestesista acessa suas próprias fichas. Administradores médicos autorizados acessam as fichas das instituições abrangidas por suas permissões.</p>
            </div>
          </PolicySection>

          <PolicySection title="Sincronização opcional do Pro" icon={Share2}>
            <div className="space-y-4">
              <p>A sincronização das fichas anestésicas e avaliações pré-anestésicas vem desativada e utiliza um mesmo controle na Conta. Quando ativada e atendidos os requisitos de acesso e conexão, os PDFs exportados e os metadados necessários podem ser enviados à área autenticada do próprio usuário.</p>
              <p>No que se refere aos documentos clínicos, a Conta Anest armazena as fichas anestésicas e avaliações pré-anestésicas enviadas por esse fluxo, com finalidade temporária de consulta e download para posterior destinação ao prontuário ou impressão e guarda.</p>
              <p>Desativar a sincronização impede novos envios por esse fluxo, mas não exclui documentos anteriormente enviados. A sincronização é independente do backup local protegido e não envia a base completa do aplicativo. Os dados necessários à criação, autenticação e manutenção da conta seguem as demais disposições desta Política.</p>
            </div>
          </PolicySection>

          <PolicySection title="Backup protegido e restauração" icon={Lock}>
            <div className="space-y-4">
              <p>O Anest+ institucional e o Anest+ Pro permitem criar backup local criptografado, protegido por senha definida pelo usuário. No iPhone, criação e restauração exigem autenticação do proprietário pelos mecanismos do sistema. A autenticação autoriza a operação; a senha protege o arquivo exportado, que não fica vinculado à biometria do aparelho original.</p>
              <p>Essas operações são locais e não enviam o arquivo, seu conteúdo ou a senha ao serviço Anest+. O serviço não recebe nem mantém uma cópia do arquivo ou da senha por essas operações. A senha não é armazenada nem pode ser recuperada pelo aplicativo; sua perda impede a restauração.</p>
              <p>O usuário ou a instituição responsável deve guardar o arquivo e a senha e escolher o destino e os destinatários do compartilhamento, nos limites da legislação aplicável. Ao escolher outro aplicativo ou serviço de nuvem, o encaminhamento ocorre por iniciativa do usuário e segue as condições do destino escolhido.</p>
              <p><strong>Conteúdo e exclusões:</strong> o backup pode conter dados clínicos, perfis, fotos e outras informações abrangidas pelo recurso. No Pro, inclui a agenda de plantões, seus valores e estados de pagamento. Não inclui os PDFs originais, credenciais de login ou chaves privadas de assinatura. No institucional, também não inclui PINs, hashes de PIN, credenciais administrativas, sessões, tokens ou dados biométricos.</p>
              <p>A restauração observa a modalidade de origem, a compatibilidade e as regras de duplicados e conflitos, preservando registros existentes. Dados de perfil podem ser atualizados conforme as opções e confirmações apresentadas. No Pro, são respeitadas as restrições de identidade aplicáveis ao acesso por residência. Restaurar não recupera sessões, não concede direitos de acesso nem sincroniza automaticamente os documentos com a Conta Anest.</p>
              <p>O backup não substitui a guarda dos PDFs e dos documentos destinados ao prontuário. Alterações ou exclusões no aplicativo não atualizam nem eliminam backups já criados. Outros recursos de transferência e compartilhamento são distintos do backup protegido; a proteção por senha aqui descrita refere-se especificamente a esse recurso.</p>
            </div>
          </PolicySection>

          <PolicySection title="Autenticação e segurança" icon={Lock}>
            <div className="space-y-4">
              <p>O desenvolvedor adota medidas técnicas e administrativas razoáveis, incluindo autenticação, conexões seguras e restrição de acesso conforme a necessidade operacional.</p>
              <p>No iPhone, o aplicativo utiliza autenticação do proprietário, como Face ID, Touch ID ou código do aparelho, e bloqueio por inatividade. A autenticação biométrica é realizada pelo sistema operacional; o aplicativo não recebe nem armazena os dados biométricos utilizados.</p>
              <p>Essas medidas não eliminam todos os riscos de acesso indevido. Sua efetividade depende também da guarda do dispositivo, da atualização do sistema e do sigilo das credenciais.</p>
            </div>
          </PolicySection>

          <PolicySection title="Permissões do dispositivo" icon={MapPin}>
            <div className="space-y-4">
              <p><strong>Localização:</strong> quando autorizada, é utilizada para geofencing institucional, auxiliando a seleção do hospital e a autorização de operações quando aplicável. As coordenadas são processadas no dispositivo e não integram o envio institucional descrito nesta Política. A identificação do hospital é enviada com o documento.</p>
              <p><strong>Fotos, câmera e arquivos:</strong> utilizados nos recursos acionados pelo usuário, como perfil, leitura de QR, importação, exportação e compartilhamento. O compartilhamento com outros aplicativos ou destinatários segue a ação do usuário e as condições do destino escolhido.</p>
            </div>
          </PolicySection>

          <PolicySection title="Provedores e armazenamento internacional" icon={Database}>
            <div className="space-y-4">
              <p>Os fluxos de documentos do serviço utilizam Cloudflare R2 para armazenamento de PDFs e Supabase para metadados e recursos de autenticação. Outros serviços de apoio podem ser utilizados para a operação técnica, como envio de e-mails transacionais, na medida necessária às finalidades descritas nesta Política.</p>
              <p>Quando houver envio institucional, sincronização Pro ou uso dos serviços remotos, há possibilidade de armazenamento e tratamento de dados pessoais fora do Brasil, incluindo informações de saúde quando contidas nos documentos e metadados enviados.</p>
              <p>As operações de transferência internacional devem observar a LGPD e a regulamentação aplicável da Autoridade Nacional de Proteção de Dados, inclusive quanto à adoção de mecanismo válido de transferência internacional e das salvaguardas correspondentes.</p>
            </div>
          </PolicySection>

          <PolicySection title="Retenção e exclusão" icon={Database}>
            <div className="space-y-4">
              <p><strong>Serviço institucional:</strong> os PDFs e os metadados associados ao envio ficam disponíveis por até 30 dias a partir do envio. Após o vencimento, sua exclusão é realizada por rotinas automáticas dos serviços de armazenamento e banco de dados.</p>
              <p><strong>Conta Anest Pro:</strong> os PDFs de fichas anestésicas e avaliações pré-anestésicas sincronizados ficam disponíveis por até 30 dias. Após esse prazo, os arquivos são excluídos automaticamente. Cabe ao usuário providenciar seu download e destinação antes do término desse prazo.</p>
              <p>Esse prazo de disponibilidade dos documentos não constitui guarda definitiva nem arquivo histórico permanente e não deve ser interpretado como prazo único para dados de conta, autenticação ou registros operacionais. Os documentos destinados ao prontuário seguem as responsabilidades de guarda aplicáveis.</p>
              <p>Os dados locais permanecem no dispositivo até exclusão manual, desinstalação do app ou restauração do aparelho, conforme o caso. A exclusão local, inclusive por mês, não exclui automaticamente documentos enviados, backups ou cópias exportadas e compartilhadas. A exclusão no serviço também não elimina registros locais nem cópias anteriormente baixadas ou impressas.</p>
            </div>
          </PolicySection>

          <PolicySection title="Destinação dos documentos e assinatura externa" icon={ShieldAlert}>
            <div className="space-y-4">
              <p>No uso individual, inclusive em atendimento particular ou on-line, cabe ao profissional destinar o documento ao prontuário correspondente e assegurar sua guarda, integridade, disponibilidade, sigilo, backup e conservação pelo prazo aplicável. Em instituição de saúde, a custódia e a governança seguem as responsabilidades e os procedimentos da instituição que assiste o paciente.</p>
              <p>Quando o Anest+ apresenta orientação para assinatura externa com o Certificado Digital do CFM pelo VIDaaS, não ocorre integração automática nem compartilhamento de dados com esse serviço. O Anest+ não recebe nem armazena certificado, senha, PIN ou credenciais do VIDaaS. Os documentos exportados não retornam automaticamente ao aplicativo após a assinatura. Cabe ao profissional ou à instituição destiná-los ao prontuário e mantê-los conforme o fluxo de guarda adotado.</p>
            </div>
          </PolicySection>

          <PolicySection title="Contexto institucional e responsabilidade" icon={Scale}>
            <div className="space-y-4">
              <p>Os hospitais são responsáveis por suas diretrizes, padronizações, guarda, acesso e governança dos dados clínicos sob sua custódia, em conformidade com a LGPD (Lei nº 13.709/2018) e demais normas aplicáveis.</p>
              <p>A empresa de anestesia responsável autoriza os acessos ao painel e articula com o hospital os procedimentos de encaminhamento e integração dos documentos ao prontuário. Essas atribuições não afastam as responsabilidades do Anest+ e dos provedores pelas operações que realizam. A avaliação pré-anestésica do Pro individual não integra o fluxo institucional aqui descrito.</p>
            </div>
          </PolicySection>

          <PolicySection title="Bases legais" icon={Scale}>
            <div className="space-y-4">
              <p>A hipótese legal aplicável depende da finalidade e do contexto do tratamento. Dados de identificação e acesso dos profissionais são utilizados para disponibilizar e administrar os serviços conforme a relação contratual e as obrigações aplicáveis.</p>
              <p>Dados de saúde são dados pessoais sensíveis e seu tratamento deve observar as hipóteses do artigo 11 da LGPD, considerando, quando aplicáveis, tutela da saúde, cumprimento de obrigação legal ou regulatória e exercício regular de direitos. O legítimo interesse não é utilizado como fundamento para o tratamento desses dados sensíveis.</p>
              <p>O aceite destes documentos pelo profissional não constitui consentimento do paciente nem substitui a identificação da hipótese legal aplicável aos seus dados. Também não autoriza sua utilização para finalidades diferentes das informadas.</p>
            </div>
          </PolicySection>

          <PolicySection title="Site e atendimento de suporte" icon={Settings2}>
            <div className="space-y-4">
              <p>Nas áreas autenticadas, o site utiliza cookies de sessão e informações necessárias à autenticação e ao controle de acesso. Quando o usuário utiliza o atendimento de suporte, a mensagem e o contexto fornecido são processados para responder à solicitação.</p>
            </div>
          </PolicySection>

          <PolicySection title="Direitos do titular e contato" icon={UserCog}>
            <div className="space-y-4">
              <p>Os titulares podem solicitar confirmação da existência de tratamento, acesso, correção, portabilidade, exclusão e informações sobre compartilhamento, bem como revogar consentimentos quando essa for a base utilizada, observadas as condições legais e eventuais deveres de conservação.</p>
              <p>Questões sobre o aplicativo, a conta e as operações sob responsabilidade do Anest+ podem ser encaminhadas a <strong>anestplus@outlook.com</strong>. Para dados clínicos institucionais, contate a empresa de anestesia responsável pelos seus canais oficiais, que fará a articulação com o hospital quando necessário. No atendimento individual, as solicitações sobre dados clínicos devem ser dirigidas ao profissional responsável, conforme suas atribuições.</p>
              <p>Para dados sob sua guarda no dispositivo, utilize os recursos locais disponíveis. A exclusão local não elimina automaticamente outras cópias, conforme a seção de retenção e exclusão.</p>
            </div>
          </PolicySection>

          <PolicySection title="Alterações e legislação aplicável" icon={Scale}>
            <div className="space-y-4">
              <p>Esta Política pode ser atualizada periodicamente. Alterações relevantes serão comunicadas no aplicativo ou na área autenticada, com novo aceite quando aplicável. No uso compartilhado, cada profissional deve ler os Termos de Uso e a Política de Privacidade antes de utilizar o aplicativo. Ao utilizar o Anest+, o profissional declara ter ciência e concordar com esses documentos, que ficam sempre disponíveis para consulta no aplicativo ou no site.</p>
              <p>Aplica-se a legislação brasileira, em especial a LGPD. Fica eleito o foro da comarca de Vitória da Conquista/BA para dirimir controvérsias, ressalvadas as hipóteses legais de competência diversa. As condições de uso estão descritas nos <a href="/termos" className="underline underline-offset-4">Termos de Uso</a>.</p>
            </div>
          </PolicySection>

          <motion.div variants={fadeUpVariants} className="pt-8 text-center text-sm font-medium text-zinc-400">
            Última atualização: 21 de setembro de 2026 • Versão dos documentos do site: 1.6.0
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

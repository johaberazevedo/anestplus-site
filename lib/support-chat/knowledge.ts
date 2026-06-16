export type SupportProduct = "anest";

export type SupportIntent =
  | "triage"
  | "anest_sync"
  | "anest_print"
  | "anest_wifi_hgvc"
  | "anest_signature"
  | "anest_pin"
  | "anest_pdf_validation"
  | "anest_crash"
  | "anest_missing_record"
  | "anest_missing_dashboard_record"
  | "anest_professional"
  | "anest_geofence"
  | "anest_overview"
  | "anest_account_pro"
  | "anest_pro_access"
  | "anest_pro_dashboard"
  | "anest_hospital_dashboard"
  | "anest_production"
  | "anest_panel_access"
  | "anest_production_access"
  | "anest_production_empty"
  | "anest_production_copy"
  | "anest_production_review"
  | "anest_production_versions"
  | "anest_production_download"
  | "anest_trust_layer"
  | "anest_privacy"
  | "anest_appstore_subscription"
  | "human_support"
  | "fallback";

export type WeightedKeyword = {
  term: string;
  weight: number;
};

export type KnowledgeKeyword = string | WeightedKeyword;

export type KnowledgeItem = {
  intent: SupportIntent;
  product: SupportProduct;
  title: string;
  keywords: KnowledgeKeyword[];
  answer: string;
  diagnosticQuestions?: string[];
  nextActions?: string[];
  requiresHandoff?: boolean;
  severity?: "low" | "medium" | "high";
};

export const WHATSAPP_SUPPORT = "5571992288755";

export const HUMAN_SUPPORT_REPLY = `Se mesmo assim não resolver, entre em contato com o suporte pelo WhatsApp: ${WHATSAPP_SUPPORT}. Envie uma descrição curta do problema e, se possível, um print da tela.`;

export const INITIAL_REPLY =
  "Olá! Sou o suporte Anest+. Posso te ajudar com sincronização, impressão, assinatura, PIN, PDF, painel hospitalar, produção e Conta Pro. Me diga o que aconteceu.";

export const SAFETY_FOOTER =
  "Não envie senha, PIN ou dados completos de pacientes pelo chat.";

export const KNOWLEDGE_ITEMS: KnowledgeItem[] = [
  {
    intent: "anest_sync",
    product: "anest",
    title: "Ficha não sincronizou",
    keywords: [
      { term: "sincronização", weight: 4 },
      { term: "sincronizacao", weight: 4 },
      { term: "ficha nao subiu", weight: 5 },
      { term: "ficha não subiu", weight: 5 },
      { term: "nao apareceu no painel", weight: 5 },
      { term: "não apareceu no painel", weight: 5 },
      { term: "exportei e nao apareceu", weight: 5 },
      { term: "exportei e não apareceu", weight: 5 },
      "sincronizar",
      "sincronizou",
    ],
    answer:
      "Vamos tentar resolver pelo básico primeiro:\n\n1. Verifique se o aparelho está com internet.\n2. Use a rede principal do hospital.\n3. Se estiver na rede direta da impressora, saia dela.\n4. Exporte a ficha novamente.\n5. Depois de sair da tela de compartilhamento, veja se aparece “Ficha sincronizada com sucesso”.\n6. Confira no painel do Anest+.\n\nSe aparecer uma mensagem de erro, você pode usar essa mensagem para orientar o próximo passo.",
    diagnosticQuestions: [
      "Você estava na rede principal do hospital ou na rede direta da impressora?",
      "Apareceu a mensagem “Ficha sincronizada com sucesso” depois da exportação?",
    ],
    nextActions: [
      "Verificar internet",
      "Usar a rede principal do hospital",
      "Sair da rede direta da impressora",
      "Exportar novamente",
      "Conferir o painel",
    ],
    severity: "medium",
  },
  {
    intent: "anest_print",
    product: "anest",
    title: "Impressão",
    keywords: [
      { term: "impressão", weight: 4 },
      { term: "impressao", weight: 4 },
      { term: "nao imprime", weight: 4 },
      { term: "não imprime", weight: 4 },
      { term: "impressora nao aparece", weight: 5 },
      { term: "impressora não aparece", weight: 5 },
      "imprimir",
      "impressora",
      "epson",
      "l3250",
      "airprint",
    ],
    answer:
      "Para impressão no Anest+, confira primeiro:\n\n1. O iPad/iPhone precisa estar na mesma rede usada para a impressão.\n2. Se estiver no HGVC, use a orientação da rede CC-ANESTESISTAS quando precisar sincronizar.\n3. Abra o PDF exportado e tente imprimir novamente pelo compartilhamento do iOS.\n4. Se a impressora não aparecer, verifique se ela está ligada e conectada à rede correta.\n\nEm qual hospital você está tentando imprimir: HGVC ou Afrânio Peixoto?",
    diagnosticQuestions: [
      "Você está tentando imprimir no HGVC, Afrânio Peixoto ou outro local?",
      "A impressora aparece na lista de impressão do iOS?",
    ],
    nextActions: [
      "Abrir o PDF exportado",
      "Usar o compartilhamento do iOS",
      "Confirmar se a impressora está ligada",
      "Confirmar se o aparelho está na rede correta",
    ],
    severity: "medium",
  },
  {
    intent: "anest_wifi_hgvc",
    product: "anest",
    title: "Wi-Fi HGVC / CC-ANESTESISTAS",
    keywords: [
      "wifi",
      "wi-fi",
      "cc-anestesistas",
      "ccanest",
      "hgvc",
      "mac",
      "endereco privado",
      "endereço privado",
      "rede do hospital",
    ],
    answer:
      "No HGVC, use a rede principal CC-ANESTESISTAS.\n\nSenha: @#CCANEST2026\n\nAntes de conectar no iPhone/iPad:\n1. Abra Ajustes.\n2. Toque em Wi-Fi.\n3. Toque no “i” ao lado da rede CC-ANESTESISTAS.\n4. Desative “Endereço Wi-Fi Privado”.\n5. Conecte novamente usando a senha acima.\n\nNo Android, procure a opção de privacidade/MAC da rede e altere para usar o MAC do dispositivo. Se não conectar mesmo assim, confirme se o MAC já foi cadastrado pela equipe responsável.",
  },
  {
    intent: "anest_signature",
    product: "anest",
    title: "Assinatura eletrônica",
    keywords: [
      { term: "assinatura", weight: 4 },
      { term: "nao consigo assinar", weight: 5 },
      { term: "não consigo assinar", weight: 5 },
      "assinar",
      "face id",
      "touch id",
      "biometria",
    ],
    answer:
      "Para problema de assinatura no Anest+:\n\n1. Confirme se o profissional correto está selecionado.\n2. Tente assinar novamente.\n3. Se usar Face ID ou Touch ID, veja se o desbloqueio do aparelho está funcionando normalmente.\n4. Se estiver no iPad institucional, confirme se está usando o profissional certo antes de tentar o PIN.\n\nNão envie seu PIN pelo chat.",
    diagnosticQuestions: [
      "O profissional correto está selecionado antes de assinar?",
    ],
    nextActions: [
      "Confirmar profissional selecionado",
      "Tentar assinar novamente",
      "Verificar Face ID/Touch ID",
      "Se for problema de PIN, acionar responsável local ou suporte",
    ],
    severity: "medium",
  },
  {
    intent: "anest_pin",
    product: "anest",
    title: "PIN",
    keywords: [
      "pin",
      "esqueci meu pin",
      "pin incorreto",
      "senha do pin",
      "codigo",
      "código",
    ],
    answer:
      "Não envie o PIN pelo chat.\n\nPrimeiro confirme se o profissional selecionado é o correto. Se estiver no iPad institucional e o PIN continuar incorreto ou esquecido, acione o responsável local ou o suporte para redefinição conforme a rotina institucional.",
    requiresHandoff: true,
  },
  {
    intent: "anest_pdf_validation",
    product: "anest",
    title: "Validação de PDF",
    keywords: [
      { term: "pdf", weight: 5 },
      "pdf invalido",
      "pdf inválido",
      "validacao",
      "validação",
      "validar",
      "qr",
      "documento invalido",
      "documento inválido",
    ],
    answer:
      "Para validar um PDF do Anest+, acesse anestplus.com/validar e envie o arquivo por lá.\n\nSe a validação falhar no site, confira se o PDF é o arquivo original exportado pelo Anest+ e tente novamente. Quando a falha persistir ou o arquivo precisar ser analisado, o suporte humano deve avaliar.",
    requiresHandoff: true,
  },
  {
    intent: "anest_crash",
    product: "anest",
    title: "App travou ou fechou",
    keywords: [
      "travou",
      "fechou",
      "crash",
      "bug",
      "tela travada",
      "nao abre",
      "não abre",
      "congelou",
    ],
    answer:
      "Tente estes passos:\n\n1. Feche o Anest+ completamente.\n2. Abra o app novamente.\n3. Verifique se há atualização disponível na App Store.\n4. Se o problema aconteceu ao exportar ou assinar, tente repetir a ação após reabrir o app.\n\nSe aparecer uma mensagem de erro, ela ajuda a orientar o próximo passo.",
  },
  {
    intent: "anest_missing_record",
    product: "anest",
    title: "Ficha não encontrada",
    keywords: [
      { term: "ficha", weight: 3 },
      "perdi a ficha",
      "ficha sumiu",
      "nao encontro",
      "não encontro",
      "ficha antiga",
      "ficha nao encontrada",
      "ficha não encontrada",
    ],
    answer:
      "No Anest+, primeiro confira:\n\n1. Se está no hospital/perfil correto.\n2. Se a busca está usando a data correta.\n3. Se a ficha não ficou em outro fluxo ou lista do app.\n4. Se ela já foi exportada, confira também o painel quando a sincronização estiver habilitada.\n\nO assistente não acessa fichas reais nem o banco de dados.",
  },
  {
    intent: "anest_professional",
    product: "anest",
    title: "Profissional, CRM ou assinatura errada",
    keywords: [
      "crm errado",
      "profissional errado",
      "assinatura errada",
      "medico errado",
      "médico errado",
      "nome errado",
    ],
    answer:
      "Se o profissional, CRM ou assinatura saiu errado:\n\n1. Confira se o profissional correto está selecionado antes de assinar/exportar.\n2. Se a ficha ainda puder ser ajustada, corrija e exporte novamente.\n3. Se o PDF já foi usado ou enviado, avalie com a equipe qual versão deve ser considerada.\n\nO assistente não altera PDFs, fichas ou dados reais.",
  },
  {
    intent: "anest_geofence",
    product: "anest",
    title: "Hospital, localização ou geofence",
    keywords: [
      "hospital errado",
      "localizacao",
      "localização",
      "geofence",
      "gps",
      "permissao de localizacao",
      "permissão de localização",
    ],
    answer:
      "Para hospital/localização no Anest+:\n\n1. Confira se a permissão de localização está ativa para o app.\n2. Veja se o hospital selecionado é o correto.\n3. Se estiver em área de baixa precisão do GPS, tente sair e abrir o app novamente.\n4. Depois, gere o PDF novamente se precisar corrigir a identificação.",
  },
  {
    intent: "anest_overview",
    product: "anest",
    title: "Como funciona o Anest+",
    keywords: [
      "como funciona o anest",
      "o que é o anest",
      "o que e o anest",
      "para que serve o anest",
      "ficha anestesica digital",
      "ficha anestésica digital",
      "registro anestesico",
      "registro anestésico",
      "sinais vitais",
      "farmacos",
      "fármacos",
      "protocolos",
      "presets",
      "scanner",
      "qr code",
    ],
    answer:
      "O Anest+ ajuda o anestesiologista a registrar a ficha anestésica de forma digital.\n\nEle permite organizar dados do paciente, sinais vitais, fármacos, eventos, técnica anestésica, protocolos/presets e gerar um PDF final para impressão, compartilhamento ou integração ao prontuário conforme a rotina da instituição.\n\nO app não substitui o prontuário oficial nem toma decisões clínicas. Ele apoia o registro e a organização das informações.",
  },
  {
    intent: "anest_account_pro",
    product: "anest",
    title: "Conta Anest+ Pro",
    keywords: [
      { term: "conta pro", weight: 5 },
      "conta anest",
      "conta anest+",
      "anest pro",
      "anest+ pro",
      "conta pro",
      "cadastro pro",
      "criar conta",
      "confirmar cadastro",
      "email de confirmacao",
      "e-mail de confirmação",
      "minha conta",
      "perfil pro",
      "rqe",
    ],
    answer:
      "Na Conta Anest+ Pro, o usuário pode criar conta, confirmar o e-mail, entrar com e-mail e senha, recuperar senha e atualizar perfil com nome, CRM e RQE.\n\nSe criou a conta e ainda não consegue acessar, confira se o e-mail de confirmação foi aberto. Se não encontrar, veja caixa de spam/lixo eletrônico.\n\nNunca envie sua senha pelo chat.",
  },
  {
    intent: "anest_pro_access",
    product: "anest",
    title: "Login, senha e acesso da Conta Pro",
    keywords: [
      { term: "acesso", weight: 3 },
      "nao consigo entrar na conta pro",
      "não consigo entrar na conta pro",
      "login pro",
      "senha pro",
      "esqueci senha pro",
      "recuperar senha pro",
      "sessao expirada",
      "sessão expirada",
      "email ou senha incorretos",
      "e-mail ou senha incorretos",
      "link de recuperacao",
      "link de recuperação",
    ],
    answer:
      "Para acesso à Conta Anest+ Pro:\n\n1. Confira se o e-mail digitado está correto.\n2. Se aparecer e-mail ou senha incorretos, tente novamente com calma.\n3. Se esqueceu a senha, use “Esqueci minha senha”.\n4. Se aparecer sessão expirada, entre novamente.\n5. Se o link de recuperação expirou, solicite um novo link.\n\nNão envie sua senha pelo chat.",
    requiresHandoff: true,
  },
  {
    intent: "anest_pro_dashboard",
    product: "anest",
    title: "Dashboard da Conta Anest+ Pro",
    keywords: [
      "dashboard pro",
      "painel pro",
      "minhas fichas",
      "historico detalhado",
      "histórico detalhado",
      "buscar por periodo",
      "buscar por período",
      "baixar ficha pro",
      "excluir ficha",
      "remover ficha",
      "disponivel ate",
      "disponível até",
      "tecnica predominante",
      "técnica predominante",
      "tempo de anestesia",
    ],
    answer:
      "No dashboard da Conta Anest+ Pro, você pode buscar fichas por data ou período, filtrar por paciente ou prontuário, ver total no período, tempo de anestesia e técnica predominante.\n\nTambém é possível baixar fichas e remover uma ficha da visualização da sua conta. A cópia web do fluxo Pro é temporária e pode ficar disponível por até 30 dias. O registro original permanece no dispositivo.",
  },
  {
    intent: "anest_hospital_dashboard",
    product: "anest",
    title: "Dashboard hospitalar de fichas",
    keywords: [
      { term: "painel", weight: 3 },
      { term: "hospital", weight: 3 },
      { term: "prontuario", weight: 4 },
      { term: "prontuário", weight: 4 },
      { term: "baixar", weight: 3 },
      { term: "download", weight: 3 },
      { term: "baixar pdf", weight: 5 },
      { term: "baixar ficha", weight: 5 },
      { term: "baixar versao", weight: 4 },
      { term: "baixar versão", weight: 4 },
      { term: "copiar prontuario", weight: 5 },
      { term: "copiar prontuário", weight: 5 },
      "dashboard hospitalar",
      "painel hospitalar",
      "fichas sincronizadas",
      "buscar fichas",
      "casos unicos",
      "casos únicos",
      "versoes extras",
      "versões extras",
      "arquivos encontrados",
      "hgvc",
      "afranio peixoto",
      "afrânio peixoto",
    ],
    answer:
      "No dashboard hospitalar do Anest+, selecione o hospital, informe o CRM e escolha a data para listar fichas sincronizadas.\n\nA tela mostra casos únicos, versões extras e arquivos encontrados. A versão mais recente aparece como principal. Se houver mais de uma exportação do mesmo caso, você pode expandir para ver versões anteriores.\n\nTambém é possível copiar o prontuário e baixar o PDF.",
  },
  {
    intent: "anest_missing_dashboard_record",
    product: "anest",
    title: "Ficha não aparece no painel",
    keywords: [
      "ficha nao aparece no dashboard",
      "ficha não aparece no dashboard",
      "ficha nao aparece no painel",
      "ficha não aparece no painel",
      "nao achei a ficha no painel",
      "não achei a ficha no painel",
      "nenhuma ficha encontrada",
      "exportei mas nao aparece",
      "exportei mas não aparece",
      "nao encontrou ficha",
      "não encontrou ficha",
    ],
    answer:
      "Se a ficha não aparece no painel do Anest+:\n\n1. Confira se o hospital selecionado está correto.\n2. Confira se o CRM foi digitado corretamente.\n3. Veja se a data da busca é a data da ficha.\n4. Verifique a internet do iPad/iPhone.\n5. Use a rede principal do hospital, não a rede direta da impressora.\n6. Exporte a ficha novamente e saia da tela de compartilhamento.\n7. Veja se aparece “Ficha sincronizada com sucesso”.\n\nDepois disso, tente buscar novamente no painel.",
  },
  {
    intent: "anest_production",
    product: "anest",
    title: "Produção anestésica institucional",
    keywords: [
      { term: "produção", weight: 5 },
      { term: "producao", weight: 5 },
      "producao anestesica",
      "produção anestésica",
      "painel de producao",
      "painel de produção",
      "copiar linhas",
      "colar na planilha",
      "planilha",
      "revisar",
      "tipo de anestesia",
      "empresa",
      "turno",
      "relatorio de producao",
      "relatório de produção",
    ],
    answer:
      "Claro. No painel de produção, o caminho é simples: escolha o hospital, selecione a data e clique em buscar.\n\nA tela monta as linhas com data, turno, registro/prontuário, paciente, empresa, anestesista e tipo de anestesia. Depois, use “Copiar linhas” para colar na planilha.\n\nSe algum item aparecer como revisar, vale conferir com calma porque pode ter dado faltando ou informação que precisa de validação humana.",
  },
  {
    intent: "anest_panel_access",
    product: "anest",
    title: "Acesso ao painel hospitalar",
    keywords: [
      { term: "nao consigo acessar o painel", weight: 5 },
      { term: "não consigo acessar o painel", weight: 5 },
      { term: "acesso ao painel", weight: 4 },
      { term: "login painel", weight: 4 },
      { term: "dashboard hospitalar", weight: 3 },
      "nao consigo entrar no painel",
      "não consigo entrar no painel",
      "acesso painel hospitalar",
      "login painel hospitalar",
      "usuario ou senha incorretos",
      "usuário ou senha incorretos",
      "senha do dashboard",
      "login dashboard",
      "painel nao abre",
      "painel não abre",
    ],
    answer:
      "Para acesso ao painel hospitalar do Anest+:\n\n1. Confira se está usando o usuário e senha corretos do painel.\n2. Verifique se não há espaço antes ou depois do usuário/senha.\n3. Atualize a página e tente novamente.\n4. Se aparecer “usuário ou senha incorretos”, o acesso precisa ser conferido com o responsável pelo painel.\n\nNão envie senha pelo chat.",
    requiresHandoff: true,
    severity: "medium",
  },
  {
    intent: "anest_production_access",
    product: "anest",
    title: "Acesso ao painel de produção",
    keywords: [
      { term: "nao consigo acessar a producao", weight: 5 },
      { term: "não consigo acessar a produção", weight: 5 },
      { term: "acesso producao", weight: 4 },
      { term: "acesso produção", weight: 4 },
      { term: "painel de producao", weight: 3 },
      { term: "painel de produção", weight: 3 },
      "nao consigo entrar na producao",
      "não consigo entrar na produção",
      "acessar producao",
      "acessar produção",
      "login producao",
      "login produção",
      "senha da producao",
      "senha da produção",
      "usuario da producao",
      "usuário da produção",
      "producao nao abre",
      "produção não abre",
    ],
    answer:
      "Beleza, vamos por partes.\n\nPara acessar o painel de produção, confira primeiro se o usuário e a senha da produção estão corretos. Também vale apagar e digitar de novo, porque às vezes entra um espaço antes ou depois.\n\nDepois atualize a página e tente novamente. Se aparecer “usuário ou senha inválidos”, o acesso precisa ser conferido com o responsável pelo painel.\n\nNão envie senha pelo chat.",
    requiresHandoff: true,
    severity: "medium",
  },
  {
    intent: "anest_production_empty",
    product: "anest",
    title: "Produção sem fichas",
    keywords: [
      { term: "produção vazia", weight: 5 },
      { term: "producao vazia", weight: 5 },
      { term: "nenhuma ficha na producao", weight: 5 },
      { term: "nenhuma ficha na produção", weight: 5 },
      { term: "lista vazia", weight: 4 },
      { term: "sem fichas", weight: 4 },
      { term: "nenhum resultado", weight: 4 },
      "nao apareceu nada",
      "não apareceu nada",
      "nao trouxe nada",
      "não trouxe nada",
      "nenhuma ficha",
      "nao encontrou",
      "não encontrou",
    ],
    answer:
      "Entendi. No painel de produção, quando não aparece nada, normalmente é um destes pontos:\n\n1. Hospital selecionado diferente do hospital da ficha.\n2. Data diferente da data do procedimento.\n3. A ficha ainda não foi sincronizada.\n4. A ficha foi exportada, mas o iPad/iPhone estava sem internet ou na rede direta da impressora.\n\nTente conferir hospital e data, depois busque novamente. Se a ficha acabou de ser exportada, veja no app se apareceu “Ficha sincronizada com sucesso”.",
    requiresHandoff: true,
    severity: "medium",
  },
  {
    intent: "anest_production_copy",
    product: "anest",
    title: "Copiar linhas da produção",
    keywords: [
      { term: "copiar linhas", weight: 5 },
      { term: "colar na planilha", weight: 5 },
      { term: "não copiou", weight: 4 },
      { term: "nao copiou", weight: 4 },
      "copiar para planilha",
      "nao cola",
      "não cola",
      "planilha",
      "excel",
      "google sheets",
    ],
    answer:
      "Vamos resolver isso. Primeiro, faça a busca da produção e confirme se há linhas na tabela.\n\nDepois clique em “Copiar linhas” e cole direto na planilha. O painel copia as colunas separadas por tabulação, então elas devem cair em colunas diferentes no Excel ou Google Sheets.\n\nSe não copiar, tente atualizar a página e clicar de novo. Em alguns navegadores, a permissão de área de transferência pode bloquear a cópia.",
    severity: "low",
  },
  {
    intent: "anest_production_review",
    product: "anest",
    title: "Itens para revisar na produção",
    keywords: [
      { term: "revisar", weight: 4 },
      { term: "revisão", weight: 4 },
      { term: "revisao", weight: 4 },
      { term: "item para revisar", weight: 5 },
      { term: "dados incompletos", weight: 4 },
      "itens para revisar",
      "marcado para revisar",
      "precisa revisar",
      "tipo revisar",
      "turno revisar",
      "incompleto",
      "tipo de anestesia",
      "duração",
      "duracao",
    ],
    answer:
      "Quando aparece “revisar”, o painel está avisando que aquela linha merece conferência antes de ir para a planilha.\n\nGeralmente isso acontece por dado ausente ou informação que não ficou clara para a produção, como turno, tipo de anestesia, duração, anestesista ou algum campo essencial da ficha.\n\nNesses casos, confira a linha e, se precisar, abra/baixe a ficha para validar a informação antes de fechar a produção.",
    severity: "low",
  },
  {
    intent: "anest_production_versions",
    product: "anest",
    title: "Versões extras na produção",
    keywords: [
      { term: "versões extras", weight: 5 },
      { term: "versoes extras", weight: 5 },
      { term: "ficha duplicada", weight: 5 },
      { term: "fichas duplicadas", weight: 5 },
      "versao anterior",
      "versão anterior",
      "mais de uma versao",
      "mais de uma versão",
      "duplicado",
      "duplicada",
    ],
    answer:
      "No painel de produção, “versões extras” normalmente significa que o mesmo caso foi exportado mais de uma vez.\n\nA linha principal usa a versão mais recente. Se precisar conferir o histórico, expanda o caso para ver as versões anteriores e baixar uma versão específica.\n\nIsso não quer dizer automaticamente que a ficha está duplicada na produção; muitas vezes é só uma nova exportação do mesmo caso.",
    severity: "low",
  },
  {
    intent: "anest_production_download",
    product: "anest",
    title: "Baixar ficha na produção",
    keywords: [
      { term: "baixar pdf", weight: 5 },
      { term: "download pdf", weight: 5 },
      { term: "não baixa", weight: 4 },
      { term: "nao baixa", weight: 4 },
      "baixar ficha",
      "baixar versao",
      "baixar versão",
      "gerando",
      "erro ao baixar",
      "download",
    ],
    answer:
      "Se o botão de baixar não funcionar, tente primeiro atualizar a página e clicar novamente.\n\nTambém confira se o navegador não bloqueou a nova aba ou o download. Para versões extras, expanda o caso e use “Baixar versão” na linha desejada.\n\nSe aparecer mensagem de erro ou continuar travando, aí pode depender do arquivo ou da permissão de download no painel.",
    requiresHandoff: true,
    severity: "medium",
  },
  {
    intent: "anest_trust_layer",
    product: "anest",
    title: "Trust Layer e validação de PDF",
    keywords: [
      "trust layer",
      "assinatura digital",
      "validador",
      "validar pdf",
      "pdf validavel",
      "pdf validável",
      "marcador trust",
      "anestplus_trust",
      "hash",
      "integridade criptografica",
      "integridade criptográfica",
      "documento verificavel",
      "documento verificável",
    ],
    answer:
      "O validador oficial fica em anestplus.com/validar.\n\nEle analisa o PDF exportado pelo Anest+ localmente no navegador e verifica marcador Trust, assinatura digital, integridade criptográfica e metadados do documento.\n\nSe o PDF falhar, tente usar o arquivo original exportado pelo Anest+. Arquivo alterado, escaneado, comprimido ou sem marcador Trust pode não validar.",
    requiresHandoff: true,
  },
  {
    intent: "anest_privacy",
    product: "anest",
    title: "Privacidade, dados locais e localização",
    keywords: [
      "privacidade",
      "dados locais",
      "dados ficam onde",
      "nuvem",
      "servidor",
      "lgpd",
      "localizacao",
      "localização",
      "geofencing",
      "backup",
      "dados do paciente",
      "dados clinicos",
      "dados clínicos",
    ],
    answer:
      "O Anest+ funciona localmente por padrão. Fichas, registros clínicos, hospitais personalizados, logos e PDFs ficam no dispositivo, salvo quando o usuário usa exportação, compartilhamento, sincronização opcional, Conta Anest+ Pro ou fluxo institucional.\n\nA localização “Durante o uso do app” serve para geofencing institucional, ajudando a sugerir o hospital correto.",
  },
  {
    intent: "anest_appstore_subscription",
    product: "anest",
    title: "Assinatura App Store",
    keywords: [
      "assinatura pro",
      "assinar pro",
      "cancelar assinatura",
      "reembolso",
      "cobranca",
      "cobrança",
      "renovacao",
      "renovação",
      "restaurar compra",
      "app store",
      "storekit",
      "pagamento",
    ],
    answer:
      "A assinatura Anest+ Pro individual é gerenciada pela App Store.\n\nCancelamento, reembolso, método de pagamento, renovação e restauração de compra seguem as regras da Apple e devem ser feitos na conta Apple do usuário.\n\nO Anest+ não recebe dados completos de cartão ou pagamento.",
    requiresHandoff: true,
  },

];

import {
  HUMAN_SUPPORT_REPLY,
  INITIAL_REPLY,
  KNOWLEDGE_ITEMS,
  SAFETY_FOOTER,
  type KnowledgeItem,
  type KnowledgeKeyword,
  type SupportIntent,
  type SupportProduct,
} from "./knowledge";

export type SupportFlow =
  | "idle"
  | "anest_sync_awaiting_network"
  | "anest_sync_awaiting_success_message"
  | "anest_print_awaiting_hospital"
  | "anest_print_awaiting_printer_visible"
  | "anest_signature_awaiting_profile_check";

export type SupportChatResult = {
  reply: string;
  product: SupportProduct;
  intent: SupportIntent;
  requiresHandoff: boolean;
  confidence: number;
  matchedTitle?: string;
  matchedScore?: number;
  activeFlow: SupportFlow;
  collected?: Record<string, string>;
  supportSummary?: string;
};

type SupportChatContext = {
  area?: "general" | "production";
  activeFlow?: SupportFlow;
  collected?: Record<string, string>;
};

type MatchedKnowledgeItem = {
  item: KnowledgeItem;
  score: number;
};

const HUMAN_KEYWORDS = [
  "humano",
  "atendente",
  "whatsapp",
  "zap",
  "suporte humano",
  "falar com alguem",
  "falar com alguém",
  "telefone",
];

const ACCESS_KEYWORDS = [
  "nao consigo acessar",
  "não consigo acessar",
  "nao consigo entrar",
  "não consigo entrar",
  "problema de acesso",
  "acesso",
  "login",
  "senha",
];

const GREETING_KEYWORDS = [
  "oi",
  "ola",
  "olá",
  "bom dia",
  "boa tarde",
  "boa noite",
  "e ai",
  "e aí",
  "fala",
  "opa",
];

const THANKS_KEYWORDS = [
  "obrigado",
  "obrigada",
  "valeu",
  "vlw",
  "show",
  "beleza",
  "blz",
  "perfeito",
  "entendi",
];

const SUMMARY_KEYWORDS = [
  "me diga o que entendeu",
  "diga o que entendeu",
  "o que voce entendeu",
  "o que você entendeu",
  "o que entendeu",
  "resuma",
  "resume",
  "resumo",
  "qual resumo",
  "me de um resumo",
  "me dê um resumo",
];

const SUPPORT_SYNONYMS: Record<string, string[]> = {
  sincronizacao: [
    "subiu",
    "nao subiu",
    "não subiu",
    "nao chegou",
    "não chegou",
    "nao apareceu",
    "não apareceu",
    "exportei",
  ],
  impressao: [
    "impressora",
    "imprimir",
    "airprint",
    "epson",
    "pdf nao imprime",
    "pdf não imprime",
  ],
  acesso: [
    "login",
    "entrar",
    "senha",
    "conta",
    "nao consigo acessar",
    "não consigo acessar",
  ],
  producao: [
    "produção",
    "producao",
    "planilha",
    "revisar",
    "copiar linhas",
    "versões extras",
    "versoes extras",
  ],
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(message: string, keywords: string[]) {
  return keywords.some((keyword) => message.includes(normalize(keyword)));
}

function isShortSocialMessage(message: string, keywords: string[]) {
  const words = message.split(" ").filter(Boolean);
  const wordCount = words.length;

  if (wordCount > 5) return false;

  return keywords.some((keyword) => {
    const normalizedKeyword = normalize(keyword);

    if (message === normalizedKeyword) return true;

    if (normalizedKeyword.includes(" ")) {
      return message.includes(normalizedKeyword);
    }

    return words.includes(normalizedKeyword);
  });
}

function expandWithSynonyms(message: string) {
  const additions = Object.entries(SUPPORT_SYNONYMS)
    .filter(([, terms]) => includesAny(message, terms))
    .map(([canonical]) => canonical);

  if (additions.length === 0) return message;
  return `${message} ${additions.join(" ")}`;
}

function getKeywordTerm(keyword: KnowledgeKeyword) {
  return typeof keyword === "string" ? keyword : keyword.term;
}

function getKeywordWeight(keyword: KnowledgeKeyword) {
  if (typeof keyword !== "string") return keyword.weight;

  const normalizedKeyword = normalize(keyword);
  return Math.max(1, normalizedKeyword.split(" ").length);
}

function scoreItem(message: string, item: KnowledgeItem) {
  return item.keywords.reduce((score, keyword) => {
    const normalizedKeyword = normalize(getKeywordTerm(keyword));
    if (message.includes(normalizedKeyword)) {
      return score + getKeywordWeight(keyword);
    }
    return score;
  }, 0);
}

function findBestItem(message: string): MatchedKnowledgeItem | undefined {
  const scoredCandidates = KNOWLEDGE_ITEMS.map((item) => ({
    item,
    score: scoreItem(message, item),
  }))
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score);

  return scoredCandidates[0];
}

function confidenceFromScore(score = 0) {
  if (score >= 5) return 0.9;
  if (score >= 3) return 0.65;
  if (score >= 1) return 0.4;
  return 0;
}

function withSafetyFooter(reply: string) {
  if (reply.includes(SAFETY_FOOTER)) return reply;
  return `${reply}\n\n${SAFETY_FOOTER}`;
}

function shouldShowSafetyFooter(intent: SupportIntent) {
  return (
    intent === "anest_pin" ||
    intent === "anest_signature" ||
    intent === "anest_pro_access" ||
    intent === "anest_panel_access" ||
    intent === "anest_production_access"
  );
}

function getAccessFallback(message: string) {
  if (message.includes("producao") || message.includes("produção")) {
    return KNOWLEDGE_ITEMS.find(
      (item) => item.intent === "anest_production_access"
    );
  }

  if (message.includes("painel") || message.includes("dashboard")) {
    return KNOWLEDGE_ITEMS.find((item) => item.intent === "anest_panel_access");
  }

  if (includesAny(message, ["conta pro", "anest pro", "anest+ pro", "conta"])) {
    return KNOWLEDGE_ITEMS.find((item) => item.intent === "anest_pro_access");
  }

  return undefined;
}

function findItemByIntent(intent: SupportIntent) {
  return KNOWLEDGE_ITEMS.find((item) => item.intent === intent);
}

function getProductionContextItem(message: string) {
  if (includesAny(message, ACCESS_KEYWORDS)) {
    const item = findItemByIntent("anest_production_access");
    return item ? { item, score: 3 } : undefined;
  }

  if (
    includesAny(message, [
      "nao apareceu",
      "não apareceu",
      "nao aparece",
      "não aparece",
      "nao trouxe",
      "não trouxe",
      "nada",
      "vazio",
      "sem ficha",
      "sem fichas",
      "nenhum resultado",
      "lista vazia",
    ])
  ) {
    const item = findItemByIntent("anest_production_empty");
    return item ? { item, score: 3 } : undefined;
  }

  if (
    includesAny(message, [
      "copiar",
      "copiou",
      "colar",
      "planilha",
      "excel",
      "google sheets",
    ])
  ) {
    const item = findItemByIntent("anest_production_copy");
    return item ? { item, score: 3 } : undefined;
  }

  if (includesAny(message, ["revisar", "revisao", "revisão"])) {
    const item = findItemByIntent("anest_production_review");
    return item ? { item, score: 3 } : undefined;
  }

  if (
    includesAny(message, [
      "versao",
      "versão",
      "versoes",
      "versões",
      "duplicado",
      "duplicada",
    ])
  ) {
    const item = findItemByIntent("anest_production_versions");
    return item ? { item, score: 3 } : undefined;
  }

  if (includesAny(message, ["pdf", "baixar", "baixa", "download", "gerando"])) {
    const item = findItemByIntent("anest_production_download");
    return item ? { item, score: 3 } : undefined;
  }

  if (
    includesAny(message, [
      "buscar",
      "busca",
      "ficha",
      "fichas",
      "produção",
      "producao",
      "produção anestésica",
      "producao anestesica",
    ])
  ) {
    const item = findItemByIntent("anest_production");
    return item ? { item, score: 3 } : undefined;
  }

  return undefined;
}

function buildSupportSummary({
  intent,
  title,
  rawMessage,
  collected,
  area,
}: {
  intent: SupportIntent;
  title: string;
  rawMessage: string;
  collected?: Record<string, string>;
  area?: SupportChatContext["area"];
}) {
  return [
    "Resumo para suporte:",
    "Produto: Anest+",
    `Área: ${area ?? "general"}`,
    `Intenção detectada: ${title}`,
    `Problema relatado: “${rawMessage.trim() || "não informado"}”`,
    `Hospital informado: ${collected?.hospital ?? "não informado"}`,
    `Rede usada: ${collected?.network ?? "não informada"}`,
    `Mensagem de erro: ${collected?.errorMessage ?? "não informada"}`,
    `Último passo tentado: ${collected?.lastStep ?? "não informado"}`,
    `Intent técnico: ${intent}`,
  ].join("\n");
}

function makeResult({
  reply,
  intent,
  requiresHandoff = false,
  confidence = 0,
  matchedTitle,
  matchedScore,
  activeFlow = "idle",
  collected,
  supportSummary,
}: {
  reply: string;
  intent: SupportIntent;
  requiresHandoff?: boolean;
  confidence?: number;
  matchedTitle?: string;
  matchedScore?: number;
  activeFlow?: SupportFlow;
  collected?: Record<string, string>;
  supportSummary?: string;
}): SupportChatResult {
  return {
    reply,
    product: "anest",
    intent,
    requiresHandoff,
    confidence,
    matchedTitle,
    matchedScore,
    activeFlow,
    collected,
    supportSummary,
  };
}

function resolveActiveFlow(
  rawMessage: string,
  normalizedMessage: string,
  context?: SupportChatContext
): SupportChatResult | undefined {
  const activeFlow = context?.activeFlow ?? "idle";
  const collected = { ...(context?.collected ?? {}) };

  if (activeFlow === "anest_sync_awaiting_network") {
    if (includesAny(normalizedMessage, ["impressora", "epson", "rede direta"])) {
      collected.network = "rede direta da impressora";
      return {
        reply:
          "Boa, isso explica bastante. Saia da rede direta da impressora, conecte na rede principal do hospital e exporte a ficha novamente. Depois veja se aparece “Ficha sincronizada com sucesso”.",
        product: "anest",
        intent: "anest_sync",
        requiresHandoff: false,
        confidence: 0.9,
        matchedTitle: "Ficha não sincronizou",
        matchedScore: 5,
        activeFlow: "anest_sync_awaiting_success_message",
        collected,
      };
    }

    if (includesAny(normalizedMessage, ["principal", "hospital", "cc-anestesistas", "wifi", "wi-fi"])) {
      collected.network = rawMessage.trim();
      return {
        reply:
          "Certo. Depois da exportação, apareceu a mensagem “Ficha sincronizada com sucesso”?",
        product: "anest",
        intent: "anest_sync",
        requiresHandoff: false,
        confidence: 0.8,
        matchedTitle: "Ficha não sincronizou",
        matchedScore: 4,
        activeFlow: "anest_sync_awaiting_success_message",
        collected,
      };
    }

    return {
      reply:
        "Só para eu te orientar melhor: o aparelho estava na rede principal do hospital ou na rede direta da impressora?",
      product: "anest",
      intent: "anest_sync",
      requiresHandoff: false,
      confidence: 0.65,
      matchedTitle: "Ficha não sincronizou",
      matchedScore: 3,
      activeFlow: "anest_sync_awaiting_network",
      collected,
    };
  }

  if (activeFlow === "anest_sync_awaiting_success_message") {
    if (includesAny(normalizedMessage, ["sim", "apareceu", "sucesso"])) {
      collected.lastStep = "mensagem de sincronização apareceu";
      return {
        reply:
          "Ótimo. Agora confira no painel se o hospital, CRM e data da busca estão corretos. Se ainda não aparecer, tente atualizar o painel e buscar de novo.",
        product: "anest",
        intent: "anest_sync",
        requiresHandoff: false,
        confidence: 0.85,
        matchedTitle: "Ficha não sincronizou",
        matchedScore: 4,
        activeFlow: "idle",
        collected,
      };
    }

    if (includesAny(normalizedMessage, ["nao", "não", "erro", "falhou"])) {
      collected.lastStep = "mensagem de sincronização não apareceu";
      return {
        reply:
          "Entendi. Nesse caso, conecte na rede principal do hospital, saia da tela de compartilhamento/exportação e tente exportar novamente. Se aparecer erro, um print da mensagem ajuda bastante.",
        product: "anest",
        intent: "anest_sync",
        requiresHandoff: false,
        confidence: 0.85,
        matchedTitle: "Ficha não sincronizou",
        matchedScore: 4,
        activeFlow: "idle",
        collected,
      };
    }
  }

  if (activeFlow === "anest_print_awaiting_hospital") {
    collected.hospital = rawMessage.trim();
    return {
      reply:
        "Certo. Agora veja se a impressora aparece na lista de impressão do iOS quando você abre o PDF exportado.",
      product: "anest",
      intent: "anest_print",
      requiresHandoff: false,
      confidence: 0.75,
      matchedTitle: "Impressão",
      matchedScore: 3,
      activeFlow: "anest_print_awaiting_printer_visible",
      collected,
    };
  }

  if (activeFlow === "anest_print_awaiting_printer_visible") {
    const printerVisible = includesAny(normalizedMessage, ["sim", "aparece"]);
    collected.lastStep = printerVisible
      ? "impressora aparece na lista"
      : "impressora não aparece na lista";

    return {
      reply: printerVisible
        ? "Beleza. Se ela aparece, tente imprimir novamente pelo compartilhamento do iOS. Se falhar, confira se o PDF abriu corretamente antes de enviar para impressão."
        : "Se a impressora não aparece, confira se ela está ligada e se o iPad/iPhone está na mesma rede usada para impressão. Depois abra o PDF e tente de novo.",
      product: "anest",
      intent: "anest_print",
      requiresHandoff: false,
      confidence: 0.8,
      matchedTitle: "Impressão",
      matchedScore: 4,
      activeFlow: "idle",
      collected,
    };
  }

  if (activeFlow === "anest_signature_awaiting_profile_check") {
    collected.lastStep = rawMessage.trim();
    return {
      reply:
        "Certo. Se o profissional correto já está selecionado, tente assinar novamente. Se o problema for PIN, não envie o código pelo chat; o responsável local ou suporte deve orientar a redefinição conforme a rotina institucional.",
      product: "anest",
      intent: "anest_signature",
      requiresHandoff: false,
      confidence: 0.75,
      matchedTitle: "Assinatura eletrônica",
      matchedScore: 3,
      activeFlow: "idle",
      collected,
    };
  }

  return undefined;
}

function socialReply(
  normalizedMessage: string,
  context?: SupportChatContext
): SupportChatResult | undefined {
  const area = context?.area ?? "general";
  const collected = context?.collected;

  if (isShortSocialMessage(normalizedMessage, GREETING_KEYWORDS)) {
    return makeResult({
      reply:
        area === "production"
          ? "Olá! Posso te ajudar com o painel de produção do Anest+. Me diga se a dúvida é sobre buscar fichas, revisar produção, copiar linhas, baixar PDF, versões ou fichas que não apareceram."
          : "Olá! Posso te ajudar com o Anest+. Me diga qual ponto você quer resolver: sincronização, impressão, assinatura, PIN, PDF, painel hospitalar, produção, Conta Pro ou acesso.",
      intent: "triage",
      confidence: 1,
      activeFlow: "idle",
      collected,
    });
  }

  if (isShortSocialMessage(normalizedMessage, THANKS_KEYWORDS)) {
    return makeResult({
      reply:
        "Por nada! Se precisar, me diga qual ponto do Anest+ você quer resolver e eu te oriento passo a passo.",
      intent: "triage",
      confidence: 1,
      activeFlow: "idle",
      collected,
    });
  }

  if (includesAny(normalizedMessage, SUMMARY_KEYWORDS)) {
    return makeResult({
      reply:
        collected && Object.keys(collected).length > 0
          ? `Entendi até aqui:\n\n${buildSupportSummary({
              intent: "triage",
              title: "Resumo da conversa",
              rawMessage: "Pedido de resumo",
              collected,
              area,
            })}`
          : area === "production"
          ? "Até aqui, entendi que você está usando o suporte do Anest+ no contexto do painel de produção. Ainda não tenho um problema específico registrado nesta conversa. Me diga se a dúvida é sobre buscar fichas, revisar produção, copiar linhas, baixar PDF, versões ou fichas que não apareceram."
          : "Até aqui, entendi que você está usando o suporte geral do Anest+. Ainda não tenho um problema específico registrado nesta conversa. Me diga se a dúvida é sobre sincronização, impressão, assinatura, PIN, PDF, painel hospitalar, produção, Conta Pro ou acesso.",
      intent: "triage",
      confidence: 1,
      activeFlow: "idle",
      collected,
    });
  }

  return undefined;
}

export function getSupportReply(
  rawMessage: string,
  context?: SupportChatContext
): SupportChatResult {
  const normalizedMessage = normalize(rawMessage);
  const area = context?.area ?? "general";
  const expandedMessage = expandWithSynonyms(normalizedMessage);

  if (!normalizedMessage) {
    return makeResult({
      reply: INITIAL_REPLY,
      intent: "triage",
      confidence: 0,
      activeFlow: "idle",
      collected: context?.collected,
    });
  }

  const flowResult = resolveActiveFlow(rawMessage, normalizedMessage, context);
  if (flowResult) return flowResult;

  if (includesAny(normalizedMessage, HUMAN_KEYWORDS)) {
    const summary = buildSupportSummary({
      intent: "human_support",
      title: "Suporte humano",
      rawMessage,
      collected: context?.collected,
      area,
    });

    return makeResult({
      reply: HUMAN_SUPPORT_REPLY,
      intent: "human_support",
      requiresHandoff: true,
      confidence: 1,
      matchedTitle: "Suporte humano",
      matchedScore: 5,
      activeFlow: "idle",
      collected: context?.collected,
      supportSummary: summary,
    });
  }

  const socialResult = socialReply(normalizedMessage, context);
  if (socialResult) return socialResult;

const isHospitalDashboardActionMessage =
  area !== "production" &&
  includesAny(normalizedMessage, [
    "baixar",
    "download",
    "baixar pdf",
    "baixar ficha",
    "baixar versao",
    "baixar versão",
    "prontuario",
    "prontuário",
    "copiar prontuario",
    "copiar prontuário",
    "buscar ficha",
    "buscar fichas",
  ]);

if (isHospitalDashboardActionMessage) {
  const dashboardItem = findItemByIntent("anest_hospital_dashboard");

  if (dashboardItem) {
    return makeResult({
      reply: dashboardItem.answer,
      intent: dashboardItem.intent,
      requiresHandoff: Boolean(dashboardItem.requiresHandoff),
      confidence: 0.9,
      matchedTitle: dashboardItem.title,
      matchedScore: 5,
      activeFlow: "idle",
      collected: context?.collected,
    });
  }
}

const isPanelAccessMessage = includesAny(normalizedMessage, [
  "painel nao abre",
  "painel não abre",
  "nao consigo acessar o painel",
  "não consigo acessar o painel",
  "nao consigo acessar painel",
  "não consigo acessar painel",
  "nao consigo entrar no painel",
  "não consigo entrar no painel",
  "nao consigo entrar painel",
  "não consigo entrar painel",
  "acessar painel",
  "entrar painel",
  "acesso painel",
  "acesso ao painel",
  "login painel",
  "senha do dashboard",
  "usuario ou senha",
  "usuário ou senha",
]);

if (isPanelAccessMessage) {
  const panelAccessItem = findItemByIntent("anest_panel_access");

  if (panelAccessItem) {
    return makeResult({
      reply: panelAccessItem.answer,
      intent: panelAccessItem.intent,
      requiresHandoff: Boolean(panelAccessItem.requiresHandoff),
      confidence: 0.9,
      matchedTitle: panelAccessItem.title,
      matchedScore: 5,
      activeFlow: "idle",
      collected: context?.collected,
    });
  }
}

const isPanelOnlyMessage =
  includesAny(normalizedMessage, [
    "painel",
    "dashboard",
    "painel hospitalar",
    "dashboard hospitalar",
    "abrir painel",
    "ver painel",
  ]) &&
  !includesAny(normalizedMessage, [
    "ficha",
    "fichas",
    "nao apareceu",
    "não apareceu",
    "nao aparece",
    "não aparece",
    "exportei",
    "sincronizou",
    "sincronizar",
    "impressora",
    "imprimir",
    "acessar",
    "entrar",
    "login",
    "senha",
    "acesso",
  ]);

if (isPanelOnlyMessage) {
  const panelIntent =
    area === "production" ? "anest_production" : "anest_hospital_dashboard";
  const panelItem = findItemByIntent(panelIntent);

  if (panelItem) {
    return makeResult({
      reply: panelItem.answer,
      intent: panelItem.intent,
      requiresHandoff: Boolean(panelItem.requiresHandoff),
      confidence: 0.9,
      matchedTitle: panelItem.title,
      matchedScore: 5,
      activeFlow: "idle",
      collected: context?.collected,
    });
  }
}

  const bestItem = findBestItem(expandedMessage);
  const productionContextItem =
    context?.area === "production"
      ? getProductionContextItem(normalizedMessage)
      : undefined;
  const accessFallbackItem = includesAny(normalizedMessage, ACCESS_KEYWORDS)
    ? (() => {
        const fallbackItem = getAccessFallback(normalizedMessage);
        return fallbackItem ? { item: fallbackItem, score: 3 } : undefined;
      })()
    : undefined;

  const item =
    context?.area === "production"
      ? productionContextItem ?? bestItem ?? accessFallbackItem
      : bestItem ?? productionContextItem ?? accessFallbackItem;

  if (item) {
    const confidence = confidenceFromScore(item.score);
    const nextFlow =
      item.item.intent === "anest_sync" && item.item.diagnosticQuestions?.[0]
        ? "anest_sync_awaiting_network"
        : item.item.intent === "anest_print" && item.item.diagnosticQuestions?.[0]
        ? "anest_print_awaiting_hospital"
        : item.item.intent === "anest_signature" &&
          item.item.diagnosticQuestions?.[0]
        ? "anest_signature_awaiting_profile_check"
        : "idle";

    const shouldAskDiagnostic = nextFlow !== "idle";

    const diagnosticReply = shouldAskDiagnostic
      ? `Entendi. ${item.item.diagnosticQuestions?.[0]}`
      : undefined;

    const handoff = item.item.requiresHandoff ? `\n\n${HUMAN_SUPPORT_REPLY}` : "";
    const baseReply = diagnosticReply ?? `${item.item.answer}${handoff}`;
    const reply = shouldShowSafetyFooter(item.item.intent)
      ? withSafetyFooter(baseReply)
      : baseReply;
    const supportSummary =
      item.item.requiresHandoff || item.item.intent === "human_support"
        ? buildSupportSummary({
            intent: item.item.intent,
            title: item.item.title,
            rawMessage,
            collected: context?.collected,
            area,
          })
        : undefined;

    return {
      reply,
      product: "anest",
      intent: item.item.intent,
      requiresHandoff: Boolean(item.item.requiresHandoff),
      confidence,
      matchedTitle: item.item.title,
      matchedScore: item.score,
      activeFlow: shouldAskDiagnostic ? nextFlow : "idle",
      collected: context?.collected,
      supportSummary,
    };
  }

  return {
    reply:
      context?.area === "production"
        ? "Entendi. Me diga em uma frase o que está acontecendo na produção: acesso, busca vazia, copiar linhas, revisar, versões extras, baixar PDF ou outro ponto?"
        : "Entendi. Me diga em uma frase o que está acontecendo no Anest+: sincronização, impressão, assinatura, PIN, PDF, painel hospitalar, produção, Conta Pro ou outro ponto?",
    product: "anest",
    intent: "fallback",
    requiresHandoff: false,
    confidence: 0,
    activeFlow: "idle",
  };
}

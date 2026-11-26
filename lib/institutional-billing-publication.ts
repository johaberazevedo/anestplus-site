import { createHmac } from "node:crypto";
import { isUuid } from "@/lib/admin-auth";
import { billingText } from "@/lib/institutional-billing";
import { validateBillingRevisionV2, type BillingConfigurationIssueV2, type BillingRevisionV2 } from "@/lib/institutional-billing-rules-v2";
import { HOSPITAL_BILLING_FEATURE, isHospitalCode } from "@/lib/institutional-hospitals";
import { authenticateProHospitalToken, getProHospitalLinksForUser } from "@/lib/pro-hospital-access";

type Rejection = {
  status: 400 | 401 | 403;
  error: string;
  issues?: BillingConfigurationIssueV2[];
};
type SignedPreparation = { args: { p_intent: string; p_signature: string }; error?: never } | (Rejection & { args?: never });
type EngineIntent =
  | { action: "calculation_read"; through: string }
  | { action: "activation_read" }
  | { action: "activation_set"; expectedVersion: number; startsOn: string | null; firstPublicationVersion: number | null; reason: string }
  | { action: "closure_prepare"; month: string }
  | { action: "closure_commit"; month: string; operationId: string; closeRequest: unknown; snapshot: unknown };
type Intent = EngineIntent
  | { action: "publish"; expectedVersion: number; planId: string | null; configuration: BillingRevisionV2; reason: string | null }
  | { action: "read"; beforeVersion: number | null; limit: number };

const intentFields = ["configuration", "expectedVersion", "planId", "reason"];

async function publicationActor(request: Request, hospitalCode: string): Promise<{ userId: string } | Rejection> {
  if (!isHospitalCode(hospitalCode)) return { status: 400, error: "Hospital inválido." };
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!token) return { status: 401, error: "Não autenticado." };
  const userId = await authenticateProHospitalToken(token);
  if (!userId) return { status: 401, error: "Sessão inválida." };
  const hospitals = await getProHospitalLinksForUser(userId, hospitalCode, HOSPITAL_BILLING_FEATURE);
  if (!hospitals.includes(hospitalCode)) return { status: 403, error: "Acesso ao faturamento não autorizado." };
  return { userId };
}

function signIntent(actor: string, hospitalCode: string, intent: Intent) {
  const key = process.env.ANEST_BILLING_PUBLICATION_SIGNING_KEY;
  if (!key || !/^[0-9a-f]{64}$/i.test(key)) throw new Error("Chave de assinatura de publicações indisponível.");
  const payload = JSON.stringify({ actor, hospitalCode, expiresAt: Math.floor(Date.now() / 1000) + 60, ...intent });
  return { args: { p_intent: payload, p_signature: createHmac("sha256", Buffer.from(key, "hex")).update(payload).digest("hex") } };
}

export function signBillingEngineIntent(hospital: { code: string; actorId: string }, intent: EngineIntent) {
  return signIntent(hospital.actorId, hospital.code, intent).args;
}

// A futura rota usa o mesmo Bearer para chamar a RPC pelo PostgREST. O banco
// compara auth.uid() com o ator assinado antes de verificar o vínculo.
export async function prepareProBillingPublication(request: Request, hospitalCode: string, input: unknown): Promise<SignedPreparation> {
  const actor = await publicationActor(request, hospitalCode);
  if ("error" in actor) return actor;

  if (!input || typeof input !== "object" || Array.isArray(input) || Object.keys(input).some((key) => !intentFields.includes(key))) {
    return { status: 400, error: "Confira os dados da publicação." };
  }
  const { configuration, expectedVersion, planId, reason } = input as Record<string, unknown>;
  if (typeof expectedVersion !== "number" || !Number.isInteger(expectedVersion)
      || expectedVersion < 0 || expectedVersion > 2147483647 || (planId !== null && !isUuid(planId))) {
    return { status: 400, error: "Informe a versão conferida e o identificador do plano ou da tabela geral." };
  }
  const justification = billingText(reason) || null;
  if ((reason != null && (typeof reason !== "string" || reason.includes("\0"))) || (justification && [...justification].length > 1000)) {
    return { status: 400, error: "Informe uma justificativa de até 1.000 caracteres." };
  }

  const validated = validateBillingRevisionV2(configuration);
  if (validated.issues) return { status: 400, error: "Confira as regras da configuração.", issues: validated.issues };
  const { revision } = validated;
  if (revision.hospitalCode !== hospitalCode || (revision.planName === null) !== (planId === null)
      || !isUuid(revision.revisionId)) {
    return { status: 400, error: "A revisão deve identificar o mesmo hospital, o mesmo escopo e um UUID de publicação." };
  }

  const operationId = revision.revisionId.toLowerCase();
  return signIntent(actor.userId, hospitalCode, { action: "publish", expectedVersion, planId,
    configuration: { ...revision, revisionId: operationId }, reason: justification });
}

export async function prepareProBillingPublicationHistory(request: Request, hospitalCode: string,
  beforeVersion: unknown = null, limit: unknown = 50): Promise<SignedPreparation> {
  const actor = await publicationActor(request, hospitalCode);
  if ("error" in actor) return actor;
  if ((beforeVersion !== null && (typeof beforeVersion !== "number" || !Number.isInteger(beforeVersion)
      || beforeVersion < 1 || beforeVersion > 2147483647))
      || typeof limit !== "number" || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    return { status: 400, error: "Confira os parâmetros do histórico." };
  }
  return signIntent(actor.userId, hospitalCode, { action: "read", beforeVersion, limit });
}

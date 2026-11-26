import { billingReply } from "@/lib/institutional-billing-access";
import { prepareProBillingPublicationHistory, signBillingEngineIntent } from "@/lib/institutional-billing-publication";
import type { BillingRevisionV2 } from "@/lib/institutional-billing-rules-v2";

export type BillingPublication = {
  hospital_code: string;
  version: number;
  revision_id: string;
  plan_id: string | null;
  starts_on: string;
  published_by: string;
  published_at: string;
  is_retroactive: boolean;
  reason: string | null;
  previous_version: number | null;
  previous_starts_on: string | null;
  configuration_before: unknown;
  configuration_after: BillingRevisionV2;
};

export type BillingPublicationPage = {
  latest_version: number;
  publications: BillingPublication[];
  next_before_version: number | null;
};

type Rpc = "publish_pro_billing_configuration" | "read_pro_billing_publications" | "read_pro_billing_calculation"
  | "read_pro_billing_engine_activation" | "set_pro_billing_engine_activation" | "prepare_pro_billing_close" | "close_pro_billing_period";
type SignedArgs = { p_intent: string; p_signature: string };

const unavailable = () => billingReply({ error: "Publicações indisponíveis no momento." }, 503);

export function publicationUnavailable(error: unknown) {
  return error instanceof Response ? error : unavailable();
}

export function billingVersion(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 2_147_483_647;
}

function rpcFailure(response: Response, error: { code?: string; message?: string } | null) {
  switch (error?.message) {
    case "billing_publication_stale":
      return billingReply({ error: "Outra revisão foi publicada. Confira a prévia novamente.", code: "stale" }, 409);
    case "billing_publication_operation_conflict":
      return billingReply({ error: "Esta operação já está vinculada a outra publicação.", code: "operation_conflict" }, 409);
    case "billing_publication_retroactive_reason_required":
      return billingReply({ error: "Informe a justificativa para essa vigência.", code: "reason_required" }, 400);
    case "billing_publication_scope_mismatch":
    case "billing_publication_plan_not_in_hospital":
      return billingReply({ error: "O plano mudou. Atualize os dados e confira a prévia novamente.", code: "scope_changed" }, 409);
    case "billing_publication_attestation_expired":
      return billingReply({ error: "A autorização da operação expirou. Tente novamente." }, 503);
    case "billing_publication_attestation_required":
      return unavailable();
    case "billing_activation_stale":
      return billingReply({ error: "A ativação mudou. Consulte a configuração novamente." }, 409);
    case "billing_activation_publication_unavailable":
      return billingReply({ error: "A publicação inicial não está vigente nesse hospital para a data escolhida." }, 400);
    case "billing_preview_stale":
    case "billing_configuration_changed":
    case "snapshot_source_conflict":
    case "snapshot_sources_mismatch":
      return billingReply({ error: "A competência mudou. Atualize e revise a prévia antes de confirmar.", code: "closing_stale" }, 409);
    case "close_operation_conflict":
      return billingReply({ error: "Esta confirmação já está associada a outra decisão. Atualize a competência.", code: "closing_conflict" }, 409);
    case "competence_expired":
      return billingReply({ error: "A competência expirou.", code: "competence_expired" }, 410);
    case "billing_month_not_ended":
      return billingReply({ error: "O fechamento fica disponível após o fim da competência.", code: "billing_month_not_ended" }, 409);
  }
  if (response.status === 401) return billingReply({ error: "Sessão inválida." }, 401);
  if (error?.code === "42501" || response.status === 403) return billingReply({ error: "Acesso ao faturamento não autorizado." }, 403);
  if (error?.code === "22023" || error?.code === "22008") return billingReply({ error: "Confira os dados da publicação." }, 400);
  return unavailable();
}

export async function publicationRpc(request: Request, rpc: Rpc, args: SignedArgs | {
  p_hospital: string; p_through: string; p_intent: string | null; p_signature: string | null;
}): Promise<unknown> {
  const authorization = request.headers.get("authorization");
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!authorization || !baseUrl || !key) throw unavailable();
  const response = await fetch(new URL(`/rest/v1/rpc/${rpc}`, baseUrl), {
    method: "POST", cache: "no-store", redirect: "error", signal: request.signal,
    headers: { apikey: key, Authorization: authorization, "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw rpcFailure(response, data);
  return data;
}

export function readBillingCalculationContext(request: Request, hospital: { code: string; actorId: string }, through: string) {
  // Sem chave, o banco só admite a consulta autenticada de tabelas anteriores.
  const proof = /^[0-9a-f]{64}$/i.test(process.env.ANEST_BILLING_PUBLICATION_SIGNING_KEY ?? "")
    ? signBillingEngineIntent(hospital, { action: "calculation_read", through }) : { p_intent: null, p_signature: null };
  return publicationRpc(request, "read_pro_billing_calculation", { p_hospital: hospital.code, p_through: through, ...proof });
}

export function publicationView(raw: unknown, hospitalCode: string): BillingPublication {
  const row = raw as Partial<BillingPublication> | null;
  if (!row || row.hospital_code !== hospitalCode || !billingVersion(row.version) || row.version === 0
      || (row.plan_id !== null && typeof row.plan_id !== "string")
      || typeof row.revision_id !== "string" || typeof row.starts_on !== "string"
      || typeof row.published_by !== "string" || typeof row.published_at !== "string"
      || typeof row.is_retroactive !== "boolean" || (row.reason !== null && typeof row.reason !== "string")
      || !row.configuration_after || row.configuration_after.hospitalCode !== hospitalCode
      || row.configuration_after.revisionId !== row.revision_id || row.configuration_after.startsOn !== row.starts_on) throw unavailable();
  // Somente os campos do histórico aprovado compõem a resposta ao navegador.
  const { hospital_code, version, revision_id, plan_id, starts_on, published_by, published_at, is_retroactive,
    reason, previous_version, previous_starts_on, configuration_before, configuration_after } = row;
  return { hospital_code, version, revision_id, plan_id, starts_on, published_by, published_at, is_retroactive,
    reason, previous_version: previous_version ?? null, previous_starts_on: previous_starts_on ?? null,
    configuration_before: configuration_before ?? null, configuration_after };
}

export async function readPublicationPage(request: Request, hospitalCode: string, cursor: number | null, limit = 50): Promise<BillingPublicationPage> {
  const prepared = await prepareProBillingPublicationHistory(request, hospitalCode, cursor, limit);
  if (!prepared.args) throw billingReply({ error: prepared.error }, prepared.status);
  const page = await publicationRpc(request, "read_pro_billing_publications", prepared.args) as Partial<BillingPublicationPage> | null;
  if (!page || !billingVersion(page.latest_version) || !Array.isArray(page.publications) || page.publications.length > limit
      || (page.next_before_version !== null && (!billingVersion(page.next_before_version) || page.next_before_version === 0))) throw unavailable();
  const { latest_version, next_before_version } = page;
  const publications = page.publications.map((row) => publicationView(row, hospitalCode));
  if (publications.some((row, index) => row.version > latest_version
      || (cursor !== null && row.version >= cursor) || (index > 0 && row.version >= publications[index - 1].version))
      || (next_before_version !== null && next_before_version !== publications.at(-1)?.version)) throw unavailable();
  return { latest_version, publications, next_before_version };
}

import { billingText, isBillingDate } from "@/lib/institutional-billing";
import { billingReply as reply, getBillingHospital } from "@/lib/institutional-billing-access";
import { signBillingEngineIntent } from "@/lib/institutional-billing-publication";
import { publicationRpc, publicationUnavailable } from "@/lib/institutional-billing-publication-rpc";

type RouteContext = { params: Promise<{ hospitalCode: string }> };
const fields = new Set(["expectedVersion", "startsOn", "firstPublicationVersion", "reason"]);

function version(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 2_147_483_647;
}

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { hospitalCode } = await params;
    const hospital = await getBillingHospital(request, hospitalCode);
    if (hospital instanceof Response) return hospital;
    const proof = signBillingEngineIntent(hospital, { action: "activation_read" });
    return reply({ activation: await publicationRpc(request, "read_pro_billing_engine_activation", proof) });
  } catch (error) {
    return publicationUnavailable(error);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { hospitalCode } = await params;
    const hospital = await getBillingHospital(request, hospitalCode);
    if (hospital instanceof Response) return hospital;
    const body = await request.json().catch(() => null);
    const { expectedVersion, startsOn, firstPublicationVersion, reason } = body ?? {};
    const justification = billingText(reason);
    if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).some((key) => !fields.has(key))
        || !version(expectedVersion) || !justification || [...justification].length > 1000 || reason.includes("\0")
        || !(startsOn === null && firstPublicationVersion === null
          || isBillingDate(startsOn) && version(firstPublicationVersion) && firstPublicationVersion > 0)) {
      return reply({ error: "Confira a vigência, a versão inicial e a justificativa da ativação." }, 400);
    }
    const proof = signBillingEngineIntent(hospital, {
      action: "activation_set", expectedVersion, startsOn, firstPublicationVersion, reason: justification,
    });
    return reply({ activation: await publicationRpc(request, "set_pro_billing_engine_activation", proof) });
  } catch (error) {
    return publicationUnavailable(error);
  }
}

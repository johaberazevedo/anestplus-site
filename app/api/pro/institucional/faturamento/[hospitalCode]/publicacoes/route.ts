import { billingPublicationEnabled, billingReply } from "@/lib/institutional-billing-access";
import { prepareProBillingPublication } from "@/lib/institutional-billing-publication";
import { publicationRpc, publicationUnavailable, publicationView, readPublicationPage } from "@/lib/institutional-billing-publication-rpc";

type Context = { params: Promise<{ hospitalCode: string }> };

export async function GET(request: Request, { params }: Context) {
  const { hospitalCode } = await params;
  if (!billingPublicationEnabled(hospitalCode)) return billingReply({ error: "Publicações indisponíveis para este hospital." }, 404);
  try {
    const cursor = new URL(request.url).searchParams.get("antes");
    if (cursor !== null && !/^[1-9]\d{0,9}$/.test(cursor)) return billingReply({ error: "Página inválida." }, 400);
    return billingReply(await readPublicationPage(request, hospitalCode, cursor === null ? null : Number(cursor)));
  } catch (error) {
    return publicationUnavailable(error);
  }
}

export async function POST(request: Request, { params }: Context) {
  const { hospitalCode } = await params;
  if (!billingPublicationEnabled(hospitalCode)) return billingReply({ error: "Publicações indisponíveis para este hospital." }, 404);
  try {
    const input: unknown = await request.json().catch(() => null);
    const prepared = await prepareProBillingPublication(request, hospitalCode, input);
    if (!prepared.args) return billingReply({ error: prepared.error, issues: prepared.issues }, prepared.status);
    const persisted = await publicationRpc(request, "publish_pro_billing_configuration", prepared.args);
    return billingReply({ publication: publicationView(persisted, hospitalCode) });
  } catch (error) {
    return publicationUnavailable(error);
  }
}

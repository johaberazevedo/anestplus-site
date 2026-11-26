import { createHash, timingSafeEqual } from "node:crypto";
import { runBillingRetentionEmails } from "@/lib/institutional-billing-retention-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

function reply(body: object, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const supplied = request.headers.get("authorization")?.match(/^Bearer ([^\s]+)$/)?.[1];
  const digest = (value: string) => createHash("sha256").update(value).digest();
  if (!secret || !supplied || !timingSafeEqual(digest(secret), digest(supplied))) {
    return reply({ error: "Não autorizado." }, 401);
  }
  try {
    const counts = await runBillingRetentionEmails();
    return reply(counts, counts.errors ? 503 : 200);
  } catch {
    return reply({ error: "Avisos de retenção indisponíveis." }, 503);
  }
}

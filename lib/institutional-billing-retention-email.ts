import { createHmac } from "node:crypto";
import { setTimeout as wait } from "node:timers/promises";
import { billingPath, HOSPITAL_BILLING_FEATURE } from "@/lib/institutional-hospitals";
import { getProHospitalLinksForUser } from "@/lib/pro-hospital-access";
import { supabaseAdmin } from "@/lib/supabase-admin";

const providerUrl = "https://api.resend.com/emails";
const sendTimeoutMs = 8_000;
const leaseMarginMs = 2_000;
const jobBudgetMs = 23_000;
const shortRetrySeconds = 5;
const hospitalPaused = Symbol("hospital_paused");
const providerId = /^[A-Za-z0-9_-]{1,128}$/;
const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const dateFormat = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Bahia", dateStyle: "short", timeStyle: "short",
});
const monthFormat = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });

type Candidate = {
  hospital_code: string;
  competence_month: string;
  notice_stage_days: 1 | 7 | 30;
  expires_at: string;
  user_id: string;
};
type Reservation = {
  status: "reserved";
  request_id: string;
  lease_id: string;
  lease_until: string;
  retry_until: string;
  lease_ms: number;
};
type Outcome =
  | { result: "accepted"; providerId: string }
  | { result: "retry" | "uncertain"; code: string; after: number }
  | { result: "failed" | "review"; code: string };

function emailConfig() {
  const key = process.env.ANEST_BILLING_RETENTION_RESEND_API_KEY?.trim();
  const from = process.env.ANEST_BILLING_RETENTION_FROM?.trim();
  const payloadKey = process.env.ANEST_BILLING_RETENTION_PAYLOAD_KEY?.trim();
  const origin = new URL(process.env.ANEST_BILLING_RETENTION_SITE_ORIGIN ?? "");
  if (!key || !from || !payloadKey || !/^[a-f0-9]{64}$/i.test(payloadKey)
    || origin.protocol !== "https:" || origin.origin !== origin.href.slice(0, -1) || origin.pathname !== "/") {
    throw new Error("invalid_email_settings");
  }
  return { key, from, origin, payloadKey: Buffer.from(payloadKey, "hex") };
}

type EmailConfig = ReturnType<typeof emailConfig>;
function fingerprint(body: string, config: EmailConfig) {
  return createHmac("sha256", config.payloadKey).update(body).digest("hex");
}

async function payload(target: Candidate, config: EmailConfig): Promise<string | null | typeof hospitalPaused> {
  const { hospital_code: hospitalCode, competence_month: month, notice_stage_days: stage, expires_at: expiresAt, user_id: userId } = target;
  const link = billingPath(hospitalCode);
  const expiry = Date.parse(expiresAt);
  if (!link || !uuid.test(userId) || !/^\d{4}-\d{2}-01$/.test(month)
    || (stage !== 1 && stage !== 7 && stage !== 30) || !(expiry > Date.now())) return null;
  const [notice, links, recipient] = await Promise.all([
    supabaseAdmin.from("institutional_billing_retention_notices").select("expires_at")
      .eq("hospital_code", hospitalCode).eq("competence_month", month).eq("notice_stage_days", stage).maybeSingle(),
    getProHospitalLinksForUser(userId, hospitalCode, HOSPITAL_BILLING_FEATURE),
    supabaseAdmin.auth.admin.getUserById(userId),
  ]);
  const hospital = await supabaseAdmin.from("institutional_hospitals")
    .select("name,is_active,billing_retention_emails_enabled").eq("code", hospitalCode).maybeSingle();
  if (hospital.data && (hospital.data.is_active !== true || hospital.data.billing_retention_emails_enabled !== true)) {
    return hospitalPaused;
  }
  const user = recipient.data?.user;
  if (hospital.error || notice.error || (recipient.error && recipient.error.status !== 404)) {
    throw new Error("eligibility_unavailable");
  }
  if (!hospital.data || !notice.data || Date.parse(notice.data.expires_at) !== expiry
    || expiry <= Date.now() || !links.includes(hospitalCode) || user?.id !== userId
    || !user.email_confirmed_at || !user.email?.trim()) return null;

  const competence = monthFormat.format(new Date(`${month}T00:00:00Z`));
  const window = stage === 1 ? "1 dia" : `${stage} dias`;
  return JSON.stringify({
    from: config.from,
    to: [user.email.trim()],
    subject: `Anest+ · Competência de ${competence} expira em até ${window}`,
    text: [
      `A produção financeira de ${competence} do hospital ${hospital.data.name} estará disponível até ${dateFormat.format(expiry)}, no horário da Bahia.`,
      "Se a competência estiver fechada, baixe e arquive os demonstrativos definitivos. Se estiver aberta, consulte a conferência no painel.",
      `Abrir Faturamento: ${new URL(link, config.origin).href}`,
      "Aviso automático do Anest+.",
    ].join("\n\n"),
  });
}

async function rpc(name: string, args: object) {
  const { data, error } = await supabaseAdmin.rpc(name, args);
  if (error) throw new Error("email_control_unavailable");
  return data;
}

function validReservation(result: Partial<Reservation> | null): result is Reservation {
  return result?.status === "reserved" && typeof result.request_id === "string" && uuid.test(result.request_id)
    && typeof result.lease_id === "string" && uuid.test(result.lease_id)
    && Number.isFinite(Date.parse(result.lease_until ?? "")) && Number.isFinite(Date.parse(result.retry_until ?? ""))
    && typeof result.lease_ms === "number" && Number.isSafeInteger(result.lease_ms)
    && result.lease_ms >= 0 && result.lease_ms <= 120_000;
}

function retryAfter(header: string | null) {
  if (!header) return 60;
  const seconds = /^\d+$/.test(header) ? Number(header) : Math.ceil((Date.parse(header) - Date.now()) / 1000);
  return Number.isFinite(seconds) ? Math.min(86_400, Math.max(shortRetrySeconds, seconds)) : 60;
}

async function send(body: string, id: string, config: EmailConfig): Promise<Outcome> {
  try {
    const response = await fetch(providerUrl, {
      method: "POST", cache: "no-store", redirect: "error", signal: AbortSignal.timeout(sendTimeoutMs),
      headers: { Authorization: `Bearer ${config.key}`, "Content-Type": "application/json", "Idempotency-Key": `anestplus-retention/${id}` },
      body,
    });
    const result = await response.json().catch(() => null);
    if (response.ok && typeof result?.id === "string" && providerId.test(result.id)) {
      return { result: "accepted", providerId: result.id };
    }
    if (response.status === 429) return { result: "retry", code: "provider_rate_limit", after: retryAfter(response.headers.get("Retry-After")) };
    if (response.status === 409 && result?.name !== "concurrent_idempotent_requests") {
      return { result: "review", code: "provider_idempotency_conflict" };
    }
    if (response.ok || response.status === 408 || response.status === 409 || response.status >= 500) {
      return { result: "uncertain", code: "provider_uncertain", after: shortRetrySeconds };
    }
    return { result: "failed", code: "provider_rejected" };
  } catch {
    return { result: "uncertain", code: "provider_network", after: shortRetrySeconds };
  }
}

async function finish(reservation: Reservation, outcome: Outcome): Promise<string> {
  const status = await rpc("finish_pro_billing_retention_email", {
    p_request_id: reservation.request_id,
    p_lease_id: reservation.lease_id,
    p_result: outcome.result,
    p_provider_message_id: outcome.result === "accepted" ? outcome.providerId : null,
    p_result_code: outcome.result === "accepted" ? null : outcome.code,
    p_retry_after_seconds: "after" in outcome ? outcome.after : 60,
  });
  if (typeof status !== "string") throw new Error("invalid_email_result");
  return status;
}

async function attempt(target: Candidate, config: EmailConfig, deadline: number): Promise<{ status: string; retryIn?: number }> {
  const prepared = await payload(target, config);
  if (prepared === hospitalPaused) return { status: "deferred" };
  if (!prepared) return { status: "ineligible" };
  if (performance.now() + sendTimeoutMs + leaseMarginMs >= deadline) return { status: "deferred" };
  const hmac = fingerprint(prepared, config);

  const started = performance.now();
  const reservation = await rpc("reserve_pro_billing_retention_email", {
    p_hospital: target.hospital_code, p_month: target.competence_month, p_stage: target.notice_stage_days,
    p_recipient: target.user_id, p_expires_at: target.expires_at, p_payload_hmac: hmac,
  });
  if (!validReservation(reservation)) {
    const status = reservation?.status;
    return { status: typeof status === "string" ? status : "deferred" };
  }
  const leaseEnd = started + reservation.lease_ms;
  let current: Awaited<ReturnType<typeof payload>>;
  try {
    current = await payload(target, config);
  } catch {
    return { status: await finish(reservation, { result: "retry", code: "revalidation_unavailable", after: 60 }) };
  }

  // Allow the current lease to expire without recording a provider result.
  if (current === hospitalPaused) return { status: "deferred" };
  let outcome: Outcome;
  if (!current) outcome = { result: "failed", code: "eligibility_changed" };
  else if (fingerprint(current, config) !== hmac) outcome = { result: "review", code: "payload_changed" };
  else {
    const remaining = Math.min(
      leaseEnd - performance.now(), deadline - performance.now(), Date.parse(reservation.lease_until) - Date.now(),
      Date.parse(reservation.retry_until) - Date.now(), Date.parse(target.expires_at) - Date.now(),
    );
    outcome = remaining >= sendTimeoutMs + leaseMarginMs
      ? await send(current, reservation.request_id, config)
      : { result: "retry", code: "insufficient_lease", after: 60 };
  }
  const status = await finish(reservation, outcome);
  return { status, retryIn: status === "retry" && "after" in outcome ? outcome.after : undefined };
}

export async function runBillingRetentionEmails() {
  const deadline = performance.now() + jobBudgetMs;
  const enabled = process.env.ANEST_BILLING_RETENTION_EMAILS_ENABLED === "true";
  const batch = await rpc("maintain_pro_billing_retention_emails", {
    p_limit: 500, p_hospitals: enabled ? null : [], p_candidate_limit: 20,
  });
  const counts = { settled: Number(batch?.settled ?? 0), deleted: Number(batch?.deleted ?? 0),
    accepted: 0, review: 0, failed: 0, deferred: 0, errors: 0 };
  if (!enabled) return counts;
  const config = emailConfig();
  if (!Array.isArray(batch?.candidates)) throw new Error("email_batch_unavailable");
  for (const target of batch.candidates as Candidate[]) {
    if (performance.now() + sendTimeoutMs + leaseMarginMs >= deadline) break;
    try {
      let result = await attempt(target, config, deadline);
      if (result.retryIn === shortRetrySeconds && performance.now() + shortRetrySeconds * 1000 + sendTimeoutMs + leaseMarginMs < deadline) {
        await wait(shortRetrySeconds * 1000 + 100);
        result = await attempt(target, config, deadline);
      }
      if (result.status === "accepted" || result.status === "review" || result.status === "failed") counts[result.status]++;
      else counts.deferred++;
    } catch {
      counts.errors++;
    }
  }
  return counts;
}

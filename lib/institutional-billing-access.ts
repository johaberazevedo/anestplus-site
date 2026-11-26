import { HOSPITAL_BILLING_FEATURE, isHospitalCode } from "@/lib/institutional-hospitals";
import { authenticateProHospitalToken, getProHospitalLinksForUser } from "@/lib/pro-hospital-access";
import { supabaseAdmin } from "@/lib/supabase-admin";

export function billingPublicationEnabled(hospitalCode: string) {
  return isHospitalCode(hospitalCode) && (process.env.ANEST_BILLING_PUBLICATION_HOSPITALS ?? "")
    .split(",").some((code) => code.trim() === hospitalCode);
}

export function billingReply(data: object, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "private, no-store" } });
}

export function billingTiming(route: "producao" | "configuracao" | "acesso") {
  const started = performance.now();
  const durations: Record<string, number> = {};
  return {
    async measure<T>(name: string, operation: () => T | PromiseLike<T>): Promise<T> {
      const start = performance.now();
      try {
        return await operation();
      } finally {
        durations[name] = (durations[name] ?? 0) + performance.now() - start;
      }
    },
    finish(response: Response, records?: number) {
      durations.total = performance.now() - started;
      response.headers.set("Server-Timing", Object.entries(durations)
        .map(([name, duration]) => `${name};dur=${duration.toFixed(1)}`).join(", "));
      if (records !== undefined) response.headers.set("X-Billing-Records", String(records));
      if (process.env.NODE_ENV === "development") {
        const milliseconds = Object.fromEntries(Object.entries(durations).map(([name, duration]) => [name, Math.round(duration)]));
        console.info("[faturamento.tempo]", { rota: route, status: response.status, ms: milliseconds, fichas: records });
      }
      return response;
    },
  };
}

export async function getBillingHospital(request: Request, hospitalCode: string, timing = billingTiming("acesso")) {
  if (!isHospitalCode(hospitalCode)) return billingReply({ error: "Hospital inválido." }, 400);
  const denied = () => billingReply({ error: "Acesso ao faturamento não autorizado." }, 403);
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!token) return billingReply({ error: "Não autenticado." }, 401);
  const userID = await timing.measure("auth", () => authenticateProHospitalToken(token));
  if (!userID) return billingReply({ error: "Sessão inválida." }, 401);

  const [links, hospital] = await Promise.allSettled([
    timing.measure("vinculo", () => getProHospitalLinksForUser(userID, hospitalCode, HOSPITAL_BILLING_FEATURE)),
    timing.measure("hospital", () => supabaseAdmin.from("institutional_hospitals")
      .select("code,name").eq("code", hospitalCode).eq("is_active", true).maybeSingle()),
  ]);
  if (links.status === "rejected") return billingReply({ error: "Não foi possível verificar os vínculos." }, 500);
  if (!links.value.includes(hospitalCode)) return denied();
  if (hospital.status === "rejected" || hospital.value.error) {
    return billingReply({ error: "Não foi possível verificar o hospital." }, 500);
  }
  return hospital.value.data ? { ...hospital.value.data, actorId: userID } : denied();
}

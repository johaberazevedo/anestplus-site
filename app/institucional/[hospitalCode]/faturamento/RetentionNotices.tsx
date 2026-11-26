import { useEffect, useState } from "react";
import type { BillingRetentionNotice } from "@/app/api/pro/institucional/faturamento/[hospitalCode]/avisos-retencao/route";
import { billingRequest, RequestError } from "./billing-request";
import { loadNoticePreferences, nextNoticeRefresh, noticeIsHidden, noticePreferenceKey, recordNoticePreference,
  type NoticeAction, type NoticePreferences } from "./retention-notice-preferences";

const expiryFormat = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Bahia", dateStyle: "short", timeStyle: "short",
});
const stages = {
  1: { label: "Até 1 dia", style: "bg-red-100 text-red-900" },
  7: { label: "Até 7 dias", style: "bg-amber-100 text-amber-950" },
  30: { label: "Até 30 dias", style: "bg-[#f2f3ec] text-[#394631]" },
};

export default function RetentionNotices({ hospitalCode, token, userId, activeSessionId, revision, onAccessDenied, onOpen }: {
  hospitalCode: string;
  token: string;
  userId: string;
  activeSessionId: string | null;
  revision: number;
  onAccessDenied: (message: string) => void;
  onOpen: (notice: BillingRetentionNotice) => void;
}) {
  const [notices, setNotices] = useState<BillingRetentionNotice[]>([]);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [preferences, setPreferences] = useState<NoticePreferences>({});

  useEffect(() => {
    const controller = new AbortController();
    void billingRequest<{ notices: BillingRetentionNotice[] }>(
      `/api/pro/institucional/faturamento/${hospitalCode}/avisos-retencao`, token, { signal: controller.signal },
    ).then(({ notices }) => {
      if (controller.signal.aborted) return;
      const saved = loadNoticePreferences();
      setPreferences((current) => ({ ...saved, ...current }));
      setNotices(notices);
      setError("");
    }).catch((caught: unknown) => {
      if (controller.signal.aborted) return;
      setNotices([]);
      if (caught instanceof RequestError && (caught.status === 401 || caught.status === 403)) {
        onAccessDenied(caught.message);
        return;
      }
      setError("Não foi possível carregar os avisos de retenção.");
    });
    return () => controller.abort();
  }, [hospitalCode, token, revision, attempt, onAccessDenied]);

  useEffect(() => {
    // Inclui os avisos ocultos para que a próxima faixa volte a aparecer com o painel aberto.
    const refreshAt = nextNoticeRefresh(notices);
    if (refreshAt === null) return;
    let triggered = false;
    const refresh = () => {
      if (triggered) return;
      triggered = true;
      setAttempt((value) => value + 1);
    };
    const timer = window.setTimeout(refresh, Math.max(0, refreshAt - Date.now()));
    const onVisible = () => {
      if (document.visibilityState === "visible" && Date.now() >= refreshAt) refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [notices]);

  function hide(notice: BillingRetentionNotice, action: NoticeAction) {
    const key = noticePreferenceKey(userId, hospitalCode, notice.month);
    const preference = recordNoticePreference(key, notice, action, activeSessionId);
    setPreferences((current) => ({ ...current, [key]: preference }));
  }

  if (error) return <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-700">
    <p role="status">{error}</p>
    <button type="button" className="min-h-11 font-bold text-[#394631] underline"
      onClick={() => setAttempt((value) => value + 1)}>Tentar novamente</button>
  </div>;
  const visible = notices.filter((notice) =>
    !noticeIsHidden(notice, preferences[noticePreferenceKey(userId, hospitalCode, notice.month)], activeSessionId),
  );
  if (!visible.length) return null;

  return <section aria-label="Avisos de retenção financeira" className="rounded-[28px] border border-amber-200 bg-[#fffdf5] p-5 sm:p-6">
    <h2 className="text-lg font-bold text-zinc-950">Competências próximas da expiração</h2>
    <p className="mt-1 text-sm text-zinc-700">Arquive os demonstrativos definitivos antes do vencimento.</p>
    <ul className="mt-3 divide-y divide-amber-200/70">
      {visible.map((notice) => {
        const month = notice.month.slice(0, 7).split("-").reverse().join("/");
        const action = notice.state === "open" ? "Conferir competência" : "Consultar demonstrativos";
        const stage = stages[notice.stage];
        return <li key={notice.month} className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 py-3 last:pb-0">
          <div>
            <p className="flex flex-wrap items-center gap-2 text-sm text-zinc-800">
              <strong>{month}</strong>
              <span>{notice.state === "open" ? "Aberta" : "Fechada"}</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${stage.style}`}>{stage.label}</span>
            </p>
            <p className="mt-1 text-sm text-zinc-700">Expira em <time dateTime={notice.expiresAt}>
              {expiryFormat.format(new Date(notice.expiresAt))}
            </time></p>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <button type="button" aria-label={`${action} de ${month}`}
              className="min-h-11 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-bold text-[#394631] hover:bg-[#f6f7f1] focus-visible:outline-2 focus-visible:outline-[#b9963b]"
              onClick={() => onOpen(notice)}>{action}</button>
            <button type="button" aria-label={`Lembrar no próximo login sobre ${month}`}
              className="min-h-11 text-sm font-semibold text-[#394631] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-[#b9963b]"
              onClick={() => hide(notice, "next-login")}>Lembrar no próximo login</button>
            <button type="button" aria-label={`Dispensar aviso de ${month}`}
              className="min-h-11 text-sm font-semibold text-zinc-600 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-[#b9963b]"
              onClick={() => hide(notice, "dismiss")}>Dispensar este aviso</button>
          </div>
        </li>;
      })}
    </ul>
  </section>;
}

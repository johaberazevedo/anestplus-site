import type { BillingRetentionNotice } from "@/app/api/pro/institucional/faturamento/[hospitalCode]/avisos-retencao/route";

export type NoticeAction = "dismiss" | "next-login";
type NoticePreference = Pick<BillingRetentionNotice, "stage" | "expiresAt"> & {
  action: NoticeAction;
  sessionId: string | null;
};
export type NoticePreferences = Record<string, NoticePreference>;

const storageKey = "anest.billing.retention-preferences.v1";
const dayMs = 86_400_000;
const nextStageDays = { 30: 7, 7: 1, 1: 0 };

export function noticePreferenceKey(userId: string, hospitalCode: string, month: string) {
  return JSON.stringify([userId, hospitalCode, month]);
}

export function noticeIsHidden(notice: BillingRetentionNotice, preference: NoticePreference | undefined, sessionId: string | null) {
  return preference?.stage === notice.stage && preference.expiresAt === notice.expiresAt
    && (preference.action === "dismiss" || preference.sessionId === sessionId);
}

function savePreferences(preferences: NoticePreferences) {
  try { localStorage.setItem(storageKey, JSON.stringify(preferences)); } catch { /* Mantém a escolha em memória. */ }
}

export function loadNoticePreferences(now = Date.now()): NoticePreferences {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
    if (!stored || typeof stored !== "object" || Array.isArray(stored)) return {};
    const entries = Object.entries(stored) as [string, Partial<NoticePreference> | null][];
    const active = Object.fromEntries(entries.filter(([, preference]) =>
      preference && typeof preference.expiresAt === "string" && Date.parse(preference.expiresAt) > now
      && (preference.stage === 1 || preference.stage === 7 || preference.stage === 30)
      && (preference.action === "dismiss" || (preference.action === "next-login" && typeof preference.sessionId === "string")),
    )) as NoticePreferences;
    if (Object.keys(active).length !== entries.length) savePreferences(active);
    return active;
  } catch {
    return {};
  }
}

export function recordNoticePreference(key: string, notice: BillingRetentionNotice, action: NoticeAction, sessionId: string | null) {
  const preference = { stage: notice.stage, expiresAt: notice.expiresAt, action, sessionId: action === "next-login" ? sessionId : null };
  if (action === "dismiss" || sessionId) savePreferences({ ...loadNoticePreferences(), [key]: preference });
  return preference;
}

export function nextNoticeRefresh(notices: BillingRetentionNotice[], now = Date.now()) {
  const next = Math.min(...notices.map((notice) => Date.parse(notice.expiresAt) - nextStageDays[notice.stage] * dayMs));
  if (!Number.isFinite(next)) return null;
  // A view decide o estágio. Evita consultar repetidamente se o relógio do servidor ainda não cruzou o limite.
  return next > now ? next + 1000 : now + 30_000;
}

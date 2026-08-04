"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  LogOut,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRoundCheck,
  UserRoundX,
} from "lucide-react";

type EffectiveStatus =
  | "none"
  | "active"
  | "scheduled"
  | "expired"
  | "suspended"
  | "revoked";

type AdminEntitlement = {
  institutionCode: string;
  status: "active" | "suspended" | "revoked";
  effectiveStatus: EffectiveStatus;
  startsAt: string;
  expiresAt: string | null;
  updatedAt: string;
};

type AdminUser = {
  id: string;
  email: string;
  emailConfirmedAt: string | null;
  createdAt: string;
  fullName: string;
  crm: string;
  rqe: string;
  entitlements: AdminEntitlement[];
  residentHospital: {
    name: string;
    city: string;
    state: string;
    isArchived: boolean;
    replacementAllowed: boolean;
  } | null;
};

type UsersResponse = {
  users: AdminUser[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    lastPage: number;
  };
  error?: string;
};

const statusPresentation: Record<
  EffectiveStatus,
  { label: string; className: string }
> = {
  none: { label: "Sem acesso", className: "bg-zinc-100 text-zinc-600" },
  active: { label: "Ativo", className: "bg-emerald-50 text-emerald-700" },
  scheduled: { label: "Agendado", className: "bg-blue-50 text-blue-700" },
  expired: { label: "Expirado", className: "bg-amber-50 text-amber-700" },
  suspended: { label: "Suspenso", className: "bg-orange-50 text-orange-700" },
  revoked: { label: "Revogado", className: "bg-red-50 text-red-700" },
};

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function localDateInputValue(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function todayInputValue() {
  return localDateInputValue(new Date().toISOString());
}

function expirationAtEndOfLocalDay(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;

  const expiration = new Date(year, month - 1, day, 23, 59, 59, 999);
  return Number.isNaN(expiration.getTime()) ? null : expiration.toISOString();
}

export default function AdminDashboardClient() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionKey, setActionKey] = useState<string | null>(null);
  const [accessDialog, setAccessDialog] = useState<{
    user: AdminUser;
    entitlement: AdminEntitlement | null;
  } | null>(null);
  const [institutionCode, setInstitutionCode] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadUsers = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/users?page=${targetPage}&perPage=50`,
        { cache: "no-store" },
      );
      const data = (await response.json()) as UsersResponse;

      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!response.ok) {
        throw new Error(data.error || "Não foi possível carregar os usuários.");
      }

      setUsers(data.users);
      setPage(data.pagination.page);
      setLastPage(Math.max(data.pagination.lastPage, 1));
      setTotal(data.pagination.total);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar os usuários.",
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadUsers(1);
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
    if (!normalizedSearch) return users;

    return users.filter((user) =>
      [user.fullName, user.email, user.crm, user.rqe].some((value) =>
        value.toLocaleLowerCase("pt-BR").includes(normalizedSearch),
      ),
    );
  }, [search, users]);

  async function performAction(
    user: AdminUser,
    action: "grant" | "revoke" | "replacement",
    targetInstitutionCode?: string,
    expiresAt?: string | null,
  ): Promise<boolean> {
    const confirmation =
      action === "revoke"
        ? `Revogar o acesso ${targetInstitutionCode} de ${user.fullName || user.email}?`
        : action === "replacement"
          ? `Autorizar a substituição do hospital acadêmico de ${user.fullName || user.email}?`
          : null;

    if (confirmation && !window.confirm(confirmation)) return false;

    const endpoint =
      action === "grant"
        ? "/api/admin/pre-anesthetic/grant"
        : action === "revoke"
          ? "/api/admin/pre-anesthetic/revoke"
          : "/api/admin/resident-hospital/allow-replacement";
    const key = `${user.id}:${action}`;

    setActionKey(key);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          ...(action === "grant" || action === "revoke"
            ? { institutionCode: targetInstitutionCode }
            : {}),
          ...(action === "grant" ? { expiresAt: expiresAt ?? null } : {}),
        }),
      });
      const data = (await response.json()) as { error?: string };

      if (response.status === 401) {
        router.replace("/admin/login");
        return false;
      }
      if (!response.ok) {
        throw new Error(data.error || "Não foi possível concluir a operação.");
      }

      setSuccess(
        action === "grant"
          ? "Acesso residencial liberado."
          : action === "revoke"
            ? "Acesso residencial revogado."
            : "Substituição do hospital acadêmico autorizada.",
      );
      await loadUsers(page);
      return true;
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Não foi possível concluir a operação.",
      );
      return false;
    } finally {
      setActionKey(null);
    }
  }

  function openAccessDialog(
    user: AdminUser,
    entitlement: AdminEntitlement | null = null,
  ) {
    setError(null);
    setSuccess(null);
    setInstitutionCode(entitlement?.institutionCode ?? "");
    setExpirationDate(localDateInputValue(entitlement?.expiresAt));
    setAccessDialog({ user, entitlement });
  }

  async function saveAccessConfiguration() {
    if (!accessDialog) return;

    const normalizedInstitutionCode = institutionCode
      .trim()
      .toLocaleLowerCase("pt-BR");
    if (!/^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(normalizedInstitutionCode)) {
      setError(
        "Use um identificador com letras minúsculas, números e sublinhados, como residencia_hospital_a.",
      );
      return;
    }

    const expiresAt = expirationDate
      ? expirationAtEndOfLocalDay(expirationDate)
      : null;

    if (expirationDate && !expiresAt) {
      setError("Informe uma data de expiração válida.");
      return;
    }

    if (expiresAt && new Date(expiresAt).getTime() <= Date.now()) {
      setError("A data de expiração deve estar no futuro.");
      return;
    }

    const succeeded = await performAction(
      accessDialog.user,
      "grant",
      normalizedInstitutionCode,
      expiresAt,
    );
    if (succeeded) setAccessDialog(null);
  }

  async function logout() {
    await fetch("/api/auth/admin-logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#f7f8f4] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="flex items-center gap-4">
            <Image
              src="/brand/anest-symbol.png"
              alt="Anest+"
              width={52}
              height={52}
              className="h-13 w-13 rounded-2xl"
              priority
            />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a865f]">
                Área administrativa
              </p>
              <h1 className="text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">
                Acessos da residência
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                Pré-anestésica e hospitais acadêmicos
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void loadUsers(page)}
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-60"
            >
              <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
              Atualizar
            </button>
            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#162014] px-4 text-sm font-bold text-white transition hover:bg-[#22331d]"
            >
              <LogOut size={17} />
              Sair
            </button>
          </div>
        </header>

        <section className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-zinc-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Usuários no Auth
            </p>
            <p className="mt-2 text-3xl font-black text-zinc-950">{total}</p>
          </div>
          <div className="rounded-3xl border border-zinc-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Ativos nesta página
            </p>
            <p className="mt-2 text-3xl font-black text-emerald-700">
              {
                users.filter(
                  (user) =>
                    user.entitlements.some(
                      (entitlement) =>
                        entitlement.effectiveStatus === "active",
                    ),
                ).length
              }
            </p>
          </div>
          <div className="rounded-3xl border border-zinc-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Identificadores
            </p>
            <p className="mt-2 font-mono text-sm font-bold text-zinc-700">
              Definidos por concessão
            </p>
          </div>
        </section>

        <section className="mt-5 rounded-[28px] border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-zinc-950">Usuários</h2>
              <p className="mt-1 text-sm text-zinc-500">
                A busca abaixo filtra a página carregada.
              </p>
            </div>
            <label className="relative block w-full sm:max-w-sm">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nome, e-mail, CRM ou RQE"
                className="h-11 w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-11 pr-4 text-sm text-zinc-950 outline-none focus:border-[#7a865f] focus:bg-white"
              />
            </label>
          </div>

          {error ? (
            <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {success}
            </p>
          ) : null}

          <div className="mt-5 space-y-4">
            {loading ? (
              <div className="flex min-h-48 items-center justify-center text-sm font-medium text-zinc-500">
                Carregando usuários...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex min-h-48 items-center justify-center text-sm font-medium text-zinc-500">
                Nenhum usuário encontrado nesta página.
              </div>
            ) : (
              filteredUsers.map((user) => {
                const effectiveStatus = user.entitlements.some(
                  (entitlement) => entitlement.effectiveStatus === "active",
                )
                  ? "active"
                  : (user.entitlements[0]?.effectiveStatus ?? "none");
                const status = statusPresentation[effectiveStatus];
                const hospital = user.residentHospital;
                const actionInProgress = actionKey?.startsWith(user.id) ?? false;

                return (
                  <article
                    key={user.id}
                    className="rounded-3xl border border-zinc-200 p-4 sm:p-5"
                  >
                    <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr_auto] lg:items-center">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate font-black text-zinc-950">
                            {user.fullName || "Nome não informado"}
                          </h3>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-black ${status.className}`}
                          >
                            {status.label}
                          </span>
                          {user.emailConfirmedAt ? (
                            <CheckCircle2
                              size={16}
                              className="text-emerald-600"
                              aria-label="E-mail confirmado"
                            />
                          ) : null}
                        </div>
                        <p className="mt-1 truncate text-sm text-zinc-600">
                          {user.email || "E-mail indisponível"}
                        </p>
                        <p className="mt-2 text-xs text-zinc-500">
                          CRM {user.crm || "—"} · RQE {user.rqe || "—"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-zinc-50 p-3 text-xs leading-5 text-zinc-600">
                        <div className="flex items-center gap-2 font-bold text-zinc-800">
                          <Building2 size={16} />
                          {hospital?.name || "Sem hospital acadêmico"}
                        </div>
                        {hospital ? (
                          <p className="mt-1">
                            {hospital.city}/{hospital.state} ·{" "}
                            {hospital.isArchived ? "Arquivado" : "Ativo"} ·{" "}
                            {hospital.replacementAllowed
                              ? "Substituição liberada"
                              : "Substituição bloqueada"}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-2 lg:max-w-64 lg:justify-end">
                        <button
                          type="button"
                          disabled={actionInProgress}
                          onClick={() => openAccessDialog(user)}
                          className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-50 px-3 text-xs font-black text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                        >
                          <UserRoundCheck size={16} /> Novo acesso
                        </button>
                        {hospital?.isArchived && !hospital.replacementAllowed ? (
                          <button
                            type="button"
                            disabled={actionInProgress}
                            onClick={() =>
                              void performAction(user, "replacement")
                            }
                            className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-50 px-3 text-xs font-black text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                          >
                            <ShieldCheck size={16} /> Autorizar troca
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-5 border-t border-zinc-100 pt-4">
                      <p className="mb-3 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                        Concessões de pré-anestésica
                      </p>
                      {user.entitlements.length === 0 ? (
                        <p className="text-sm text-zinc-500">
                          Nenhuma concessão cadastrada.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {user.entitlements.map((entitlement) => {
                            const entitlementStatus =
                              statusPresentation[entitlement.effectiveStatus];
                            return (
                              <div
                                key={entitlement.institutionCode}
                                className="flex flex-col gap-3 rounded-2xl bg-zinc-50 p-4 lg:flex-row lg:items-center lg:justify-between"
                              >
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <code className="font-bold text-zinc-800">
                                      {entitlement.institutionCode}
                                    </code>
                                    <span
                                      className={`rounded-full px-2.5 py-1 text-[11px] font-black ${entitlementStatus.className}`}
                                    >
                                      {entitlementStatus.label}
                                    </span>
                                  </div>
                                  <p className="mt-2 text-xs leading-5 text-zinc-500">
                                    Início: {formatDate(entitlement.startsAt)} · Expiração:{" "}
                                    {formatDate(entitlement.expiresAt)} · Atualização:{" "}
                                    {formatDate(entitlement.updatedAt)}
                                  </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    disabled={actionInProgress}
                                    onClick={() =>
                                      openAccessDialog(user, entitlement)
                                    }
                                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-50 px-3 text-xs font-black text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                                  >
                                    <CalendarDays size={16} />
                                    {entitlement.effectiveStatus === "active"
                                      ? "Ajustar validade"
                                      : "Reativar"}
                                  </button>
                                  {entitlement.effectiveStatus === "active" ? (
                                    <button
                                      type="button"
                                      disabled={actionInProgress}
                                      onClick={() =>
                                        void performAction(
                                          user,
                                          "revoke",
                                          entitlement.institutionCode,
                                        )
                                      }
                                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-50 px-3 text-xs font-black text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                                    >
                                      <UserRoundX size={16} /> Revogar
                                    </button>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-5">
            <button
              type="button"
              disabled={loading || page <= 1}
              onClick={() => void loadUsers(page - 1)}
              className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-bold text-zinc-700 disabled:opacity-40"
            >
              Anterior
            </button>
            <p className="text-sm font-medium text-zinc-500">
              Página {page} de {lastPage}
            </p>
            <button
              type="button"
              disabled={loading || page >= lastPage}
              onClick={() => void loadUsers(page + 1)}
              className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-bold text-zinc-700 disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        </section>
      </div>

      {accessDialog ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/45 px-4 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="access-dialog-title"
        >
          <div className="w-full max-w-md rounded-[28px] border border-zinc-200 bg-white p-6 shadow-2xl sm:p-7">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a865f]">
              Acesso residencial
            </p>
            <h2
              id="access-dialog-title"
              className="mt-2 text-2xl font-black tracking-tight text-zinc-950"
            >
              Definir validade
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              {accessDialog.user.fullName || accessDialog.user.email}
            </p>

            <label className="mt-6 block">
              <span className="text-sm font-bold text-zinc-700">
                Identificador da residência
              </span>
              <input
                type="text"
                value={institutionCode}
                maxLength={80}
                disabled={accessDialog.entitlement !== null}
                onChange={(event) => setInstitutionCode(event.target.value)}
                placeholder="residencia_hospital_a"
                autoCapitalize="none"
                spellCheck={false}
                className="mt-2 h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 font-mono text-sm font-medium text-zinc-950 outline-none focus:border-[#7a865f] focus:ring-4 focus:ring-[#7a865f]/10 disabled:bg-zinc-100 disabled:text-zinc-500"
              />
              <span className="mt-2 block text-xs leading-5 text-zinc-500">
                Use letras minúsculas, números e sublinhados. Esse código identifica a residência desta concessão.
              </span>
            </label>

            <label className="mt-5 block">
              <span className="text-sm font-bold text-zinc-700">
                Data de expiração
              </span>
              <input
                type="date"
                value={expirationDate}
                min={todayInputValue()}
                onChange={(event) => setExpirationDate(event.target.value)}
                className="mt-2 h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-950 outline-none focus:border-[#7a865f] focus:ring-4 focus:ring-[#7a865f]/10"
              />
            </label>

            <button
              type="button"
              onClick={() => setExpirationDate("")}
              className="mt-2 text-sm font-bold text-[#7a865f] underline decoration-[#7a865f]/30 underline-offset-4"
            >
              Deixar sem expiração
            </button>

            <p className="mt-4 rounded-2xl bg-zinc-50 px-4 py-3 text-xs leading-5 text-zinc-600">
              {expirationDate
                ? "O acesso permanecerá válido até o fim do dia selecionado, no horário local."
                : "Sem uma data, o acesso permanecerá ativo até ser revogado manualmente."}
            </p>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={actionKey !== null}
                onClick={() => setAccessDialog(null)}
                className="h-11 rounded-2xl border border-zinc-200 px-5 text-sm font-bold text-zinc-700 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={actionKey !== null}
                onClick={() => void saveAccessConfiguration()}
                className="h-11 rounded-2xl bg-[#162014] px-5 text-sm font-black text-white disabled:opacity-50"
              >
                {actionKey ? "Salvando..." : "Salvar acesso"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

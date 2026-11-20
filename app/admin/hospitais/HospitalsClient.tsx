"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { InstitutionalHospital } from "@/lib/institutional-hospitals";

type Account = { id: string; fullName: string; email: string; crm: string; rqe: string };
type Directory = { users: Account[]; pagination: { lastPage: number } };
type LinkStatus = { status: string | null; active: boolean };
const accessLabels = {
  app: "acesso à ficha anestésica",
  pre_anesthetic: "acesso à pré-anestésica",
  coordination: "acesso à coordenação",
  billing: "acesso ao faturamento",
};
type AccessType = keyof typeof accessLabels;

const button = "rounded-xl border border-zinc-200 px-3 py-2 text-sm font-bold text-zinc-800 hover:bg-zinc-50 disabled:opacity-40";
const input = "mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-950";
const panel = "rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm";

async function adminRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api/admin/${path}`, { cache: "no-store", ...options });
  const body = await response.json();
  if (response.status === 401) window.location.replace("/admin/login");
  if (!response.ok) throw new Error(body.error || "Não foi possível concluir a operação.");
  return body;
}

function mutation(method: string, body: object) {
  return { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}

function message(error: unknown) {
  return error instanceof Error ? error.message : "Não foi possível concluir a operação.";
}

export default function HospitalsClient() {
  const router = useRouter();
  const [hospitals, setHospitals] = useState<InstitutionalHospital[] | null>(null);
  const [selectedCode, setSelectedCode] = useState("");
  const [error, setError] = useState("");
  const selected = hospitals?.find((hospital) => hospital.code === selectedCode);

  useEffect(() => {
    const controller = new AbortController();
    void adminRequest<{ hospitals: InstitutionalHospital[] }>("hospitals", { signal: controller.signal })
      .then(({ hospitals }) => { if (!controller.signal.aborted) setHospitals(hospitals); })
      .catch((error: unknown) => { if (!controller.signal.aborted) setError(message(error)); });
    return () => controller.abort();
  }, []);

  async function logout() {
    const response = await fetch("/api/auth/admin-logout", { method: "POST" });
    if (!response.ok) {
      setError("Não foi possível sair. Tente novamente.");
      return;
    }
    router.replace("/admin/login");
    router.refresh();
  }

  function updateList(hospital: InstitutionalHospital) {
    setHospitals((list) => [
      ...(list ?? []).filter((item) => item.code !== hospital.code), hospital,
    ].sort((a, b) => a.name.localeCompare(b.name, "pt-BR") || a.code.localeCompare(b.code)));
    setSelectedCode(hospital.code);
  }

  return (
    <div className="mt-5 space-y-4">
      <section className={panel}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <label className="w-full max-w-md text-sm font-bold text-zinc-700">
            Hospital
            <select value={selectedCode} onChange={(event) => setSelectedCode(event.target.value)}
              disabled={!hospitals} className={input}>
              <option value="">{hospitals ? "Novo hospital" : error ? "Hospitais indisponíveis" : "Carregando hospitais…"}</option>
              {hospitals?.map((hospital) => (
                <option key={hospital.code} value={hospital.code}>
                  {hospital.name}{hospital.is_active ? "" : " (desativado)"}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className={button} onClick={() => void logout().catch((error: unknown) => setError(message(error)))}>Sair</button>
        </div>
        {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      </section>
      {hospitals && <HospitalForm key={`form-${selectedCode}`} hospital={selected} onSaved={updateList} />}
      {selected && <HospitalAccess key={`access-${selected.code}`} hospital={selected} />}
    </div>
  );
}

function HospitalForm({ hospital, onSaved }: {
  hospital?: InstitutionalHospital;
  onSaved: (hospital: InstitutionalHospital) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const result = await adminRequest<{ hospital: InstitutionalHospital }>("hospitals", mutation(hospital ? "PATCH" : "POST", {
        code: hospital?.code ?? String(form.get("code") ?? "").trim().toLowerCase(),
        name: form.get("name"),
        latitude: Number(form.get("latitude")),
        longitude: Number(form.get("longitude")),
        radius_meters: Number(form.get("radius_meters")),
        is_active: form.get("is_active") === "on",
      }));
      onSaved(result.hospital);
      setSuccess("Hospital salvo.");
    } catch (error) {
      setError(message(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={panel}>
      <h2 className="text-xl font-black text-zinc-950">{hospital ? "Editar hospital" : "Cadastrar hospital"}</h2>
      <form onSubmit={save} className="mt-4">
        <fieldset disabled={saving} className="grid gap-4 text-sm font-semibold text-zinc-700 sm:grid-cols-3">
          <label>Nome<input name="name" required minLength={2} maxLength={120} defaultValue={hospital?.name} className={input} /></label>
          <label>Código<input name="code" required pattern="[a-z0-9]+(_[a-z0-9]+)*" maxLength={80}
            readOnly={Boolean(hospital)} defaultValue={hospital?.code} className={input} /></label>
          <label>Raio em metros<input name="radius_meters" type="number" required min={1} max={2147483647}
            defaultValue={hospital?.radius_meters} className={input} /></label>
          <label>Latitude<input name="latitude" type="number" required step="any" min={-90} max={90}
            defaultValue={hospital?.latitude} className={input} /></label>
          <label>Longitude<input name="longitude" type="number" required step="any" min={-180} max={180}
            defaultValue={hospital?.longitude} className={input} /></label>
          {hospital && <label className="flex items-center gap-2">
            <input name="is_active" type="checkbox" defaultChecked={hospital.is_active} /> Hospital ativo
          </label>}
          <div className="sm:col-span-3">
            <button type="submit" className={button}>{saving ? "Salvando…" : "Salvar hospital"}</button>
          </div>
        </fieldset>
        {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
        {success && <p role="status" className="mt-3 text-sm text-emerald-700">{success}</p>}
      </form>
      {hospital && <HospitalLogoEditor hospitalCode={hospital.code} />}
    </section>
  );
}

async function hospitalLogoRequest(url: string, options?: RequestInit) {
  const response = await fetch(url, { cache: "no-store", ...options });
  if (response.status === 401) window.location.replace("/admin/login");
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || "Não foi possível atualizar a logo.");
  }
  return response.status === 204 ? null : response.blob();
}

function HospitalLogoEditor({ hospitalCode }: { hospitalCode: string }) {
  const url = `/api/admin/hospital-logo?${new URLSearchParams({ hospitalCode })}`;
  const [savedLogo, setSavedLogo] = useState<Blob | null>(null);
  const [pendingLogo, setPendingLogo] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const preview = pendingLogo ?? savedLogo;
  const attachPreview = useCallback((image: HTMLImageElement | null) => {
    if (!image || !preview) return;
    const objectURL = URL.createObjectURL(preview);
    image.src = objectURL;
    return () => URL.revokeObjectURL(objectURL);
  }, [preview]);

  useEffect(() => {
    const controller = new AbortController();
    void hospitalLogoRequest(url, { signal: controller.signal })
      .then((logo) => { if (!controller.signal.aborted) setSavedLogo(logo); })
      .catch((error: unknown) => { if (!controller.signal.aborted) setError(message(error)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [url]);

  function selectFile(file: File) {
    setError("");
    setSuccess("");
    setPendingLogo(null);
    if (file.type !== "image/png" || file.size > 2 * 1024 * 1024) {
      setError("Selecione um PNG de até 2 MiB.");
      return;
    }
    setPendingLogo(file);
  }

  async function saveLogo(method: "PUT" | "DELETE") {
    if (method === "PUT" && !pendingLogo) return;
    if (method === "DELETE" && !window.confirm("Remover a logo deste hospital?")) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const logo = await hospitalLogoRequest(url, method === "PUT"
        ? { method, headers: { "Content-Type": "image/png" }, body: pendingLogo }
        : { method });
      setSavedLogo(logo);
      setPendingLogo(null);
      setSuccess(method === "PUT" ? "Logo salva." : "Logo removida.");
    } catch (error) {
      setError(message(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <fieldset disabled={loading || saving} className="mt-6 border-t border-zinc-200 pt-4">
      <legend className="sr-only">Logo do hospital</legend>
      <h3 className="text-base font-bold text-zinc-950">Logo do hospital</h3>
      <p className="mt-1 text-sm text-zinc-600">Use um PNG transparente de até 2 MiB, de preferência horizontal.</p>
      {preview && (
        <div className="mt-3 flex h-24 max-w-sm items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 p-3">
          {/* A prévia usa uma URL local do arquivo ou da resposta autenticada. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={attachPreview} alt={pendingLogo ? "Prévia da nova logo" : "Logo atual do hospital"}
            className="h-full max-w-full object-contain" />
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="text-sm font-semibold text-zinc-700">
          <span className="sr-only">Selecionar imagem PNG</span>
          <input type="file" accept="image/png" className="max-w-full"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              event.currentTarget.value = "";
              if (file) selectFile(file);
            }} />
        </label>
        {pendingLogo ? (
          <>
            <button type="button" className={button} onClick={() => void saveLogo("PUT")}>
              {saving ? "Salvando…" : "Salvar logo"}
            </button>
            <button type="button" className={button} onClick={() => { setPendingLogo(null); setError(""); }}>Cancelar</button>
          </>
        ) : savedLogo && (
          <button type="button" className={button} onClick={() => void saveLogo("DELETE")}>
            {saving ? "Removendo…" : "Remover logo"}
          </button>
        )}
      </div>
      {loading && <p role="status" className="mt-2 text-sm text-zinc-600">Carregando logo…</p>}
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
      {success && <p role="status" className="mt-2 text-sm text-emerald-700">{success}</p>}
    </fieldset>
  );
}

function HospitalAccess({ hospital }: { hospital: InstitutionalHospital }) {
  const [directory, setDirectory] = useState<Directory | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [userId, setUserId] = useState("");
  const [accessType, setAccessType] = useState<AccessType>("app");
  const [status, setStatus] = useState<LinkStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [directoryError, setDirectoryError] = useState("");
  const [linkError, setLinkError] = useState("");
  const [success, setSuccess] = useState("");
  const lookup = `hospital-access?${new URLSearchParams({ userId, hospitalCode: hospital.code, accessType })}`;
  const accessLabel = accessLabels[accessType];
  const query = search.trim().toLocaleLowerCase("pt-BR");
  const accounts = directory?.users.filter((account) =>
    [account.fullName, account.email, account.crm, account.rqe].some((value) => value.toLocaleLowerCase("pt-BR").includes(query)),
  ) ?? [];

  useEffect(() => {
    const controller = new AbortController();
    void adminRequest<Directory>(`users?page=${page}&perPage=50`, { signal: controller.signal })
      .then((directory) => { if (!controller.signal.aborted) setDirectory(directory); })
      .catch((error: unknown) => { if (!controller.signal.aborted) setDirectoryError(message(error)); });
    return () => controller.abort();
  }, [page]);

  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    void adminRequest<LinkStatus>(lookup, { signal: controller.signal })
      .then((status) => { if (!controller.signal.aborted) setStatus(status); })
      .catch((error: unknown) => { if (!controller.signal.aborted) setLinkError(message(error)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [lookup, userId]);

  function selectAccount(id: string) {
    setUserId(id);
    setStatus(null);
    setLoading(Boolean(id));
    setLinkError("");
    setSuccess("");
  }

  function changePage(next: number) {
    selectAccount("");
    setDirectory(null);
    setDirectoryError("");
    setPage(next);
  }

  async function changeAccess(action: "grant" | "revoke") {
    if (action === "revoke" && !window.confirm(`Revogar o ${accessLabel} desta conta neste hospital?`)) return;
    setSaving(true);
    setLinkError("");
    setSuccess("");
    try {
      await adminRequest("hospital-access", mutation("POST", { userId, hospitalCode: hospital.code, action, accessType }));
      setStatus(action === "grant" ? { status: "active", active: true } : { status: "revoked", active: false });
      setSuccess(action === "grant" ? "Vínculo concedido." : "Vínculo revogado.");
    } catch (error) {
      setLinkError(message(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={panel}>
      <h2 className="text-xl font-black text-zinc-950">Vínculos de {hospital.name}</h2>
      {!hospital.is_active && <p className="mt-1 text-sm text-zinc-600">O acesso será disponibilizado quando o hospital for ativado.</p>}
      <fieldset disabled={saving} className="mt-4 grid gap-3 text-sm font-semibold text-zinc-700 sm:grid-cols-2">
        <label>Filtrar contas nesta página
          <input value={search} onChange={(event) => { setSearch(event.target.value); selectAccount(""); }}
            placeholder="Nome, e-mail, CRM ou RQE" className={input} />
        </label>
        <label>Conta Anest+
          <select value={userId} onChange={(event) => selectAccount(event.target.value)} disabled={!directory} className={input}>
            <option value="">{directory ? (accounts.length ? "Selecione uma conta" : "Nenhuma conta nesta página") : directoryError ? "Contas indisponíveis" : "Carregando contas…"}</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>{account.fullName && account.email ? `${account.fullName} · ${account.email}` : account.email || account.fullName || account.id}</option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-2">
          <button type="button" disabled={!directory || page <= 1} onClick={() => changePage(page - 1)} className={button}>Anterior</button>
          <span>Página {page}</span>
          <button type="button" disabled={!directory || page >= directory.pagination.lastPage} onClick={() => changePage(page + 1)} className={button}>Próxima</button>
        </div>
        <label>Tipo de acesso
          <select value={accessType} onChange={(event) => {
            setAccessType(event.target.value as AccessType);
            selectAccount(userId);
          }} className={input}>
            <option value="app">Ficha anestésica</option>
            <option value="pre_anesthetic">Pré-anestésica</option>
            <option value="coordination">Coordenação hospitalar</option>
            <option value="billing">Faturamento</option>
          </select>
        </label>
        {userId && <div className="flex flex-wrap items-center gap-2">
          <span role="status">
            {loading ? "Consultando vínculo…" : !status ? "Vínculo indisponível" : status.active ? "Vínculo ativo" : status.status === "revoked" ? "Vínculo revogado" : status.status ? "Vínculo inativo" : "Sem vínculo"}
          </span>
          <button type="button" disabled={!status || status.active} onClick={() => void changeAccess("grant")} className={button}>Conceder</button>
          <button type="button" disabled={!status?.status || status.status === "revoked"} onClick={() => void changeAccess("revoke")} className={button}>Revogar</button>
        </div>}
      </fieldset>
      <p className="mt-3 text-sm text-zinc-600">Para liberar ficha e pré-anestésica, conceda os dois vínculos separadamente.</p>
      {(directoryError || linkError) && <p role="alert" className="mt-3 text-sm text-red-700">{directoryError || linkError}</p>}
      {success && <p role="status" className="mt-3 text-sm text-emerald-700">{success}</p>}
    </section>
  );
}

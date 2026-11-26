export class RequestError extends Error {
  constructor(readonly status: number, message: string, readonly details?: { code?: string; issues?: { path: string; message: string }[] }) {
    super(message);
  }
}

export async function billingRequest<T>(endpoint: string, token: string, options?: RequestInit): Promise<T> {
  const response = await billingResponse(endpoint, token, options);
  const data = await response.json().catch(() => null);
  if (!data) throw new RequestError(response.status, "Não foi possível concluir a operação.");
  return data;
}

export async function billingResponse(endpoint: string, token: string, options?: RequestInit) {
  const headers = new Headers(options?.headers);
  headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(endpoint, { ...options, headers, cache: "no-store", credentials: "omit" });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new RequestError(response.status, data?.error ?? "Não foi possível concluir a operação.", data ?? undefined);
  }
  return response;
}

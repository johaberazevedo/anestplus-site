export class RequestError extends Error {
  constructor(readonly status: number, message: string) { super(message); }
}

export async function billingRequest<T>(endpoint: string, token: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);
  headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(endpoint, { ...options, headers, cache: "no-store", credentials: "omit" });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) {
    throw new RequestError(response.status, data?.error ?? "Não foi possível concluir a operação.");
  }
  return data;
}

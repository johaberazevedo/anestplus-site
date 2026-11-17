import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export const PRODUCAO_COOKIE = "anest_producao_auth";
export const PRODUCAO_SESSION_SECONDS = 8 * 60 * 60;

function sign(payload: string) {
  const secret = process.env.PRODUCAO_SESSION_SECRET;
  if (!secret || secret.length < 32) return null;
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createProducaoSession() {
  const expires = Math.floor(Date.now() / 1000) + PRODUCAO_SESSION_SECONDS;
  const payload = `${expires}.${randomUUID()}`;
  const signature = sign(payload);
  return signature && `${payload}.${signature}`;
}

export function validProducaoSession(token?: string) {
  if (!token || !/^\d{10}\.[0-9a-f-]{36}\.[\w-]{43}$/.test(token)) return false;
  const [expires, nonce, signature] = token.split(".");
  if (Number(expires) <= Math.floor(Date.now() / 1000)) return false;
  const expected = sign(`${expires}.${nonce}`);
  return expected !== null && timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

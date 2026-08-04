import {
  createHmac,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "anest_admin_auth";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

type AdminSessionPayload = {
  exp: number;
  nonce: string;
};

function adminSessionSecret() {
  const secret = process.env.ANEST_ADMIN_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "ANEST_ADMIN_SESSION_SECRET deve possuir pelo menos 32 caracteres.",
    );
  }

  return secret;
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function signPayload(encodedPayload: string) {
  return createHmac("sha256", adminSessionSecret())
    .update(encodedPayload)
    .digest("base64url");
}

export function validateAdminCredentials(username: string, password: string) {
  const expectedUsername = process.env.ANEST_ADMIN_USERNAME;
  const expectedPassword = process.env.ANEST_ADMIN_PASSWORD;

  if (!expectedUsername || !expectedPassword) {
    throw new Error("Credenciais administrativas não configuradas.");
  }

  return (
    safeEqual(username, expectedUsername) &&
    safeEqual(password, expectedPassword)
  );
}

export function createAdminSessionToken() {
  const payload: AdminSessionPayload = {
    exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE_SECONDS,
    nonce: randomUUID(),
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );

  return `${encodedPayload}.${signPayload(encodedPayload)}`;
}

export function verifyAdminSessionToken(token: string | undefined) {
  if (!token) return false;

  try {
    const [encodedPayload, receivedSignature, extra] = token.split(".");
    if (!encodedPayload || !receivedSignature || extra) return false;

    const expectedSignature = signPayload(encodedPayload);
    if (!safeEqual(receivedSignature, expectedSignature)) return false;

    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as Partial<AdminSessionPayload>;

    return (
      typeof payload.exp === "number" &&
      typeof payload.nonce === "string" &&
      payload.exp > Math.floor(Date.now() / 1000)
    );
  } catch {
    return false;
  }
}

export async function hasValidAdminSession() {
  const cookieStore = await cookies();
  return verifyAdminSessionToken(
    cookieStore.get(ADMIN_COOKIE_NAME)?.value,
  );
}

export function isTrustedAdminMutationRequest(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return process.env.NODE_ENV !== "production";
  }

  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}

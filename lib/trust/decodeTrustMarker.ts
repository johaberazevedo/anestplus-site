export type TrustSigner = {
  name?: string;
  crm?: string;
  rqe?: string;
};

export type TrustCrypto = {
  algorithm?: string;
  payloadHashSHA256?: string;
  publicKeyBase64?: string;
  signatureBase64?: string;
};

export type AnestplusTrustPayload = {
  schemaVersion?: number;
  signedAtISO8601?: string;
  signer?: TrustSigner;
  crypto?: TrustCrypto;
  payload?: {
    json?: string;
  };
  authContext?: TrustAuthContext;
};

export type TrustAuthContext = {
  authMethod?: string;
  signatureProvider?: string;
  signerUserId?: string;
  deviceMode?: string;
};

export type DecodedTrustPayload = {
  anestplusTrust?: AnestplusTrustPayload;
};

export type DecodedTrustResult = {
  rawPayload: string;
  decodedJSON: string;
  payload: DecodedTrustPayload;
};

const TRUST_PREFIX = "ANESTPLUS_TRUST:";
const TRUST_BEGIN = "[ANESTPLUS_TRUST_BEGIN]";
const TRUST_END = "[ANESTPLUS_TRUST_END]";

export function decodeTrustMarker(marker: string): DecodedTrustResult {
  const encodedPart = extractEncodedPart(marker);

  if (!encodedPart) {
    throw new Error("Marcador Trust vazio.");
  }

  const compact = encodedPart.replace(/\s+/g, "").replace(/\./g, "");
  const base64 = normalizeBase64(compact);

  let decodedJSON = "";
  try {
    decodedJSON = decodeBase64ToUtf8(base64);
  } catch {
    throw new Error("Não foi possível decodificar o conteúdo base64 do marcador.");
  }

  try {
    const payload = JSON.parse(decodedJSON) as DecodedTrustPayload;
    return {
      rawPayload: encodedPart,
      decodedJSON,
      payload,
    };
  } catch {
    throw new Error("O conteúdo decodificado não é um JSON válido.");
  }
}

function extractEncodedPart(marker: string): string {
  const trimmed = marker.trim();

  if (trimmed.startsWith(TRUST_PREFIX)) {
    return trimmed.slice(TRUST_PREFIX.length).trim();
  }

  if (trimmed.startsWith(TRUST_BEGIN) && trimmed.endsWith(TRUST_END)) {
    return trimmed
      .slice(TRUST_BEGIN.length, trimmed.length - TRUST_END.length)
      .trim();
  }

  throw new Error("Marcador Trust inválido.");
}

function normalizeBase64(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = base64.length % 4;
  if (padding === 0) return base64;
  return base64 + "=".repeat(4 - padding);
}

function decodeBase64ToUtf8(base64: string): string {
  if (typeof window === "undefined") {
    throw new Error("Decodificação disponível apenas no browser.");
  }

  const binary = window.atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
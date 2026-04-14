export type TrustVerificationResult = {
  markerFound: boolean;
  jsonDecoded: boolean;
  hashMatches: boolean;
  signatureValid: boolean;
  overallValid: boolean;
  errors: string[];
};

type TrustPayloadShape = {
  anestplusTrust?: {
    crypto?: {
      algorithm?: string;
      payloadHashSHA256?: string;
      publicKeyBase64?: string;
      signatureBase64?: string;
    };
    payload?: {
      json?: string;
    };
  };
};

export async function verifyTrustSignature(
  decoded: TrustPayloadShape
): Promise<TrustVerificationResult> {
  const errors: string[] = [];

  const trust = decoded?.anestplusTrust;
  if (!trust) {
    return {
      markerFound: true,
      jsonDecoded: true,
      hashMatches: false,
      signatureValid: false,
      overallValid: false,
      errors: ["Payload Trust ausente no JSON decodificado."],
    };
  }

  const algorithm = trust.crypto?.algorithm ?? "";
  const payloadJSON = trust.payload?.json ?? "";
  const payloadHashSHA256 = trust.crypto?.payloadHashSHA256 ?? "";
  const publicKeyBase64 = trust.crypto?.publicKeyBase64 ?? "";
  const signatureBase64 = trust.crypto?.signatureBase64 ?? "";

  if (!payloadJSON) errors.push("Payload JSON ausente.");
  if (!payloadHashSHA256) errors.push("Hash SHA-256 do payload ausente.");
  if (!publicKeyBase64) errors.push("Chave pública ausente.");
  if (!signatureBase64) errors.push("Assinatura digital ausente.");

  if (errors.length > 0) {
    return {
      markerFound: true,
      jsonDecoded: true,
      hashMatches: false,
      signatureValid: false,
      overallValid: false,
      errors,
    };
  }

  if (algorithm !== "ECDSA_P256_SHA256") {
    errors.push(`Algoritmo não suportado: ${algorithm || "desconhecido"}.`);
    return {
      markerFound: true,
      jsonDecoded: true,
      hashMatches: false,
      signatureValid: false,
      overallValid: false,
      errors,
    };
  }

  const payloadBytes = new TextEncoder().encode(payloadJSON);

  const recalculatedHashHex = await sha256Hex(payloadBytes);
  const hashMatches =
    normalizeHex(recalculatedHashHex) === normalizeHex(payloadHashSHA256);

  if (!hashMatches) {
    errors.push("O hash do payload não confere com o hash declarado no marcador.");
  }

  let signatureValid = false;

  try {
    const publicKeyRaw = base64ToBytes(publicKeyBase64);
    const signatureBytes = base64ToBytes(signatureBase64);

        const cryptoKey = await crypto.subtle.importKey(
      "raw",
      toArrayBuffer(publicKeyRaw),
      {
        name: "ECDSA",
        namedCurve: "P-256",
      },
      false,
      ["verify"]
    );

    // Tenta primeiro com a assinatura exatamente como veio do iOS.
        signatureValid = await crypto.subtle.verify(
      {
        name: "ECDSA",
        hash: "SHA-256",
      },
      cryptoKey,
      toArrayBuffer(signatureBytes),
      toArrayBuffer(payloadBytes)
    );

    // Fallback: se algum navegador esperar P1363/raw 64 bytes, converte DER -> raw.
    if (!signatureValid) {
      const maybeRaw = derEcdsaToRaw64(signatureBytes);
      if (maybeRaw) {
        signatureValid = await crypto.subtle.verify(
          {
            name: "ECDSA",
            hash: "SHA-256",
          },
          cryptoKey,
          toArrayBuffer(maybeRaw),
          toArrayBuffer(payloadBytes)
        );
      }
    }

    if (!signatureValid) {
      errors.push("A assinatura digital não pôde ser validada com a chave pública informada.");
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Falha inesperada durante a verificação criptográfica.";
    errors.push(`Erro ao verificar assinatura: ${message}`);
  }

  return {
    markerFound: true,
    jsonDecoded: true,
    hashMatches,
    signatureValid,
    overallValid: hashMatches && signatureValid,
    errors,
  };
}

function normalizeHex(value: string): string {
  return value.trim().toLowerCase();
}

async function sha256Hex(data: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", toArrayBuffer(data));
  const bytes = new Uint8Array(digest);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function base64ToBytes(base64: string): Uint8Array {
  const normalized = normalizeBase64(base64);
  const binary = atob(normalized);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;
}

function normalizeBase64(input: string): string {
  const base64 = input.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
  const padding = base64.length % 4;
  if (padding === 0) return base64;
  return base64 + "=".repeat(4 - padding);
}

/**
 * Converte assinatura DER ASN.1 ECDSA para raw 64 bytes (r|s).
 * Fallback útil caso o browser espere P1363.
 */
function derEcdsaToRaw64(der: Uint8Array): Uint8Array | null {
  try {
    if (der.length < 8 || der[0] !== 0x30) return null;

    let offset = 1;
    const seqLen = readAsn1Length(der, offset);
    if (!seqLen) return null;
    offset = seqLen.nextOffset;

    if (der[offset] !== 0x02) return null;
    offset += 1;
    const rLen = readAsn1Length(der, offset);
    if (!rLen) return null;
    offset = rLen.nextOffset;
    const r = der.slice(offset, offset + rLen.length);
    offset += rLen.length;

    if (der[offset] !== 0x02) return null;
    offset += 1;
    const sLen = readAsn1Length(der, offset);
    if (!sLen) return null;
    offset = sLen.nextOffset;
    const s = der.slice(offset, offset + sLen.length);

    const rPadded = leftPadTo32(stripLeadingZero(r));
    const sPadded = leftPadTo32(stripLeadingZero(s));

    if (!rPadded || !sPadded) return null;

    const out = new Uint8Array(64);
    out.set(rPadded, 0);
    out.set(sPadded, 32);
    return out;
  } catch {
    return null;
  }
}

function readAsn1Length(
  bytes: Uint8Array,
  offset: number
): { length: number; nextOffset: number } | null {
  const first = bytes[offset];
  if (first == null) return null;

  if ((first & 0x80) === 0) {
    return { length: first, nextOffset: offset + 1 };
  }

  const numBytes = first & 0x7f;
  if (numBytes < 1 || numBytes > 4) return null;
  if (offset + numBytes >= bytes.length) return null;

  let length = 0;
  for (let i = 1; i <= numBytes; i++) {
    length = (length << 8) | bytes[offset + i];
  }

  return {
    length,
    nextOffset: offset + 1 + numBytes,
  };
}

function stripLeadingZero(bytes: Uint8Array): Uint8Array {
  if (bytes.length > 1 && bytes[0] === 0x00) {
    return bytes.slice(1);
  }
  return bytes;
}

function leftPadTo32(bytes: Uint8Array): Uint8Array | null {
  if (bytes.length > 32) return null;
  if (bytes.length === 32) return bytes;

  const out = new Uint8Array(32);
  out.set(bytes, 32 - bytes.length);
  return out;
}
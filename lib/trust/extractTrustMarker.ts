export function extractTrustMarker(text: string): string | null {
  if (!text) return null;

  const TRUST_BEGIN = "[ANESTPLUS_TRUST_BEGIN]";
  const TRUST_END = "[ANESTPLUS_TRUST_END]";

  /**
   * PDF.js pode fragmentar texto invisível em pedaços e o client junta com espaços.
   * Exemplo real:
   * [ANESTP  LUS_TRUST_END]
   * IjpcIjY  wXCIs
   *
   * Por isso, para localizar o marcador Trust, usamos uma cópia compactada
   * sem qualquer whitespace.
   */
  const compact = text
    .replace(/\u00A0/g, "")
    .replace(/\s+/g, "")
    .trim();

  if (!compact) return null;

  /**
   * Usamos lastIndexOf para preferir a última ocorrência completa.
   * Isso evita pegar uma cópia visual/truncada caso o PDF contenha mais de uma
   * tentativa de marcador.
   */
  const beginIndex = compact.lastIndexOf(TRUST_BEGIN);
  if (beginIndex === -1) return null;

  const payloadStart = beginIndex + TRUST_BEGIN.length;
  const endIndex = compact.indexOf(TRUST_END, payloadStart);

  if (endIndex === -1) return null;
  if (endIndex <= payloadStart) return null;

  const compactPayload = compact.slice(payloadStart, endIndex).trim();

  if (!compactPayload) return null;

  /**
   * Base64 esperado. Mantém o validador conservador:
   * se tiver caractere estranho após compactação, não tenta validar.
   */
  if (!/^[A-Za-z0-9+/=]+$/.test(compactPayload)) {
    return null;
  }

  return `${TRUST_BEGIN}${compactPayload}${TRUST_END}`;
}
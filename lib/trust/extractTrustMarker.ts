export function extractTrustMarker(text: string): string | null {
  if (!text) return null;

  const normalized = text
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const beginRegex =
    /\[\s*ANESTPLUS\s*[_\-\s]*TRUST\s*[_\-\s]*BEGIN\s*\]/i;
  const endRegex =
    /\[\s*ANESTPLUS\s*[_\-\s]*TRUST\s*[_\-\s]*END\s*\]/i;

  const beginMatch = normalized.match(beginRegex);
  const endMatch = normalized.match(endRegex);

  if (!beginMatch || !endMatch) return null;
  if (beginMatch.index == null || endMatch.index == null) return null;
  if (endMatch.index <= beginMatch.index) return null;

  const beginToken = beginMatch[0];
  const payloadSection = normalized.slice(
    beginMatch.index + beginToken.length,
    endMatch.index
  );

  const compactPayload = payloadSection.replace(/\s+/g, "").trim();

  if (!compactPayload) return null;

  return `[ANESTPLUS_TRUST_BEGIN]${compactPayload}[ANESTPLUS_TRUST_END]`;
}
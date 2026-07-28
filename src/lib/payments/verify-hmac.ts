import { createHmac, timingSafeEqual } from "node:crypto";

export class WebhookVerificationError extends Error {}

// Constant-time HMAC-SHA256 comparison, shared by MockProvider and
// YouCanPayProvider (both sign the raw request body with a shared secret).
export function verifyHmacSignature(
  rawBody: string,
  signatureHex: string | null,
  secret: string
): boolean {
  if (!signatureHex) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest();
  let provided: Buffer;
  try {
    provided = Buffer.from(signatureHex, "hex");
  } catch {
    return false;
  }
  if (provided.length !== expected.length) return false;
  return timingSafeEqual(provided, expected);
}

import { createHmac } from 'crypto';

/**
 * HMAC-SHA256 signer for Polymarket CLOB L2 authentication.
 * Mirrors the Java PolyHmacSigner exactly.
 */
export function polyHmacSign(
  secretBase64: string,
  timestampSeconds: number,
  method: string,
  requestPath: string,
  body: string | null,
): string {
  const message = `${timestampSeconds}${method}${requestPath}${body ?? ''}`;
  const secretBytes = decodePolymarketSecret(secretBase64);
  const hmac = createHmac('sha256', secretBytes);
  hmac.update(message, 'utf8');
  const sig = hmac.digest('base64');
  return sig.replace(/\+/g, '-').replace(/\//g, '_');
}

function decodePolymarketSecret(secretBase64: string): Buffer {
  if (!secretBase64) {
    throw new Error('secret must not be null');
  }
  let sanitized = secretBase64.replace(/-/g, '+').replace(/_/g, '/').replace(/[^A-Za-z0-9+/=]/g, '');
  const remainder = sanitized.length % 4;
  if (remainder !== 0) {
    sanitized += '='.repeat(4 - remainder);
  }
  return Buffer.from(sanitized, 'base64');
}

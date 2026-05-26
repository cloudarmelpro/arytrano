import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Verify a GoalPay webhook signature.
 *
 * Algorithm (per https://goalpay.pro/docs/api/integrations 2026-05-25) :
 *   HMAC-SHA256( rawBody, WEBHOOK_SECRET ) → hex digest
 *   Header: `x-gpay-signature`
 *
 * Uses `crypto.timingSafeEqual` to prevent timing-side-channel attacks
 * on the comparison. Returns `false` when the signature header is null,
 * malformed, or the buffers have mismatched lengths — never throws on
 * untrusted input.
 *
 * NOTE: `rawBody` MUST be the exact raw request body bytes as received,
 * NOT a re-serialized JSON.parse → JSON.stringify (key ordering /
 * whitespace differences would break the HMAC).
 */
export function verifyGoalPaySignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader) return false

  // Compute the expected HMAC over the raw body.
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')

  let received: Buffer
  let expectedBuf: Buffer
  try {
    received = Buffer.from(signatureHeader, 'hex')
    expectedBuf = Buffer.from(expected, 'hex')
  } catch {
    return false
  }

  // `timingSafeEqual` requires equal-length buffers — short-circuit
  // out-of-band header lengths to avoid the otherwise-thrown error.
  if (received.length !== expectedBuf.length) return false

  return timingSafeEqual(received, expectedBuf)
}

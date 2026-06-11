import 'server-only'
import crypto from 'node:crypto'
import { env } from '@/lib/env'

/**
 * Hash a phone number with the same scheme as `hashIp` / `hashUa` (sha256
 * peppered with AUTH_SECRET).
 *
 * Used by :
 *  - LeadRequest.tenantPhoneHash (E-T28) — anti-duplicate-spam index +
 *    rate-limit key + PII scrubbing in Sentry/log payloads (per memory
 *    `feedback_debug_logs_no_pii`).
 *  - Future flows that need to match a phone without storing it in clear.
 *
 * Caller MUST normalize to E.164 first ("+261341234567") — this helper
 * does NOT normalize, so "0341234567" and "+261341234567" hash to
 * different values. Use the input formatter at the call site.
 */
export function hashPhone(phoneE164: string): string {
  return crypto
    .createHash('sha256')
    .update(phoneE164 + (env.AUTH_SECRET ?? ''))
    .digest('hex')
}

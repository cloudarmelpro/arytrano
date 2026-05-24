import 'server-only'
import { randomBytes } from 'node:crypto'

/**
 * Generate a long-lived, opaque unsubscribe token for a WhatsApp
 * Alert subscription. 24 random bytes → 32 chars base64url (192 bits
 * entropy, non-bruteforce-able). Stable across renewals: once written
 * on a row, the token never changes — the public unsubscribe URL is
 * the same for the lifetime of the subscription.
 */
export function generateUnsubscribeToken(): string {
  return randomBytes(24).toString('base64url')
}

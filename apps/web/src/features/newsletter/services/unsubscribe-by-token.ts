import 'server-only'
import { prisma } from '@/lib/db'

export type UnsubscribeResult = 'ok' | 'already' | 'invalid'

/**
 * Code-review 2026-07-16 — extracted from page.tsx so the same
 * business logic backs both surfaces:
 *   - GET confirm page → Server Action (browser click)
 *   - POST route.ts    → RFC 8058 List-Unsubscribe-Post (Gmail/Yahoo)
 * Idempotent, always returns a discriminant instead of throwing, so
 * callers can render a uniform 200 without leaking token existence.
 */
export async function unsubscribeNewsletterByToken(
  token: string,
): Promise<UnsubscribeResult> {
  if (!token || token.length < 20 || token.length > 64) return 'invalid'
  const row = await prisma.newsletterSubscriber.findUnique({
    where: { unsubscribeToken: token },
    select: { id: true, unsubscribedAt: true },
  })
  if (!row) return 'invalid'
  if (row.unsubscribedAt) return 'already'
  await prisma.newsletterSubscriber.update({
    where: { id: row.id },
    data: { unsubscribedAt: new Date() },
  })
  return 'ok'
}

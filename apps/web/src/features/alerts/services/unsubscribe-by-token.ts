import 'server-only'
import { prisma } from '@/lib/db'

export type UnsubscribeResult =
  | { ok: true; alreadyUnsubscribed: boolean }
  | { ok: false; reason: 'invalid' }

/**
 * Public unsubscribe lookup by long-lived token. Idempotent: re-clicking
 * the same link after success returns { alreadyUnsubscribed: true } so
 * the UI can tell the user "you're already off the list" instead of
 * pretending success twice.
 *
 * No auth — the token is the proof of authority. Anyone holding the
 * link can unsubscribe that subscription (which is the intent — we
 * want zero friction to leave).
 */
export async function unsubscribeByToken(
  token: string,
): Promise<UnsubscribeResult> {
  const row = await prisma.whatsAppAlert.findUnique({
    where: { unsubscribeToken: token },
    select: { id: true, unsubscribedAt: true },
  })
  if (!row) {
    return { ok: false, reason: 'invalid' }
  }
  if (row.unsubscribedAt !== null) {
    return { ok: true, alreadyUnsubscribed: true }
  }
  await prisma.whatsAppAlert.update({
    where: { id: row.id },
    data: { unsubscribedAt: new Date() },
  })
  return { ok: true, alreadyUnsubscribed: false }
}

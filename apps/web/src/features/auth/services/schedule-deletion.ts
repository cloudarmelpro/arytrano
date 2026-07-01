import 'server-only'
import { prisma } from '@/lib/db'
import { errors } from '@/lib/api/errors'

export const DELETION_GRACE_DAYS = 30

/**
 * TRU-19 — schedule a user account for deletion 30 days in the
 * future. The row stays fully functional until the cron finalises;
 * users can cancel via `cancelAccountDeletion` any time before the
 * scheduled date.
 */
export async function scheduleAccountDeletion(userId: string): Promise<Date> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, status: true, deletionScheduledAt: true },
  })
  if (!user) throw errors.notFound('Compte introuvable')
  if (user.status === 'DELETED') {
    throw errors.conflict('Compte déjà supprimé')
  }
  // Idempotent — a second click within the window doesn't reset the
  // countdown so the user can't game the delay.
  if (user.deletionScheduledAt) return user.deletionScheduledAt

  const scheduledFor = new Date(
    Date.now() + DELETION_GRACE_DAYS * 24 * 60 * 60 * 1000,
  )
  await prisma.user.update({
    where: { id: userId },
    data: { deletionScheduledAt: scheduledFor },
  })
  return scheduledFor
}

/**
 * TRU-19 — cancel a pending deletion. Returns true when we cleared a
 * scheduled row; false when there was nothing to cancel.
 */
export async function cancelAccountDeletion(userId: string): Promise<boolean> {
  const result = await prisma.user.updateMany({
    where: { id: userId, deletionScheduledAt: { not: null } },
    data: { deletionScheduledAt: null },
  })
  return result.count > 0
}

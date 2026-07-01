import 'server-only'
import * as Sentry from '@sentry/nextjs'
import { prisma } from '@/lib/db'
import { deleteAccount } from './delete-account'

/**
 * TRU-19 — cron sweep. Finalises every account whose 30-day grace
 * window has elapsed. Runs the same hard-anonymize path
 * (deleteAccount) so all downstream side-effects (Cloudinary purge,
 * OAuth link deletion, Listing → DELETED) fire in one place.
 */
export async function finalizeScheduledDeletions(): Promise<{
  scanned: number
  finalised: number
  failed: number
}> {
  const now = new Date()
  const due = await prisma.user.findMany({
    where: {
      deletionScheduledAt: { lte: now },
      status: { not: 'DELETED' },
    },
    select: { id: true },
  })

  let finalised = 0
  let failed = 0
  for (const row of due) {
    try {
      await deleteAccount(row.id)
      finalised += 1
    } catch (err) {
      failed += 1
      Sentry.captureException(err, {
        tags: { cron: 'finalize-scheduled-deletions' },
        extra: { userId: row.id },
      })
    }
  }
  return { scanned: due.length, finalised, failed }
}

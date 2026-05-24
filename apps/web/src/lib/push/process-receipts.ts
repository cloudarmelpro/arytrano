import 'server-only'
import { prisma } from '@/lib/db'
import { fetchReceipts } from './receipts'

/**
 * Process pending push receipts (cron — every ~30 min).
 *
 * Flow :
 *   1. Pick PushReceipt rows older than 15 minutes (Expo's earliest
 *      receipt-available window) and not older than 24 hours (Expo's
 *      retention limit — older rows are unrecoverable, just delete).
 *   2. Batch-fetch up to 1000 receipts per Expo call.
 *   3. Per receipt :
 *      - `ok` → drop the row (delivered successfully)
 *      - `error` with `DeviceNotRegistered` → clear the user's
 *        `expoPushToken` AND drop the row (uninstall — the token
 *        will never work again)
 *      - other `error` (MessageTooBig, MismatchSenderId, etc.) →
 *        drop the row, log for debugging (these are typically dev
 *        configuration issues, not actionable on the receipt path)
 *   4. Drop rows we couldn't poll (Expo returned nothing for them) —
 *      if they're > 24h we couldn't poll them anyway, and if they're
 *      <24h we'll see them next run unless Expo never returns them.
 *      Hard-delete after 24h to keep the table bounded.
 *
 * Returns counters for observability.
 */

const POLL_AGE_MIN_MS = 15 * 60 * 1000  // 15 min — earliest Expo guarantees receipts
const POLL_AGE_MAX_MS = 24 * 60 * 60 * 1000 // 24h — Expo's receipt retention

export type ProcessReceiptsResult = {
  polled: number
  delivered: number
  deviceNotRegistered: number
  otherErrors: number
  staleDeleted: number
}

export async function processPushReceipts(): Promise<ProcessReceiptsResult> {
  const now = Date.now()
  const minAge = new Date(now - POLL_AGE_MIN_MS)
  const maxAge = new Date(now - POLL_AGE_MAX_MS)

  // First: hard-delete anything older than 24h (Expo no longer has
  // receipts for these — keeping the row wastes index space).
  const staleResult = await prisma.pushReceipt.deleteMany({
    where: { sentAt: { lt: maxAge } },
  })

  // Then load the polling window.
  const ready = await prisma.pushReceipt.findMany({
    where: { sentAt: { lt: minAge, gte: maxAge } },
    select: { id: true, ticketId: true, userId: true },
    // Perf P2 : FIFO drain. Without explicit orderBy the heap-scan
    // returns rows in undefined order — when the table holds more
    // than 1000 eligible rows, old receipts near the 24h Expo
    // retention boundary might never be polled, leaving
    // DeviceNotRegistered tokens alive forever. Oldest first.
    orderBy: { sentAt: 'asc' },
    // 1000 is Expo's batch limit; doing more than one batch per run
    // would risk timing out a 10s serverless function. If we ever
    // ship volumes that demand more, switch the cron to run more
    // frequently rather than batch larger.
    take: 1000,
  })

  if (ready.length === 0) {
    return {
      polled: 0,
      delivered: 0,
      deviceNotRegistered: 0,
      otherErrors: 0,
      staleDeleted: staleResult.count,
    }
  }

  const ticketIds = ready.map((r) => r.ticketId)
  const receipts = await fetchReceipts(ticketIds)

  let delivered = 0
  let deviceNotRegistered = 0
  let otherErrors = 0
  const tokensToClear: string[] = []
  const rowIdsToDelete: string[] = []

  for (const row of ready) {
    const receipt = receipts.get(row.ticketId)
    if (!receipt) continue // try again next run

    rowIdsToDelete.push(row.id)
    if (receipt.status === 'ok') {
      delivered++
    } else {
      // The error code lives at details.error per Expo's API. The
      // top-level message field is a human-readable summary.
      const errorCode = receipt.details?.error
      if (errorCode === 'DeviceNotRegistered') {
        deviceNotRegistered++
        tokensToClear.push(row.userId)
      } else {
        otherErrors++
        console.warn(
          '[push] receipt non-actionable error',
          errorCode ?? receipt.message ?? 'unknown',
        )
      }
    }
  }

  // Apply side effects in two transactions : clear stale tokens,
  // then delete the polled rows. Doing them separately keeps the
  // DELETE small even when the token-clear set is empty.
  if (tokensToClear.length > 0) {
    await prisma.user.updateMany({
      where: { id: { in: tokensToClear } },
      data: { expoPushToken: null },
    })
  }
  if (rowIdsToDelete.length > 0) {
    await prisma.pushReceipt.deleteMany({
      where: { id: { in: rowIdsToDelete } },
    })
  }

  return {
    polled: ready.length,
    delivered,
    deviceNotRegistered,
    otherErrors,
    staleDeleted: staleResult.count,
  }
}

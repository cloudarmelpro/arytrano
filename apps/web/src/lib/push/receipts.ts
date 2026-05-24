import 'server-only'
import { prisma } from '@/lib/db'
import { env } from '@/lib/env'

/**
 * Receipt-polling utilities for the Expo Push API.
 *
 * The Push API returns a ticket id per recipient on send; ~15-30
 * minutes later the receipt is available at `/getReceipts` and
 * tells us whether delivery actually happened. The critical actionable
 * error is `DeviceNotRegistered` — that token belongs to an app the
 * user uninstalled, and we should clear it from User.expoPushToken
 * so we stop dispatching to it.
 *
 * Persist on send, poll on cron, delete on poll. See
 * `/api/cron/push-receipts/route.ts`.
 */

const RECEIPTS_ENDPOINT = 'https://exp.host/--/api/v2/push/getReceipts'
const BATCH_SIZE = 1000

export type ExpoReceipt = {
  status: 'ok' | 'error'
  message?: string
  details?: { error?: string }
}

/**
 * Persist ticket ids for later receipt polling. Called by the senders
 * (notifyOwnerContact, notifySavedSearchMatches) immediately after a
 * successful `sendPush`.
 *
 * Caller passes the `to → userId` mapping it already has — we don't
 * round-trip to the DB to resolve the token → user link (the senders
 * already know who they're notifying).
 */
export async function recordTickets(
  rows: Array<{ userId: string; ticketId: string }>,
): Promise<void> {
  if (rows.length === 0) return
  try {
    await prisma.pushReceipt.createMany({
      data: rows,
      // `ticketId` is @unique — Expo would have to recycle one for
      // skipDuplicates to matter, which doesn't happen in practice.
      // Defensive anyway.
      skipDuplicates: true,
    })
  } catch (err) {
    // Sec P1-5 : log only the message/code, never the raw error
    // (Prisma errors include the query + bound values which can
    // contain userId / push token PII).
    console.warn(
      '[push] recordTickets failed',
      err instanceof Error ? err.message : String(err),
    )
  }
}

/**
 * Fetch receipts from Expo for the given ticket ids. Auto-batches at
 * 1000 (Expo's documented max). Returns `{ id → receipt }` mapping so
 * the caller can act per-ticket.
 *
 * Returns an empty map on any fetch / parsing failure — the cron
 * tolerates these and retries on the next run since rows aren't
 * deleted until we actually act on them.
 */
export async function fetchReceipts(
  ticketIds: string[],
): Promise<Map<string, ExpoReceipt>> {
  const out = new Map<string, ExpoReceipt>()
  if (ticketIds.length === 0) return out

  for (let i = 0; i < ticketIds.length; i += BATCH_SIZE) {
    const batch = ticketIds.slice(i, i + BATCH_SIZE)
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      }
      if (env.EXPO_ACCESS_TOKEN) {
        headers.Authorization = `Bearer ${env.EXPO_ACCESS_TOKEN}`
      }
      const res = await fetch(RECEIPTS_ENDPOINT, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ids: batch }),
      })
      if (!res.ok) {
        console.warn('[push] getReceipts non-2xx', res.status)
        continue
      }
      const body = (await res.json()) as {
        data?: Record<string, ExpoReceipt>
      } | null
      if (!body?.data) continue
      for (const [id, receipt] of Object.entries(body.data)) {
        out.set(id, receipt)
      }
    } catch (err) {
      console.warn(
        '[push] getReceipts threw',
        err instanceof Error ? err.message : String(err),
      )
    }
  }

  return out
}

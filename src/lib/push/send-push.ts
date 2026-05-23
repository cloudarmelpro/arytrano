import 'server-only'
import { env } from '@/lib/env'

/**
 * Expo Push API client (server-side).
 *
 * Endpoint : `https://exp.host/--/api/v2/push/send` — accepts a JSON
 * body of either a single message OR an array (batched up to 100 per
 * request). We always send an array so the caller doesn't have to
 * special-case the single-recipient path.
 *
 * Auth : optional bearer (`EXPO_ACCESS_TOKEN`). Without it the API
 * works but is rate-limited per source IP. Production should set the
 * token; dev/staging can run anonymous.
 *
 * Failure mode : ALL errors swallow + log. Push delivery is a
 * "best effort enhancement" — never block the user's primary action
 * (contact reveal, listing publish, etc.) because the Expo endpoint
 * is slow or down.
 *
 * Out of scope (next slice) :
 *  - Receipt polling : Expo returns per-message `id` values that can
 *    be polled at `/--/api/v2/push/getReceipts` to confirm delivery.
 *    Useful for cleaning up DeviceNotRegistered errors (uninstalls)
 *    but not critical for v1 — abandoned tokens stay in the DB and
 *    silently fail on push, which is acceptable.
 *  - Retry on 5xx : we drop the message on any non-2xx. If we see
 *    real volume of 5xx we can add an exponential-backoff retry.
 */

export type PushMessage = {
  to: string
  title?: string
  body?: string
  /** Custom payload the mobile client reads in its notification
   *  listener — e.g. `{ kind: 'listingMatch', listingId: '...' }`. */
  data?: Record<string, unknown>
  /** Sound on iOS / channel on Android. 'default' = the system default. */
  sound?: 'default' | null
  /** Android-only : which channel to dispatch under. Matches the channel
   *  the mobile app declared in `expo-notifications` plugin config. */
  channelId?: string
  /** App badge increment for iOS. Skip for Android. */
  badge?: number
  /** Time-to-live in seconds; Expo holds undelivered messages for at
   *  most this long before dropping. */
  ttl?: number
  /** Higher = more important — affects Android delivery on Doze mode. */
  priority?: 'default' | 'normal' | 'high'
}

type ExpoTicket = {
  status: 'ok' | 'error'
  id?: string
  message?: string
  details?: { error?: string }
}

type ExpoResponse = { data: ExpoTicket[] }

const PUSH_ENDPOINT = 'https://exp.host/--/api/v2/push/send'
const BATCH_SIZE = 100

export type SendPushResult = {
  accepted: number
  rejected: number
  /** Per-recipient ticket IDs the caller can persist for the
   *  receipt-poll cron. The `to` token is included so the caller
   *  can look up the user id without re-keying off the message
   *  position in the input array. */
  tickets: Array<{ to: string; ticketId: string }>
}

/**
 * Send a batch of push messages. Splits internally into 100-message
 * chunks (the Expo API hard limit). Returns counts + per-message
 * ticket ids so the caller can persist them for the receipt-poll
 * cron (`/api/cron/push-receipts`).
 *
 * Caller doesn't need to check the return for failures — they're
 * already logged via console.warn. The return is for persisting
 * tickets + telemetry.
 */
export async function sendPush(
  messages: PushMessage[],
): Promise<SendPushResult> {
  if (messages.length === 0) return { accepted: 0, rejected: 0, tickets: [] }

  let accepted = 0
  let rejected = 0
  const tickets: Array<{ to: string; ticketId: string }> = []

  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const batch = messages.slice(i, i + BATCH_SIZE)
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      }
      if (env.EXPO_ACCESS_TOKEN) {
        headers.Authorization = `Bearer ${env.EXPO_ACCESS_TOKEN}`
      }

      const res = await fetch(PUSH_ENDPOINT, {
        method: 'POST',
        headers,
        body: JSON.stringify(batch),
      })

      if (!res.ok) {
        console.warn('[push] expo api non-2xx', res.status)
        rejected += batch.length
        continue
      }

      const body = (await res.json()) as ExpoResponse | null
      if (!body || !Array.isArray(body.data)) {
        console.warn('[push] expo api malformed response')
        rejected += batch.length
        continue
      }

      // Expo returns one ticket per message, in the same order. Pair
      // each with its `to` token so the caller can persist the
      // (userId via lookup, ticketId) tuple.
      body.data.forEach((ticket, idx) => {
        const msg = batch[idx]
        if (ticket.status === 'ok' && ticket.id && msg) {
          accepted++
          tickets.push({ to: msg.to, ticketId: ticket.id })
        } else {
          rejected++
          console.warn(
            '[push] ticket error',
            ticket.message ?? ticket.details?.error ?? 'unknown',
          )
        }
      })
    } catch (err) {
      console.warn('[push] fetch threw', err)
      rejected += batch.length
    }
  }

  return { accepted, rejected, tickets }
}

/**
 * Convenience for the single-recipient case — wraps a one-message
 * call to `sendPush`. Logs the count on success.
 */
export async function sendPushToOne(message: PushMessage): Promise<void> {
  await sendPush([message])
}

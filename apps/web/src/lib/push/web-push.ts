import 'server-only'
import webpush from 'web-push'
import * as Sentry from '@sentry/nextjs'
import { prisma } from '@/lib/db'
import { env } from '@/lib/env'

/**
 * OWN-12 — thin wrapper around web-push. Sends a JSON payload to a
 * single subscription, deletes the row on 410 Gone (the browser has
 * unsubscribed), swallows everything else to Sentry.
 */
let configured = false
function ensureConfigured(): boolean {
  if (configured) return true
  if (!env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) {
    return false
  }
  webpush.setVapidDetails(
    env.VAPID_SUBJECT,
    env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY,
  )
  configured = true
  return true
}

export type PushPayload = {
  title: string
  body: string
  url?: string
  tag?: string
}

export async function sendPushToUser(
  userId: string,
  payload: PushPayload,
): Promise<{ sent: number; removed: number }> {
  if (!ensureConfigured()) return { sent: 0, removed: 0 }

  const subs = await prisma.pushSubscription.findMany({
    where: { userId },
    select: { id: true, endpoint: true, p256dh: true, auth: true },
  })
  if (subs.length === 0) return { sent: 0, removed: 0 }

  let sent = 0
  let removed = 0
  const body = JSON.stringify(payload)

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        body,
      )
      sent += 1
    } catch (err: unknown) {
      // 404 / 410 mean the subscription is dead — clean up.
      const status = (err as { statusCode?: number })?.statusCode ?? 0
      if (status === 404 || status === 410) {
        await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {})
        removed += 1
      } else {
        Sentry.captureException(err, {
          tags: { feature: 'push', step: 'send' },
          extra: { userId, subscriptionId: sub.id },
        })
      }
    }
  }
  return { sent, removed }
}

'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { auth } from '@/features/auth'
import { rateLimiters } from '@/lib/rate-limit'

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  p256dh: z.string().min(10),
  auth: z.string().min(10),
  userAgent: z.string().max(300).optional(),
})

export type SubscribePushActionState = {
  ok: boolean
  message?: string
}

/**
 * OWN-12 — upsert a PushSubscription for the signed-in user. Called
 * from the client after `pushManager.subscribe` resolves.
 */
export async function subscribePushAction(
  input: unknown,
): Promise<SubscribePushActionState> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, message: 'Non authentifié' }
  const parsed = subscribeSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: 'Données invalides' }
  }

  // Fable-audit M3 — rate-limit the upsert so a session can't hammer
  // the table unbounded.
  const rl = await rateLimiters.pushSubscribe(session.user.id)
  if (!rl.success) return { ok: false, message: 'Trop de tentatives.' }

  // Code-review 2026-07-16 — atomic upsert that re-parents.
  //
  // The earlier M3 fix used findUnique → conditional update/create
  // and silently refused when an endpoint belonged to another user
  // (to close what looked like IDOR). That broke shared-machine
  // re-subscription (cybercafé — a core AryTrano use case): user B
  // on the same browser as user A got { ok: true } but the row
  // stayed parented to A, so B's UI showed subscribed while B
  // received nothing and A's notifications kept firing to a browser
  // A no longer used (cross-user leak). The two-step also had a
  // P2002 race on concurrent double-taps.
  //
  // Re-parent threat model: the push endpoint URL is not a secret;
  // the encryption key that lets a server actually deliver payloads
  // is the browser-held private key paired with the p256dh public
  // key. An attacker who submits a victim's endpoint with fake keys
  // can at worst temporarily corrupt the victim's stored keys — the
  // victim's browser will 410/re-subscribe on the next push and
  // heal. They cannot intercept any payload. So possession of the
  // (endpoint, p256dh, auth) tuple from PushManager.subscribe() is
  // the authoritative proof of control. Upsert atomically, keep
  // the rate limit as the abuse ceiling.
  await prisma.pushSubscription.upsert({
    where: { endpoint: parsed.data.endpoint },
    create: {
      userId: session.user.id,
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.p256dh,
      auth: parsed.data.auth,
      userAgent: parsed.data.userAgent ?? null,
    },
    update: {
      userId: session.user.id,
      p256dh: parsed.data.p256dh,
      auth: parsed.data.auth,
      userAgent: parsed.data.userAgent ?? null,
      lastSeenAt: new Date(),
    },
  })
  revalidatePath('/dashboard/notifications')
  return { ok: true }
}

export async function unsubscribePushAction(
  endpoint: string,
): Promise<SubscribePushActionState> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, message: 'Non authentifié' }
  await prisma.pushSubscription.deleteMany({
    where: { endpoint, userId: session.user.id },
  })
  revalidatePath('/dashboard/notifications')
  return { ok: true }
}

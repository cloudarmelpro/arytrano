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

  // Fable-audit M3 — never re-parent an existing subscription to a
  // different user. If a row exists for the endpoint that belongs to
  // someone else, refuse silently (return ok so we don't leak that
  // it exists). Own row → normal upsert; missing row → create.
  const existing = await prisma.pushSubscription.findUnique({
    where: { endpoint: parsed.data.endpoint },
    select: { userId: true, id: true },
  })
  if (existing && existing.userId !== session.user.id) {
    return { ok: true }
  }
  if (existing) {
    await prisma.pushSubscription.update({
      where: { id: existing.id },
      data: {
        p256dh: parsed.data.p256dh,
        auth: parsed.data.auth,
        lastSeenAt: new Date(),
      },
    })
  } else {
    await prisma.pushSubscription.create({
      data: {
        userId: session.user.id,
        endpoint: parsed.data.endpoint,
        p256dh: parsed.data.p256dh,
        auth: parsed.data.auth,
        userAgent: parsed.data.userAgent ?? null,
      },
    })
  }
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

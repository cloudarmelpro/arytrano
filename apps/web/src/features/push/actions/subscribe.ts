'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { auth } from '@/features/auth'

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

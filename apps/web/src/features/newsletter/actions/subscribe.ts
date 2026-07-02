'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { rateLimiters } from '@/lib/rate-limit'
import { extractRequestInfo } from '@/lib/auth/request-info'
import { headers } from 'next/headers'

const subscribeSchema = z.object({
  email: z.string().email(),
  source: z.enum(['popup', 'footer', 'landing']).optional(),
})

export type NewsletterSubscribeState = {
  ok: boolean
  message?: string
}

/**
 * CON-13 — capture a newsletter email. Idempotent per email — a
 * second submission touches nothing but returns success so the
 * front-end never leaks whether the address was already on file.
 */
export async function subscribeNewsletterAction(
  _prev: NewsletterSubscribeState,
  formData: FormData,
): Promise<NewsletterSubscribeState> {
  const parsed = subscribeSchema.safeParse({
    email: formData.get('email'),
    source: formData.get('source') || undefined,
  })
  if (!parsed.success) {
    return { ok: false, message: 'Email invalide.' }
  }

  // Rate-limit by IP so a bot can't stuff the list.
  const h = await headers()
  const { ipHash } = extractRequestInfo(h)
  const rl = await rateLimiters.forgotPassword(parsed.data.email, ipHash ?? 'noip:newsletter')
  if (!rl.success) {
    // Return ok anyway so the response is uniform.
    return { ok: true, message: 'Merci !' }
  }

  const email = parsed.data.email.trim().toLowerCase()
  await prisma.newsletterSubscriber.upsert({
    where: { email },
    create: {
      email,
      source: parsed.data.source ?? 'unspecified',
    },
    update: {
      // Re-subscribing clears any prior unsubscribe.
      unsubscribedAt: null,
    },
  })
  return { ok: true, message: 'Merci ! Tu recevras notre récap mensuel.' }
}

import 'server-only'
import { prisma } from '@/lib/db'
import { env } from '@/lib/env'

export type RecordBounceOutcome =
  | { kind: 'recorded'; userId: string; nowDisabled: boolean }
  | { kind: 'soft_ignored' }
  | { kind: 'no_match' }

/**
 * COM-12 — process a single bounce event from the SMTP provider.
 *
 * `kind === 'hard'` increments the counter; when the counter crosses
 * the configured threshold, set `emailDisabledAt = now()` so future
 * senders short-circuit (sender-reputation protection).
 *
 * `kind === 'soft'` is logged as no-op — providers typically retry on
 * soft bounces and we don't want a transient inbox-full event to
 * disable a real user.
 *
 * Case-insensitive lookup because some providers normalize To: to
 * lowercase, others don't.
 */
export async function recordEmailBounce(input: {
  email: string
  kind: 'hard' | 'soft'
}): Promise<RecordBounceOutcome> {
  if (input.kind === 'soft') return { kind: 'soft_ignored' }
  const normalized = input.email.trim().toLowerCase()
  if (!normalized) return { kind: 'no_match' }

  const user = await prisma.user.findFirst({
    where: { email: { equals: normalized, mode: 'insensitive' } },
    select: { id: true, emailBouncesHard: true, emailDisabledAt: true },
  })
  if (!user) return { kind: 'no_match' }

  const newCount = user.emailBouncesHard + 1
  const shouldDisable =
    !user.emailDisabledAt && newCount >= env.EMAIL_BOUNCE_HARD_THRESHOLD

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailBouncesHard: newCount,
      ...(shouldDisable ? { emailDisabledAt: new Date() } : {}),
    },
  })
  return { kind: 'recorded', userId: user.id, nowDisabled: shouldDisable }
}

/**
 * COM-12 — quick gate consulted by the sender just before fan-out.
 * Returns true when the user has been disabled by the bounce policy
 * and we should silently skip the send.
 */
export async function isEmailDisabled(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase()
  if (!normalized) return false
  const user = await prisma.user.findFirst({
    where: { email: { equals: normalized, mode: 'insensitive' } },
    select: { emailDisabledAt: true },
  })
  return Boolean(user?.emailDisabledAt)
}

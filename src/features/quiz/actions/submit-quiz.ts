'use server'

import { headers } from 'next/headers'
import { prisma } from '@/lib/db'
import { extractRequestInfo } from '@/lib/auth/request-info'
import { rateLimiters } from '@/lib/rate-limit'
import { quizAnswersSchema } from '../schemas/quiz-answer'
import { z } from 'zod'

/**
 * Persist a completed quiz. Anonymous — no auth required. Called by
 * the client wizard right after the user sees their results so we
 * capture submissions even if they bounce before email opt-in.
 *
 * Returns the submission id so the optional email-capture flow can
 * update the same row instead of creating a new one (cleaner data,
 * no duplicate rows per user-session).
 */
const submitSchema = z.object({
  answers: quizAnswersSchema,
  recommendedSlugs: z.array(z.string().min(1).max(64)).min(1).max(8),
})

export async function submitQuizAction(input: {
  answers: unknown
  recommendedSlugs: unknown
}): Promise<{ ok: true; submissionId: string } | { ok: false }> {
  const parsed = submitSchema.safeParse(input)
  if (!parsed.success) return { ok: false }

  const h = await headers()
  const { ipHash } = extractRequestInfo(h)
  const locale = h.get('x-locale') === 'mg' ? 'mg' : 'fr-MG'

  const limit = await rateLimiters.quizSubmit(ipHash)
  if (!limit.success) return { ok: false }

  try {
    const row = await prisma.quizSubmission.create({
      data: {
        locale,
        email: null,
        answers: parsed.data.answers,
        recommendedSlugs: parsed.data.recommendedSlugs,
        ipHash,
      },
      select: { id: true },
    })
    return { ok: true, submissionId: row.id }
  } catch {
    // Best-effort analytics — never break the user's results display
    // because the insert failed. The client ignores the return value
    // in the no-email path; it only matters if email opt-in needs the id.
    return { ok: false }
  }
}

/**
 * Attach an email to a previously-submitted quiz row. Called when the
 * user types an email on the results page and clicks subscribe.
 *
 * Idempotent on the email value but only allowed when the row's email
 * is currently NULL — prevents an attacker who guesses a submission id
 * from overwriting someone else's address.
 */
const subscribeSchema = z.object({
  submissionId: z.string().min(20).max(40), // cuid bounds
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email()
    .max(254),
})

export async function subscribeQuizEmailAction(input: {
  submissionId: unknown
  email: unknown
}): Promise<{ ok: true } | { ok: false; error: 'invalid' | 'rate_limit' | 'unavailable' }> {
  const parsed = subscribeSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'invalid' }

  const h = await headers()
  const { ipHash } = extractRequestInfo(h)

  const limit = await rateLimiters.quizSubmit(ipHash)
  if (!limit.success) return { ok: false, error: 'rate_limit' }

  try {
    // Conditional update: only set email when it's currently null.
    // updateMany lets us express the WHERE clause cleanly; count=0
    // means the row was already claimed (or doesn't exist).
    const result = await prisma.quizSubmission.updateMany({
      where: { id: parsed.data.submissionId, email: null },
      data: { email: parsed.data.email },
    })
    if (result.count === 0) return { ok: false, error: 'unavailable' }
    return { ok: true }
  } catch {
    return { ok: false, error: 'unavailable' }
  }
}

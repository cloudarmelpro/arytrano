'use server'

import { headers } from 'next/headers'
import { ApiError } from '@/lib/api/errors'
import { extractRequestInfo } from '@/lib/auth/request-info'
import { submitQuiz, submitQuizSchema } from '../services/submit-quiz'
import {
  subscribeQuizEmail,
  subscribeQuizEmailSchema,
} from '../services/subscribe-quiz-email'

/**
 * Server-action wrappers — thin transport bindings around the
 * `submitQuiz` + `subscribeQuizEmail` services. Same services power
 * the REST endpoints under `/api/v1/quiz/*`, keeping web + mobile
 * behavior identical.
 *
 * Both actions are anonymous — no auth required. The action layer
 * resolves `ipHash` + `locale` from request headers and forwards them
 * to the service.
 */

export async function submitQuizAction(input: {
  answers: unknown
  recommendedSlugs: unknown
}): Promise<{ ok: true; submissionId: string } | { ok: false }> {
  const parsed = submitQuizSchema.safeParse(input)
  if (!parsed.success) return { ok: false }

  const h = await headers()
  const { ipHash } = extractRequestInfo(h)
  const locale = h.get('x-locale') === 'mg' ? 'mg' : 'fr-MG'

  try {
    const result = await submitQuiz({ data: parsed.data, ipHash, locale })
    return { ok: true, submissionId: result.submissionId }
  } catch (err) {
    // Best-effort analytics — never break the user's results display
    // because the insert failed. Both rate-limit and DB errors land here.
    if (err instanceof ApiError) return { ok: false }
    return { ok: false }
  }
}

export async function subscribeQuizEmailAction(input: {
  submissionId: unknown
  email: unknown
}): Promise<
  { ok: true } | { ok: false; error: 'invalid' | 'rate_limit' | 'unavailable' }
> {
  const parsed = subscribeQuizEmailSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'invalid' }

  const h = await headers()
  const { ipHash } = extractRequestInfo(h)

  try {
    await subscribeQuizEmail({ data: parsed.data, ipHash })
    return { ok: true }
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.code === 'rate_limited') return { ok: false, error: 'rate_limit' }
      return { ok: false, error: 'unavailable' }
    }
    return { ok: false, error: 'unavailable' }
  }
}

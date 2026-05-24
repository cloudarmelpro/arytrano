import 'server-only'
import { ok, withErrorHandling } from '@/lib/api/response'
import { errors } from '@/lib/api/errors'
import { extractRequestInfo } from '@/lib/auth/request-info'
import { submitQuiz, submitQuizSchema } from '../services/submit-quiz'

/**
 * POST /api/v1/quiz/submit — record a completed quartier quiz.
 * Anonymous. Rate-limited via the same `quizSubmit` bucket the web
 * action uses.
 *
 * Anti-scrape : safeParse + generic 400 — never echo Zod field names
 * back to the caller (matches the contact endpoint policy).
 */
export const POST = withErrorHandling(async (req: Request) => {
  const body = (await req.json().catch(() => ({}))) as unknown
  const parsed = submitQuizSchema.safeParse(body)
  if (!parsed.success) {
    throw errors.validation('Invalid quiz submission')
  }
  const { ipHash } = extractRequestInfo(req.headers)
  const locale = req.headers.get('x-locale') === 'mg' ? 'mg' : 'fr-MG'
  const result = await submitQuiz({ data: parsed.data, ipHash, locale })
  return ok(result)
})

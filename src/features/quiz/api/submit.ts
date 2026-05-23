import 'server-only'
import { ok, withErrorHandling } from '@/lib/api/response'
import { extractRequestInfo } from '@/lib/auth/request-info'
import { submitQuiz, submitQuizSchema } from '../services/submit-quiz'

/**
 * POST /api/v1/quiz/submit — record a completed quartier quiz.
 * Anonymous. Rate-limited via the same `quizSubmit` bucket the web
 * action uses.
 */
export const POST = withErrorHandling(async (req: Request) => {
  const body = (await req.json().catch(() => ({}))) as unknown
  const data = submitQuizSchema.parse(body)
  const { ipHash } = extractRequestInfo(req.headers)
  const locale = req.headers.get('x-locale') === 'mg' ? 'mg' : 'fr-MG'
  const result = await submitQuiz({ data, ipHash, locale })
  return ok(result)
})

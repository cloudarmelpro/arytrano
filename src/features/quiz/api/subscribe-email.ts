import 'server-only'
import { ok, withErrorHandling } from '@/lib/api/response'
import { extractRequestInfo } from '@/lib/auth/request-info'
import {
  subscribeQuizEmail,
  subscribeQuizEmailSchema,
} from '../services/subscribe-quiz-email'

/**
 * POST /api/v1/quiz/subscribe-email — attach an email to a quiz row.
 * Anonymous. Rate-limited per IP.
 */
export const POST = withErrorHandling(async (req: Request) => {
  const body = (await req.json().catch(() => ({}))) as unknown
  const data = subscribeQuizEmailSchema.parse(body)
  const { ipHash } = extractRequestInfo(req.headers)
  await subscribeQuizEmail({ data, ipHash })
  return ok({ ok: true })
})

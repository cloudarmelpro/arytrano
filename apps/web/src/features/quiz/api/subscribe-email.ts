import 'server-only'
import { ok, withErrorHandling } from '@/lib/api/response'
import { errors } from '@/lib/api/errors'
import { extractRequestInfo } from '@/lib/auth/request-info'
import {
  subscribeQuizEmail,
  subscribeQuizEmailSchema,
} from '../services/subscribe-quiz-email'

/**
 * POST /api/v1/quiz/subscribe-email — attach an email to a quiz row.
 * Anonymous. Rate-limited per IP.
 *
 * Anti-scrape : safeParse + generic 400 — never echo Zod field names.
 */
export const POST = withErrorHandling(async (req: Request) => {
  const body = (await req.json().catch(() => ({}))) as unknown
  const parsed = subscribeQuizEmailSchema.safeParse(body)
  if (!parsed.success) {
    throw errors.validation('Invalid subscription request')
  }
  const { ipHash } = extractRequestInfo(req.headers)
  await subscribeQuizEmail({ data: parsed.data, ipHash })
  return ok({ ok: true })
})

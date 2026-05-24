import 'server-only'
import { ok, withErrorHandling } from '@/lib/api/response'
import { errors } from '@/lib/api/errors'
import { extractRequestInfo } from '@/lib/auth/request-info'
import {
  subscribeWhatsAppAlert,
  whatsappAlertSchema,
} from '../services/subscribe-whatsapp-alert'

/**
 * POST /api/v1/whatsapp-alerts/subscribe — opt a MG phone into the
 * WhatsApp broadcast list. Anonymous. Idempotent on phone — returns
 * `{ alreadySubscribed }` so the client can tweak the message.
 *
 * Anti-scrape : safeParse + generic 400 — never echo Zod field names.
 */
export const POST = withErrorHandling(async (req: Request) => {
  const body = (await req.json().catch(() => ({}))) as unknown
  const parsed = whatsappAlertSchema.safeParse(body)
  if (!parsed.success) {
    throw errors.validation('Invalid subscription request')
  }
  const { ipHash } = extractRequestInfo(req.headers)
  const locale = req.headers.get('x-locale') === 'mg' ? 'mg' : 'fr-MG'
  const result = await subscribeWhatsAppAlert({
    data: parsed.data,
    ipHash,
    locale,
  })
  return ok(result)
})

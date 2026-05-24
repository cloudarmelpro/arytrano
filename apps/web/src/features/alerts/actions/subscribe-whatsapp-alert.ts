'use server'

import { headers } from 'next/headers'
import { ApiError } from '@/lib/api/errors'
import { extractRequestInfo } from '@/lib/auth/request-info'
import {
  subscribeWhatsAppAlert,
  whatsappAlertSchema,
} from '../services/subscribe-whatsapp-alert'

type ActionResult =
  | { ok: true; alreadySubscribed: boolean }
  | { ok: false; error: 'invalid' | 'rate_limit' | 'unavailable' }

/**
 * Server-action wrapper — thin transport binding around
 * `subscribeWhatsAppAlert`. The same service powers the REST endpoint
 * at POST /api/v1/whatsapp-alerts/subscribe, keeping web + mobile
 * behavior identical.
 *
 * Anonymous — no auth required. Action layer resolves ipHash + locale
 * from request headers and forwards them to the service.
 */
export async function subscribeWhatsAppAlertAction(input: {
  phone: unknown
  quartierSlug?: unknown
}): Promise<ActionResult> {
  const parsed = whatsappAlertSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'invalid' }

  const h = await headers()
  const { ipHash } = extractRequestInfo(h)
  const locale = h.get('x-locale') === 'mg' ? 'mg' : 'fr-MG'

  try {
    const result = await subscribeWhatsAppAlert({
      data: parsed.data,
      ipHash,
      locale,
    })
    return { ok: true, alreadySubscribed: result.alreadySubscribed }
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.code === 'rate_limited') return { ok: false, error: 'rate_limit' }
      return { ok: false, error: 'unavailable' }
    }
    return { ok: false, error: 'unavailable' }
  }
}

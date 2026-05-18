'use server'

import { headers } from 'next/headers'
import { ZodError } from 'zod'
import { ApiError } from '@/lib/api/errors'
import { extractRequestInfo } from '@/lib/auth/request-info'
import { recordContactClick } from '../services/record-contact-click'
import { recordContactClickSchema } from '../schemas/contact'

type RevealContactState = {
  ok: boolean
  message?: string
  phoneE164?: string
  channel?: 'WHATSAPP' | 'PHONE'
  ownerDisplayName?: string
}

/**
 * Reveals the owner's phone to the visitor AND logs a ContactEvent in the
 * same call. Used by the public listing detail page when the visitor clicks
 * WhatsApp or Phone — the click is recorded for analytics (T-019) and the
 * client receives the phone formatted for `wa.me/<x>` or `tel:<x>`.
 */
export async function revealContactAction(
  listingId: string,
  channel: 'WHATSAPP' | 'PHONE',
): Promise<RevealContactState> {
  // Single generic error message returned to ALL failure paths — prevents
  // a scraper from classifying listing IDs by error type (M1 audit finding).
  // Detailed reasons stay server-side via console.warn for debugging.
  const GENERIC_ERROR = 'Impossible de récupérer le contact pour le moment.'

  let input
  try {
    input = recordContactClickSchema.parse({ listingId, channel })
  } catch (err) {
    if (err instanceof ZodError) {
      console.warn('[revealContactAction] validation', { listingId, channel })
      return { ok: false, message: GENERIC_ERROR }
    }
    throw err
  }

  const h = await headers()
  const { ipHash, userAgent } = extractRequestInfo(h)

  try {
    const result = await recordContactClick({
      listingId: input.listingId,
      channel: input.channel,
      ipHash,
      userAgent,
    })
    return {
      ok: true,
      phoneE164: result.phoneE164,
      channel: result.channel,
      ownerDisplayName: result.ownerDisplayName,
    }
  } catch (err) {
    if (err instanceof ApiError) {
      // Log the precise reason server-side (not_found, no_phone, invalid_phone)
      // but ALWAYS return the same generic message to the client.
      console.warn('[revealContactAction]', { code: err.code, listingId: input.listingId })
      return { ok: false, message: GENERIC_ERROR }
    }
    console.error('[revealContactAction]', err)
    return { ok: false, message: GENERIC_ERROR }
  }
}

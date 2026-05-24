import 'server-only'
import { ok, withErrorHandling } from '@/lib/api/response'
import { optionalBearer } from '@/lib/api/bearer'
import { errors } from '@/lib/api/errors'
import { extractRequestInfo } from '@/lib/auth/request-info'
import { contactChannelSchema } from '../schemas/contact'
import { recordContactClick } from '../services/record-contact-click'

/**
 * POST /api/v1/contact/:listingId
 * Body : `{ channel: 'WHATSAPP' | 'PHONE' }`
 *
 * Records a contact event and returns the owner's normalized phone +
 * display name so the mobile client can `Linking.openURL('whatsapp://...')`
 * or `tel:`. Mirrors the web `revealContactAction` exactly — same
 * service, same rate-limit (30/h per (IP, listing)), same anti-scrape
 * generic-error policy.
 *
 * Auth : optional. Signed-in user id is stamped on the ContactEvent so
 * `Review.verifiedStay` can later confirm the reviewer reached out.
 */
export const POST = withErrorHandling(
  async (
    req: Request,
    ctx: { params: Promise<{ listingId: string }> },
  ): Promise<Response> => {
    const { listingId } = await ctx.params
    const payload = await optionalBearer(req)

    const body = (await req.json().catch(() => ({}))) as unknown
    const parsed = contactChannelSchema.safeParse(
      (body as { channel?: unknown })?.channel,
    )
    if (!parsed.success) {
      // Generic 400 — don't echo which field failed (anti-scraping).
      throw errors.validation('Invalid contact request')
    }

    const { ipHash, userAgent } = extractRequestInfo(req.headers)

    const result = await recordContactClick({
      listingId,
      channel: parsed.data,
      ipHash,
      userAgent,
      viewerId: payload?.sub ?? null,
    })

    return ok({
      channel: result.channel,
      phoneE164: result.phoneE164,
      ownerDisplayName: result.ownerDisplayName,
    })
  },
)

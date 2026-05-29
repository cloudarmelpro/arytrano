import 'server-only'
import { ok, withErrorHandling } from '@/lib/api/response'
import { requireOwnerBearer } from '@/lib/api/bearer'
import { errors } from '@/lib/api/errors'
import { rateLimiters } from '@/lib/rate-limit'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'
import { initiateLease } from '../services/initiate-lease'

/**
 * POST /api/v1/leases — owner initiates a lease + signature payment.
 *
 * Request body: same shape as the wizard FormData
 *   { listingId, tenantEmail, monthlyRentMGA, startDate, durationMonths }
 *
 * Response: { leaseId, paymentId, checkoutUrl, expiresInMinutes, fees }
 */
export const POST = withErrorHandling(async (req: Request) => {
  const payload = await requireOwnerBearer(req)
  const t = getT(await getLocale())

  // L5 audit fix — bound DB writes + outbound GoalPay calls per user.
  const rl = await rateLimiters.initiateLease(payload.sub)
  if (!rl.success) throw errors.rateLimited(t('lease.error.rateLimit'))

  // L6 audit fix — reject suspiciously large bodies before JSON.parse.
  // The wizard FormData serialized to JSON fits comfortably in 4 KB.
  const len = Number(req.headers.get('content-length') ?? 0)
  if (len > 16_384) {
    throw errors.validation(t('lease.error.payloadTooLarge'))
  }

  const body = (await req.json()) as unknown
  const result = await initiateLease(payload.sub, body)

  switch (result.kind) {
    case 'ok':
      return ok({
        leaseId: result.leaseId,
        platformFeeMGA: result.platformFeeMGA,
      })
    case 'listing_not_found':
      throw errors.notFound(t('lease.error.listingNotFound'))
    case 'listing_not_owned':
      throw errors.forbidden(t('lease.error.listingNotOwned'))
    case 'listing_not_rentable':
      throw errors.conflict(
        t('lease.error.listingNotRentable', { status: result.currentStatus }),
      )
    case 'tenant_not_found':
      throw errors.notFound(t('lease.error.tenantNotFound'))
    case 'tenant_is_owner':
      throw errors.validation(t('lease.error.tenantIsOwner'), {
        tenantEmail: [t('lease.error.tenantIsOwner')],
      })
    case 'existing_lease':
      throw errors.conflict(
        t('lease.error.existingLease', { status: result.status }),
      )
    case 'validation_failed':
      throw errors.validation(
        t('lease.error.invalidFields'),
        Object.fromEntries(result.issues.map((i) => [i.path, [i.message]])),
      )
  }
})

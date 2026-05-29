import { ok, withErrorHandling } from '@/lib/api/response'
import { requireBearer } from '@/lib/api/bearer'
import { errors } from '@/lib/api/errors'
import { rateLimiters } from '@/lib/rate-limit'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'
import { tenantInitiatePayment } from '@/features/leases/services/tenant-initiate-payment'

type Ctx = { params: Promise<{ id: string }> }

/**
 * POST /api/v1/leases/[id]/sign — tenant accepts the lease and gets
 * the GoalPay checkout URL (revised E-T26, 2026-05-27).
 *
 * In the tenant-pays model the mobile app receives `checkoutUrl` here
 * and opens it in a WebView. After payment success, the GoalPay
 * webhook flips the lease to ACTIVE server-side; the mobile app can
 * refresh /leases/[id] to see the new state.
 */
export const POST = withErrorHandling(async (req: Request, ctx: Ctx) => {
  const payload = await requireBearer(req)
  const { id } = await ctx.params
  const t = getT(await getLocale())

  // SEC-M3 — slowloris / write-amp guard.
  const len = Number(req.headers.get('content-length') ?? 0)
  if (len > 256) {
    throw errors.validation(t('lease.error.payloadTooLarge'))
  }

  // SEC-M2 — bound stolen-bearer enumeration.
  const rl = await rateLimiters.leaseAction(payload.sub)
  if (!rl.success) throw errors.rateLimited(t('lease.error.rateLimit'))

  const result = await tenantInitiatePayment(id, payload.sub)
  switch (result.kind) {
    case 'ok':
      return ok({
        leaseId: result.leaseId,
        paymentId: result.paymentId,
        checkoutUrl: result.checkoutUrl,
        expiresInMinutes: result.expiresInMinutes,
        platformFeeMGA: result.platformFeeMGA,
      })
    case 'already_paid':
      throw errors.conflict(t('lease.error.alreadyPaid'))
    case 'lease_not_found':
      throw errors.notFound(t('lease.error.leaseNotFound'))
    case 'not_tenant':
      throw errors.forbidden(t('lease.error.notTenant'))
    case 'invalid_status':
      throw errors.conflict(
        t('lease.error.cannotPay', { status: result.currentStatus }),
      )
  }
})

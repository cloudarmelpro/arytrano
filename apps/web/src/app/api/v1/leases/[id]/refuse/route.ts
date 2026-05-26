import { ok, withErrorHandling } from '@/lib/api/response'
import { requireBearer } from '@/lib/api/bearer'
import { errors } from '@/lib/api/errors'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'
import { refuseLease } from '@/features/leases/services/refuse-lease'

type Ctx = { params: Promise<{ id: string }> }

/**
 * POST /api/v1/leases/[id]/refuse — tenant refuses the lease.
 * Body: { reason?: string }
 *
 * A4 + L6 audit fixes — standard typed `params` + content-length guard
 * before JSON.parse to bound buffer size.
 */
export const POST = withErrorHandling(async (req: Request, ctx: Ctx) => {
  const payload = await requireBearer(req)
  const { id } = await ctx.params
  const t = getT(await getLocale())

  const len = Number(req.headers.get('content-length') ?? 0)
  if (len > 8192) {
    throw errors.validation(t('lease.error.payloadTooLarge'))
  }

  const body = (await req.json().catch(() => ({}))) as { reason?: unknown }
  const reason =
    typeof body.reason === 'string' ? body.reason.trim().slice(0, 500) : ''
  const result = await refuseLease(id, payload.sub, reason)
  switch (result.kind) {
    case 'ok':
      return ok({
        leaseId: result.leaseId,
        paymentRefundQueued: result.paymentRefundQueued,
      })
    case 'not_found':
      throw errors.notFound(t('lease.error.leaseNotFound'))
    case 'not_tenant':
      throw errors.forbidden(t('lease.error.notTenant'))
    case 'invalid_status':
      throw errors.conflict(
        t('lease.error.cannotRefuse', { status: result.currentStatus }),
      )
  }
})

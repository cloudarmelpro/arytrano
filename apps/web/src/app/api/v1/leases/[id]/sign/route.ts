import { ok, withErrorHandling } from '@/lib/api/response'
import { requireBearer } from '@/lib/api/bearer'
import { errors } from '@/lib/api/errors'
import { rateLimiters } from '@/lib/rate-limit'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'
import { tenantSignLease } from '@/features/leases/services/tenant-sign-lease'

type Ctx = { params: Promise<{ id: string }> }

/**
 * POST /api/v1/leases/[id]/sign — tenant accepts the lease.
 * A4 audit fix — uses Next 16's standard typed `params` instead of
 * URL.pathname segment parsing.
 *
 * SEC-M2 + SEC-M3 audit fixes — rate-limit + reject any non-empty body
 * (the sign endpoint takes no payload, only the [id] param).
 */
export const POST = withErrorHandling(async (req: Request, ctx: Ctx) => {
  const payload = await requireBearer(req)
  const { id } = await ctx.params
  const t = getT(await getLocale())

  // SEC-M3 — slowloris / write-amp guard. The sign endpoint expects no
  // body; anything substantial is suspicious.
  const len = Number(req.headers.get('content-length') ?? 0)
  if (len > 256) {
    throw errors.validation(t('lease.error.payloadTooLarge'))
  }

  // SEC-M2 — bound stolen-bearer enumeration.
  const rl = await rateLimiters.leaseAction(payload.sub)
  if (!rl.success) throw errors.rateLimited(t('lease.error.rateLimit'))

  const result = await tenantSignLease(id, payload.sub)
  switch (result.kind) {
    case 'ok':
      return ok({ leaseId: result.leaseId })
    case 'not_found':
      throw errors.notFound(t('lease.error.leaseNotFound'))
    case 'not_tenant':
      throw errors.forbidden(t('lease.error.notTenant'))
    case 'invalid_status':
      throw errors.conflict(
        t('lease.error.cannotSign', { status: result.currentStatus }),
      )
  }
})

import { ok, withErrorHandling } from '@/lib/api/response'
import { requireBearer } from '@/lib/api/bearer'
import { errors } from '@/lib/api/errors'
import { getLeaseById } from '@/features/leases/queries/get-lease-by-id'

type Ctx = { params: Promise<{ id: string }> }

/**
 * GET /api/v1/leases/[id] — detail view of a single lease.
 * Next 16 App Router passes typed `params` as a Promise.
 */
export const GET = withErrorHandling(async (req: Request, ctx: Ctx) => {
  const payload = await requireBearer(req)
  const { id } = await ctx.params
  const lease = await getLeaseById(id, payload.sub)
  if (!lease) throw errors.notFound('Bail introuvable')
  return ok(lease)
})

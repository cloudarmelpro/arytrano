import 'server-only'
import { ok, withErrorHandling } from '@/lib/api/response'
import { requireBearer } from '@/lib/api/bearer'
import { errors } from '@/lib/api/errors'
import { getListingStats } from '../queries/get-listing-stats'

/**
 * GET /api/v1/listings/:id/stats — owner-only stats for one listing.
 *
 * Ownership check happens at the DB layer via `findFirst({ id, ownerId })`
 * — a non-owner cannot distinguish "doesn't exist" from "not mine" because
 * both return 404. Defense-in-depth on top of `requireBearer`.
 */
export const GET = withErrorHandling(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const payload = await requireBearer(req)
    const { id } = await ctx.params
    const stats = await getListingStats(id, payload.sub)
    if (!stats) {
      throw errors.notFound('Listing not found')
    }
    return ok(stats)
  },
)

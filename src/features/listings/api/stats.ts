import 'server-only'
import { ok, withErrorHandling } from '@/lib/api/response'
import { requireBearer } from '@/lib/api/bearer'
import { errors } from '@/lib/api/errors'
import { rateLimiters } from '@/lib/rate-limit'
import { getListingStats } from '../queries/get-listing-stats'

const listingIdRegex = /^[a-z0-9]{20,40}$/

/**
 * GET /api/v1/listings/:id/stats — owner-only stats for one listing.
 *
 * Ownership check happens at the DB layer via `findFirst({ id, ownerId })`
 * — a non-owner cannot distinguish "doesn't exist" from "not mine" because
 * both return 404. Defense-in-depth on top of `requireBearer`.
 *
 * Rate-limited 60/min/userId — bounds a compromised or scraping bearer
 * from enumerating listing ids cheaply.
 */
export const GET = withErrorHandling(
  async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const payload = await requireBearer(req)
    const rl = await rateLimiters.listingStats(payload.sub)
    if (!rl.success) {
      throw errors.rateLimited('Too many requests')
    }
    const { id } = await ctx.params
    // Anti-enumeration : a malformed id (random short string) should
    // 404 before we round-trip to Prisma. Same shape guard as the
    // reviews handlers — consistency across the v1 surface.
    if (!listingIdRegex.test(id)) {
      throw errors.notFound('Listing not found')
    }
    const stats = await getListingStats(id, payload.sub)
    if (!stats) {
      throw errors.notFound('Listing not found')
    }
    return ok(stats)
  },
)

import 'server-only'
import { ok, withErrorHandling } from '@/lib/api/response'
import { errors } from '@/lib/api/errors'
import { getPublicListingById } from '../queries/get-public-listing'

const listingIdRegex = /^[a-z0-9]{20,40}$/

/**
 * GET /api/v1/listings/:id/public — anonymous-friendly listing detail.
 *
 * Returns the public projection (no owner email/phone, no DRAFT/UNAVAILABLE)
 * by listing id. Mobile clients hit this when the user taps a card in
 * the home grid — they have the id from the list response but not the
 * (citySlug, neighborhoodSlug, slug) triple.
 *
 * The sibling endpoint at `/api/v1/listings/:id` is owner-only — kept
 * separate so the shapes stay distinct (public has no PII, owner has
 * full edit fields).
 */
export const GET = withErrorHandling(
  async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params
    if (!listingIdRegex.test(id)) {
      throw errors.notFound('Listing not found')
    }
    const listing = await getPublicListingById(id)
    if (!listing) {
      throw errors.notFound('Listing not found')
    }
    return ok(listing)
  },
)

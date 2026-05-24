import 'server-only'
import { ok, withErrorHandling } from '@/lib/api/response'
import { errors } from '@/lib/api/errors'
import { assertCuidShape } from '@/lib/api/id-regex'
import { getPublicListingById } from '../queries/get-public-listing'

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
    assertCuidShape(id, 'Listing not found')
    const listing = await getPublicListingById(id)
    if (!listing) {
      throw errors.notFound('Listing not found')
    }
    // Security P1-3 : strip `ownerId` for the anonymous mobile
    // endpoint. It's used by the web detail page (Server Component
    // with session context) to gate owner-only UI, but the mobile
    // /public path never reads it — exposing it lets a scraper
    // build an owner→listing graph (fanout for harassment, etc.).
    const { ownerId, ...publicProjection } = listing
    void ownerId
    return ok(publicProjection)
  },
)

import 'server-only'
import { ok, withErrorHandling } from '@/lib/api/response'
import { listListingReviews } from '../queries/list-listing-reviews'

/**
 * GET /api/v1/listings/:id/reviews?cursor=<id> — paginated, public.
 * No auth required (reviews are public content like the listing itself).
 */
export function makeListReviewsHandler() {
  return withErrorHandling(
    async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
      const { id } = await ctx.params
      const url = new URL(req.url)
      const cursor = url.searchParams.get('cursor') ?? undefined
      const page = await listListingReviews(id, cursor)
      return ok(page.items, {
        meta: { nextCursor: page.nextCursor, hasMore: page.hasMore },
      })
    },
  )
}

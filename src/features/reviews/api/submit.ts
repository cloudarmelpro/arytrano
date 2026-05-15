import 'server-only'
import { created, withErrorHandling } from '@/lib/api/response'
import { requireBearer } from '@/lib/api/bearer'
import { createReviewSchema } from '../schemas/create-review'
import { createReview } from '../services/create-review'

/**
 * POST /api/v1/listings/:id/reviews — mobile clients.
 * Body: `{ rating: 1..5, body: string }` (listingId comes from the route).
 */
export function makeSubmitReviewHandler() {
  return withErrorHandling(
    async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
      const payload = await requireBearer(req)
      const { id } = await ctx.params
      const body = await req.json()
      const input = createReviewSchema.parse({ ...body, listingId: id })
      const review = await createReview({
        authorId: payload.sub,
        data: input,
      })
      return created({ id: review.id, rating: review.rating, createdAt: review.createdAt })
    },
  )
}

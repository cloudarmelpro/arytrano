import 'server-only'
import { created, withErrorHandling } from '@/lib/api/response'
import { requireBearer } from '@/lib/api/bearer'
import { errors } from '@/lib/api/errors'
import { rateLimiters } from '@/lib/rate-limit'
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

      // Security audit H-1 (2026-05-29) — shared rate-limit bucket with
      // the Server Action so a spammer can't fan-out across transports.
      const rl = await rateLimiters.reviewSubmit(payload.sub)
      if (!rl.success) throw errors.rateLimited('Trop d’avis publiés récemment.')

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

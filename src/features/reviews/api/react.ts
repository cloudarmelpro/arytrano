import 'server-only'
import { ok, withErrorHandling } from '@/lib/api/response'
import { requireBearer } from '@/lib/api/bearer'
import { errors } from '@/lib/api/errors'
import { reactToReviewSchema } from '../schemas/react-review'
import { reactToReview } from '../services/react-to-review'

const reviewIdRegex = /^[a-z0-9]{20,40}$/

/**
 * POST /api/v1/reviews/:id/react — mobile clients.
 * Body: `{ kind: 'LIKE' | 'DISLIKE' | null }`. `null` removes the reaction.
 * Returns the fresh `{ likes, dislikes, mine }` snapshot so the client can
 * update its UI without an extra query.
 */
export function makeReactToReviewHandler() {
  return withErrorHandling(
    async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
      const payload = await requireBearer(req)
      const { id } = await ctx.params
      if (!reviewIdRegex.test(id)) throw errors.validation('ID invalide')
      const body = await req.json()
      const input = reactToReviewSchema.parse({ ...body, reviewId: id })
      const state = await reactToReview({
        userId: payload.sub,
        reviewId: input.reviewId,
        kind: input.kind,
      })
      return ok(state)
    },
  )
}

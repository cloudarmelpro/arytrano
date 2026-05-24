import 'server-only'
import { ok, withErrorHandling } from '@/lib/api/response'
import { requireBearer } from '@/lib/api/bearer'
import { errors } from '@/lib/api/errors'
import { updateReviewSchema } from '../schemas/create-review'
import { updateReview } from '../services/update-review'
import { deleteReview } from '../services/delete-review'

const reviewIdRegex = /^[a-z0-9]{20,40}$/

/**
 * PATCH /api/v1/reviews/:id — author edits their review.
 * Body: `{ rating, body }`. Throws 404 if review missing OR not owned.
 */
export function makeUpdateReviewHandler() {
  return withErrorHandling(
    async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
      const payload = await requireBearer(req)
      const { id } = await ctx.params
      if (!reviewIdRegex.test(id)) throw errors.validation('ID invalide')
      const body = await req.json()
      const input = updateReviewSchema.parse({ ...body, reviewId: id })
      const review = await updateReview({ authorId: payload.sub, data: input })
      return ok({ id: review.id, rating: review.rating, updatedAt: review.updatedAt })
    },
  )
}

/**
 * DELETE /api/v1/reviews/:id — author deletes (soft) their review.
 * Throws 404 if review missing OR not owned. Returns 204-ish empty data.
 */
export function makeDeleteReviewHandler() {
  return withErrorHandling(
    async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
      const payload = await requireBearer(req)
      const { id } = await ctx.params
      if (!reviewIdRegex.test(id)) throw errors.validation('ID invalide')
      await deleteReview({ authorId: payload.sub, reviewId: id })
      return ok({ deleted: true })
    },
  )
}

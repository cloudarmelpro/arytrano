import 'server-only'
import { ok, withErrorHandling } from '@/lib/api/response'
import { requireBearer } from '@/lib/api/bearer'
import { assertCuidShape } from '@/lib/api/id-regex'
import { respondToReviewSchema } from '../schemas/create-review'
import { respondToReview } from '../services/respond-to-review'
import { deleteOwnerResponse } from '../services/delete-owner-response'

/**
 * POST /api/v1/reviews/:id/response — listing owner posts (or updates)
 * their public reply to a review. Idempotent — the service upserts the
 * `Review.ownerResponse` column. Ownership is verified at the DB layer
 * via `listing.ownerId` match — a non-owner gets 404 (not 403) to
 * avoid disclosing which review IDs exist (anti-leak).
 */
export function makeRespondHandler() {
  return withErrorHandling(
    async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
      const payload = await requireBearer(req)
      const { id } = await ctx.params
      assertCuidShape(id, 'Review not found')
      const body = (await req.json().catch(() => ({}))) as { body?: string }
      const input = respondToReviewSchema.parse({ reviewId: id, body: body.body })
      await respondToReview({ ownerId: payload.sub, data: input })
      return ok({ ok: true })
    },
  )
}

/**
 * DELETE /api/v1/reviews/:id/response — listing owner removes their
 * public reply. Same 404-on-non-owner shape as POST.
 */
export function makeDeleteResponseHandler() {
  return withErrorHandling(
    async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
      const payload = await requireBearer(req)
      const { id } = await ctx.params
      assertCuidShape(id, 'Review not found')
      await deleteOwnerResponse({ ownerId: payload.sub, reviewId: id })
      return ok({ deleted: true })
    },
  )
}

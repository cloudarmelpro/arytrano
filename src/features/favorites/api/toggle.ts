import 'server-only'
import { ok, withErrorHandling } from '@/lib/api/response'
import { requireBearer } from '@/lib/api/bearer'
import { toggleFavorite } from '../services/toggle-favorite'
import { toggleFavoriteSchema } from '../schemas/toggle-favorite'

/**
 * POST /api/v1/favorites — toggle a listing favorite for the authenticated user.
 * Body: `{ listingId: string }`. Returns `{ data: { favorited: boolean } }`.
 *
 * Idempotent: calling twice toggles back. Mobile clients can also call
 * `DELETE /api/v1/favorites/:listingId` if they prefer explicit semantics
 * — see `delete.ts`.
 */
export const POST = withErrorHandling(async (req: Request) => {
  const payload = await requireBearer(req)
  const body = await req.json()
  const input = toggleFavoriteSchema.parse(body)
  const result = await toggleFavorite({ userId: payload.sub, listingId: input.listingId })
  return ok(result)
})

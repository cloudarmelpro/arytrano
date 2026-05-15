import 'server-only'
import { ok, withErrorHandling } from '@/lib/api/response'
import { requireBearer } from '@/lib/api/bearer'
import { listUserFavorites } from '../queries/list-user-favorites'

/**
 * GET /api/v1/favorites?cursor=<listingId> — paginated list of the
 * authenticated user's favorited listings, newest-first.
 */
export const GET = withErrorHandling(async (req: Request) => {
  const payload = await requireBearer(req)
  const url = new URL(req.url)
  const cursor = url.searchParams.get('cursor') ?? undefined
  const page = await listUserFavorites(payload.sub, cursor ?? undefined)
  return ok(page.items, {
    meta: { nextCursor: page.nextCursor, hasMore: page.hasMore },
  })
})

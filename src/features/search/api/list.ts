import 'server-only'
import { ok, withErrorHandling } from '@/lib/api/response'
import { requireBearer } from '@/lib/api/bearer'
import { listUserSavedSearches } from '../services/saved-search'

/**
 * GET /api/v1/users/me/saved-searches — bearer user's saved searches,
 * newest-first. Returns the same JSON-validated rows the dashboard
 * page renders, so the mobile client gets the exact same shape as
 * /dashboard/saved-searches.
 */
export const GET = withErrorHandling(async (req: Request) => {
  const payload = await requireBearer(req)
  const rows = await listUserSavedSearches(payload.sub)
  return ok(rows)
})

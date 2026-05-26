import 'server-only'
import { ok, withErrorHandling } from '@/lib/api/response'
import { requireBearer } from '@/lib/api/bearer'
import { listUserLeases } from '../queries/list-user-leases'

/**
 * GET /api/v1/leases — list leases where the caller is owner or tenant.
 * Mirrors the dashboard `/dashboard/leases` page surface, served as JSON.
 */
export const GET = withErrorHandling(async (req: Request) => {
  const payload = await requireBearer(req)
  const leases = await listUserLeases(payload.sub)
  return ok(leases)
})

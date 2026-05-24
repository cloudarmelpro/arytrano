import 'server-only'
import { ok, withErrorHandling } from '@/lib/api/response'
import { requireBearer } from '@/lib/api/bearer'
import { listConnections } from '../services/connections'

/** GET /api/v1/users/me/connections — mobile */
export const GET = withErrorHandling(async (req: Request) => {
  const payload = await requireBearer(req)
  const connections = await listConnections(payload.sub)
  return ok(connections)
})

import 'server-only'
import { ok, withErrorHandling } from '@/lib/api/response'
import { requireBearer } from '@/lib/api/bearer'
import { listLoginEvents } from '../services/list-login-events'
import { listLoginEventsQuerySchema } from '../schemas'

/** GET /api/v1/users/me/login-events?limit=10 — mobile */
export const GET = withErrorHandling(async (req: Request) => {
  const payload = await requireBearer(req)
  const url = new URL(req.url)
  const { limit } = listLoginEventsQuerySchema.parse({
    limit: url.searchParams.get('limit') ?? undefined,
  })
  const events = await listLoginEvents(payload.sub, limit)
  return ok(events)
})

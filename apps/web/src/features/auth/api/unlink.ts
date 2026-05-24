import 'server-only'
import { ok, withErrorHandling } from '@/lib/api/response'
import { requireBearer } from '@/lib/api/bearer'
import { unlinkOAuth } from '../services/unlink-oauth'

/** DELETE /api/v1/users/me/connections/[provider] — mobile */
export function makeUnlinkHandler(provider: string) {
  return withErrorHandling(async (req: Request) => {
    const payload = await requireBearer(req)
    await unlinkOAuth(payload.sub, provider)
    return ok({ unlinked: provider })
  })
}

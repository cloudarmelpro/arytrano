import 'server-only'
import { ok, withErrorHandling } from '@/lib/api/response'
import { refreshTokens } from '../services/refresh-tokens'
import { refreshSchema } from '../schemas'

/** POST /api/v1/auth/refresh — mobile */
export const POST = withErrorHandling(async (req: Request) => {
  const body = await req.json()
  const { refreshToken } = refreshSchema.parse(body)

  const tokens = await refreshTokens(refreshToken)
  return ok({ tokens })
})

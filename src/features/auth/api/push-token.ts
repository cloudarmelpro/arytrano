import 'server-only'
import { z } from 'zod'
import { ok, withErrorHandling } from '@/lib/api/response'
import { requireBearer } from '@/lib/api/bearer'
import { errors } from '@/lib/api/errors'
import {
  clearExpoPushToken,
  setExpoPushToken,
} from '../services/push-token'

const tokenBodySchema = z.object({
  token: z.string().min(20).max(200),
})

/**
 * POST /api/v1/users/me/push-token
 * Body : `{ token: 'ExponentPushToken[...]' }`
 *
 * Stores (or rotates) the bearer user's Expo push token. Idempotent
 * on the same token value — repeat calls are no-ops.
 */
export const POST = withErrorHandling(async (req: Request) => {
  const payload = await requireBearer(req)
  const body = (await req.json().catch(() => ({}))) as unknown
  const parsed = tokenBodySchema.safeParse(body)
  if (!parsed.success) {
    throw errors.validation('Invalid push token payload')
  }
  await setExpoPushToken(payload.sub, parsed.data.token)
  return ok({ registered: true })
})

/**
 * DELETE /api/v1/users/me/push-token
 *
 * Clears the bearer user's push token. Called on logout so the
 * server-side notification fanout doesn't keep pinging a device
 * the user explicitly signed out of.
 */
export const DELETE = withErrorHandling(async (req: Request) => {
  const payload = await requireBearer(req)
  await clearExpoPushToken(payload.sub)
  return ok({ cleared: true })
})

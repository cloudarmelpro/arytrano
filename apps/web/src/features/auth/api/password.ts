import 'server-only'
import { ok, withErrorHandling } from '@/lib/api/response'
import { requireBearer } from '@/lib/api/bearer'
import { setPassword, changePassword } from '../services/set-password'
import { setPasswordSchema, changePasswordSchema } from '../schemas'

/** POST /api/v1/users/me/password — set (OAuth-only user adding a password) */
export const POST = withErrorHandling(async (req: Request) => {
  const payload = await requireBearer(req)
  const body = await req.json()
  const { password } = setPasswordSchema.parse(body)
  await setPassword(payload.sub, password)
  return ok({ updated: true })
})

/** PATCH /api/v1/users/me/password — change existing password */
export const PATCH = withErrorHandling(async (req: Request) => {
  const payload = await requireBearer(req)
  const body = await req.json()
  const input = changePasswordSchema.parse(body)
  await changePassword(payload.sub, input)
  return ok({ updated: true })
})

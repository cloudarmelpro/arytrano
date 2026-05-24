import 'server-only'
import { ok, withErrorHandling } from '@/lib/api/response'
import { requireBearer } from '@/lib/api/bearer'
import { getProfile, updateProfile } from '../services/update-profile'
import { updateProfileSchema } from '../schemas'

/** GET /api/v1/users/me — mobile */
export const GET = withErrorHandling(async (req: Request) => {
  const payload = await requireBearer(req)
  const profile = await getProfile(payload.sub)
  return ok(profile)
})

/** PATCH /api/v1/users/me — mobile */
export const PATCH = withErrorHandling(async (req: Request) => {
  const payload = await requireBearer(req)
  const body = await req.json()
  const input = updateProfileSchema.parse(body)
  const profile = await updateProfile(payload.sub, input)
  return ok(profile)
})

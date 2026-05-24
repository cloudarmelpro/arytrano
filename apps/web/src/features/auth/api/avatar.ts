import 'server-only'
import { ok, withErrorHandling } from '@/lib/api/response'
import { errors } from '@/lib/api/errors'
import { requireBearer } from '@/lib/api/bearer'
import { updateAvatar, removeAvatar } from '../services/update-avatar'

/** POST /api/v1/users/me/avatar — multipart/form-data with field "avatar" */
export const POST = withErrorHandling(async (req: Request) => {
  const payload = await requireBearer(req)
  const formData = await req.formData()
  const file = formData.get('avatar')
  if (!(file instanceof File) || file.size === 0) {
    throw errors.validation('Champ "avatar" manquant ou vide')
  }
  const { url } = await updateAvatar(payload.sub, file)
  return ok({ url })
})

/** DELETE /api/v1/users/me/avatar */
export const DELETE = withErrorHandling(async (req: Request) => {
  const payload = await requireBearer(req)
  await removeAvatar(payload.sub)
  return ok({ removed: true })
})

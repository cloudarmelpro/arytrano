import 'server-only'
import { ok, withErrorHandling } from '@/lib/api/response'
import { requireBearer } from '@/lib/api/bearer'
import { deleteAccount } from '../services/delete-account'
import { deleteAccountSchema } from '../schemas'

/** DELETE /api/v1/users/me — soft-delete current user. Body: { confirm: "SUPPRIMER" } */
export const DELETE = withErrorHandling(async (req: Request) => {
  const payload = await requireBearer(req)
  const body = await req.json()
  deleteAccountSchema.parse(body)
  await deleteAccount(payload.sub)
  return ok({ deleted: true })
})

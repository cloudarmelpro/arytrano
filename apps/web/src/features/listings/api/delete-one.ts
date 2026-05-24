import 'server-only'
import { ok, withErrorHandling } from '@/lib/api/response'
import { requireOwnerBearer } from '@/lib/api/bearer'
import { deleteListing } from '../services/delete-listing'
import { listingIdSchema } from '../schemas'

/** DELETE /api/v1/listings/[id] — soft-delete owner's listing */
export function makeDeleteHandler(id: string) {
  return withErrorHandling(async (req: Request) => {
    const payload = await requireOwnerBearer(req)
    const listingId = listingIdSchema.parse(id)
    await deleteListing(payload.sub, listingId)
    return ok({ deleted: true })
  })
}

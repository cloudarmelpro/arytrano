import 'server-only'
import { ok, withErrorHandling } from '@/lib/api/response'
import { requireBearer } from '@/lib/api/bearer'
import { getOwnerListing } from '../queries/get-owner-listing'
import { listingIdSchema } from '../schemas'

/** GET /api/v1/listings/[id] — owner accessing their own listing */
export function makeGetOneHandler(id: string) {
  return withErrorHandling(async (req: Request) => {
    const payload = await requireBearer(req)
    const listingId = listingIdSchema.parse(id)
    const listing = await getOwnerListing(payload.sub, listingId)
    return ok(listing)
  })
}

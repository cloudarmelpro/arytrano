import 'server-only'
import { ok, withErrorHandling } from '@/lib/api/response'
import { requireOwnerBearer } from '@/lib/api/bearer'
import { updateListing } from '../services/update-listing'
import { updateListingSchema, listingIdSchema } from '../schemas'

/** PATCH /api/v1/listings/[id] — owner updates fields */
export function makeUpdateHandler(id: string) {
  return withErrorHandling(async (req: Request) => {
    const payload = await requireOwnerBearer(req)
    const listingId = listingIdSchema.parse(id)
    const body = await req.json()
    const input = updateListingSchema.parse(body)
    const listing = await updateListing(payload.sub, listingId, input)
    return ok({
      id: listing.id,
      slug: listing.slug,
      status: listing.status,
      updatedAt: listing.updatedAt,
    })
  })
}

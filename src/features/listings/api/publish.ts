import 'server-only'
import { ok, withErrorHandling } from '@/lib/api/response'
import { requireOwnerBearer } from '@/lib/api/bearer'
import { publishListing } from '../services/publish-listing'
import { toggleListingAvailability } from '../services/toggle-availability'
import { listingIdSchema } from '../schemas'

/** POST /api/v1/listings/[id]/publish — DRAFT → PUBLISHED */
export function makePublishHandler(id: string) {
  return withErrorHandling(async (req: Request) => {
    const payload = await requireOwnerBearer(req)
    const listingId = listingIdSchema.parse(id)
    const listing = await publishListing(payload.sub, listingId)
    return ok({ id: listing.id, status: listing.status, publishedAt: listing.publishedAt })
  })
}

/** POST /api/v1/listings/[id]/availability — PUBLISHED ↔ UNAVAILABLE */
export function makeAvailabilityHandler(id: string) {
  return withErrorHandling(async (req: Request) => {
    const payload = await requireOwnerBearer(req)
    const listingId = listingIdSchema.parse(id)
    const listing = await toggleListingAvailability(payload.sub, listingId)
    return ok({ id: listing.id, status: listing.status })
  })
}

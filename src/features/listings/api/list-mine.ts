import 'server-only'
import { ok, withErrorHandling } from '@/lib/api/response'
import { requireBearer } from '@/lib/api/bearer'
import { listOwnerListings } from '../queries/list-owner-listings'

/** GET /api/v1/listings/me — owner's listings */
export const GET = withErrorHandling(async (req: Request) => {
  const payload = await requireBearer(req)
  const listings = await listOwnerListings(payload.sub)
  return ok(listings)
})

import 'server-only'
import { created, withErrorHandling } from '@/lib/api/response'
import { requireOwnerBearer } from '@/lib/api/bearer'
import { errors } from '@/lib/api/errors'
import { rateLimiters } from '@/lib/rate-limit'
import { createListing } from '../services/create-listing'
import { createListingSchema } from '../schemas'

/** POST /api/v1/listings — owner creates a DRAFT */
export const POST = withErrorHandling(async (req: Request) => {
  const payload = await requireOwnerBearer(req)
  const rl = await rateLimiters.createListing(payload.sub)
  if (!rl.success) {
    throw errors.rateLimited('Trop de brouillons créés. Réessaie dans une heure.')
  }
  const body = await req.json()
  const input = createListingSchema.parse(body)
  const listing = await createListing(payload.sub, input)
  return created({ id: listing.id, slug: listing.slug, status: listing.status })
})

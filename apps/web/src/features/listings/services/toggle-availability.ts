import 'server-only'
import type { Listing } from '@prisma/client'
import { prisma } from '@/lib/db'
import { errors } from '@/lib/api/errors'
import { ownerTermsAcceptedFor } from '@/features/auth/server'

/**
 * Toggle between PUBLISHED and UNAVAILABLE for a listing.
 * Only valid from those two states (DRAFT must be published first;
 * SUSPENDED is admin-only; DELETED is terminal).
 */
export async function toggleListingAvailability(
  ownerId: string,
  listingId: string,
): Promise<Listing> {
  // Audit Archi H-1 (2026-05-29) — Owner Terms gate.
  if (!(await ownerTermsAcceptedFor(ownerId))) {
    throw errors.conflict(
      'Tu dois accepter les Conditions d’utilisation Propriétaire avant de gérer ta disponibilité.',
    )
  }

  const listing = await prisma.listing.findFirst({
    where: { id: listingId, ownerId, status: { not: 'DELETED' } },
    select: { id: true, status: true },
  })
  if (!listing) throw errors.notFound('Annonce introuvable')

  if (listing.status === 'DRAFT') {
    throw errors.validation('Publie d\'abord ton annonce avant de gérer sa disponibilité')
  }
  if (listing.status === 'SUSPENDED') {
    throw errors.forbidden('Annonce suspendue par la modération')
  }

  const next = listing.status === 'PUBLISHED' ? 'UNAVAILABLE' : 'PUBLISHED'
  return prisma.listing.update({
    where: { id: listing.id },
    data: { status: next },
  })
}

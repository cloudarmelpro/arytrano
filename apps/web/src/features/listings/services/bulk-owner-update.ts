import 'server-only'
import { prisma } from '@/lib/db'
import { errors } from '@/lib/api/errors'
import { ownerTermsAcceptedFor } from '@/features/auth/server'

export type BulkOwnerAction =
  | { kind: 'price-delta'; percent: number }
  | { kind: 'set-unavailable'; reason: 'RENTED_VIA_ARYTRANO' | 'RENTED_OFF_PLATFORM' | 'TAKING_A_BREAK' | 'OTHER' }
  | { kind: 'republish' }

export type BulkResult = {
  scanned: number
  succeeded: number
  failed: number
}

/**
 * OWN-05 — bulk edit across the owner's listings. Three kinds today:
 *  - price-delta : bump every selected listing's price by ±N%.
 *  - set-unavailable : flip PUBLISHED → UNAVAILABLE with a shared reason.
 *  - republish : UNAVAILABLE → PUBLISHED for the batch (idempotent).
 *
 * All operations are ownership-scoped: findFirst({ ownerId }) means a
 * cross-owner id in the batch is silently dropped rather than erroring.
 */
export async function bulkOwnerUpdateListings(
  ownerId: string,
  listingIds: string[],
  action: BulkOwnerAction,
): Promise<BulkResult> {
  if (!(await ownerTermsAcceptedFor(ownerId))) {
    throw errors.conflict(
      'Tu dois accepter les Conditions d’utilisation Propriétaire avant de faire des modifications en masse.',
    )
  }

  const ids = Array.from(new Set(listingIds)).slice(0, 50)
  const owned = await prisma.listing.findMany({
    where: { id: { in: ids }, ownerId, status: { not: 'DELETED' } },
    select: { id: true, status: true, priceMonthlyMGA: true },
  })

  let succeeded = 0
  let failed = 0

  for (const l of owned) {
    try {
      if (action.kind === 'price-delta') {
        const factor = 1 + action.percent / 100
        const next = Math.max(1, Math.round(l.priceMonthlyMGA * factor))
        await prisma.listing.update({
          where: { id: l.id },
          data: { priceMonthlyMGA: next },
        })
      } else if (action.kind === 'set-unavailable' && l.status === 'PUBLISHED') {
        await prisma.listing.update({
          where: { id: l.id },
          data: {
            status: 'UNAVAILABLE',
            unavailableReason: action.reason,
            unavailableReasonAt: new Date(),
          },
        })
      } else if (action.kind === 'republish' && l.status === 'UNAVAILABLE') {
        await prisma.listing.update({
          where: { id: l.id },
          data: {
            status: 'PUBLISHED',
            unavailableReason: null,
            unavailableReasonAt: null,
          },
        })
      } else {
        // Skip rows the action doesn't apply to (e.g. republish a
        // PUBLISHED listing) without counting them as failures.
        continue
      }
      succeeded += 1
    } catch {
      failed += 1
    }
  }

  return { scanned: owned.length, succeeded, failed }
}

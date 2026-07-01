import 'server-only'
import { prisma } from '@/lib/db'
import { verifyListing, unverifyListing } from './verify-listing'
import { suspendListing } from './suspend-listing'

export type BulkAction = 'verify' | 'unverify' | 'suspend'

export type BulkModerateResult = {
  processed: number
  succeeded: number
  failed: number
}

/**
 * ADM-02 — apply the same moderation action to a batch of listing
 * ids. Runs sequentially per-listing so a mid-run failure doesn't
 * abort the rest (each row's outcome is independent). Callers are
 * expected to have run requireAdmin() BEFORE this service.
 */
export async function bulkModerateListings(input: {
  adminId: string
  listingIds: string[]
  action: BulkAction
  reason?: string
}): Promise<BulkModerateResult> {
  let succeeded = 0
  let failed = 0
  const ids = Array.from(new Set(input.listingIds)).slice(0, 100)

  for (const id of ids) {
    try {
      if (input.action === 'verify') {
        await verifyListing(input.adminId, id)
      } else if (input.action === 'unverify') {
        await unverifyListing(input.adminId, id)
      } else if (input.action === 'suspend') {
        await suspendListing(input.adminId, {
          listingId: id,
          reason: (input.reason ?? '').trim() || 'Bulk moderation',
        })
      }
      succeeded += 1
    } catch {
      failed += 1
    }
  }

  return { processed: ids.length, succeeded, failed }
}

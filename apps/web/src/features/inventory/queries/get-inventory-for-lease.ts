import 'server-only'
import { prisma } from '@/lib/db'

/**
 * E-T27.2 — fetch every InventoryItem for a lease, grouped by phase.
 *
 * The dashboard wizard renders ENTRY and EXIT side by side in v1
 * (single page, two columns). The dispute UI (E-T27.3) re-uses the
 * same shape.
 *
 * Returns null when the lease doesn't exist (caller maps to 404).
 */
export async function getInventoryForLease(leaseId: string) {
  const lease = await prisma.lease.findUnique({
    where: { id: leaseId },
    select: {
      id: true,
      status: true,
      ownerId: true,
      tenantId: true,
      startDate: true,
      terminatedAt: true,
      listing: { select: { title: true } },
      inventoryItems: {
        orderBy: [{ phase: 'asc' }, { roomKey: 'asc' }],
        select: {
          id: true,
          phase: true,
          roomKey: true,
          notes: true,
          photoUrls: true,
          uploadedById: true,
          createdAt: true,
          updatedAt: true,
          uploadedBy: { select: { id: true, name: true } },
        },
      },
    },
  })
  if (!lease) return null

  const entry = lease.inventoryItems.filter((i) => i.phase === 'ENTRY')
  const exit = lease.inventoryItems.filter((i) => i.phase === 'EXIT')

  return {
    leaseId: lease.id,
    leaseStatus: lease.status,
    listingTitle: lease.listing.title,
    ownerId: lease.ownerId,
    tenantId: lease.tenantId,
    startDate: lease.startDate,
    terminatedAt: lease.terminatedAt,
    entry,
    exit,
  }
}

export type InventoryForLease = NonNullable<
  Awaited<ReturnType<typeof getInventoryForLease>>
>

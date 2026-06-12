import 'server-only'
import { prisma } from '@/lib/db'
import type { UpsertInventoryItemInput } from '../schemas'

/**
 * E-T27.2 — create or update an InventoryItem (one row per
 * leaseId × phase × roomKey).
 *
 * Authorization is the caller's responsibility — the action /
 * handler boundary verifies the visitor is owner or tenant of the
 * lease. Service trusts the userId.
 *
 * Phase lifecycle :
 *  - ENTRY upload is allowed when Lease.status ∈ {ACTIVE}. Locked
 *    after TERMINATED so a party can't backdate evidence.
 *  - EXIT upload is allowed when Lease.status ∈ {ACTIVE, TERMINATED}.
 *    Pre-TERMINATED is allowed so the parties can pre-fill the
 *    EXIT inventory together at the end-of-lease handover.
 */

export type UpsertInventoryItemOutcome =
  | {
      kind: 'ok'
      itemId: string
      createdAt: Date
      isNew: boolean
    }
  | { kind: 'lease_not_found' }
  | { kind: 'not_a_party' }
  | { kind: 'invalid_phase_for_status'; status: string; phase: string }

const ENTRY_ALLOWED_STATUSES = ['ACTIVE'] as const
const EXIT_ALLOWED_STATUSES = ['ACTIVE', 'TERMINATED', 'DISPUTED'] as const

export async function upsertInventoryItem(
  input: UpsertInventoryItemInput,
  userId: string,
): Promise<UpsertInventoryItemOutcome> {
  const lease = await prisma.lease.findUnique({
    where: { id: input.leaseId },
    select: {
      id: true,
      status: true,
      ownerId: true,
      tenantId: true,
    },
  })
  if (!lease) return { kind: 'lease_not_found' }
  if (lease.ownerId !== userId && lease.tenantId !== userId) {
    return { kind: 'not_a_party' }
  }

  const allowedStatuses =
    input.phase === 'ENTRY' ? ENTRY_ALLOWED_STATUSES : EXIT_ALLOWED_STATUSES
  if (!(allowedStatuses as readonly string[]).includes(lease.status)) {
    return {
      kind: 'invalid_phase_for_status',
      status: lease.status,
      phase: input.phase,
    }
  }

  // upsert via the composite unique. Returns the row + whether it
  // was created or updated (length comparison on previous data).
  const before = await prisma.inventoryItem.findUnique({
    where: {
      leaseId_phase_roomKey: {
        leaseId: input.leaseId,
        phase: input.phase,
        roomKey: input.roomKey,
      },
    },
    select: { id: true },
  })

  const row = await prisma.inventoryItem.upsert({
    where: {
      leaseId_phase_roomKey: {
        leaseId: input.leaseId,
        phase: input.phase,
        roomKey: input.roomKey,
      },
    },
    create: {
      leaseId: input.leaseId,
      phase: input.phase,
      roomKey: input.roomKey,
      notes: input.notes ?? null,
      photoUrls: input.photoUrls,
      uploadedById: userId,
    },
    update: {
      notes: input.notes ?? null,
      photoUrls: input.photoUrls,
      // Stamp the updater on every edit so the dashboard shows who
      // touched it last.
      uploadedById: userId,
    },
    select: { id: true, createdAt: true },
  })

  return {
    kind: 'ok',
    itemId: row.id,
    createdAt: row.createdAt,
    isNew: !before,
  }
}

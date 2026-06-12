import 'server-only'
import { prisma } from '@/lib/db'
import type { DeleteInventoryItemInput } from '../schemas'

/**
 * E-T27.2 — remove an InventoryItem row. Both photos and notes are
 * dropped together (we don't keep "row-with-no-photos" because the
 * dashboard would render an empty placeholder).
 *
 * Authorization : visitor must be party to the lease, AND the item
 * must belong to the lease (defense in depth — the action layer
 * already gates by lease ownership).
 *
 * Phase lock : once the lease is TERMINATED, ENTRY rows are read-
 * only (dispute evidence). EXIT rows stay editable until the
 * lease leaves DISPUTED / TERMINATED.
 */

export type DeleteInventoryItemOutcome =
  | { kind: 'ok'; itemId: string }
  | { kind: 'lease_not_found' }
  | { kind: 'not_a_party' }
  | { kind: 'item_not_found' }
  | { kind: 'item_wrong_lease' }
  | { kind: 'entry_locked_after_termination' }

export async function deleteInventoryItem(
  input: DeleteInventoryItemInput,
  userId: string,
): Promise<DeleteInventoryItemOutcome> {
  const lease = await prisma.lease.findUnique({
    where: { id: input.leaseId },
    select: { id: true, status: true, ownerId: true, tenantId: true },
  })
  if (!lease) return { kind: 'lease_not_found' }
  if (lease.ownerId !== userId && lease.tenantId !== userId) {
    return { kind: 'not_a_party' }
  }

  const item = await prisma.inventoryItem.findUnique({
    where: { id: input.itemId },
    select: { id: true, leaseId: true, phase: true },
  })
  if (!item) return { kind: 'item_not_found' }
  if (item.leaseId !== input.leaseId) return { kind: 'item_wrong_lease' }

  if (
    item.phase === 'ENTRY' &&
    (lease.status === 'TERMINATED' || lease.status === 'DISPUTED')
  ) {
    return { kind: 'entry_locked_after_termination' }
  }

  await prisma.inventoryItem.delete({ where: { id: item.id } })
  return { kind: 'ok', itemId: item.id }
}

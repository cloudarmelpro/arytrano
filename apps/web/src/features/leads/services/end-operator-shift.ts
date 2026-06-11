import 'server-only'
import { prisma } from '@/lib/db'

/**
 * E-T28 follow-up — operator manually ends their current shift before
 * the natural `endsAt` deadline.
 *
 * Behavior :
 *  - Find the current active shift (now ∈ [startsAt, endsAt]).
 *  - Truncate endsAt to NOW so the next push fan-out skips this
 *    operator immediately.
 *  - If the truncation would put endsAt before startsAt (impossible
 *    in practice — startsAt is always ≤ now for an active shift),
 *    delete the row instead to keep the table clean.
 */

export type EndOperatorShiftOutcome =
  | { kind: 'ok'; shiftId: string; endedAt: Date }
  | { kind: 'no_active_shift' }

export async function endOperatorShift(
  operatorId: string,
): Promise<EndOperatorShiftOutcome> {
  const now = new Date()

  const shift = await prisma.operatorShift.findFirst({
    where: {
      operatorId,
      startsAt: { lte: now },
      endsAt: { gte: now },
    },
    select: { id: true, startsAt: true },
    orderBy: { endsAt: 'desc' },
  })
  if (!shift) return { kind: 'no_active_shift' }

  // Defensive : startsAt > now would be a clock skew; trim to startsAt
  // so the row stays consistent with its constraint.
  const truncated = shift.startsAt > now ? shift.startsAt : now

  await prisma.operatorShift.update({
    where: { id: shift.id },
    data: { endsAt: truncated },
  })

  return { kind: 'ok', shiftId: shift.id, endedAt: truncated }
}

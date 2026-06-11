import 'server-only'
import { prisma } from '@/lib/db'

/**
 * E-T28 follow-up — operator self-declares an 8h shift.
 *
 * Behavior :
 *  - If an active shift already exists for this operator (now between
 *    startsAt and endsAt), return its id with `kind:'already_active'`
 *    so the UI can render the "Stop shift" button instead.
 *  - Otherwise create a new shift starting NOW + 8h (default duration).
 *
 * 8h matches the runbook's default. We expose `durationHours` as a
 * param so a manager can spin a longer shift via the upcoming
 * shift-config page (out of scope for v1).
 */

export type StartOperatorShiftOutcome =
  | { kind: 'ok'; shiftId: string; endsAt: Date }
  | { kind: 'already_active'; shiftId: string; endsAt: Date }

const DEFAULT_DURATION_HOURS = 8

export async function startOperatorShift(
  operatorId: string,
  opts?: { durationHours?: number },
): Promise<StartOperatorShiftOutcome> {
  const now = new Date()

  const existing = await prisma.operatorShift.findFirst({
    where: {
      operatorId,
      startsAt: { lte: now },
      endsAt: { gte: now },
    },
    select: { id: true, endsAt: true },
    orderBy: { endsAt: 'desc' },
  })
  if (existing) {
    return {
      kind: 'already_active',
      shiftId: existing.id,
      endsAt: existing.endsAt,
    }
  }

  const durationMs = (opts?.durationHours ?? DEFAULT_DURATION_HOURS) * 60 * 60 * 1000
  const endsAt = new Date(now.getTime() + durationMs)

  const shift = await prisma.operatorShift.create({
    data: {
      operatorId,
      startsAt: now,
      endsAt,
    },
    select: { id: true, endsAt: true },
  })

  return { kind: 'ok', shiftId: shift.id, endsAt: shift.endsAt }
}

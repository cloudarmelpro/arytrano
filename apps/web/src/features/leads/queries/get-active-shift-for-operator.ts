import 'server-only'
import { prisma } from '@/lib/db'

/**
 * E-T28 follow-up — returns the operator's currently active shift, or
 * null if they're off-shift. Used by the /admin/leads banner to
 * render the Start / Stop button.
 */
export async function getActiveShiftForOperator(operatorId: string) {
  const now = new Date()
  return prisma.operatorShift.findFirst({
    where: {
      operatorId,
      startsAt: { lte: now },
      endsAt: { gte: now },
    },
    select: { id: true, startsAt: true, endsAt: true },
    orderBy: { endsAt: 'desc' },
  })
}

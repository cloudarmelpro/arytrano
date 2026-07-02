import 'server-only'
import { prisma } from '@/lib/db'

export type ActivationCohort = {
  monthLabel: string
  signups: number
  activated: number
  activationRate: number
}

const ACTIVATION_WINDOW_DAYS = 7

/**
 * ANA-11 — for each of the last 6 months, count owners who signed up
 * that month and how many published their first listing within 7 days.
 * Activation = "took the action that unlocks core value" ; for owners
 * that's publishing an annonce.
 */
export async function computeOwnerActivationCohorts(): Promise<ActivationCohort[]> {
  const anchor = new Date()
  const cohorts: ActivationCohort[] = []
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(
      Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() - i, 1),
    )
    const monthEnd = new Date(
      Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1),
    )
    const owners = await prisma.user.findMany({
      where: {
        role: { in: ['OWNER', 'ADMIN'] },
        createdAt: { gte: monthStart, lt: monthEnd },
      },
      select: {
        id: true,
        createdAt: true,
      },
    })
    let activated = 0
    for (const o of owners) {
      const cutoff = new Date(
        o.createdAt.getTime() + ACTIVATION_WINDOW_DAYS * 24 * 60 * 60 * 1000,
      )
      const first = await prisma.listing.findFirst({
        where: {
          ownerId: o.id,
          status: 'PUBLISHED',
          publishedAt: { lte: cutoff },
        },
        select: { id: true },
      })
      if (first) activated += 1
    }
    const label = `${monthStart.getUTCFullYear()}-${String(monthStart.getUTCMonth() + 1).padStart(2, '0')}`
    cohorts.push({
      monthLabel: label,
      signups: owners.length,
      activated,
      activationRate:
        owners.length === 0 ? 0 : Math.round((activated / owners.length) * 100),
    })
  }
  return cohorts
}

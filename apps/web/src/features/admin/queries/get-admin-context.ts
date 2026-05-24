import 'server-only'
import type { UserRole, UserStatus } from '@prisma/client'
import { prisma } from '@/lib/db'

export type AdminContext = {
  user: {
    role: UserRole
    status: UserStatus
    name: string | null
    email: string
    image: string | null
  } | null
  openReports: number
}

/**
 * One-shot fetch used by the admin layout guard: live-reads role+status
 * (closes JWT staleness from security audit H2), pulls the profile bits
 * the sidebar user-info card needs, and the open-reports count for the
 * sidebar badge. Two parallel queries, single round-trip.
 */
export async function getAdminContext(userId: string): Promise<AdminContext> {
  const [user, openReports] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        status: true,
        name: true,
        email: true,
        image: true,
      },
    }),
    prisma.report.count({ where: { status: 'OPEN' } }),
  ])
  return { user, openReports }
}

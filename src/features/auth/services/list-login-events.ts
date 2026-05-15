import 'server-only'
import type { LoginAuthMethod } from '@prisma/client'
import { prisma } from '@/lib/db'

export type LoginEventView = {
  id: string
  occurredAt: Date
  authMethod: LoginAuthMethod
  browser: string | null
  os: string | null
  deviceType: string | null
  isMobileApp: boolean
}

export async function listLoginEvents(userId: string, limit = 10): Promise<LoginEventView[]> {
  return prisma.loginEvent.findMany({
    where: { userId },
    orderBy: { occurredAt: 'desc' },
    take: Math.min(Math.max(limit, 1), 50),
    select: {
      id: true,
      occurredAt: true,
      authMethod: true,
      browser: true,
      os: true,
      deviceType: true,
      isMobileApp: true,
    },
  })
}

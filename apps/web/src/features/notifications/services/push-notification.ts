import 'server-only'
import { prisma } from '@/lib/db'

/**
 * COM-01 — persist an in-app notification. Kept fire-and-forget from
 * the caller's point of view (services `void pushInappNotification(…)`).
 * Titles and bodies must stay short (< 100 char / < 240 char) so the
 * bell dropdown stays readable.
 */
export async function pushInappNotification(input: {
  userId: string
  kind: string
  title: string
  body: string
  href?: string
}): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId: input.userId,
        kind: input.kind,
        title: input.title.slice(0, 100),
        body: input.body.slice(0, 240),
        href: input.href ?? null,
      },
    })
  } catch {
    /* analytics failure — never throws */
  }
}

export async function listUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, readAt: null },
  })
}

export async function listRecentNotifications(userId: string, take = 20) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take,
  })
}

export async function markAllRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  })
}

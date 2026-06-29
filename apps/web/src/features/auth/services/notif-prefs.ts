import 'server-only'
import { prisma } from '@/lib/db'

export type NotifPrefs = {
  contactNotificationsEnabled: boolean
  savedSearchAlertsEnabled: boolean
  listingExpirationAlertsEnabled: boolean
  leaseUpdatesEnabled: boolean
}

export async function getNotifPrefs(userId: string): Promise<NotifPrefs> {
  const u = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      contactNotificationsEnabled: true,
      savedSearchAlertsEnabled: true,
      listingExpirationAlertsEnabled: true,
      leaseUpdatesEnabled: true,
    },
  })
  return u
}

export async function updateNotifPrefs(
  userId: string,
  input: Partial<NotifPrefs>,
): Promise<NotifPrefs> {
  return prisma.user.update({
    where: { id: userId },
    data: input,
    select: {
      contactNotificationsEnabled: true,
      savedSearchAlertsEnabled: true,
      listingExpirationAlertsEnabled: true,
      leaseUpdatesEnabled: true,
    },
  })
}

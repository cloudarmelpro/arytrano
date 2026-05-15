import 'server-only'
import { prisma } from '@/lib/db'
import { deleteAsset } from '@/lib/cloudinary'
import { errors } from '@/lib/api/errors'

/**
 * Soft-delete a user account. Irreversible.
 *   - User row anonymized + status=DELETED
 *   - All Account rows (OAuth) removed
 *   - All Session rows removed (signs them out everywhere)
 *   - All Listings owned by this user marked DELETED
 *
 * Reviews + ContactEvents kept (Listing FK cascades will handle them when
 * listings are cleaned up later). PaymentEvents kept for audit.
 */
export async function deleteAccount(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, image: true, status: true },
  })
  if (!user) throw errors.notFound('User not found')
  if (user.status === 'DELETED') return

  const anonymousEmail = `deleted-${userId}@arytrano.local`

  await prisma.$transaction([
    prisma.account.deleteMany({ where: { userId } }),
    prisma.session.deleteMany({ where: { userId } }),
    prisma.listing.updateMany({
      where: { ownerId: userId, status: { not: 'DELETED' } },
      data: { status: 'DELETED' },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        status: 'DELETED',
        email: anonymousEmail,
        name: '[supprimé]',
        phone: null,
        image: null,
        passwordHash: null,
      },
    }),
  ])

  // Best-effort cleanup of Cloudinary avatar.
  if (user.image) {
    await deleteAsset(`arytrano/avatars/user-${userId}`).catch(() => {})
  }
}

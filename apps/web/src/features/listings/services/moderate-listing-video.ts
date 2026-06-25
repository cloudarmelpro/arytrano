import 'server-only'
import { prisma } from '@/lib/db'

/**
 * T-059 moderation — admin flips a video between PUBLISHED and
 * HIDDEN_BY_ADMIN. Hiding stamps the admin + a timestamp + an
 * optional reason. Unhiding clears those fields.
 *
 * The Cloudinary asset is NEVER destroyed by this service — that's
 * the owner's job. The public queries already filter on status, so
 * a hidden video disappears from /annonces, the detail page, and
 * the "Vidéo" card badge.
 */

export type ModerateListingVideoOutcome =
  | { kind: 'ok'; status: 'PUBLISHED' | 'HIDDEN_BY_ADMIN' }
  | { kind: 'no_video' }

export async function hideListingVideo(
  listingId: string,
  adminUserId: string,
  reason: string | null,
): Promise<ModerateListingVideoOutcome> {
  const existing = await prisma.listingVideo.findUnique({
    where: { listingId },
    select: { id: true },
  })
  if (!existing) return { kind: 'no_video' }

  await prisma.listingVideo.update({
    where: { listingId },
    data: {
      status: 'HIDDEN_BY_ADMIN',
      hiddenById: adminUserId,
      hiddenAt: new Date(),
      hiddenReason: reason?.trim() ? reason.trim().slice(0, 500) : null,
    },
  })
  return { kind: 'ok', status: 'HIDDEN_BY_ADMIN' }
}

export async function unhideListingVideo(
  listingId: string,
): Promise<ModerateListingVideoOutcome> {
  const existing = await prisma.listingVideo.findUnique({
    where: { listingId },
    select: { id: true },
  })
  if (!existing) return { kind: 'no_video' }

  await prisma.listingVideo.update({
    where: { listingId },
    data: {
      status: 'PUBLISHED',
      hiddenById: null,
      hiddenAt: null,
      hiddenReason: null,
    },
  })
  return { kind: 'ok', status: 'PUBLISHED' }
}

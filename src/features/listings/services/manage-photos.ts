import 'server-only'
import { ZodError } from 'zod'
import { prisma } from '@/lib/db'
import { errors } from '@/lib/api/errors'
import { uploadBuffer, deleteAsset } from '@/lib/cloudinary'
import { sniffImage } from '@/lib/images/sniff'
import { parseListingPhotoFile, MAX_PHOTOS_PER_LISTING } from '../schemas'

async function requireOwnerListing(ownerId: string, listingId: string) {
  const listing = await prisma.listing.findFirst({
    where: { id: listingId, ownerId, status: { not: 'DELETED' } },
    select: { id: true, _count: { select: { photos: true } } },
  })
  if (!listing) throw errors.notFound('Annonce introuvable')
  return listing
}

/**
 * Upload a single photo to Cloudinary and create a ListingPhoto row at the
 * end of the photo list (position = current count). Returns the new row.
 * Throws 422 if the listing already has the max photos.
 */
export async function addListingPhoto(
  ownerId: string,
  listingId: string,
  file: File,
) {
  try {
    parseListingPhotoFile(file)
  } catch (err) {
    if (err instanceof ZodError) {
      throw errors.validation(err.issues[0]?.message ?? 'Fichier invalide')
    }
    throw err
  }

  const listing = await requireOwnerListing(ownerId, listingId)
  if (listing._count.photos >= MAX_PHOTOS_PER_LISTING) {
    throw errors.conflict(`Maximum ${MAX_PHOTOS_PER_LISTING} photos par annonce`)
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  // Magic-bytes sniff: reject polyglot uploads BEFORE the Cloudinary transfer.
  // The client-declared MIME (validated by parseListingPhotoFile) can be
  // spoofed — this reads the real content signature.
  const sniff = await sniffImage(buffer)
  if (!sniff.ok) {
    console.warn('[add-photo] magic-bytes rejected', { ownerId, listingId, reason: sniff.reason })
    throw errors.validation('Fichier non reconnu comme image (JPG, PNG, WebP ou HEIC)')
  }

  const uploaded = await uploadBuffer(buffer, {
    folder: `arytrano/listings/${listingId}`,
    transformation: [{ width: 1600, height: 1200, crop: 'limit', quality: 'auto' }],
  })

  try {
    return await prisma.$transaction(async (tx) => {
      // Serialise concurrent photo ops on the same listing.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${listingId})::bigint)`
      const count = await tx.listingPhoto.count({ where: { listingId } })
      if (count >= MAX_PHOTOS_PER_LISTING) {
        throw errors.conflict(`Maximum ${MAX_PHOTOS_PER_LISTING} photos par annonce`)
      }
      return tx.listingPhoto.create({
        data: {
          listingId,
          url: uploaded.url,
          cloudinaryId: uploaded.publicId,
          width: uploaded.width,
          height: uploaded.height,
          position: count,
        },
        select: {
          id: true,
          url: true,
          cloudinaryId: true,
          width: true,
          height: true,
          position: true,
        },
      })
    })
  } catch (err) {
    // Persist failed (race lost, or unique conflict) — clean the orphan asset.
    await deleteAsset(uploaded.publicId).catch((cleanupErr) => {
      console.error('[add-photo] cloudinary cleanup failed', {
        publicId: uploaded.publicId,
        err: cleanupErr instanceof Error ? cleanupErr.message : String(cleanupErr),
      })
    })
    throw err
  }
}

/**
 * Remove a photo from the listing. Re-numbers positions so the order stays
 * contiguous (no gaps). Best-effort delete on Cloudinary side.
 */
export async function removeListingPhoto(
  ownerId: string,
  listingId: string,
  photoId: string,
) {
  await requireOwnerListing(ownerId, listingId)

  const photo = await prisma.listingPhoto.findFirst({
    where: { id: photoId, listingId },
    select: { id: true, cloudinaryId: true, position: true },
  })
  if (!photo) throw errors.notFound('Photo introuvable')

  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${listingId})::bigint)`
    await tx.listingPhoto.delete({ where: { id: photo.id } })
    // Re-number remaining photos after the deleted position.
    const remaining = await tx.listingPhoto.findMany({
      where: { listingId, position: { gt: photo.position } },
      orderBy: { position: 'asc' },
      select: { id: true, position: true },
    })
    for (const p of remaining) {
      await tx.listingPhoto.update({
        where: { id: p.id },
        data: { position: p.position - 1 },
      })
    }
  })

  await deleteAsset(photo.cloudinaryId).catch((err) => {
    console.error('[remove-photo] cloudinary delete failed', {
      publicId: photo.cloudinaryId,
      err: err instanceof Error ? err.message : String(err),
    })
  })
}

/**
 * Reorder photos. `order` is the new sequence of photo ids; missing/extra
 * ids cause a 400. Applied in a transaction so the unique(listingId, position)
 * constraint is preserved (we shift to negative positions first to avoid
 * conflicts, then back to 0..N-1).
 */
export async function reorderListingPhotos(
  ownerId: string,
  listingId: string,
  order: string[],
) {
  await requireOwnerListing(ownerId, listingId)

  const photos = await prisma.listingPhoto.findMany({
    where: { listingId },
    select: { id: true },
  })
  const existing = new Set(photos.map((p) => p.id))
  if (
    order.length !== existing.size ||
    !order.every((id) => existing.has(id))
  ) {
    throw errors.validation('La liste fournie ne correspond pas aux photos de l\'annonce')
  }

  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${listingId})::bigint)`
    // Phase 1: move every photo to a negative offset (avoids unique conflict).
    for (let i = 0; i < order.length; i++) {
      await tx.listingPhoto.update({
        where: { id: order[i] },
        data: { position: -1 - i },
      })
    }
    // Phase 2: apply the final positions.
    for (let i = 0; i < order.length; i++) {
      await tx.listingPhoto.update({
        where: { id: order[i] },
        data: { position: i },
      })
    }
  })
}

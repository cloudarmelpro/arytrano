'use server'

import { ZodError } from 'zod'
import { auth } from '@/features/auth'
import { uploadBuffer } from '@/lib/cloudinary'
import { sniffImage } from '@/lib/images/sniff'
import { prisma } from '@/lib/db'
import { parseListingPhotoFile } from '@/features/listings'

export type UploadInventoryPhotoActionState = {
  ok: boolean
  message?: string
  url?: string
}

/**
 * E-T27.2 — single-photo upload helper for the inventory wizard.
 *
 * Reuses the listings photo pipeline (parseListingPhotoFile +
 * sniffImage + uploadBuffer with `image_metadata: false`,
 * `exif: false`). Each upload returns the secure_url, which the
 * wizard pushes into a local `photoUrls` array. The whole array is
 * persisted via upsertInventoryItemAction.
 *
 * No per-listing rate limit because inventory uploads are bounded by
 * the lease lifecycle (one row per room per phase, 20 photos max
 * per row). A separate inventory rate-limit would be premature.
 *
 * Authorization : owner or tenant of the lease.
 */
export async function uploadInventoryPhotoAction(
  leaseId: string,
  phase: 'ENTRY' | 'EXIT',
  _prev: UploadInventoryPhotoActionState,
  formData: FormData,
): Promise<UploadInventoryPhotoActionState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, message: 'Authentification requise.' }
  }

  const lease = await prisma.lease.findUnique({
    where: { id: leaseId },
    select: { id: true, ownerId: true, tenantId: true },
  })
  if (!lease) return { ok: false, message: 'Bail introuvable.' }
  if (lease.ownerId !== session.user.id && lease.tenantId !== session.user.id) {
    return { ok: false, message: 'Accès refusé.' }
  }

  const file = formData.get('photo')
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: 'Choisis une photo.' }
  }

  try {
    parseListingPhotoFile(file)
  } catch (err) {
    if (err instanceof ZodError) {
      return {
        ok: false,
        message: err.issues[0]?.message ?? 'Fichier invalide.',
      }
    }
    return { ok: false, message: 'Fichier invalide.' }
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  const sniff = await sniffImage(buffer)
  if (!sniff.ok) {
    return {
      ok: false,
      message: 'Fichier non reconnu comme image (JPG, PNG, WebP ou HEIC).',
    }
  }

  try {
    const uploaded = await uploadBuffer(buffer, {
      folder: `arytrano/leases/${leaseId}/inventory/${phase.toLowerCase()}`,
      transformation: [
        { width: 1600, height: 1200, crop: 'limit', quality: 'auto' },
      ],
    })
    return { ok: true, url: uploaded.url }
  } catch (err) {
    console.error('[upload-inventory-photo]', err)
    return { ok: false, message: 'Upload Cloudinary échoué.' }
  }
}

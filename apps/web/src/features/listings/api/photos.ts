import 'server-only'
import { created, ok, withErrorHandling } from '@/lib/api/response'
import { requireOwnerBearer } from '@/lib/api/bearer'
import { errors } from '@/lib/api/errors'
import { rateLimiters } from '@/lib/rate-limit'
import {
  addListingPhoto,
  removeListingPhoto,
  reorderListingPhotos,
} from '../services/manage-photos'
import {
  listingIdSchema,
  listingPhotoIdSchema,
  reorderPhotosSchema,
} from '../schemas'

/** POST /api/v1/listings/[id]/photos — multipart upload */
export function makeUploadPhotoHandler(id: string) {
  return withErrorHandling(async (req: Request) => {
    const payload = await requireOwnerBearer(req)
    const listingId = listingIdSchema.parse(id)
    const rl = await rateLimiters.photoUpload(payload.sub, listingId)
    if (!rl.success) {
      throw errors.rateLimited('Trop d\'uploads. Réessaie dans une minute.')
    }
    const formData = await req.formData()
    const file = formData.get('photo')
    if (!(file instanceof File) || file.size === 0) {
      throw errors.validation('Champ "photo" manquant ou vide')
    }
    const photo = await addListingPhoto(payload.sub, listingId, file)
    return created(photo)
  })
}

/** PATCH /api/v1/listings/[id]/photos — { order: string[] } reorders */
export function makeReorderPhotosHandler(id: string) {
  return withErrorHandling(async (req: Request) => {
    const payload = await requireOwnerBearer(req)
    const listingId = listingIdSchema.parse(id)
    const body = await req.json()
    const { order } = reorderPhotosSchema.parse(body)
    await reorderListingPhotos(payload.sub, listingId, order)
    return ok({ reordered: true })
  })
}

/** DELETE /api/v1/listings/[id]/photos/[photoId] */
export function makeDeletePhotoHandler(listingIdRaw: string, photoIdRaw: string) {
  return withErrorHandling(async (req: Request) => {
    const payload = await requireOwnerBearer(req)
    const listingId = listingIdSchema.parse(listingIdRaw)
    const photoId = listingPhotoIdSchema.parse(photoIdRaw)
    await removeListingPhoto(payload.sub, listingId, photoId)
    return ok({ deleted: true })
  })
}

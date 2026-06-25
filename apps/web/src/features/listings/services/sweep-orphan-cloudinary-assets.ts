import 'server-only'
import { prisma } from '@/lib/db'
import { deleteVideoAsset } from '@/lib/cloudinary'

/**
 * T-059 follow-up — clean up Cloudinary video assets that no longer
 * have a corresponding `ListingVideo` row.
 *
 * Why this exists : when a delete request is sent we first remove the
 * Postgres row, then call Cloudinary `destroy`. If the Cloudinary call
 * 5xx's or times out, the asset is left dangling (Postgres won — the
 * row is gone, but Cloudinary still bills us for storage). This cron
 * runs daily, lists assets in our `arytrano/listings/.../video` folder,
 * and destroys any whose `public_id` isn't referenced from the DB.
 *
 * NOTE : the listing pattern uses `arytrano/listings/<listingId>/video/`
 * — the listingId is inside the public_id path, so we can extract it
 * cheaply and skip DB lookups for assets whose listing was already
 * deleted (cascade unrelated to the dangling case, but still a useful
 * sweep).
 */

const CLOUDINARY_LIST_PAGE = 100

type CloudinaryListResource = {
  public_id: string
  resource_type?: string
}

export async function sweepOrphanVideoAssets(): Promise<{
  scanned: number
  deleted: number
}> {
  // Lazy-import the Cloudinary SDK to avoid pulling it into bundles
  // that don't need it.
  const { v2: cloudinary } = await import('cloudinary')
  const env = await import('@/lib/env').then((m) => m.env)
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    return { scanned: 0, deleted: 0 }
  }
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  })

  let scanned = 0
  let deleted = 0
  let nextCursor: string | undefined

  do {
    // Cloudinary Admin API : list resources by prefix. Free tier
    // allows 500 calls/hr — daily sweep is way under that.
    const page: {
      resources: CloudinaryListResource[]
      next_cursor?: string
    } = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'video',
      prefix: 'arytrano/listings/',
      max_results: CLOUDINARY_LIST_PAGE,
      next_cursor: nextCursor,
    })

    for (const r of page.resources) {
      scanned += 1
      const hit = await prisma.listingVideo.findFirst({
        where: { cloudinaryId: r.public_id },
        select: { id: true },
      })
      if (hit) continue
      try {
        await deleteVideoAsset(r.public_id)
        deleted += 1
      } catch {
        // Best-effort — next sweep retries.
      }
    }
    nextCursor = page.next_cursor
  } while (nextCursor)

  return { scanned, deleted }
}

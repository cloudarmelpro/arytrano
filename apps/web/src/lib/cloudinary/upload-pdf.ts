import 'server-only'
import { v2 as cloudinary } from 'cloudinary'
import { env } from '@/lib/env'

/**
 * E-T27.1 — upload a lease-contract PDF to Cloudinary as a `raw`
 * resource inside a private folder. The returned `secure_url` is the
 * canonical Cloudinary URL ; downloads in the dashboard go through a
 * separate `signLeasePdfUrl` helper that produces a short-lived
 * signed link (7-day TTL).
 *
 * Privacy : `type: 'private'` so the asset is NOT publicly reachable
 * — only signed URLs with valid signatures work. Critical for lease
 * PDFs that contain owner+tenant PII.
 */

function ensureConfigured() {
  if (
    !env.CLOUDINARY_CLOUD_NAME ||
    !env.CLOUDINARY_API_KEY ||
    !env.CLOUDINARY_API_SECRET
  ) {
    throw new Error('Cloudinary credentials not configured.')
  }
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  })
}

export type PdfUploadResult = {
  /** Cloudinary canonical secure_url. Stored on the row. */
  url: string
  /** Stable id we feed into `cloudinary.utils.private_download_url`. */
  publicId: string
  bytes: number
}

export async function uploadLeasePdfBuffer(
  buffer: Buffer,
  opts: { leaseId: string },
): Promise<PdfUploadResult> {
  ensureConfigured()
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'arytrano/leases',
        public_id: `lease-${opts.leaseId}-contract`,
        resource_type: 'raw',
        type: 'private',
        format: 'pdf',
        overwrite: true,
        invalidate: true,
      },
      (err, result) => {
        if (err || !result) {
          const raw = err as {
            message?: string
            http_code?: number
          } | undefined
          const baseMsg = raw?.message ?? 'Cloudinary upload returned no result'
          const code = raw?.http_code ? ` (HTTP ${raw.http_code})` : ''
          return reject(new Error(`Cloudinary: ${baseMsg}${code}`))
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          bytes: result.bytes,
        })
      },
    )
    stream.end(buffer)
  })
}

/**
 * Re-sign a lease PDF URL for download. TTL 7 days — long enough for
 * a tenant to forget to download immediately but short enough that a
 * leaked link goes stale.
 */
export function signLeasePdfUrl(publicId: string): string {
  ensureConfigured()
  return cloudinary.utils.private_download_url(publicId, 'pdf', {
    resource_type: 'raw',
    expires_at: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
  })
}

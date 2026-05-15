import 'server-only'
import { v2 as cloudinary } from 'cloudinary'
import { env } from '@/lib/env'

let configured = false

function ensureConfigured() {
  if (configured) return
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary not configured: set CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET')
  }
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  })
  configured = true
}

export type UploadResult = {
  url: string
  publicId: string
  width: number
  height: number
  bytes: number
  format: string
}

const CLOUDINARY_URL_PREFIX = 'https://res.cloudinary.com/'

/** Cloudinary transformation step — keep it loosely typed, the SDK accepts many keys. */
export type CloudinaryTransformation = Record<string, string | number | boolean | undefined>

/** Server-side raster image allowlist. SVG is intentionally absent (XSS via embedded scripts). */
export const SAFE_RASTER_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'] as const
export type SafeRasterFormat = (typeof SAFE_RASTER_FORMATS)[number]

/**
 * Upload a buffer to Cloudinary. Used for profile avatars (small files).
 * For listing photos (multiple, large), prefer signed-URL direct upload.
 *
 * `transformation` must be passed as an array of objects (or a single object),
 * NOT as a URL-style string like `c_fill,w_400` — Cloudinary's upload API
 * rejects the string form with "Unknown transformation c_fill".
 */
export async function uploadBuffer(
  buffer: Buffer,
  opts: {
    folder: string
    publicId?: string
    transformation?: CloudinaryTransformation | CloudinaryTransformation[]
  },
): Promise<UploadResult> {
  ensureConfigured()
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: opts.folder,
        public_id: opts.publicId,
        resource_type: 'image',
        format: 'webp',
        // Server-side format gate — Cloudinary refuses the upload if the
        // content sniffs as anything other than a raster image we trust.
        // Critical: blocks SVG (script-XSS), TIFF, raw, PDF, video disguised
        // under a faked `image/jpeg` Content-Type.
        allowed_formats: [...SAFE_RASTER_FORMATS],
        transformation: opts.transformation,
        overwrite: true,
        invalidate: true,
      },
      (err, result) => {
        if (err || !result) {
          // Cloudinary error is a plain object { message, http_code, name } —
          // flatten to a real Error so the upstream catch gets a useful message.
          const raw = err as { message?: string; http_code?: number; name?: string } | undefined
          const baseMsg = raw?.message ?? 'Cloudinary upload returned no result'
          const code = raw?.http_code ? ` (HTTP ${raw.http_code})` : ''
          const wrapped = new Error(`Cloudinary: ${baseMsg}${code}`)
          // Preserve original for server-side debugging.
          ;(wrapped as Error & { cause?: unknown }).cause = err
          console.error('[cloudinary] upload failed', raw)
          return reject(wrapped)
        }
        // Assert the URL really came from Cloudinary's CDN before we trust it
        // into the DB. Cloudinary's secure_url is always under
        // https://res.cloudinary.com/<cloud>/ — if it isn't, refuse the upload
        // rather than persist an attacker-controlled URL.
        if (
          typeof result.secure_url !== 'string' ||
          !result.secure_url.startsWith(CLOUDINARY_URL_PREFIX)
        ) {
          console.error('[cloudinary] unexpected secure_url', { url: result.secure_url })
          return reject(new Error('Cloudinary: URL inattendue, upload rejeté'))
        }
        // Defense in depth: even with allowed_formats, double-check what
        // Cloudinary actually stored. Output format is `webp` from our
        // pipeline, but `result.format` reflects the source — reject if not
        // in the safe raster allowlist.
        if (
          !result.format ||
          !(SAFE_RASTER_FORMATS as readonly string[]).includes(result.format)
        ) {
          console.error('[cloudinary] unexpected format', { format: result.format })
          return reject(new Error('Cloudinary: format non supporté'))
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
          format: result.format,
        })
      },
    )
    stream.end(buffer)
  })
}

export async function deleteAsset(publicId: string): Promise<void> {
  ensureConfigured()
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true })
}

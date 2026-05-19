/**
 * One-shot upload of the AryTrano brand mark to Cloudinary, ready to be
 * used as a Cloudinary image-overlay watermark (T-036 redo).
 *
 * Pipeline:
 *  1. Read `public/logo/arytrano-mark.svg`
 *  2. Render to a 300×300 PNG with transparency via sharp
 *  3. Upload to Cloudinary at public_id `arytrano/watermark`
 *  4. Echo the URL + public_id so we can wire the helper afterwards.
 *
 * Run with: `npx tsx prisma/scripts/upload-watermark.ts`
 * Re-runnable: Cloudinary overwrites the existing asset at that public_id.
 */
import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { v2 as cloudinary } from 'cloudinary'

const cloudName = process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET
if (!cloudName || !apiKey || !apiSecret) {
  throw new Error(
    'Missing CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET in .env',
  )
}
cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true })

async function main() {
  const svgPath = path.resolve(process.cwd(), 'public/logo/arytrano-mark.svg')
  if (!fs.existsSync(svgPath)) {
    throw new Error(`SVG not found at ${svgPath}`)
  }
  console.log(`Reading ${svgPath}…`)
  const svgBuffer = fs.readFileSync(svgPath)

  // Render to 300×300 PNG. `density` controls the SVG raster resolution
  // before resize — higher = sharper edges. 300 dpi is plenty for a
  // 300px output.
  const png = await sharp(svgBuffer, { density: 300 })
    .resize(300, 300, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()
  console.log(`Rendered PNG: ${(png.byteLength / 1024).toFixed(1)} KB`)

  const result = await new Promise<{ public_id: string; secure_url: string }>(
    (resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'arytrano',
          public_id: 'watermark',
          resource_type: 'image',
          format: 'png',
          // Watermark assets keep their original — no transformation
          // applied at upload. Delivery-time params (size, opacity,
          // position) live in the listing photo URL.
          overwrite: true,
          invalidate: true,
        },
        (err, res) => {
          if (err || !res) return reject(err ?? new Error('upload returned no result'))
          resolve({ public_id: res.public_id, secure_url: res.secure_url })
        },
      )
      stream.end(png)
    },
  )

  console.log('\n✅ Upload OK')
  console.log(`   public_id: ${result.public_id}`)
  console.log(`   url:       ${result.secure_url}`)
  console.log(
    '\nUse this in the watermark helper:\n   l_' + result.public_id.replace(/\//g, ':'),
  )
}

main().catch((err) => {
  console.error('\n❌ Upload failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})

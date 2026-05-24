/**
 * One-shot backfill of `ListingPhoto.blurhash` for photos that pre-date
 * the upload-time computation (T-035). Reads each photo's Cloudinary URL,
 * downloads the bytes, computes a tiny base64 JPEG, writes it back.
 *
 * Idempotent — skips rows that already have a blurhash. Safe to re-run.
 *
 * Run with: `npx tsx prisma/scripts/backfill-blurhash.ts`
 */
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import sharp from 'sharp'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
})

async function computeBlurDataURL(buffer: Buffer): Promise<string> {
  const output = await sharp(buffer)
    .resize(16, 16, { fit: 'inside' })
    .jpeg({ quality: 20, mozjpeg: true })
    .toBuffer()
  return `data:image/jpeg;base64,${output.toString('base64')}`
}

async function main() {
  const rows = await prisma.listingPhoto.findMany({
    where: { blurhash: null },
    select: { id: true, url: true },
  })

  if (rows.length === 0) {
    console.log('No photos need backfill.')
    return
  }

  console.log(`Backfilling ${rows.length} photo(s)…`)
  let ok = 0
  let failed = 0
  for (const photo of rows) {
    try {
      const res = await fetch(photo.url)
      if (!res.ok) throw new Error(`fetch ${res.status}`)
      const buffer = Buffer.from(await res.arrayBuffer())
      const blurDataURL = await computeBlurDataURL(buffer)
      await prisma.listingPhoto.update({
        where: { id: photo.id },
        data: { blurhash: blurDataURL },
      })
      ok++
      console.log(`  ✓ ${photo.id}`)
    } catch (err) {
      failed++
      console.error(`  ✗ ${photo.id}`, err instanceof Error ? err.message : err)
    }
  }
  console.log(`\nDone: ${ok} OK, ${failed} failed`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

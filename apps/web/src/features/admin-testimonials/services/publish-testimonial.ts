import 'server-only'
import { prisma } from '@/lib/db'

/**
 * Set `publishedAt = now()` on a Testimonial. Idempotent — re-publish
 * of an already-published row is a no-op (we don't bump the timestamp
 * because that would shuffle the sort order on the public query).
 */
export async function publishTestimonial(id: string): Promise<void> {
  await prisma.testimonial.updateMany({
    where: { id, publishedAt: null },
    data: { publishedAt: new Date() },
  })
}

/**
 * Set `publishedAt = null` on a Testimonial — pulls it from the
 * public landing without deleting it. Idempotent.
 */
export async function unpublishTestimonial(id: string): Promise<void> {
  await prisma.testimonial.updateMany({
    where: { id, publishedAt: { not: null } },
    data: { publishedAt: null },
  })
}

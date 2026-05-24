import 'server-only'
import { prisma } from '@/lib/db'
import type { CreateTestimonialInput } from '../schemas/testimonial'

/**
 * Insert a curated Testimonial. Pure function — auth + revalidation
 * happen at the action edge. Returns the new row id so the action
 * can redirect to `/admin/testimonials/<id>/edit` if needed.
 *
 * `publishImmediately` toggles whether `publishedAt` is set at
 * creation (default false = draft).
 */
export async function createTestimonial(
  input: CreateTestimonialInput,
): Promise<{ id: string }> {
  const row = await prisma.testimonial.create({
    data: {
      audience: input.audience,
      body: input.body,
      authorName: input.authorName,
      authorMeta: input.authorMeta ?? null,
      sortOrder: input.sortOrder ?? 0,
      publishedAt: input.publishImmediately ? new Date() : null,
    },
    select: { id: true },
  })
  return row
}

import 'server-only'
import { prisma } from '@/lib/db'
import type { UpdateTestimonialInput } from '../schemas/testimonial'

/**
 * Partial update of an existing Testimonial. Does NOT touch
 * `publishedAt` — use `publish-testimonial` / `unpublish-testimonial`
 * to flip that flag, so the moderation state is always a deliberate
 * choice and never a side-effect of editing the body.
 *
 * Throws if the id doesn't exist (Prisma P2025).
 */
export async function updateTestimonial(
  id: string,
  patch: UpdateTestimonialInput,
): Promise<void> {
  await prisma.testimonial.update({
    where: { id },
    data: {
      ...(patch.audience !== undefined && { audience: patch.audience }),
      ...(patch.body !== undefined && { body: patch.body }),
      ...(patch.authorName !== undefined && { authorName: patch.authorName }),
      ...(patch.authorMeta !== undefined && {
        authorMeta: patch.authorMeta ?? null,
      }),
      ...(patch.sortOrder !== undefined && { sortOrder: patch.sortOrder }),
    },
  })
}

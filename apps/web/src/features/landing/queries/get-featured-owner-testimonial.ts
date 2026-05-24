import 'server-only'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'

export type FeaturedTestimonial = {
  body: string
  authorName: string
  authorMeta: string | null
}

/**
 * Returns the top-priority published OWNER testimonial for the landing
 * owner block, or `null` if none is curated yet. Hand-curated content
 * (admin pastes a real quote after a successful rental) — never written
 * by owners themselves, so no risk of unmoderated text leaking onto the
 * homepage.
 *
 * Cached 5 min: changes only on rare admin edits. Tag
 * `landing-testimonials` lets the future admin form call
 * `revalidateTag` for instant updates.
 */
export const getFeaturedOwnerTestimonial = unstable_cache(
  async (): Promise<FeaturedTestimonial | null> => {
    const row = await prisma.testimonial.findFirst({
      where: { audience: 'OWNER', publishedAt: { not: null } },
      orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }],
      select: { body: true, authorName: true, authorMeta: true },
    })
    return row
  },
  ['landing-owner-testimonial-v1'],
  { revalidate: 300, tags: ['landing-testimonials'] },
)

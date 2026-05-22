import 'server-only'
import { prisma } from '@/lib/db'
import type { TestimonialAudience } from '../schemas/testimonial'

const PAGE_SIZE = 20

export type AdminTestimonialRow = {
  id: string
  audience: TestimonialAudience
  body: string
  authorName: string
  authorMeta: string | null
  sortOrder: number
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type AdminTestimonialsPage = {
  items: AdminTestimonialRow[]
  nextCursor: string | null
  hasMore: boolean
}

export type StatusFilter = 'all' | 'published' | 'draft'

export async function listAdminTestimonials({
  audience,
  status,
  cursor,
}: {
  audience?: TestimonialAudience
  status?: StatusFilter
  cursor?: string
}): Promise<AdminTestimonialsPage> {
  const where: {
    audience?: TestimonialAudience
    publishedAt?: { not: null } | null
  } = {}
  if (audience) where.audience = audience
  if (status === 'published') where.publishedAt = { not: null }
  if (status === 'draft') where.publishedAt = null

  const rows = await prisma.testimonial.findMany({
    where,
    take: PAGE_SIZE + 1,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    // Newest first by createdAt — the sortOrder column controls the
    // public display order, not the admin list. Admin sees insertion
    // history first.
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      audience: true,
      body: true,
      authorName: true,
      authorMeta: true,
      sortOrder: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  const hasMore = rows.length > PAGE_SIZE
  const sliced = hasMore ? rows.slice(0, PAGE_SIZE) : rows
  const lastRow = sliced[sliced.length - 1]
  return {
    items: sliced,
    nextCursor: hasMore && lastRow ? lastRow.id : null,
    hasMore,
  }
}

export async function getAdminTestimonialById(
  id: string,
): Promise<AdminTestimonialRow | null> {
  return prisma.testimonial.findUnique({
    where: { id },
    select: {
      id: true,
      audience: true,
      body: true,
      authorName: true,
      authorMeta: true,
      sortOrder: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

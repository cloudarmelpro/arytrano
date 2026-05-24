import 'server-only'
import { z } from 'zod'
import type { ReportReason, ReportStatus } from '@prisma/client'
import { prisma } from '@/lib/db'

export const listReportsQuerySchema = z.object({
  status: z.enum(['OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED']).optional(),
})

export type AdminReportRow = {
  id: string
  reason: ReportReason
  details: string | null
  adminNote: string | null
  status: ReportStatus
  createdAt: Date
  resolvedAt: Date | null
  listing: {
    id: string
    slug: string
    title: string
    citySlug: string
    neighborhoodSlug: string
  }
  reporter: { name: string | null; email: string } | null
}

export async function listReports(
  input: z.infer<typeof listReportsQuerySchema> = {},
): Promise<AdminReportRow[]> {
  const rows = await prisma.report.findMany({
    where: input.status ? { status: input.status } : undefined,
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    take: 200, // soft cap — admin will filter as load grows
    select: {
      id: true,
      reason: true,
      details: true,
      adminNote: true,
      status: true,
      createdAt: true,
      resolvedAt: true,
      listing: {
        select: {
          id: true,
          slug: true,
          title: true,
          city: { select: { slug: true } },
          neighborhood: { select: { slug: true } },
        },
      },
      reporter: { select: { name: true, email: true } },
    },
  })

  return rows.map((r) => ({
    id: r.id,
    reason: r.reason,
    details: r.details,
    adminNote: r.adminNote,
    status: r.status,
    createdAt: r.createdAt,
    resolvedAt: r.resolvedAt,
    listing: {
      id: r.listing.id,
      slug: r.listing.slug,
      title: r.listing.title,
      citySlug: r.listing.city.slug,
      neighborhoodSlug: r.listing.neighborhood.slug,
    },
    reporter: r.reporter,
  }))
}

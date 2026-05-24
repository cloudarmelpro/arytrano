import 'server-only'
import { prisma } from '@/lib/db'

const PAGE_SIZE = 50

export type AdminAlertRow = {
  id: string
  phoneE164: string
  locale: string
  quartierSlug: string | null
  createdAt: Date
}

export type AdminAlertsPage = {
  items: AdminAlertRow[]
  nextCursor: string | null
  hasMore: boolean
  /** Total ACTIVE subscribers matching the filter (unsubscribed excluded). */
  total: number
}

export type AdminAlertsFilters = {
  quartierSlug?: string
  /** 'fr-MG' | 'mg' — keep as string here, schema-level enum migration is AUD-001. */
  locale?: string
  cursor?: string
}

/**
 * Paginated list of active WhatsApp Alert subscribers for the admin
 * broadcast tool (T-044). Excludes unsubscribed rows so an admin
 * preparing a broadcast can't accidentally re-target someone who
 * opted out via T-045.
 *
 * Filters are independent (quartierSlug + locale) — both can be
 * applied at once. Pagination is cursor-based on `id` (insertion
 * order, descending by createdAt for newest-first display).
 */
export async function listWhatsAppAlerts(
  filters: AdminAlertsFilters = {},
): Promise<AdminAlertsPage> {
  const where = {
    unsubscribedAt: null,
    ...(filters.quartierSlug !== undefined
      ? { quartierSlug: filters.quartierSlug || null }
      : {}),
    ...(filters.locale !== undefined ? { locale: filters.locale } : {}),
  }

  const [rows, total] = await Promise.all([
    prisma.whatsAppAlert.findMany({
      where,
      take: PAGE_SIZE + 1,
      skip: filters.cursor ? 1 : 0,
      cursor: filters.cursor ? { id: filters.cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        phoneE164: true,
        locale: true,
        quartierSlug: true,
        createdAt: true,
      },
    }),
    prisma.whatsAppAlert.count({ where }),
  ])

  const hasMore = rows.length > PAGE_SIZE
  const sliced = hasMore ? rows.slice(0, PAGE_SIZE) : rows
  const lastRow = sliced[sliced.length - 1]
  return {
    items: sliced,
    nextCursor: hasMore && lastRow ? lastRow.id : null,
    hasMore,
    total,
  }
}

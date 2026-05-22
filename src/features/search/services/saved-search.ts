import 'server-only'
import { prisma } from '@/lib/db'
import type {
  CreateSavedSearchInput,
  SavedSearchFilters,
} from '../schemas/saved-search'
import { savedSearchFiltersSchema } from '../schemas/saved-search'

export type SavedSearchRow = {
  id: string
  name: string
  filters: SavedSearchFilters
  alertsOn: boolean
  createdAt: Date
}

/**
 * Owner-by-userId service helpers for SavedSearch CRUD. Auth is the
 * caller's responsibility — every Server Action wrapper passes the
 * resolved userId. Filters are JSON-validated on read (forward-compat
 * with schema migrations) and dropped silently if malformed.
 */

export async function createSavedSearch(
  userId: string,
  input: CreateSavedSearchInput,
): Promise<{ id: string }> {
  return prisma.savedSearch.create({
    data: {
      userId,
      name: input.name,
      filters: input.filters as object,
      alertsOn: input.alertsOn,
    },
    select: { id: true },
  })
}

export async function listUserSavedSearches(
  userId: string,
): Promise<SavedSearchRow[]> {
  const rows = await prisma.savedSearch.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      filters: true,
      alertsOn: true,
      createdAt: true,
    },
  })
  return rows.flatMap((r) => {
    const parsed = savedSearchFiltersSchema.safeParse(r.filters)
    if (!parsed.success) return [] // drop malformed rows silently
    return [
      {
        id: r.id,
        name: r.name,
        filters: parsed.data,
        alertsOn: r.alertsOn,
        createdAt: r.createdAt,
      },
    ]
  })
}

export async function deleteSavedSearch(
  userId: string,
  id: string,
): Promise<boolean> {
  const result = await prisma.savedSearch.deleteMany({
    where: { id, userId },
  })
  return result.count > 0
}

export async function toggleSavedSearchAlerts(
  userId: string,
  id: string,
  alertsOn: boolean,
): Promise<boolean> {
  const result = await prisma.savedSearch.updateMany({
    where: { id, userId },
    data: { alertsOn },
  })
  return result.count > 0
}

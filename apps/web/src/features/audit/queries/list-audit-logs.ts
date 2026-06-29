import 'server-only'
import { prisma } from '@/lib/db'
import type { Prisma } from '@prisma/client'

export type AuditLogRow = {
  id: string
  action: string
  targetType: string
  targetId: string
  metadata: Prisma.JsonValue | null
  createdAt: Date
  admin: {
    id: string
    name: string | null
    email: string
  } | null
}

export type ListAuditLogsFilter = {
  /** Substring match on action (e.g. "listing" matches listing.verify). */
  action?: string
  targetType?: string
  /** Exact admin id. */
  adminId?: string
  /** Cursor pagination — id of the last row from the previous page. */
  cursor?: string
  limit?: number
}

/**
 * TRU-09 / ADM-05 — list audit log rows with cursor pagination.
 * Read-only; never call from outside the /admin/audit surface.
 */
export async function listAuditLogs(
  filter: ListAuditLogsFilter = {},
): Promise<{ rows: AuditLogRow[]; nextCursor: string | null }> {
  const limit = Math.min(Math.max(filter.limit ?? 50, 1), 100)

  const where: Prisma.AuditLogWhereInput = {}
  if (filter.action) where.action = { contains: filter.action }
  if (filter.targetType) where.targetType = filter.targetType
  if (filter.adminId) where.adminId = filter.adminId

  const rows = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(filter.cursor ? { cursor: { id: filter.cursor }, skip: 1 } : {}),
    select: {
      id: true,
      action: true,
      targetType: true,
      targetId: true,
      metadata: true,
      createdAt: true,
      admin: {
        select: { id: true, name: true, email: true },
      },
    },
  })

  const hasMore = rows.length > limit
  const trimmed = hasMore ? rows.slice(0, limit) : rows
  const nextCursor = hasMore ? (trimmed[trimmed.length - 1]?.id ?? null) : null
  return { rows: trimmed, nextCursor }
}

/**
 * Return the distinct `targetType` values seen in the audit log —
 * fuels the filter dropdown so we don't hard-code it.
 */
export async function listAuditTargetTypes(): Promise<string[]> {
  const rows = await prisma.auditLog.findMany({
    distinct: ['targetType'],
    select: { targetType: true },
    orderBy: { targetType: 'asc' },
  })
  return rows.map((r) => r.targetType)
}

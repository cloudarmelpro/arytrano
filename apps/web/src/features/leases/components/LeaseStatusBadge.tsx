'use client'

import type { LeaseStatus } from '@prisma/client'
import { useT } from '@/lib/i18n/client'

/**
 * Visual badge for a Lease.status. Mirrors the editorial palette from
 * the rest of AryTrano — soft tinted backgrounds, no loud colors.
 */
const CLASSES: Record<LeaseStatus, string> = {
  DRAFT: 'bg-muted/50 text-muted-foreground',
  PENDING_TENANT: 'bg-amber-50 text-amber-800',
  ACTIVE: 'bg-emerald-50 text-emerald-700',
  REFUSED: 'bg-destructive/10 text-destructive',
  TERMINATED: 'bg-secondary/40 text-secondary-foreground',
  DISPUTED: 'bg-destructive/10 text-destructive',
}

export function LeaseStatusBadge({ status }: { status: LeaseStatus }) {
  const t = useT()
  return (
    <span
      className={`inline-flex h-7 items-center rounded-md px-2.5 text-[11.5px] font-semibold uppercase tracking-[0.08em] ${CLASSES[status]}`}
    >
      {t(`lease.status.${status}` as const)}
    </span>
  )
}

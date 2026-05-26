'use client'

import type { ListingStatus } from '@prisma/client'
import { useT } from '@/lib/i18n/client'

/**
 * Per-status colour mapping — kept contextual so a quick scan reveals
 * which listings are in trouble. Shape mirrors the filter pills used
 * elsewhere (rounded-md compact) for visual coherence.
 */
const CLASSES: Record<ListingStatus, string> = {
  DRAFT: 'bg-muted/40 text-muted-foreground',
  PUBLISHED: 'bg-success/10 text-success',
  UNAVAILABLE: 'bg-secondary/40 text-secondary-foreground',
  SUSPENDED: 'bg-destructive/10 text-destructive',
  DELETED: 'bg-destructive/10 text-destructive',
  // E-T26 — bail signé sur la plateforme, annonce masquée du grid public
  RENTED: 'bg-primary/10 text-primary',
}

export function ListingStatusBadge({ status }: { status: ListingStatus }) {
  const t = useT()
  return (
    <span
      className={`inline-flex h-7 items-center rounded-md px-2.5 text-xs font-medium ${CLASSES[status]}`}
    >
      {t(`status.${status}` as const)}
    </span>
  )
}

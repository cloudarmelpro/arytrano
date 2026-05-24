'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useT } from '@/lib/i18n/client'
import {
  deleteSavedSearchAction,
  toggleSavedSearchAlertsAction,
} from '../actions/saved-search'
import type { SavedSearchFilters } from '../schemas/saved-search'

type Props = {
  id: string
  name: string
  filters: SavedSearchFilters
  alertsOn: boolean
}

/**
 * One saved search row in /dashboard/saved-searches. Shows the name +
 * a compact summary of the filters + actions (run, toggle alerts,
 * delete). The "Lancer" link rebuilds the URL search params from the
 * stored filters and points at /annonces.
 */
export function SavedSearchRow({ id, name, filters, alertsOn }: Props) {
  const t = useT()
  const [pending, startTransition] = useTransition()

  function buildSearchUrl(): string {
    const params = new URLSearchParams()
    if (filters.city) params.set('city', filters.city)
    if (filters.neighborhood)
      params.set('neighborhood', filters.neighborhood)
    if (filters.type) params.set('type', filters.type)
    if (filters.priceMin !== undefined)
      params.set('priceMin', String(filters.priceMin))
    if (filters.priceMax !== undefined)
      params.set('priceMax', String(filters.priceMax))
    if (filters.amenities && filters.amenities.length > 0) {
      params.set('amenities', filters.amenities.join(','))
    }
    if (filters.q) params.set('q', filters.q)
    return `/annonces?${params.toString()}`
  }

  function summary(): string {
    const parts: string[] = []
    if (filters.city) parts.push(filters.city)
    if (filters.neighborhood) parts.push(filters.neighborhood)
    if (filters.type) parts.push(t(`listing.type.${filters.type}` as const))
    if (filters.priceMax !== undefined) {
      parts.push(`≤ ${filters.priceMax.toLocaleString('fr-FR')} Ar`)
    }
    if (filters.q) parts.push(`"${filters.q}"`)
    return parts.length > 0 ? parts.join(' · ') : t('savedSearch.row.allListings')
  }

  function handleDelete() {
    if (
      typeof window !== 'undefined' &&
      !window.confirm(t('savedSearch.row.confirmDelete'))
    ) {
      return
    }
    startTransition(async () => {
      const res = await deleteSavedSearchAction(id)
      if (res.ok) toast.success(t('savedSearch.row.deleted'))
      else toast.error(res.message ?? t('savedSearch.save.error'))
    })
  }

  function handleToggleAlerts() {
    startTransition(async () => {
      const res = await toggleSavedSearchAlertsAction(id, !alertsOn)
      if (res.ok) {
        toast.success(
          alertsOn
            ? t('savedSearch.row.alertsOff')
            : t('savedSearch.row.alertsOn'),
        )
      } else toast.error(res.message ?? t('savedSearch.save.error'))
    })
  }

  return (
    <li className="flex flex-col gap-3 rounded-2xl bg-muted/40 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <p className="text-[15px] font-semibold text-foreground">{name}</p>
        <p className="mt-1 text-[13px] text-foreground/70">{summary()}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={buildSearchUrl()}
          // Multiple "Lancer" buttons land in a screen-reader's link
          // list otherwise — interpolate the search name to make each
          // accessible name unique.
          aria-label={`${t('savedSearch.row.run')} — ${name}`}
          className="inline-flex h-9 items-center rounded-md bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {t('savedSearch.row.run')}
        </Link>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleToggleAlerts}
          disabled={pending}
          aria-pressed={alertsOn}
        >
          {alertsOn ? t('savedSearch.row.alertsOnCta') : t('savedSearch.row.alertsOffCta')}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDelete}
          disabled={pending}
          className="text-muted-foreground hover:text-destructive"
        >
          {t('savedSearch.row.delete')}
        </Button>
      </div>
    </li>
  )
}

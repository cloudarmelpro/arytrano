'use client'

import type { Locale } from '@/lib/i18n/config'
import { useT } from '@/lib/i18n/client'
import { useUrlFilters } from '@/lib/hooks/use-url-filters'
import { formatAriary } from '@/lib/format/currency'
import { Button } from '@/components/ui/button'
import { AMENITY_CATALOG } from '../amenities'

type Neighborhood = { slug: string; nameFr: string; nameMg: string }

type Chip = {
  key: string
  label: React.ReactNode
  remove: () => void
}

// Cap displayed q chip to keep the row from breaking on a hostile / pasted
// query. Server schema allows up to 120 chars; UI truncates beyond ~36.
const Q_CHIP_MAX_CHARS = 36

function safeFiniteNumber(raw: string | null): number | null {
  if (!raw) return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

/**
 * Removable chips for every active filter on /annonces.
 *
 * Reads the URL params and renders one chip per active filter
 * (type, neighborhood, price range, full-text q, each amenity).
 * Each chip's × button removes only that filter; "Tout effacer"
 * wipes the lot while preserving `city` + `view` (those are scopes,
 * not filters).
 *
 * Hidden when no filter is active.
 */
export function ActiveFiltersChips({
  locale,
  neighborhoods,
}: {
  locale: Locale
  neighborhoods: Neighborhood[]
}) {
  const { params, pending, push, updateMultiple, removeParams } = useUrlFilters()
  const t = useT()

  function removeAmenity(value: string) {
    const current = (params.get('amenities') ?? '').split(',').filter(Boolean)
    const remaining = current.filter((a) => a !== value)
    updateMultiple({
      amenities: remaining.length ? remaining.join(',') : null,
    })
  }

  function clearAll() {
    // Preserve scope params (city, view); wipe every refining filter.
    const next = new URLSearchParams()
    const city = params.get('city')
    const view = params.get('view')
    if (city) next.set('city', city)
    if (view) next.set('view', view)
    push(next.toString())
  }

  const type = params.get('type')
  const neighborhoodSlug = params.get('neighborhood')
  const priceMin = safeFiniteNumber(params.get('priceMin'))
  const priceMax = safeFiniteNumber(params.get('priceMax'))
  const amenities = (params.get('amenities') ?? '').split(',').filter(Boolean)
  const q = params.get('q')

  const chips: Chip[] = []

  if (q) {
    const display =
      q.length > Q_CHIP_MAX_CHARS ? `${q.slice(0, Q_CHIP_MAX_CHARS)}…` : q
    chips.push({
      key: 'q',
      label: <span className="italic">«&nbsp;{display}&nbsp;»</span>,
      remove: () => removeParams('q'),
    })
  }

  if (type) {
    const typeMap = {
      ROOM: 'listing.type.ROOM',
      STUDIO: 'listing.type.STUDIO',
      APARTMENT: 'listing.type.APARTMENT',
      HOUSE: 'listing.type.HOUSE',
    } as const
    const key = typeMap[type as keyof typeof typeMap]
    if (key) {
      chips.push({
        key: `type-${type}`,
        label: t(key),
        remove: () => removeParams('type'),
      })
    }
  }

  if (neighborhoodSlug) {
    const n = neighborhoods.find((x) => x.slug === neighborhoodSlug)
    if (n) {
      chips.push({
        key: `neighborhood-${neighborhoodSlug}`,
        label: locale === 'mg' ? n.nameMg : n.nameFr,
        remove: () => removeParams('neighborhood'),
      })
    }
  }

  if (priceMin !== null || priceMax !== null) {
    let priceLabel: string
    if (priceMin !== null && priceMax !== null) {
      priceLabel = `${formatAriary(priceMin)} → ${formatAriary(priceMax)}`
    } else if (priceMin !== null) {
      priceLabel = `≥ ${formatAriary(priceMin)}`
    } else {
      priceLabel = `≤ ${formatAriary(priceMax!)}`
    }
    chips.push({
      key: 'price',
      label: priceLabel,
      remove: () => removeParams('priceMin', 'priceMax'),
    })
  }

  for (const value of amenities) {
    const a = AMENITY_CATALOG.find((c) => c.value === value)
    if (a) {
      chips.push({
        key: `amenity-${value}`,
        label: t(a.labelKey),
        remove: () => removeAmenity(value),
      })
    }
  }

  if (chips.length === 0) return null

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      aria-busy={pending}
      aria-label={t('filters.chips.aria')}
      role="group"
    >
      {chips.map((c) => (
        <Button
          key={c.key}
          type="button"
          variant="outline"
          size="sm"
          onClick={c.remove}
          disabled={pending}
          aria-label={t('filters.chips.remove')}
          className="group h-7 max-w-full gap-1.5 rounded-full px-3 text-[12.5px] font-medium hover:border-primary/40 hover:bg-primary/[0.04]"
        >
          <span className="truncate">{c.label}</span>
          <svg
            aria-hidden
            width={11}
            height={11}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            className="text-foreground/40 transition group-hover:text-primary"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </Button>
      ))}
      <Button
        type="button"
        variant="link"
        size="sm"
        onClick={clearAll}
        disabled={pending}
        className="h-7 px-1 text-[12.5px] font-medium text-primary"
      >
        {t('filters.chips.clearAll')}
      </Button>
    </div>
  )
}

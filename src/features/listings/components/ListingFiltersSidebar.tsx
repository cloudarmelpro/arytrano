'use client'

import { useMemo, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useT } from '@/lib/i18n/client'
import { AMENITY_CATALOG, AmenityIcon } from '../amenities'

const LISTING_TYPES = ['ROOM', 'STUDIO', 'APARTMENT', 'HOUSE'] as const

/**
 * Left-sidebar filter panel (Booking / Leboncoin pattern).
 *
 * Sections:
 *   - Type — radio-style row of toggleable chips (single-select per
 *     existing schema; clicking the active value unsets it back to "all")
 *   - Prix — min/max inputs side-by-side
 *   - Reset button at the bottom when any filter is active
 *
 * URL is the source of truth for all values — every change pushes a
 * `router.replace` with the updated query string, scroll preserved.
 */
export function ListingFiltersSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const t = useT()
  const [pending, startTransition] = useTransition()

  const typeOptions = useMemo(
    () =>
      LISTING_TYPES.map((value) => ({
        value,
        label: t(`listing.type.${value}` as const),
      })),
    [t],
  )

  const currentType = params.get('type') ?? ''
  const currentPriceMin = params.get('priceMin') ?? ''
  const currentPriceMax = params.get('priceMax') ?? ''
  // Note: neighborhood is handled in the top toolbar; we don't surface
  // it here. `hasActiveFilter` still includes it so the reset button
  // appears whenever ANY filter is active across the whole page.
  const currentNeighborhood = params.get('neighborhood') ?? ''
  // Amenities live in the URL as a comma-separated string — we parse
  // them into a Set for O(1) "is this one checked?" lookups in render.
  const currentAmenities = useMemo(
    () => new Set((params.get('amenities') ?? '').split(',').filter(Boolean)),
    [params],
  )

  const hasActiveFilter =
    Boolean(currentType || currentNeighborhood || currentPriceMin || currentPriceMax) ||
    currentAmenities.size > 0

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('cursor') // any filter change resets cursor to page 1
    const qs = next.toString()
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    })
  }

  function toggleType(value: string) {
    // Re-clicking the active value clears the filter (back to "all").
    updateParam('type', value === currentType ? '' : value)
  }

  function toggleAmenity(value: string) {
    const next = new Set(currentAmenities)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    // URL: comma-separated; empty set removes the param entirely.
    updateParam('amenities', Array.from(next).join(','))
  }

  function reset() {
    startTransition(() => {
      router.replace(pathname, { scroll: false })
    })
  }

  return (
    <aside
      aria-busy={pending}
      className="flex flex-col gap-6 lg:border-r lg:border-border lg:pr-6"
    >
      <header className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
          {t('filters.sidebar.title')}
        </h2>
        {hasActiveFilter && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={reset}
            disabled={pending}
            className="h-7 px-2 text-xs text-muted-foreground"
          >
            {t('filters.reset')}
          </Button>
        )}
      </header>

      {/* Type — vertically stacked toggleable chips */}
      <section className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t('filters.type.label')}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => updateParam('type', '')}
            disabled={pending}
            aria-pressed={!currentType}
            className={`inline-flex h-7 items-center rounded-md px-2.5 text-[11px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60 ${
              !currentType
                ? 'bg-primary text-primary-foreground'
                : 'border border-border bg-background text-foreground hover:bg-muted'
            }`}
          >
            {t('filters.type.all')}
          </button>
          {typeOptions.map((o) => {
            const active = o.value === currentType
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => toggleType(o.value)}
                disabled={pending}
                aria-pressed={active}
                className={`inline-flex h-7 items-center rounded-md px-2.5 text-[11px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60 ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border bg-background text-foreground hover:bg-muted'
                }`}
              >
                {o.label}
              </button>
            )
          })}
        </div>
      </section>

      {/* Price range */}
      <section className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t('filters.price.label')}
        </p>
        <div className="flex items-center gap-2">
          <Input
            key={`min-${currentPriceMin}`}
            id="filter-price-min"
            type="number"
            inputMode="numeric"
            min={0}
            step={10000}
            placeholder={t('filters.priceMin.placeholder')}
            aria-label={t('filters.priceMin.label')}
            defaultValue={currentPriceMin}
            onBlur={(e) => updateParam('priceMin', e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                updateParam('priceMin', e.currentTarget.value)
              }
            }}
            disabled={pending}
            className="h-9 flex-1"
          />
          <span className="text-xs text-muted-foreground">{t('filters.price.separator')}</span>
          <Input
            key={`max-${currentPriceMax}`}
            id="filter-price-max"
            type="number"
            inputMode="numeric"
            min={0}
            step={10000}
            placeholder={t('filters.priceMax.placeholder')}
            aria-label={t('filters.priceMax.label')}
            defaultValue={currentPriceMax}
            onBlur={(e) => updateParam('priceMax', e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                updateParam('priceMax', e.currentTarget.value)
              }
            }}
            disabled={pending}
            className="h-9 flex-1"
          />
        </div>
        <p className="text-[11px] text-muted-foreground">{t('filters.price.hint')}</p>
      </section>

      {/* Amenities — multi-select checkboxes. AND-semantic: a listing
         must include EVERY checked amenity (Prisma `hasEvery`).
         Compact sizing: tighter padding, smaller icon container, no
         outer rounded chip (just clean rows). */}
      <section className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t('filters.amenities.label')}
        </p>
        <ul className="flex flex-col">
          {AMENITY_CATALOG.map((a) => {
            const checked = currentAmenities.has(a.value)
            return (
              <li key={a.value}>
                <Label
                  className="cursor-pointer rounded-md px-1.5 py-1 font-normal transition hover:bg-muted data-[checked=true]:text-foreground"
                  data-checked={checked}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleAmenity(a.value)}
                    disabled={pending}
                  />
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground [&_svg]:h-3.5 [&_svg]:w-3.5">
                    <AmenityIcon amenity={a.value} />
                  </span>
                  <span className="text-[11px] leading-tight">{t(a.labelKey)}</span>
                </Label>
              </li>
            )
          })}
        </ul>
      </section>
    </aside>
  )
}

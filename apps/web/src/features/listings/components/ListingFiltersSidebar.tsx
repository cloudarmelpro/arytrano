'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { useT } from '@/lib/i18n/client'
import { useUrlFilters } from '@/lib/hooks/use-url-filters'
import { formatAriary } from '@/lib/format/currency'
import { AMENITY_CATALOG } from '../amenities'

// UX cap — covers premium housing rentals on the platform. URL/schema
// allow up to 100M Ar for the rare luxury case; visitors who need that
// can still type values directly (kept as a soft cap on the slider only).
const PRICE_MIN = 0
const PRICE_MAX = 10_000_000
const PRICE_STEP = 50_000
const PRICE_LARGE_STEP = 500_000

/**
 * Left-sidebar filter panel — card-style, sticky on lg, Booking-grade UX.
 *
 * Sections (separated by Separator):
 *   - Prix — range slider (Base UI) with live Ariary readout + 3M+ overflow
 *   - Équipements — multi-select checkbox list (AND-semantic)
 *
 * Type lives in the `<ResultsSearchStrip>` above the page (city +
 * quartier + type pivot), so the sidebar focuses on the refining
 * filters that aren't part of the primary scope picker.
 *
 * URL is the source of truth. The price slider keeps a local draft so
 * dragging is buttery; URL only updates on pointerup (`onValueCommitted`)
 * which avoids a router.replace per pixel of drag.
 */
export function ListingFiltersSidebar() {
  const { params, pending, updateMultiple, updateParam, reset } = useUrlFilters()
  const t = useT()

  const currentNeighborhood = params.get('neighborhood') ?? ''
  const urlPriceMin = clamp(Number(params.get('priceMin')) || PRICE_MIN, PRICE_MIN, PRICE_MAX)
  const urlPriceMax = clamp(
    params.get('priceMax') ? Number(params.get('priceMax')) : PRICE_MAX,
    PRICE_MIN,
    PRICE_MAX,
  )
  const currentAmenities = useMemo(
    () => new Set((params.get('amenities') ?? '').split(',').filter(Boolean)),
    [params],
  )

  // Local draft of the price slider — committed to URL only on pointerup.
  const [priceDraft, setPriceDraft] = useState<[number, number]>([
    urlPriceMin,
    urlPriceMax,
  ])

  // Re-sync local draft if URL changes externally (reset, browser back).
  useEffect(() => {
    setPriceDraft([urlPriceMin, urlPriceMax])
  }, [urlPriceMin, urlPriceMax])

  const priceTouched =
    priceDraft[0] !== PRICE_MIN || priceDraft[1] !== PRICE_MAX
  const hasActiveFilter =
    Boolean(currentNeighborhood) ||
    priceTouched ||
    currentAmenities.size > 0

  function commitPrice([min, max]: [number, number]) {
    updateMultiple({
      priceMin: min !== PRICE_MIN ? String(min) : null,
      priceMax: max !== PRICE_MAX ? String(max) : null,
    })
  }

  function toggleAmenity(value: string) {
    const next = new Set(currentAmenities)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    updateParam('amenities', next.size ? Array.from(next).join(',') : null)
  }

  return (
    <aside aria-busy={pending}>
      <div className="overflow-hidden rounded-xl border border-border bg-background shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <header className="flex items-center justify-between px-5 py-4">
          <h2 className="text-[15px] font-bold tracking-[-0.01em] text-foreground">
            {t('filters.sidebar.title')}
          </h2>
          {hasActiveFilter && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={reset}
              disabled={pending}
              className="h-7 px-2 text-[12px] font-medium text-primary hover:bg-primary/5 hover:text-primary"
            >
              {t('filters.reset')}
            </Button>
          )}
        </header>

        <Separator />

        {/* Price slider */}
        <section className="flex flex-col gap-4 px-5 py-5">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-foreground/70">
              {t('filters.price.label')}
            </p>
            <span className="text-[11px] text-muted-foreground">
              {t('filters.price.unit')}
            </span>
          </div>
          <div className="flex items-baseline justify-between font-mono text-[13.5px] font-semibold tabular-nums text-foreground">
            <span>{formatAriary(priceDraft[0])}</span>
            <span className="text-foreground/40">→</span>
            <span>
              {formatAriary(priceDraft[1])}
            </span>
          </div>
          <Slider.Root
            value={priceDraft}
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={PRICE_STEP}
            largeStep={PRICE_LARGE_STEP}
            disabled={pending}
            aria-label={t('filters.price.range.aria')}
            onValueChange={(v) => {
              if (Array.isArray(v) && v.length === 2) {
                setPriceDraft([v[0]!, v[1]!])
              }
            }}
            onValueCommitted={(v) => {
              if (Array.isArray(v) && v.length === 2) {
                commitPrice([v[0]!, v[1]!])
              }
            }}
          >
            <Slider.Control>
              <Slider.Track>
                <Slider.Indicator />
              </Slider.Track>
              <Slider.Thumb />
              <Slider.Thumb />
            </Slider.Control>
          </Slider.Root>
        </section>

        <Separator />

        {/* Amenities */}
        <section className="flex flex-col gap-3 px-5 py-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-foreground/70">
            {t('filters.amenities.label')}
          </p>
          <ul className="flex flex-col gap-0.5">
            {AMENITY_CATALOG.map((a) => {
              const checked = currentAmenities.has(a.value)
              return (
                <li key={a.value}>
                  <Label
                    className="cursor-pointer rounded-md py-1.5 font-normal transition data-[checked=true]:text-foreground"
                    data-checked={checked}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleAmenity(a.value)}
                      disabled={pending}
                    />
                    <span className="leading-tight">
                      {t(a.labelKey)}
                    </span>
                  </Label>
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    </aside>
  )
}

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min
  return Math.max(min, Math.min(max, n))
}

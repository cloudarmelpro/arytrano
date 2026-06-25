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

// 2026-06-09 sidebar additions — Type / Bedrooms / Bathrooms / Furnished.
// Pill-row UX (Booking / Airbnb pattern). Bedrooms + bathrooms use
// "≥ N" semantics (Prisma `gte` in the where clause).
const LISTING_TYPES = ['ROOM', 'STUDIO', 'APARTMENT', 'HOUSE'] as const
type ListingTypeFilter = (typeof LISTING_TYPES)[number]
const BEDROOM_OPTIONS = [1, 2, 3, 4, 5] as const
const BATHROOM_OPTIONS = [1, 2, 3] as const

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
  // 2026-06-09 — read the new refining filters off the URL. Invalid
  // values from the URL bar (e.g. `?bedrooms=foo`) fall through as
  // `null`/`undefined` so the "Indifférent" pill stays selected.
  const currentType = (() => {
    const v = params.get('type')
    return v && (LISTING_TYPES as ReadonlyArray<string>).includes(v)
      ? (v as ListingTypeFilter)
      : null
  })()
  const currentBedrooms = (() => {
    const n = Number(params.get('bedrooms'))
    return Number.isFinite(n) && n >= 1 ? n : null
  })()
  const currentBathrooms = (() => {
    const n = Number(params.get('bathrooms'))
    return Number.isFinite(n) && n >= 1 ? n : null
  })()
  const currentFurnished = (() => {
    const v = params.get('furnished')
    return v === 'true' ? true : v === 'false' ? false : null
  })()

  // Local draft of the price slider — committed to URL only on pointerup.
  const [priceDraft, setPriceDraft] = useState<[number, number]>([
    urlPriceMin,
    urlPriceMax,
  ])

  // Re-sync local draft when the URL changes EXTERNALLY (reset button,
  // chip removal, browser back). The slider keeps its own draft state
  // while the visitor drags — committing on `onValueCommitted` only —
  // so we can't derive the draft directly from URL. This is the
  // intentional way to bridge an external state change into a
  // controlled local draft.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPriceDraft([urlPriceMin, urlPriceMax])
  }, [urlPriceMin, urlPriceMax])

  const priceTouched =
    priceDraft[0] !== PRICE_MIN || priceDraft[1] !== PRICE_MAX
  const hasActiveFilter =
    Boolean(currentNeighborhood) ||
    priceTouched ||
    currentAmenities.size > 0 ||
    currentType !== null ||
    currentBedrooms !== null ||
    currentBathrooms !== null ||
    currentFurnished !== null

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

  // 2026-06-09 — each refining filter clears itself when the visitor
  // re-clicks the active pill (toggle semantics), or sets the URL
  // param when picking a new value.
  function pickType(v: ListingTypeFilter | null) {
    updateParam('type', v ?? null)
  }
  function pickBedrooms(n: number | null) {
    updateParam('bedrooms', n === null ? null : String(n))
  }
  function pickBathrooms(n: number | null) {
    updateParam('bathrooms', n === null ? null : String(n))
  }
  function pickFurnished(v: boolean | null) {
    updateParam('furnished', v === null ? null : v ? 'true' : 'false')
  }

  return (
    <aside aria-busy={pending}>
      <div className="overflow-hidden bg-background shadow-none">
        <header className="flex items-center justify-between gap-2 py-1.5">
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
              className="h-7 px-2 text-[12px] cursor-pointer font-medium text-primary hover:bg-primary/5 hover:text-primary"
            >
              {t('filters.reset')}
            </Button>
          )}
        </header>

        {/* Price slider */}
        <section className="flex flex-col gap-2 py-1.5">
          <div className="flex items-baselinejustify-between gap-2">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-foreground/70">
              {t('filters.price.label')}
            </p>
            <span className="text-[11px] text-muted-foreground">
              {t('filters.price.unit')}
            </span>
          </div>
          <div className="flex items-baseline justify-between font-mono text-[13.5px] font-semibold tabular-nums text-foreground">
            <span>{formatAriary(priceDraft[0])}</span>
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
            className='px-2'
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

        {/* Type de logement (2026-06-09) — checkbox list, single-select
            semantics : cocher un autre type décoche le précédent.
            Visuellement aligné sur la section Équipements ci-dessous. */}
        <section className="flex flex-col gap-2 py-1.5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-foreground/70">
            {t('filters.type.label')}
          </p>
          <ul className="flex flex-col gap-0.5">
            {LISTING_TYPES.map((v) => {
              const checked = currentType === v
              return (
                <li key={v}>
                  <Label
                    className="cursor-pointer rounded-md py-1.5 font-normal transition data-[checked=true]:text-foreground"
                    data-checked={checked}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => pickType(checked ? null : v)}
                      disabled={pending}
                    />
                    <span className="leading-tight">
                      {t(`listing.type.${v}` as const)}
                    </span>
                  </Label>
                </li>
              )
            })}
          </ul>
        </section>

        {/* Chambres (2026-06-09) — "≥ N" semantics */}
        <section className="flex flex-col gap-2 py-1.5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-foreground/70">
            {t('filters.bedrooms.label')}
          </p>
          <ul className="flex flex-col gap-0.5">
            {BEDROOM_OPTIONS.map((n) => {
              const checked = currentBedrooms === n
              return (
                <li key={n}>
                  <Label
                    className="cursor-pointer rounded-md py-1.5 font-normal transition data-[checked=true]:text-foreground"
                    data-checked={checked}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => pickBedrooms(checked ? null : n)}
                      disabled={pending}
                    />
                    <span className="leading-tight">
                      {t('filters.bedrooms.atLeast', { count: n })}
                    </span>
                  </Label>
                </li>
              )
            })}
          </ul>
        </section>

        {/* Salles de bain (2026-06-09) — "≥ N" semantics */}
        <section className="flex flex-col gap-2 py-1.5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-foreground/70">
            {t('filters.bathrooms.label')}
          </p>
          <ul className="flex flex-col gap-0.5">
            {BATHROOM_OPTIONS.map((n) => {
              const checked = currentBathrooms === n
              return (
                <li key={n}>
                  <Label
                    className="cursor-pointer rounded-md py-1.5 font-normal transition data-[checked=true]:text-foreground"
                    data-checked={checked}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => pickBathrooms(checked ? null : n)}
                      disabled={pending}
                    />
                    <span className="leading-tight">
                      {t('filters.bathrooms.atLeast', { count: n })}
                    </span>
                  </Label>
                </li>
              )
            })}
          </ul>
        </section>

        {/* Meublé (2026-06-09) */}
        <section className="flex flex-col gap-2 py-1.5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-foreground/70">
            {t('filters.furnished.label')}
          </p>
          <ul className="flex flex-col gap-0.5">
            {[
              { value: true as const, labelKey: 'filters.furnished.yes' as const },
              { value: false as const, labelKey: 'filters.furnished.no' as const },
            ].map((opt) => {
              const checked = currentFurnished === opt.value
              return (
                <li key={String(opt.value)}>
                  <Label
                    className="cursor-pointer rounded-md py-1.5 font-normal transition data-[checked=true]:text-foreground"
                    data-checked={checked}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => pickFurnished(checked ? null : opt.value)}
                      disabled={pending}
                    />
                    <span className="leading-tight">{t(opt.labelKey)}</span>
                  </Label>
                </li>
              )
            })}
          </ul>
        </section>

        {/* Amenities */}
        <section className="flex flex-col gap-2 py-1.5">
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


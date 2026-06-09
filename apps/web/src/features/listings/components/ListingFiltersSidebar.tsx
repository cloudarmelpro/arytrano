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

  // Re-sync local draft if URL changes externally (reset, browser back).
  useEffect(() => {
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

        {/* Type de logement (2026-06-09) */}
        <section className="flex flex-col gap-3 px-5 py-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-foreground/70">
            {t('filters.type.label')}
          </p>
          <div className="flex flex-wrap gap-1.5">
            <PillButton
              active={currentType === null}
              onClick={() => pickType(null)}
              disabled={pending}
            >
              {t('filters.type.all')}
            </PillButton>
            {LISTING_TYPES.map((v) => (
              <PillButton
                key={v}
                active={currentType === v}
                onClick={() => pickType(currentType === v ? null : v)}
                disabled={pending}
              >
                {t(`listing.type.${v}` as const)}
              </PillButton>
            ))}
          </div>
        </section>

        <Separator />

        {/* Chambres (2026-06-09) — "≥ N" semantics */}
        <section className="flex flex-col gap-3 px-5 py-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-foreground/70">
            {t('filters.bedrooms.label')}
          </p>
          <div className="flex flex-wrap gap-1.5">
            <PillButton
              active={currentBedrooms === null}
              onClick={() => pickBedrooms(null)}
              disabled={pending}
            >
              {t('filters.bedrooms.any')}
            </PillButton>
            {BEDROOM_OPTIONS.map((n) => (
              <PillButton
                key={n}
                active={currentBedrooms === n}
                onClick={() => pickBedrooms(currentBedrooms === n ? null : n)}
                disabled={pending}
              >
                {t('filters.bedrooms.atLeast', { count: n })}
              </PillButton>
            ))}
          </div>
        </section>

        <Separator />

        {/* Salles de bain (2026-06-09) — "≥ N" semantics */}
        <section className="flex flex-col gap-3 px-5 py-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-foreground/70">
            {t('filters.bathrooms.label')}
          </p>
          <div className="flex flex-wrap gap-1.5">
            <PillButton
              active={currentBathrooms === null}
              onClick={() => pickBathrooms(null)}
              disabled={pending}
            >
              {t('filters.bathrooms.any')}
            </PillButton>
            {BATHROOM_OPTIONS.map((n) => (
              <PillButton
                key={n}
                active={currentBathrooms === n}
                onClick={() => pickBathrooms(currentBathrooms === n ? null : n)}
                disabled={pending}
              >
                {t('filters.bathrooms.atLeast', { count: n })}
              </PillButton>
            ))}
          </div>
        </section>

        <Separator />

        {/* Meublé (2026-06-09) */}
        <section className="flex flex-col gap-3 px-5 py-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-foreground/70">
            {t('filters.furnished.label')}
          </p>
          <div className="flex flex-wrap gap-1.5">
            <PillButton
              active={currentFurnished === null}
              onClick={() => pickFurnished(null)}
              disabled={pending}
            >
              {t('filters.furnished.any')}
            </PillButton>
            <PillButton
              active={currentFurnished === true}
              onClick={() => pickFurnished(currentFurnished === true ? null : true)}
              disabled={pending}
            >
              {t('filters.furnished.yes')}
            </PillButton>
            <PillButton
              active={currentFurnished === false}
              onClick={() =>
                pickFurnished(currentFurnished === false ? null : false)
              }
              disabled={pending}
            >
              {t('filters.furnished.no')}
            </PillButton>
          </div>
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

/**
 * Pill-row button used by Type / Bedrooms / Bathrooms / Furnished
 * filter sections (2026-06-09 sidebar additions). Same visual
 * treatment across the four sections so the visitor learns the
 * affordance once.
 */
function PillButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`inline-flex h-8 items-center rounded-full border px-3 text-[12.5px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background text-foreground/80 hover:border-primary/40 hover:bg-primary/[0.04]'
      }`}
    >
      {children}
    </button>
  )
}

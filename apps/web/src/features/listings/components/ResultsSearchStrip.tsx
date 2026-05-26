'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Combobox } from '@base-ui/react/combobox'
import { useT } from '@/lib/i18n/client'
import { useUrlFilters } from '@/lib/hooks/use-url-filters'
import { Icon, type IconName } from '@/components/shared/Icon'
import { Button } from '@/components/ui/button'

const LISTING_TYPES = ['ROOM', 'STUDIO', 'APARTMENT', 'HOUSE'] as const
type ListingType = (typeof LISTING_TYPES)[number]

export type CityOption = {
  slug: string
  label: string
  neighborhoods: { slug: string; label: string }[]
}

/**
 * Compact pivot/refine search strip on /annonces — three Combobox
 * autocompletes (City / Quartier / Type) + a "Rechercher" CTA, all
 * inside a single card with hairline dividers between segments.
 *
 * Mirrors the landing hero's Combobox UX (same dropdown style, same
 * cascade logic) but in a light/compact theme suited to a results
 * page where the visitor already committed.
 *
 * URL is the source of truth. Local draft state lets the visitor
 * stage city/quartier/type then commit via the CTA in one shot.
 */
export function ResultsSearchStrip({ cities }: { cities: CityOption[] }) {
  const { params, pending, updateMultiple } = useUrlFilters()
  const t = useT()

  const urlCity = params.get('city') ?? ''
  const urlNeighborhood = params.get('neighborhood') ?? ''
  const urlType = params.get('type') ?? ''

  // Slug-level state — what we'll commit to the URL on submit.
  const [city, setCity] = useState(urlCity)
  const [quartier, setQuartier] = useState(urlNeighborhood)
  const [type, setType] = useState<ListingType | ''>(
    (LISTING_TYPES as ReadonlyArray<string>).includes(urlType)
      ? (urlType as ListingType)
      : '',
  )

  // Text shown in each Combobox.Input — keeps the visible label
  // in sync with the picked slug, and lets the visitor free-type.
  const initialCityLabel =
    cities.find((c) => c.slug === urlCity)?.label ?? ''
  const initialQuartierLabel = (() => {
    const c = cities.find((x) => x.slug === urlCity)
    return c?.neighborhoods.find((n) => n.slug === urlNeighborhood)?.label ?? ''
  })()
  const initialTypeLabel = (LISTING_TYPES as ReadonlyArray<string>).includes(
    urlType,
  )
    ? t(`listing.type.${urlType as ListingType}` as const)
    : ''

  const [cityText, setCityText] = useState(initialCityLabel)
  const [quartierText, setQuartierText] = useState(initialQuartierLabel)
  const [typeText, setTypeText] = useState(initialTypeLabel)

  // Re-sync on external URL changes (chip removed, browser back, reset).
  useEffect(() => {
    setCity(urlCity)
    setCityText(cities.find((c) => c.slug === urlCity)?.label ?? '')
  }, [urlCity, cities])

  useEffect(() => {
    setQuartier(urlNeighborhood)
    const c = cities.find((x) => x.slug === urlCity)
    setQuartierText(
      c?.neighborhoods.find((n) => n.slug === urlNeighborhood)?.label ?? '',
    )
  }, [urlNeighborhood, urlCity, cities])

  useEffect(() => {
    if ((LISTING_TYPES as ReadonlyArray<string>).includes(urlType)) {
      setType(urlType as ListingType)
      setTypeText(t(`listing.type.${urlType as ListingType}` as const))
    } else {
      setType('')
      setTypeText('')
    }
  }, [urlType, t])

  const cityAnchorRef = useRef<HTMLLabelElement>(null)
  const quartierAnchorRef = useRef<HTMLLabelElement>(null)
  const typeAnchorRef = useRef<HTMLLabelElement>(null)

  const cityItems = useMemo(
    () => cities.map((c) => ({ value: c.slug, label: c.label })),
    [cities],
  )

  const neighborhoodItems = useMemo(() => {
    const selected = cities.find((c) => c.slug === city)
    return (selected?.neighborhoods ?? []).map((n) => ({
      value: n.slug,
      label: n.label,
    }))
  }, [cities, city])

  const typeItems = useMemo(
    () =>
      LISTING_TYPES.map((value) => ({
        value,
        label: t(`listing.type.${value}` as const),
      })),
    [t],
  )

  function handleCityPick(slug: string, label: string) {
    setCity(slug)
    setCityText(label)
    // Cascade — quartier slugs are unique per city. Drop both the
    // selected slug and its display text on city change.
    if (quartier) setQuartier('')
    setQuartierText('')
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    updateMultiple({
      city: city || null,
      neighborhood: quartier || null,
      type: type || null,
    })
  }

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      aria-label={t('annonces.search.aria')}
      aria-busy={pending}
      className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-[1.1fr_1.3fr_1.1fr_auto]"
    >
      {/* CITY */}
      <Combobox.Root
        items={cityItems}
        inputValue={cityText}
        onInputValueChange={(v) => {
          setCityText(v)
          // Match-by-label-while-typing : if the user re-types the exact
          // label of an existing city, keep the slug selected.
          const exact = cities.find((c) => c.label === v)
          if (exact) {
            if (city !== exact.slug) {
              setCity(exact.slug)
              if (quartier) setQuartier('')
              setQuartierText('')
            }
          } else if (city) {
            setCity('')
            if (quartier) setQuartier('')
            setQuartierText('')
          }
        }}
      >
        <Segment
          anchorRef={cityAnchorRef}
          eyebrow={t('annonces.search.city.label')}
          iconName="pin"
          className=""
        >
          <Combobox.Input
            placeholder={t('landing.hero.search.city.placeholder')}
            disabled={pending}
            className="w-full bg-transparent text-[15px] font-bold leading-[1.15] tracking-[-0.01em] text-foreground outline-none placeholder:font-medium placeholder:text-foreground/45 disabled:opacity-60"
          />
        </Segment>
        <ComboPopup
          anchorRef={cityAnchorRef}
          emptyMessage={t('landing.hero.search.city.noResults')}
        >
          {(o: { value: string; label: string }) => (
            <Combobox.Item
              key={o.value}
              value={o}
              onClick={() => handleCityPick(o.value, o.label)}
              className="cursor-pointer rounded-md px-3 py-2.5 outline-none data-highlighted:bg-primary/10"
            >
              <Row icon="pin" label={o.label} />
            </Combobox.Item>
          )}
        </ComboPopup>
      </Combobox.Root>

      {/* QUARTIER */}
      <Combobox.Root
        items={neighborhoodItems}
        inputValue={quartierText}
        onInputValueChange={(v) => {
          setQuartierText(v)
          if (quartier) setQuartier('')
        }}
      >
        <Segment
          anchorRef={quartierAnchorRef}
          eyebrow={t('annonces.search.quartier.label')}
          iconName="building"
          className=""
        >
          <Combobox.Input
            placeholder={t('landing.hero.search.quartier.placeholder')}
            disabled={pending || !city}
            className="w-full bg-transparent text-[15px] font-bold leading-[1.15] tracking-[-0.01em] text-foreground outline-none placeholder:font-medium placeholder:text-foreground/45 disabled:opacity-60"
          />
        </Segment>
        <ComboPopup
          anchorRef={quartierAnchorRef}
          emptyMessage={t('landing.hero.search.quartier.noResults')}
        >
          {(o: { value: string; label: string }) => (
            <Combobox.Item
              key={o.value}
              value={o}
              onClick={() => {
                setQuartier(o.value)
                setQuartierText(o.label)
              }}
              className="cursor-pointer rounded-md px-3 py-2.5 outline-none data-highlighted:bg-primary/10"
            >
              <Row icon="pin" label={o.label} />
            </Combobox.Item>
          )}
        </ComboPopup>
      </Combobox.Root>

      {/* TYPE */}
      <Combobox.Root
        items={typeItems}
        inputValue={typeText}
        onInputValueChange={(v) => {
          setTypeText(v)
          if (type) setType('')
        }}
      >
        <Segment
          anchorRef={typeAnchorRef}
          eyebrow={t('annonces.search.type.label')}
          iconName="house"
          className=""
        >
          <Combobox.Input
            placeholder={t('landing.hero.search.type.placeholder')}
            disabled={pending}
            className="w-full bg-transparent text-[15px] font-bold leading-[1.15] tracking-[-0.01em] text-foreground outline-none placeholder:font-medium placeholder:text-foreground/45 disabled:opacity-60"
          />
        </Segment>
        <ComboPopup
          anchorRef={typeAnchorRef}
          emptyMessage={t('landing.hero.search.type.noResults')}
        >
          {(o: { value: ListingType; label: string }) => (
            <Combobox.Item
              key={o.value}
              value={o}
              onClick={() => {
                setType(o.value)
                setTypeText(o.label)
              }}
              className="cursor-pointer rounded-md px-3 py-2.5 outline-none data-highlighted:bg-primary/10"
            >
              <Row icon={TYPE_ICON[o.value]} label={o.label} />
            </Combobox.Item>
          )}
        </ComboPopup>
      </Combobox.Root>

      <Button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="min-h-16 gap-2 rounded-xl border-2 border-primary px-7 text-[14px] font-bold tracking-[-0.005em]"
      >
        {pending ? (
          <span
            aria-hidden
            className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"
          />
        ) : (
          <Icon name="search" size={16} />
        )}
        {t('annonces.search.cta')}
      </Button>
    </form>
  )
}

const TYPE_ICON: Record<ListingType, IconName> = {
  ROOM: 'bed',
  STUDIO: 'house',
  APARTMENT: 'building',
  HOUSE: 'home-heart',
}

function Segment({
  anchorRef,
  eyebrow,
  iconName,
  className,
  children,
}: {
  anchorRef: React.RefObject<HTMLLabelElement | null>
  eyebrow: string
  iconName: IconName
  className?: string
  children: React.ReactNode
}) {
  return (
    <label
      ref={anchorRef}
      className={`flex min-h-16 items-center gap-3 rounded-xl border-2 border-primary/15 bg-background px-4 py-2.5 text-left transition focus-within:border-primary/40 hover:border-primary/30 ${className ?? ''}`}
    >
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/[0.08] text-primary">
        <Icon name={iconName} size={16} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[10px] font-semibold uppercase leading-none tracking-[0.12em] text-foreground/55">
          {eyebrow}
        </span>
        {children}
      </span>
    </label>
  )
}

function ComboPopup<V extends string>({
  anchorRef,
  emptyMessage,
  children,
}: {
  anchorRef: React.RefObject<HTMLLabelElement | null>
  emptyMessage: string
  children: (o: { value: V; label: string }) => React.ReactNode
}) {
  return (
    <Combobox.Portal>
      <Combobox.Positioner
        anchor={anchorRef}
        sideOffset={6}
        align="start"
        side="bottom"
        collisionAvoidance={{ side: 'none' }}
        className="z-50"
      >
        <Combobox.Popup className="w-(--anchor-width) max-h-(--available-height) overflow-y-auto rounded-xl bg-background p-1 text-foreground shadow-lg ring-1 ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0">
          <Combobox.Empty className="empty:p-0 px-3 py-4 text-center text-[13px] text-muted-foreground">
            {emptyMessage}
          </Combobox.Empty>
          <Combobox.List className="flex flex-col">{children}</Combobox.List>
        </Combobox.Popup>
      </Combobox.Positioner>
    </Combobox.Portal>
  )
}

function Row({ icon, label }: { icon: IconName; label: string }) {
  return (
    <span className="flex items-center gap-3">
      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center text-foreground/70">
        <Icon name={icon} size={18} stroke={1.6} />
      </span>
      <span className="text-[14px] font-semibold text-foreground">{label}</span>
    </span>
  )
}

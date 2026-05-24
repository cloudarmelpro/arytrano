'use client'

import { useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Combobox } from '@base-ui/react/combobox'
import { useT } from '@/lib/i18n/client'
import { Icon, type IconName } from '@/components/shared/Icon'

const LISTING_TYPES = ['ROOM', 'STUDIO', 'APARTMENT', 'HOUSE'] as const
type ListingType = (typeof LISTING_TYPES)[number]

const TYPE_ICON: Record<ListingType, IconName> = {
  ROOM: 'bed',
  STUDIO: 'house',
  APARTMENT: 'building',
  HOUSE: 'home-heart',
}

export type NeighborhoodOption = {
  slug: string
  label: string
}

export type CityOption = {
  slug: string
  label: string
  /** Neighborhoods inside this city — drives the cascade. */
  neighborhoods: NeighborhoodOption[]
}

export function LandingSearchCard({
  cities,
  defaultCitySlug,
  publishedListings,
}: {
  cities: CityOption[]
  /** Pre-selected city on first render. Usually the city with most inventory. */
  defaultCitySlug?: string
  publishedListings: number
}) {
  const router = useRouter()
  const t = useT()
  const [pending, startTransition] = useTransition()

  // E-T07 multi-ville cascade. With a single seeded city the CitySelect
  // collapses to a hidden state and the form behaves like before.
  const initialCity =
    cities.find((c) => c.slug === defaultCitySlug)?.slug ??
    cities[0]?.slug ??
    ''
  const initialCityLabel =
    cities.find((c) => c.slug === initialCity)?.label ?? ''
  const [city, setCity] = useState(initialCity)
  const [cityText, setCityText] = useState(initialCityLabel)
  const showCitySelect = cities.length > 1

  const [quartier, setQuartier] = useState('')
  // Free-text typed in the Quartier autocomplete input. Set by the user
  // when typing; reset to the matching label when an item is picked.
  const [quartierText, setQuartierText] = useState('')
  const [type, setType] = useState<ListingType | ''>('')
  // Same dual-state pattern as Quartier: `type` holds the slug used at
  // form submit; `typeText` is what the user sees in the input box.
  const [typeText, setTypeText] = useState('')
  const [priceMax, setPriceMax] = useState('')
  // Anchor refs — by default Base UI Combobox anchors the positioner on
  // the `Combobox.Input` (the small <input> inside the field). We want
  // the popup to span the entire field shell (label box with icon, mini
  // label and input), so we point the positioner at the wrapping
  // `<label>` instead. `--anchor-width` then resolves to the label's
  // width and the popup matches it 1:1, responsively.
  const cityAnchorRef = useRef<HTMLLabelElement>(null)
  const quartierAnchorRef = useRef<HTMLLabelElement>(null)
  const typeAnchorRef = useRef<HTMLLabelElement>(null)

  const submitKey =
    publishedListings <= 1
      ? 'landing.hero.search.submit.one'
      : 'landing.hero.search.submit.other'
  const submitLabel = t(submitKey, { count: publishedListings })

  // Cascade : only show neighborhoods of the currently-selected city.
  // When no city is selected (visitor cleared the field), the dropdown
  // is empty — Combobox.Empty handles the message.
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

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    // E-T07 : carry both city + neighborhood when set so /annonces can
    // disambiguate homonymous quartier slugs across cities.
    if (city) params.set('city', city)
    if (quartier) params.set('neighborhood', quartier)
    if (type) params.set('type', type)
    const trimmedPrice = priceMax.trim()
    if (trimmedPrice && /^\d+$/.test(trimmedPrice)) {
      params.set('priceMax', trimmedPrice)
    }
    const qs = params.toString()
    startTransition(() => {
      router.push(qs ? `/annonces?${qs}` : '/annonces')
    })
  }

  function handleCityPick(slug: string, label: string) {
    setCity(slug)
    setCityText(label)
    // Cascade reset : the previously-picked quartier may belong to a
    // different city. Wipe both the slug and the input text so the
    // form reflects "no quartier filter for this new city" until the
    // user picks one from the now-filtered dropdown.
    if (quartier) setQuartier('')
    setQuartierText('')
  }

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      aria-label={t('landing.hero.search.formAria' as const)}
      className={
        showCitySelect
          ? 'grid gap-3 sm:grid-cols-2 lg:grid-cols-[0.9fr_1.05fr_1.25fr_1.0fr_auto] lg:gap-3'
          : 'grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.15fr_1.35fr_1.1fr_auto] lg:gap-3'
      }
    >
      {showCitySelect ? (
        <Combobox.Root
          items={cityItems}
          inputValue={cityText}
          onInputValueChange={(v) => {
            setCityText(v)
            // Match-by-label-while-typing : if the user re-types the exact
            // label of an existing city, we keep the slug selected so the
            // cascade doesn't blank out unnecessarily.
            const exact = cities.find((c) => c.label === v)
            if (exact) {
              if (city !== exact.slug) {
                setCity(exact.slug)
                // Cascade reset still — different city = different
                // neighborhoods.
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
          <label
            ref={cityAnchorRef}
            className="flex min-h-16 items-center gap-3.5 rounded-xl border-[1.5px] border-white/50 px-3.5 py-3 text-left text-white transition focus-within:border-white focus-within:bg-white/[0.06] hover:border-white hover:bg-white/[0.06]"
          >
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-white/15 text-white">
              <Icon name="pin" size={18} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-[10.5px] font-semibold uppercase leading-none tracking-[0.1em] text-white/70">
                {t('landing.hero.search.city.label')}
              </span>
              <Combobox.Input
                placeholder={t('landing.hero.search.city.placeholder')}
                disabled={pending}
                className="w-full bg-transparent text-[15.5px] font-bold leading-[1.1] tracking-[-0.01em] text-white outline-none placeholder:font-medium placeholder:text-white/55 disabled:opacity-60"
              />
            </span>
          </label>
          <Combobox.Portal>
            <Combobox.Positioner
              anchor={cityAnchorRef}
              sideOffset={6}
              align="start"
              side="bottom"
              collisionAvoidance={{ side: 'none' }}
              className="z-50"
            >
              <Combobox.Popup className="w-(--anchor-width) max-h-(--available-height) overflow-y-auto rounded-xl bg-white p-1 text-foreground shadow-lg ring-1 ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0">
                <Combobox.Empty className="empty:p-0 px-3 py-4 text-center text-[13px] text-muted-foreground">
                  {t('landing.hero.search.city.noResults' as const)}
                </Combobox.Empty>
                <Combobox.List className="flex flex-col">
                  {(o: { value: string; label: string }) => (
                    <Combobox.Item
                      key={o.value}
                      value={o}
                      onClick={() => handleCityPick(o.value, o.label)}
                      className="cursor-pointer rounded-md px-3 py-2.5 outline-none data-highlighted:bg-primary/10 data-highlighted:text-foreground"
                    >
                      <Row icon="pin" label={o.label} />
                    </Combobox.Item>
                  )}
                </Combobox.List>
              </Combobox.Popup>
            </Combobox.Positioner>
          </Combobox.Portal>
        </Combobox.Root>
      ) : null}

      <Combobox.Root
        items={neighborhoodItems}
        inputValue={quartierText}
        onInputValueChange={(v) => {
          setQuartierText(v)
          // Free typing clears any previously-selected slug — submitting now
          // means "no quartier filter" until the user picks one from the list.
          if (quartier) setQuartier('')
        }}
      >
        <label
          ref={quartierAnchorRef}
          className="flex min-h-16 items-center gap-3.5 rounded-xl border-[1.5px] border-white/50 px-3.5 py-3 text-left text-white transition focus-within:border-white focus-within:bg-white/[0.06] hover:border-white hover:bg-white/[0.06]"
        >
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-white/15 text-white">
            <Icon name="pin" size={18} />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-[10.5px] font-semibold uppercase leading-none tracking-[0.1em] text-white/70">
              {t('landing.hero.search.quartier.label')}
            </span>
            <Combobox.Input
              placeholder={t('landing.hero.search.quartier.placeholder')}
              disabled={pending}
              className="w-full bg-transparent text-[15.5px] font-bold leading-[1.1] tracking-[-0.01em] text-white outline-none placeholder:font-medium placeholder:text-white/55 disabled:opacity-60"
            />
          </span>
        </label>
        <Combobox.Portal>
          <Combobox.Positioner
            anchor={quartierAnchorRef}
            sideOffset={6}
            align="start"
            side="bottom"
            collisionAvoidance={{ side: 'none' }}
            className="z-50"
          >
            <Combobox.Popup className="w-(--anchor-width) max-h-(--available-height) overflow-y-auto rounded-xl bg-white p-1 text-foreground shadow-lg ring-1 ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0">
              <Combobox.Empty className="empty:p-0 px-3 py-4 text-center text-[13px] text-muted-foreground">
                {t('landing.hero.search.quartier.noResults' as const)}
              </Combobox.Empty>
              <Combobox.List className="flex flex-col">
                {(o: { value: string; label: string }) => (
                  <Combobox.Item
                    key={o.value}
                    value={o}
                    onClick={() => {
                      setQuartier(o.value)
                      setQuartierText(o.label)
                    }}
                    className="cursor-pointer rounded-md px-3 py-2.5 outline-none data-highlighted:bg-primary/10 data-highlighted:text-foreground"
                  >
                    <Row
                      icon="pin"
                      label={o.label}
                      subtitle={t('landing.hero.search.quartier.itemSubtitle')}
                    />
                  </Combobox.Item>
                )}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>

      <Combobox.Root
        items={typeItems}
        inputValue={typeText}
        onInputValueChange={(v) => {
          setTypeText(v)
          if (type) setType('')
        }}
      >
        <label
          ref={typeAnchorRef}
          className="flex min-h-16 items-center gap-3.5 rounded-xl border-[1.5px] border-white/50 px-3.5 py-3 text-left text-white transition focus-within:border-white focus-within:bg-white/[0.06] hover:border-white hover:bg-white/[0.06]"
        >
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-white/15 text-white">
            <Icon name="house" size={18} />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-[10.5px] font-semibold uppercase leading-none tracking-[0.1em] text-white/70">
              {t('landing.hero.search.type.label')}
            </span>
            <Combobox.Input
              placeholder={t('landing.hero.search.type.placeholder')}
              disabled={pending}
              className="w-full bg-transparent text-[15.5px] font-bold leading-[1.1] tracking-[-0.01em] text-white outline-none placeholder:font-medium placeholder:text-white/55 disabled:opacity-60"
            />
          </span>
        </label>
        <Combobox.Portal>
          <Combobox.Positioner
            anchor={typeAnchorRef}
            sideOffset={6}
            align="start"
            side="bottom"
            collisionAvoidance={{ side: 'none' }}
            className="z-50"
          >
            <Combobox.Popup className="w-(--anchor-width) max-h-(--available-height) overflow-y-auto rounded-xl bg-white p-1 text-foreground shadow-lg ring-1 ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0">
              <Combobox.Empty className="empty:p-0 px-3 py-4 text-center text-[13px] text-muted-foreground">
                {t('landing.hero.search.type.noResults' as const)}
              </Combobox.Empty>
              <Combobox.List className="flex flex-col">
                {(o: { value: ListingType; label: string }) => (
                  <Combobox.Item
                    key={o.value}
                    value={o}
                    onClick={() => {
                      setType(o.value)
                      setTypeText(o.label)
                    }}
                    className="cursor-pointer rounded-md px-3 py-2.5 outline-none data-highlighted:bg-primary/10 data-highlighted:text-foreground"
                  >
                    <Row
                      icon={TYPE_ICON[o.value]}
                      label={o.label}
                    />
                  </Combobox.Item>
                )}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>

      <FieldShell icon="wallet" label={t('landing.hero.search.priceMax.label')}>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          step={10000}
          value={priceMax}
          onChange={(e) => setPriceMax(e.target.value)}
          placeholder={t('landing.hero.search.priceMax.placeholder')}
          disabled={pending}
          className="w-full appearance-none bg-transparent text-[15.5px] font-bold leading-[1.1] tracking-[-0.01em] text-white outline-none placeholder:font-medium placeholder:text-white/55 disabled:opacity-60"
        />
      </FieldShell>

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="inline-flex min-h-16 min-w-[170px] items-center justify-center gap-2 rounded-xl border-[1.5px] border-white bg-white px-7 text-[15px] font-bold leading-none tracking-[-0.005em] text-primary transition hover:bg-[oklch(0.97_0.012_90)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 max-lg:col-span-full"
      >
        {pending ? (
          <span
            aria-hidden
            className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary/30 border-t-primary"
          />
        ) : (
          <Icon name="search" size={17} />
        )}
        {submitLabel}
      </button>
    </form>
  )
}

/**
 * Static field shell used by the Budget input. The Quartier + Type
 * fields use the same visual but inline (their inner Combobox.Input
 * lives directly inside the label) so the shell helper is only used
 * for Budget here.
 */
function FieldShell({
  icon,
  label,
  children,
}: {
  icon: IconName
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="flex min-h-16 items-center gap-3.5 rounded-xl border-[1.5px] border-white/50 px-3.5 py-3 text-left text-white transition hover:border-white hover:bg-white/[0.06]">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-white/15 text-white">
        <Icon name={icon} size={18} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-[10.5px] font-semibold uppercase leading-none tracking-[0.1em] text-white/70">
          {label}
        </span>
        {children}
      </span>
    </label>
  )
}

/**
 * Booking-style dropdown row: outlined pin/icon + bold name on top
 * line, subtitle below. Used for both Quartier ("Andrainjato" /
 * "Fianarantsoa") and Type ("Studio" with bed icon).
 */
function Row({
  icon,
  label,
  subtitle,
}: {
  icon: IconName
  label: string
  subtitle?: string
}) {
  return (
    <span className="flex items-center gap-3">
      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center text-foreground/70">
        <Icon name={icon} size={20} stroke={1.6} />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-[14px] font-semibold text-foreground">
          {label}
        </span>
        {subtitle && (
          <span className="mt-0.5 text-[12px] font-medium text-muted-foreground">
            {subtitle}
          </span>
        )}
      </span>
    </span>
  )
}

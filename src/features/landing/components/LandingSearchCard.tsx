'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useT } from '@/lib/i18n/client'

const LISTING_TYPES = ['ROOM', 'STUDIO', 'APARTMENT', 'HOUSE'] as const
type ListingType = (typeof LISTING_TYPES)[number]

export type NeighborhoodOption = {
  slug: string
  label: string
}

/**
 * Booking-style hero search card (T-041). Three fields stacked on
 * mobile, inline on desktop. Submit redirects to /annonces with the
 * selected filters as query params — reusing the existing list page's
 * filter contract.
 *
 * Intentionally stateless w.r.t. the parent: the card builds its own
 * query string and calls `router.push`. Keeps the hero RSC otherwise.
 */
export function LandingSearchCard({
  neighborhoods,
  publishedListings,
}: {
  neighborhoods: NeighborhoodOption[]
  publishedListings: number
}) {
  const router = useRouter()
  const t = useT()
  const [pending, startTransition] = useTransition()

  const submitKey =
    publishedListings <= 1
      ? 'landing.hero.search.submit.one'
      : 'landing.hero.search.submit.other'
  const submitLabel = t(submitKey, { count: publishedListings })

  const [quartier, setQuartier] = useState('')
  const [type, setType] = useState<ListingType | ''>('')
  const [priceMax, setPriceMax] = useState('')

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
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

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-3 rounded-2xl bg-card p-3 shadow-2xl ring-1 ring-border/40 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:gap-2 sm:p-2"
      aria-label={submitLabel}
    >
      <label className="flex flex-col gap-1 px-3 py-2 sm:px-2.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t('landing.hero.search.quartier.label')}
        </span>
        <select
          value={quartier}
          onChange={(e) => setQuartier(e.target.value)}
          disabled={pending}
          className="bg-transparent text-sm text-foreground outline-none focus-visible:outline-none disabled:opacity-60"
        >
          <option value="">{t('landing.hero.search.quartier.placeholder')}</option>
          {neighborhoods.map((n) => (
            <option key={n.slug} value={n.slug}>
              {n.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 px-3 py-2 sm:px-2.5 sm:border-l sm:border-border/60">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t('landing.hero.search.type.label')}
        </span>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as ListingType | '')}
          disabled={pending}
          className="bg-transparent text-sm text-foreground outline-none focus-visible:outline-none disabled:opacity-60"
        >
          <option value="">{t('landing.hero.search.type.placeholder')}</option>
          {LISTING_TYPES.map((value) => (
            <option key={value} value={value}>
              {t(`listing.type.${value}` as const)}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 px-3 py-2 sm:px-2.5 sm:border-l sm:border-border/60">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t('landing.hero.search.priceMax.label')}
        </span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          step={10000}
          value={priceMax}
          onChange={(e) => setPriceMax(e.target.value)}
          placeholder={t('landing.hero.search.priceMax.placeholder')}
          disabled={pending}
          className="bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus-visible:outline-none disabled:opacity-60"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="inline-flex h-12 cursor-pointer items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg transition hover:opacity-95 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 sm:rounded-lg"
      >
        {pending && (
          <span
            className="mr-2 inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"
            aria-hidden
          />
        )}
        <SearchIcon />
        <span className="ml-2">{submitLabel}</span>
      </button>
    </form>
  )
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

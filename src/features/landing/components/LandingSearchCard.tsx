'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useT } from '@/lib/i18n/client'
import { Icon } from '@/components/shared/Icon'

const LISTING_TYPES = ['ROOM', 'STUDIO', 'APARTMENT', 'HOUSE'] as const
type ListingType = (typeof LISTING_TYPES)[number]

export type NeighborhoodOption = {
  slug: string
  label: string
}

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

  const [quartier, setQuartier] = useState('')
  const [type, setType] = useState<ListingType | ''>('')
  const [priceMax, setPriceMax] = useState('')

  const submitKey =
    publishedListings <= 1
      ? 'landing.hero.search.submit.one'
      : 'landing.hero.search.submit.other'
  const submitLabel = t(submitKey, { count: publishedListings })

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
      aria-label={submitLabel}
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.15fr_1.35fr_1.1fr_auto] lg:gap-3"
    >
      <Field icon="pin" label={t('landing.hero.search.quartier.label')}>
        <select
          value={quartier}
          onChange={(e) => setQuartier(e.target.value)}
          disabled={pending}
          className="w-full appearance-none bg-transparent text-[15.5px] font-bold leading-[1.1] tracking-[-0.01em] text-white outline-none disabled:opacity-60"
        >
          <option value="" className="text-foreground">
            {t('landing.hero.search.quartier.placeholder')}
          </option>
          {neighborhoods.map((n) => (
            <option key={n.slug} value={n.slug} className="text-foreground">
              {n.label}
            </option>
          ))}
        </select>
      </Field>

      <Field icon="house" label={t('landing.hero.search.type.label')}>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as ListingType | '')}
          disabled={pending}
          className="w-full appearance-none bg-transparent text-[15.5px] font-bold leading-[1.1] tracking-[-0.01em] text-white outline-none disabled:opacity-60"
        >
          <option value="" className="text-foreground">
            {t('landing.hero.search.type.placeholder')}
          </option>
          {LISTING_TYPES.map((value) => (
            <option key={value} value={value} className="text-foreground">
              {t(`listing.type.${value}` as const)}
            </option>
          ))}
        </select>
      </Field>

      <Field icon="wallet" label={t('landing.hero.search.priceMax.label')}>
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
      </Field>

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="inline-flex min-h-16 min-w-[170px] items-center justify-center gap-2 rounded-xl border-[1.5px] border-white bg-white px-7 text-[15px] font-bold leading-none tracking-[-0.005em] text-primary transition hover:bg-[oklch(0.97_0.012_90)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 max-lg:col-span-full"
      >
        {pending && (
          <span
            aria-hidden
            className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary/30 border-t-primary"
          />
        )}
        <Icon name="search" size={17} />
        {submitLabel}
      </button>
    </form>
  )
}

function Field({
  icon,
  label,
  children,
}: {
  icon: 'pin' | 'house' | 'wallet'
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="flex min-h-16 items-center gap-3.5 rounded-xl border-[1.5px] border-white/50 px-3.5 py-3 text-left text-white transition hover:border-white hover:bg-white/[0.06]">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-white/15 text-white">
        <Icon name={icon} size={18} />
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-[10.5px] font-semibold uppercase leading-none tracking-[0.1em] text-white/70">
          {label}
        </span>
        {children}
      </span>
    </label>
  )
}

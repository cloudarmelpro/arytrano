'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useT } from '@/lib/i18n/client'
import { PublicListingCard } from '@/features/listings/components/PublicListingCard'
import type { PublicListingCard as PublicListingCardData } from '@/features/listings/queries/list-public-listings'

const MIN_LISTINGS_FOR_SECTION = 3
const TABS = ['ALL', 'STUDIO', 'ROOM', 'APARTMENT', 'HOUSE'] as const
type Tab = (typeof TABS)[number]

export function LandingFeatured({
  listings,
  totalPublished,
  authenticated,
  favoritedIds,
}: {
  listings: PublicListingCardData[]
  totalPublished: number
  authenticated: boolean
  favoritedIds: Set<string>
}) {
  const t = useT()
  const [tab, setTab] = useState<Tab>('ALL')

  const filtered = useMemo(() => {
    if (tab === 'ALL') return listings
    return listings.filter((l) => l.type === tab)
  }, [listings, tab])

  if (listings.length < MIN_LISTINGS_FOR_SECTION) return null

  const viewAllKey =
    totalPublished <= 1
      ? 'landing.featured.viewAll.one'
      : 'landing.featured.viewAll.other'

  return (
    <section className="border-b border-border bg-background py-16 lg:py-20">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-6 lg:px-10">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="font-serif text-[clamp(28px,3vw,40px)] font-normal leading-[1.1] tracking-[-0.018em] text-foreground">
              {t('landing.featured.title')}
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              {t('landing.featured.lead')}
            </p>
          </div>
          <Link
            href="/annonces"
            className="text-sm font-medium text-primary transition hover:text-primary/80"
          >
            {t('landing.featured.viewMap')}
          </Link>
        </header>

        <div
          role="tablist"
          aria-label={t('landing.featured.title')}
          className="flex flex-wrap gap-2"
        >
          {TABS.map((tabKey) => {
            const labelKey =
              tabKey === 'ALL'
                ? 'landing.featured.tab.all'
                : (`landing.featured.tab.${tabKey}` as const)
            const isActive = tab === tabKey
            return (
              <button
                key={tabKey}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setTab(tabKey)}
                className={`inline-flex h-9 cursor-pointer items-center rounded-full px-4 text-sm font-medium transition ${isActive
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
              >
                {t(labelKey)}
              </button>
            )
          })}
        </div>

        {filtered.length === 0 ? (
          <p className="rounded-xl bg-muted/40 px-5 py-8 text-center text-sm text-muted-foreground">
            {t('landing.featured.tab.empty')}
          </p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((l) => (
              <PublicListingCard
                key={l.id}
                listing={l}
                t={t}
                authenticated={authenticated}
                initialFavorited={favoritedIds.has(l.id)}
              />
            ))}
          </ul>
        )}

        <div className="flex justify-end">
          <Link
            href="/annonces"
            className="inline-flex h-10 items-center rounded-xl bg-primary px-6 text-sm text-primary-foreground shadow-sm transition hover:opacity-95"
          >
            {t(viewAllKey, { count: totalPublished })}
          </Link>
        </div>
      </div>
    </section>
  )
}

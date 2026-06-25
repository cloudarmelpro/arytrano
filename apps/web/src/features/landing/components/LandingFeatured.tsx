'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useT } from '@/lib/i18n/client'
import {
  PublicListingCard,
  type PublicListingCardData,
} from '@/features/listings'

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

  // const viewAllKey =
  //   totalPublished <= 1
  //     ? 'landing.featured.viewAll.one'
  //     : 'landing.featured.viewAll.other'

  return (
    <section className="bg-background py-16 lg:py-20">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-6 lg:px-10">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-[clamp(28px,3vw,40px)] font-normal leading-[1.1] tracking-[-0.018em] text-foreground">
              {t('landing.featured.title')}
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              {t('landing.featured.lead')}
            </p>
          </div>
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
                id={`featured-tab-${tabKey}`}
                aria-selected={isActive}
                aria-controls="featured-panel"
                onClick={() => setTab(tabKey)}
                className={`inline-flex h-8 cursor-pointer items-center rounded-xl px-4 text-xs font-medium transition ${isActive
                  ? 'border border-primary text-primary'
                  : 'text-foreground/70 hover:bg-muted/40 hover:text-foreground'
                  }`}
              >
                {t(labelKey)}
              </button>
            )
          })}
        </div>

        <div
          role="tabpanel"
          id="featured-panel"
          aria-labelledby={`featured-tab-${tab}`}
        >
          {filtered.length === 0 ? (
            <p className="rounded-xl bg-muted/40 px-5 py-8 text-center text-sm text-muted-foreground">
              {t('landing.featured.tab.empty')}
            </p>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-3 lg:grid-cols-4">
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
        </div>
      </div>
    </section>
  )
}

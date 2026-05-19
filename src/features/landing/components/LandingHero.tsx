import type { Locale } from '@/lib/i18n/config'
import { getT } from '@/lib/i18n/translate'
import {
  LandingSearchCard,
  type NeighborhoodOption,
} from './LandingSearchCard'

export function LandingHero({
  locale,
  neighborhoods,
  publishedListings,
  verifiedOwners,
}: {
  locale: Locale
  neighborhoods: NeighborhoodOption[]
  publishedListings: number
  verifiedOwners: number
}) {
  const t = getT(locale)
  return (
    <section className="relative isolate overflow-hidden bg-primary pt-16 pb-24 text-white lg:pt-20 lg:pb-28">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[12%] -top-[10%] -z-10 h-[720px] w-[720px] rounded-full bg-[radial-gradient(circle_at_center,oklch(0.62_0.22_290_/_0.5)_0%,transparent_60%)]"
      />
      <div className="relative z-10 mx-auto max-w-[1280px] px-6 lg:px-10">
        <h1 className="m-0 max-w-[1040px] font-serif text-[clamp(36px,5.4vw,76px)] font-normal leading-[1.05] tracking-[-0.015em] text-balance">
          {t('landing.hero.title')}
        </h1>
        <p className="mt-5 mb-9 max-w-[720px] font-serif text-[clamp(17px,1.6vw,22px)] font-normal italic leading-[1.4] text-white/85">
          {t(
            publishedListings <= 1
              ? 'landing.hero.lead.one'
              : 'landing.hero.lead.other',
            { count: publishedListings },
          )}
        </p>

        <LandingSearchCard
          neighborhoods={neighborhoods}
          publishedListings={publishedListings}
        />

        <p className="mt-5 text-[13px] text-white/70">
          {t('landing.hero.microStats', {
            count: publishedListings,
            verified: verifiedOwners,
          })}
        </p>
      </div>
    </section>
  )
}

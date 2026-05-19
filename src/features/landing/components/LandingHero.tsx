import type { Locale } from '@/lib/i18n/config'
import { getT } from '@/lib/i18n/translate'
import {
  LandingSearchCard,
  type NeighborhoodOption,
} from './LandingSearchCard'

/**
 * Hero block (T-041) — full-width gradient placeholder (a real photo can
 * later replace the background div via a single change) with the brand
 * eyebrow, H1, lead, then the white search card overlaid below it.
 *
 * The gradient uses our brand primary fading into a darker indigo to
 * mimic the depth a real Fianarantsoa shot would give — perceived
 * quality stays high even without an actual photo asset.
 */
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
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-br from-primary via-primary/90 to-primary/70"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]"
      />

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-16 pb-20 text-primary-foreground sm:px-6 sm:pt-20 sm:pb-24 md:pt-28 md:pb-32">
        <div className="flex flex-col gap-4 max-w-3xl">
          <span className="inline-flex w-fit items-center rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-white backdrop-blur-sm">
            {t('landing.hero.eyebrow')}
          </span>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            {t('landing.hero.title')}
          </h1>
          <p className="max-w-2xl text-base text-white/85 sm:text-lg">
            {t(
              publishedListings <= 1
                ? 'landing.hero.lead.one'
                : 'landing.hero.lead.other',
              { count: publishedListings },
            )}
          </p>
        </div>

        <div className="mt-2 max-w-4xl">
          <LandingSearchCard
            neighborhoods={neighborhoods}
            publishedListings={publishedListings}
          />
        </div>

        <p className="mt-1 text-xs text-white/70 sm:text-sm">
          {t('landing.hero.microStats', {
            count: publishedListings,
            verified: verifiedOwners,
          })}
        </p>
      </div>
    </section>
  )
}

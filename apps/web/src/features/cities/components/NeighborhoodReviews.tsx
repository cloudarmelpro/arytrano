import type { Locale } from '@/lib/i18n/config'
import { getT } from '@/lib/i18n/translate'

/**
 * Aggregated review signal for a neighborhood landing page.
 *
 * We deliberately render aggregate stats only (count + average) and
 * NOT individual review bodies. Reasons :
 *   - Privacy : the reviews on this page span multiple listings and
 *     authors — surfacing them grouped without attribution would
 *     leak who lived where.
 *   - SEO : Google penalizes content scraped/duplicated from listing
 *     detail pages. The aggregate is unique to the quartier landing
 *     and adds value without duplication.
 *
 * When the count is 0 the section returns null (no awkward "Aucun
 * avis" placeholder).
 */
export function NeighborhoodReviews({
  locale,
  quartierName,
  count,
  averageRating,
}: {
  locale: Locale
  quartierName: string
  count: number
  averageRating: number | null
}) {
  const t = getT(locale)
  if (count === 0 || averageRating === null) return null

  const stars =
    '★'.repeat(Math.round(averageRating)) +
    '☆'.repeat(5 - Math.round(averageRating))

  return (
    <section className="bg-background py-16">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="flex flex-col gap-6 rounded-2xl bg-muted/40 p-8 sm:flex-row sm:items-center sm:gap-10">
          <div className="flex flex-col gap-1">
            <span
              aria-hidden
              className="font-mono text-[42px] leading-none text-primary"
            >
              {stars}
            </span>
            <span className="font-mono text-[20px] font-semibold text-foreground">
              {averageRating.toFixed(1)} / 5
            </span>
            <span className="text-[12.5px] text-muted-foreground">
              {t('neighborhoodLanding.reviews.basedOn', { count })}
            </span>
          </div>
          <div className="flex-1">
            <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
              {t('neighborhoodLanding.reviews.eyebrow')}
            </span>
            <h2 className="mt-2 text-[clamp(22px,2.6vw,32px)] font-normal leading-[1.15] tracking-[-0.02em] text-foreground">
              {t('neighborhoodLanding.reviews.title', { quartier: quartierName })}
            </h2>
            <p className="mt-2 text-[14px] leading-[1.55] text-foreground/70">
              {t('neighborhoodLanding.reviews.lead', { quartier: quartierName })}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

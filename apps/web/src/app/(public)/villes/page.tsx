import type { Metadata } from 'next'
import Link from 'next/link'
import { listCitiesWithCounts } from '@/features/landing/server'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'
import { localeAlternates } from '@/lib/seo/alternates'
import { BreadcrumbJsonLd } from '@/lib/seo/breadcrumb'
import type { MessageKey } from '@/lib/i18n/messages'

/**
 * Hub `/villes` listing every seeded city. SEO-targeted ("logement
 * étudiant à Madagascar") and serves as a fallback when a visitor
 * doesn't know which city to start with.
 *
 * Each card links to the per-city landing (`/villes/<slug>`) with a
 * tagline pulled from i18n (`cities.<slug>.tagline`) so cities feel
 * distinctive in the grid.
 */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = getT(locale)
  return {
    title: t('villesHub.meta.title'),
    description: t('villesHub.meta.description'),
    alternates: await localeAlternates('/villes'),
    openGraph: {
      title: t('villesHub.meta.title'),
      description: t('villesHub.meta.description'),
      url: '/villes',
      type: 'website',
    },
  }
}

export default async function VillesHubPage() {
  const [cities, locale] = await Promise.all([
    listCitiesWithCounts(),
    getLocale(),
  ])
  const t = getT(locale)

  return (
    <>
      <BreadcrumbJsonLd
        homeLabel={t('common.home')}
        trail={[{ name: t('villesHub.meta.title'), href: '/villes' }]}
      />
      <section className="bg-primary text-white">
        <div className="mx-auto max-w-[1280px] px-6 py-16 lg:px-10 lg:py-20">
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/70">
            {t('villesHub.eyebrow')}
          </span>
          <h1 className="mt-3 text-[clamp(36px,5vw,68px)] font-normal leading-[1.04] tracking-[-0.02em] text-white">
            {t('villesHub.title')}
          </h1>
          <p className="mt-4 max-w-[640px] text-[17px] leading-[1.55] text-white/85">
            {t('villesHub.lead', { count: cities.length })}
          </p>
        </div>
      </section>

      <section className="bg-background py-16">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cities.map((city) => {
              const name = locale === 'mg' ? city.nameMg : city.nameFr
              const taglineKey =
                `cities.${city.slug}.tagline` as MessageKey
              const isEmpty = city.listingCount === 0
              return (
                <li key={city.slug}>
                  <Link
                    href={`/villes/${city.slug}`}
                    className="group flex h-full flex-col gap-3 rounded-2xl bg-muted/40 p-6 transition hover:bg-muted/70"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <h2 className="text-[clamp(22px,2.6vw,30px)] font-normal leading-[1.1] tracking-[-0.02em] text-foreground">
                        {name}
                      </h2>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11.5px] font-mono ${
                          isEmpty
                            ? 'bg-muted/60 text-muted-foreground'
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {isEmpty
                          ? t('villesHub.card.empty')
                          : t('villesHub.card.count', {
                              count: city.listingCount,
                            })}
                      </span>
                    </div>
                    <p className="text-[14px] leading-[1.55] text-foreground/70">
                      {t(taglineKey)}
                    </p>
                    <span className="mt-auto inline-flex items-center gap-1 text-[13px] font-semibold text-primary transition group-hover:translate-x-1">
                      {t('villesHub.card.cta')} →
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </section>
    </>
  )
}

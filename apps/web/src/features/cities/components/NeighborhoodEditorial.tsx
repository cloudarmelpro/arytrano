import type { Locale } from '@/lib/i18n/config'
import { safeJsonLd } from '@/lib/seo/safe-json-ld'
import type {
  NeighborhoodEditorial as Editorial,
  NeighborhoodEditorialBody,
} from '../queries/get-neighborhood-landing-data'

/**
 * CON-03 — long-tail SEO content block on the neighborhood landing.
 *
 * Renders the editorial body (ambiance / walk / transport / distance
 * / landmark) as a set of <section>s, falls back across locales when
 * the active one is empty, and emits a small FAQPage JSON-LD that
 * surfaces in Google rich results for queries like "logement
 * <quartier> <ville>".
 */
function pickBody(
  editorial: Editorial | null,
  locale: Locale,
): NeighborhoodEditorialBody | null {
  if (!editorial) return null
  const primary =
    locale === 'mg' ? editorial.mg ?? editorial.fr : editorial.fr ?? editorial.mg
  return primary ?? null
}

export function NeighborhoodEditorial({
  locale,
  editorial,
  quartierName,
  cityName,
}: {
  locale: Locale
  editorial: Editorial | null
  quartierName: string
  cityName: string
}) {
  const body = pickBody(editorial, locale)
  if (!body) return null

  const sections: Array<{ heading: string; body: string }> = []
  if (body.tagline)
    sections.push({
      heading: locale === 'mg' ? 'Eto' : 'En un coup d’œil',
      body: body.tagline,
    })
  if (body.ambiance)
    sections.push({
      heading: locale === 'mg' ? 'Tontolon’ny manodidina' : 'Ambiance',
      body: body.ambiance,
    })
  if (body.landmark)
    sections.push({
      heading: locale === 'mg' ? 'Mariho' : 'Repères',
      body: body.landmark,
    })
  if (body.walk)
    sections.push({
      heading: locale === 'mg' ? 'An-tongotra' : 'À pied',
      body: body.walk,
    })
  if (body.transport)
    sections.push({
      heading: locale === 'mg' ? 'Fitaterana' : 'Transports',
      body: body.transport,
    })
  if (body.distance)
    sections.push({
      heading: locale === 'mg' ? 'Halaviran-dalana' : 'Distances',
      body: body.distance,
    })

  if (sections.length === 0) return null

  // FAQPage JSON-LD — rich-results boost. Pick a handful of common
  // long-tail questions, answer each with the matching editorial body.
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      body.ambiance && {
        '@type': 'Question',
        name: `Quelle est l’ambiance de ${quartierName} (${cityName}) ?`,
        acceptedAnswer: { '@type': 'Answer', text: body.ambiance },
      },
      body.transport && {
        '@type': 'Question',
        name: `Comment se déplacer depuis ${quartierName} ?`,
        acceptedAnswer: { '@type': 'Answer', text: body.transport },
      },
      body.walk && {
        '@type': 'Question',
        name: `Que peut-on faire à pied à ${quartierName} ?`,
        acceptedAnswer: { '@type': 'Answer', text: body.walk },
      },
      body.distance && {
        '@type': 'Question',
        name: `À quelle distance se trouvent les écoles/universités depuis ${quartierName} ?`,
        acceptedAnswer: { '@type': 'Answer', text: body.distance },
      },
    ].filter(Boolean),
  }

  return (
    <section className="bg-background py-14 lg:py-16">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <h2 className="font-serif text-[clamp(24px,2.8vw,36px)] font-normal leading-[1.1] tracking-[-0.02em] text-foreground">
          {locale === 'mg'
            ? `Mahafantatra an’i ${quartierName}`
            : `Découvrir ${quartierName}`}
        </h2>
        <div className="mt-6 grid gap-8 md:grid-cols-2 lg:gap-x-16">
          {sections.map((s) => (
            <div key={s.heading} className="flex flex-col gap-2">
              <h3 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-primary">
                {s.heading}
              </h3>
              <p className="text-[15px] leading-[1.65] text-foreground/75">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
      {faqJsonLd.mainEntity.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }}
        />
      )}
    </section>
  )
}

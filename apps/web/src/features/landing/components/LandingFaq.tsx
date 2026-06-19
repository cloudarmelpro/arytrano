import dynamic from 'next/dynamic'
import type { Locale } from '@/lib/i18n/config'
import { getT } from '@/lib/i18n/translate'
import { safeJsonLd } from '@/lib/seo/safe-json-ld'
import type { MessageKey } from '@/lib/i18n/messages'
import { Icon } from '@/components/shared/Icon'

/**
 * Performance audit H-1 (2026-05-29) — the accordion is below-the-fold
 * and pulls in `motion/react` (~30 kB gz). Pre-fix it shipped in the
 * landing page's initial client bundle, hurting LCP on slow Madagascar
 * 3G connections. Wrapping in `next/dynamic` defers the JS chunk so
 * the page becomes interactive without it.
 *
 * Note : no `ssr: false` because this is consumed from a Server
 * Component (Next 16 disallows that combination from RSC). The first-
 * paint HTML still includes the accordion frame (questions visible),
 * but the heavy motion-driven open/close interaction loads on demand.
 */
const LandingFaqAccordion = dynamic(() =>
  import('./LandingFaqAccordion').then((m) => m.LandingFaqAccordion),
)

const QUESTIONS: Array<{ q: MessageKey; a: MessageKey }> = [
  { q: 'landing.faq.q1.question', a: 'landing.faq.q1.answer' },
  { q: 'landing.faq.q2.question', a: 'landing.faq.q2.answer' },
  { q: 'landing.faq.q3.question', a: 'landing.faq.q3.answer' },
  { q: 'landing.faq.q4.question', a: 'landing.faq.q4.answer' },
  { q: 'landing.faq.q5.question', a: 'landing.faq.q5.answer' },
]

export function LandingFaq({ locale }: { locale: Locale }) {
  const t = getT(locale)
  const items = QUESTIONS.map((q) => ({
    question: t(q.q),
    answer: t(q.a),
  }))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.question,
      acceptedAnswer: { '@type': 'Answer', text: it.answer },
    })),
  }

  return (
    <section className="bg-white py-20 lg:py-24">
      {/* Aligned with the listing detail page container
          (`max-w-6xl px-4`) so a visitor scrolling from a detail
          page into the home doesn't see the content width jump. */}
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.5fr] lg:px-8 max-lg:gap-8">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
            {t('landing.faq.eyebrow' as MessageKey)}
          </span>
          <h2 className="mt-3.5 text-[clamp(28px,3vw,40px)] font-normal leading-[1.05] tracking-[-0.025em] text-foreground">
            {t('landing.faq.title')}
          </h2>
          <p className="mt-3 text-[14.5px] leading-[1.6] text-foreground/65">
            {t('landing.faq.lead')}
          </p>

          {/* Contact card — same DNA as the Students cards :
              ring + shadow + interactive icon chip. */}
          <a
            href="https://wa.me/261000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-8 flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(16,18,40,0.04),0_8px_28px_-16px_rgba(16,18,40,0.12)] ring-1 ring-border/60 transition-all duration-300 hover:shadow-[0_2px_4px_rgba(16,18,40,0.05),0_16px_36px_-18px_rgba(25,25,112,0.25)] hover:ring-primary/30 no-underline"
          >
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/[0.08] text-primary ring-1 ring-primary/15 transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:ring-primary">
              <Icon name="whatsapp" size={20} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-[14.5px] font-bold text-foreground">
                {t('landing.faq.contact.title' as MessageKey)}
              </span>
              <span className="text-[12.5px] font-medium text-foreground/55">
                {t('landing.faq.contact.sub' as MessageKey)}
              </span>
            </span>
            <Icon
              name="arrow-up-right"
              size={16}
              className="shrink-0 text-foreground/40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
            />
            <span className="sr-only">
              {' '}
              (ouvre WhatsApp dans un nouvel onglet)
            </span>
          </a>
        </aside>

        <LandingFaqAccordion items={items} />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
    </section>
  )
}

import type { Locale } from '@/lib/i18n/config'
import { getT } from '@/lib/i18n/translate'
import { safeJsonLd } from '@/lib/seo/safe-json-ld'
import type { MessageKey } from '@/lib/i18n/messages'

const QUESTIONS: Array<{ q: MessageKey; a: MessageKey }> = [
  { q: 'landing.faq.q1.question', a: 'landing.faq.q1.answer' },
  { q: 'landing.faq.q2.question', a: 'landing.faq.q2.answer' },
  { q: 'landing.faq.q3.question', a: 'landing.faq.q3.answer' },
  { q: 'landing.faq.q4.question', a: 'landing.faq.q4.answer' },
  { q: 'landing.faq.q5.question', a: 'landing.faq.q5.answer' },
]

/**
 * FAQ section (T-046). Uses native `<details>` so the accordion works
 * without client JS — perfect for our 3G context. Companion JSON-LD
 * (`FAQPage` schema) emitted alongside via `safeJsonLd` to unlock
 * Google's rich-results snippet for FAQ pages.
 */
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
      acceptedAnswer: {
        '@type': 'Answer',
        text: it.answer,
      },
    })),
  }

  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-16 sm:px-6 sm:py-20">
        <header className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            {t('landing.faq.title')}
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            {t('landing.faq.lead')}
          </p>
        </header>

        <ul className="flex flex-col gap-2">
          {items.map((it, i) => (
            <li key={i}>
              <details className="group rounded-xl bg-muted/40 px-5 py-4 open:bg-muted/60">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-foreground">
                  <span>{it.question}</span>
                  <span
                    aria-hidden
                    className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground transition group-open:rotate-45 group-open:text-primary"
                  >
                    <PlusIcon />
                  </span>
                </summary>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {it.answer}
                </p>
              </details>
            </li>
          ))}
        </ul>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
    </section>
  )
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

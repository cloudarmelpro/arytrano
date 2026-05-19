import type { Locale } from '@/lib/i18n/config'
import { getT } from '@/lib/i18n/translate'
import { safeJsonLd } from '@/lib/seo/safe-json-ld'
import type { MessageKey } from '@/lib/i18n/messages'
import { Icon } from '@/components/shared/Icon'

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
    <section className="bg-background py-20 lg:py-24">
      <div className="mx-auto grid max-w-[1280px] gap-12 px-6 lg:grid-cols-[1fr_1.5fr] lg:px-10 max-lg:gap-8">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
            {t('landing.faq.eyebrow' as MessageKey)}
          </span>
          <h2 className="mt-3.5 font-serif text-[clamp(28px,3vw,40px)] font-normal leading-[1.05] tracking-[-0.02em] text-foreground">
            {t('landing.faq.title')}
          </h2>
          <p className="mt-3 text-[14.5px] leading-[1.55] text-foreground/70">
            {t('landing.faq.lead')}
          </p>

          <a
            href="#"
            className="mt-7 flex items-center gap-3.5 rounded-2xl border border-border bg-muted/40 p-4 no-underline transition hover:bg-muted/60"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon name="whatsapp" size={20} />
            </span>
            <span className="flex flex-1 flex-col">
              <span className="text-[14.5px] font-semibold text-foreground">
                {t('landing.faq.contact.title' as MessageKey)}
              </span>
              <span className="text-[12.5px] font-medium text-muted-foreground">
                {t('landing.faq.contact.sub' as MessageKey)}
              </span>
            </span>
            <Icon name="arrow-up-right" size={16} className="text-muted-foreground" />
          </a>
        </aside>

        <div className="flex flex-col gap-2">
          {items.map((it, i) => (
            <details
              key={i}
              className="group rounded-2xl border border-border bg-background p-5 transition hover:border-primary/40 open:border-primary/60 open:bg-muted/30"
            >
              <summary className="flex cursor-pointer list-none items-start gap-5">
                <span className="shrink-0 font-mono text-[12px] font-semibold tracking-[0.06em] text-primary">
                  Q{String(i + 1).padStart(2, '0')}
                </span>
                <span className="flex-1 text-[16px] font-semibold leading-[1.4] text-foreground">
                  {it.question}
                </span>
                <span
                  aria-hidden
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition group-open:rotate-45 group-open:bg-primary group-open:text-primary-foreground"
                >
                  <Icon name="plus" size={16} />
                </span>
              </summary>
              <p className="mt-3 whitespace-pre-wrap pl-12 text-[14px] leading-[1.6] text-foreground/70">
                {it.answer}
              </p>
            </details>
          ))}
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
    </section>
  )
}

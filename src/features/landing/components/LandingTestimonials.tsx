import type { Locale } from '@/lib/i18n/config'
import { getT } from '@/lib/i18n/translate'
import type { MessageKey } from '@/lib/i18n/messages'

type TestimonialKey = 't1' | 't2' | 't3' | 't4' | 't5' | 't6'

const TESTIMONIALS: Array<{
  id: TestimonialKey
  name: MessageKey
  area: MessageKey
  role: MessageKey
  quote: MessageKey
}> = [
  {
    id: 't1',
    name: 'landing.testimonials.t1.name',
    area: 'landing.testimonials.t1.area',
    role: 'landing.testimonials.t1.role',
    quote: 'landing.testimonials.t1.quote',
  },
  {
    id: 't2',
    name: 'landing.testimonials.t2.name',
    area: 'landing.testimonials.t2.area',
    role: 'landing.testimonials.t2.role',
    quote: 'landing.testimonials.t2.quote',
  },
  {
    id: 't3',
    name: 'landing.testimonials.t3.name',
    area: 'landing.testimonials.t3.area',
    role: 'landing.testimonials.t3.role',
    quote: 'landing.testimonials.t3.quote',
  },
  {
    id: 't4',
    name: 'landing.testimonials.t4.name',
    area: 'landing.testimonials.t4.area',
    role: 'landing.testimonials.t4.role',
    quote: 'landing.testimonials.t4.quote',
  },
  {
    id: 't5',
    name: 'landing.testimonials.t5.name',
    area: 'landing.testimonials.t5.area',
    role: 'landing.testimonials.t5.role',
    quote: 'landing.testimonials.t5.quote',
  },
  {
    id: 't6',
    name: 'landing.testimonials.t6.name',
    area: 'landing.testimonials.t6.area',
    role: 'landing.testimonials.t6.role',
    quote: 'landing.testimonials.t6.quote',
  },
]

export function LandingTestimonials({ locale }: { locale: Locale }) {
  const t = getT(locale)
  return (
    <section className="border-b border-border bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16 sm:px-6 sm:py-20">
        <header className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            {t('landing.testimonials.title')}
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            {t('landing.testimonials.lead')}
          </p>
        </header>

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((entry) => {
            const role = t(entry.role)
            const isOwner = role === 'owner'
            const roleLabel = t(
              isOwner
                ? 'landing.testimonials.role.owner'
                : 'landing.testimonials.role.student',
            )
            return (
              <li
                key={entry.id}
                className="flex flex-col gap-3 rounded-xl bg-background p-5 shadow-sm ring-1 ring-border/40"
              >
                <p className="text-sm leading-relaxed text-foreground">
                  “{t(entry.quote)}”
                </p>
                <div className="flex items-center gap-3 border-t border-border/60 pt-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {t(entry.name).charAt(0)}
                  </span>
                  <div className="flex flex-col text-xs">
                    <span className="font-semibold text-foreground">
                      {t(entry.name)}
                    </span>
                    <span className="text-muted-foreground">
                      {roleLabel} · {t(entry.area)}
                    </span>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

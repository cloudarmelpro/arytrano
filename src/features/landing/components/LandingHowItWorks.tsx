import type { Locale } from '@/lib/i18n/config'
import { getT } from '@/lib/i18n/translate'
import type { MessageKey } from '@/lib/i18n/messages'

/**
 * Three-step "Comment ça marche" section (T-042). Sits between the
 * neighborhoods grid and the owner CTA — explains the funnel to a
 * first-time student visitor so they know what to expect.
 */
export function LandingHowItWorks({ locale }: { locale: Locale }) {
  const t = getT(locale)
  const steps: Array<{
    titleKey: MessageKey
    bodyKey: MessageKey
    icon: React.ReactNode
  }> = [
    {
      titleKey: 'landing.how.step1.title',
      bodyKey: 'landing.how.step1.body',
      icon: <SearchIcon />,
    },
    {
      titleKey: 'landing.how.step2.title',
      bodyKey: 'landing.how.step2.body',
      icon: <PhoneIcon />,
    },
    {
      titleKey: 'landing.how.step3.title',
      bodyKey: 'landing.how.step3.body',
      icon: <KeyIcon />,
    },
  ]
  return (
    <section className="border-b border-border bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 sm:py-20">
        <header className="flex flex-col gap-2 text-center">
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            {t('landing.how.title')}
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            {t('landing.how.lead')}
          </p>
        </header>

        <ol className="grid gap-8 sm:grid-cols-3">
          {steps.map((s, i) => (
            <StepCard
              key={s.titleKey}
              step={i + 1}
              title={t(s.titleKey)}
              body={t(s.bodyKey)}
              icon={s.icon}
            />
          ))}
        </ol>
      </div>
    </section>
  )
}

function StepCard({
  step,
  title,
  body,
  icon,
}: {
  step: number
  title: string
  body: string
  icon: React.ReactNode
}) {
  return (
    <li className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {step}
        </span>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
    </li>
  )
}

function SearchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72a2 2 0 0 1 1.72 2z" />
    </svg>
  )
}

function KeyIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  )
}

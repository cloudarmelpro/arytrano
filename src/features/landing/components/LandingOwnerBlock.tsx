import Link from 'next/link'
import type { UserRole } from '@prisma/client'
import type { Locale } from '@/lib/i18n/config'
import { getT } from '@/lib/i18n/translate'

/**
 * Owner conversion block (T-045). Sits late in the landing — after the
 * student-focused sections — so the prospective owner has seen the
 * value prop before being asked to sign up. Hidden when the visitor is
 * already a logged-in owner or admin (the CTA is irrelevant).
 */
export function LandingOwnerBlock({
  locale,
  role,
}: {
  locale: Locale
  role: UserRole | null
}) {
  if (role === 'OWNER' || role === 'ADMIN') return null
  const t = getT(locale)
  return (
    <section className="border-b border-border bg-primary/5">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col gap-4">
          <span className="inline-flex w-fit items-center rounded-md bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
            {t('landing.ownerBlock.eyebrow')}
          </span>
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl md:text-4xl">
            {t('landing.ownerBlock.title')}
          </h2>
          <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
            {t('landing.ownerBlock.lead')}
          </p>
        </div>

        <div className="flex flex-col gap-6 self-center">
          <ul className="flex flex-col gap-3 text-sm sm:text-base">
            <Bullet label={t('landing.ownerBlock.bullet1')} />
            <Bullet label={t('landing.ownerBlock.bullet2')} />
            <Bullet label={t('landing.ownerBlock.bullet3')} />
            <Bullet label={t('landing.ownerBlock.bullet4')} />
          </ul>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/sign-up?role=OWNER"
              className="inline-flex h-12 w-fit items-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition hover:shadow-md hover:opacity-90"
            >
              {t('landing.ownerBlock.cta')}
              <span aria-hidden className="ml-2">→</span>
            </Link>
            <Link
              href="/annonces"
              className="inline-flex h-12 w-fit items-center rounded-md border border-border bg-background px-6 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              {t('landing.ownerBlock.ctaSecondary')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function Bullet({ label }: { label: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <CheckIcon />
      </span>
      <span className="text-foreground">{label}</span>
    </li>
  )
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

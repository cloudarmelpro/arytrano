'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, MotionConfig } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field'
import { formatAriary } from '@/lib/format/currency'
import type { Locale } from '@/lib/i18n/config'
import { useT, type Translator } from '@/lib/i18n/client'
import type { MessageKey } from '@/lib/i18n/messages/types'
import type { QuartierRow } from '@/features/landing/server'
import type { ScoredQuartier } from '../types'
import { subscribeQuizEmailAction } from '../actions/submit-quiz'

export function QuizResults({
  locale,
  quartiers,
  scored,
  submissionId,
  onRestart,
}: {
  locale: Locale
  quartiers: QuartierRow[]
  scored: ScoredQuartier[]
  submissionId: string | null
  onRestart: () => void
}) {
  // PERF-H1 audit fix — client-side translator via context (active locale
  // already injected at the root layout). Was `getT(locale)` which pulled
  // both dictionaries into the client bundle.
  const t = useT()

  // Reorder full quartier rows in the scored sequence so we can show
  // names, photos, listing counts without a second DB lookup.
  const ranked = scored
    .map((s) => {
      const q = quartiers.find((qq) => qq.slug === s.slug)
      if (!q) return null
      return { ...s, quartier: q }
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)

  const [top, ...rest] = ranked

  return (
    <MotionConfig reducedMotion="user">
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div className="max-w-[720px]">
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
            {t('quiz.results.eyebrow')}
          </span>
          <h1 className="mt-3 text-[clamp(30px,3.6vw,46px)] font-normal leading-[1.05] tracking-[-0.02em] text-foreground">
            {t('quiz.results.title')}
          </h1>
          <p className="mt-3 max-w-[560px] text-[16px] leading-[1.55] text-foreground/70">
            {t('quiz.results.subtitle')}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={onRestart}
          className="h-11 shrink-0 self-start rounded-xl border-border bg-muted/40 px-5 text-[14px] font-semibold hover:bg-muted sm:self-end"
        >
          ↻ {t('quiz.restart')}
        </Button>
      </header>

      {top ? (
        <TopMatchCard locale={locale} data={top} t={t} />
      ) : null}

      {rest.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            {t('quiz.results.alsoConsider')}
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((r) => (
              <SecondaryCard key={r.slug} locale={locale} data={r} t={t} />
            ))}
          </div>
        </section>
      ) : null}

      {submissionId ? (
        <EmailCaptureCard submissionId={submissionId} t={t} />
      ) : null}
    </motion.div>
    </MotionConfig>
  )
}

function TopMatchCard({
  locale,
  data,
  t,
}: {
  locale: Locale
  data: ScoredQuartier & { quartier: QuartierRow }
  t: Translator
}) {
  const { quartier, reasonCodes } = data
  const name = locale === 'mg' ? quartier.nameMg : quartier.nameFr
  const heroPhoto = quartier.sampleListings[0]?.photo ?? null
  const listingsHref = `/annonces?neighborhood=${quartier.slug}`

  return (
    <article className="mt-10 overflow-hidden rounded-[24px] border border-border bg-background shadow-[0_1px_2px_rgba(16,18,40,.03),0_24px_60px_-30px_rgba(16,18,40,.16)] lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <div className="relative aspect-[4/3] min-h-[260px] lg:aspect-auto lg:min-h-[460px]">
        {heroPhoto ? (
          <Image
            src={heroPhoto.url}
            alt={heroPhoto.altFr ?? name}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            placeholder={heroPhoto.blurhash ? 'blur' : 'empty'}
            blurDataURL={heroPhoto.blurhash ?? undefined}
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,oklch(0.88_0.04_70)_0_14px,oklch(0.91_0.025_70)_14px_28px)]" />
        )}
        {/* Subtle dark gradient at the bottom — helps the badge read
            against busy photos and gives the corner a finished look. */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent"
        />
        <span className="absolute left-5 top-5 inline-flex h-7 items-center gap-1.5 rounded-full bg-foreground px-3 text-[11.5px] font-bold uppercase tracking-[0.08em] text-background shadow-md">
          <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
          {t('quiz.results.topMatchLabel')}
        </span>
      </div>

      <div className="flex flex-col gap-6 p-7 lg:p-10">
        <div>
          <h2 className="text-[clamp(28px,3vw,42px)] font-normal leading-[1.05] tracking-[-0.018em] text-foreground">
            {name}
          </h2>
          {quartier.avgPriceMGA || quartier.publishedListings > 0 ? (
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13.5px] font-medium text-muted-foreground">
              {quartier.avgPriceMGA ? (
                <>
                  <span>
                    {t('quartiers.block.dataCell.avgPrice')}{' '}
                    <span className="font-semibold text-foreground">
                      {formatAriary(quartier.avgPriceMGA)}
                    </span>
                  </span>
                  <span aria-hidden>·</span>
                </>
              ) : null}
              <span className="font-semibold text-foreground">
                {labelForListingsCta(quartier.publishedListings, t)}
              </span>
            </p>
          ) : null}
        </div>

        <div className="rounded-2xl bg-muted/40 p-5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            {t('quiz.results.whyMatches')}
          </span>
          <div className="mt-3">
            <ReasonChips codes={reasonCodes} t={t} />
          </div>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2.5">
          <Link
            href={listingsHref}
            className="inline-flex h-12 items-center rounded-xl bg-primary px-5 text-[14.5px] font-semibold text-primary-foreground transition hover:opacity-95"
          >
            {labelForListingsCta(quartier.publishedListings, t)}{' '}
            <span aria-hidden className="ml-2">→</span>
          </Link>
          <Link
            href={`/quartiers#${quartier.slug}`}
            className="inline-flex h-12 items-center rounded-xl border border-border bg-background px-5 text-[14.5px] font-semibold text-foreground transition hover:bg-muted"
          >
            {t('common.learnMore')}
          </Link>
        </div>
      </div>
    </article>
  )
}

function SecondaryCard({
  locale,
  data,
  t,
}: {
  locale: Locale
  data: ScoredQuartier & { quartier: QuartierRow }
  t: Translator
}) {
  const { quartier, reasonCodes } = data
  const name = locale === 'mg' ? quartier.nameMg : quartier.nameFr
  const heroPhoto = quartier.sampleListings[0]?.photo ?? null
  const listingsHref = `/annonces?neighborhood=${quartier.slug}`
  const listingsLabel = labelForListingsCta(quartier.publishedListings, t)

  // Stretched-anchor pattern — the whole card is the link. Only the
  // <Link> wrapping the title is an <a>; an `after:absolute` pseudo
  // extends its hit area to the entire <article>. Reason chips stay
  // outside the anchor's DOM tree so the markup is still valid.
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl bg-background transition hover:-translate-y-0.5">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
        {heroPhoto ? (
          <Image
            src={heroPhoto.url}
            alt={heroPhoto.altFr ?? name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-300 group-hover:scale-105"
            placeholder={heroPhoto.blurhash ? 'blur' : 'empty'}
            blurDataURL={heroPhoto.blurhash ?? undefined}
          />
        ) : (
          <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,oklch(0.88_0.04_70)_0_14px,oklch(0.91_0.025_70)_14px_28px)]" />
        )}
      </div>
      <div className="mt-3.5 flex flex-col gap-2.5 px-0.5">
        <h4 className="text-[20px] font-normal leading-[1.1] tracking-[-0.015em] text-foreground transition group-hover:text-primary">
          <Link
            href={listingsHref}
            className="outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-offset-2"
          >
            {name}
          </Link>
        </h4>
        <ReasonChips codes={reasonCodes.slice(0, 3)} t={t} compact />
        <p className="mt-0.5 text-[12.5px] font-medium text-muted-foreground">
          {listingsLabel}
        </p>
      </div>
    </article>
  )
}

const REASON_KEYS: Record<string, MessageKey> = {
  'budget.match': 'quiz.reason.budget.match',
  'school.university.close': 'quiz.reason.school.university.close',
  'school.lycee.close': 'quiz.reason.school.lycee.close',
  'housingType.available': 'quiz.reason.housingType.available',
  'vibe.match': 'quiz.reason.vibe.match',
  'mobility.walk.good': 'quiz.reason.mobility.walk.good',
  'mobility.taxibe.good': 'quiz.reason.mobility.taxibe.good',
  'mobility.car.good': 'quiz.reason.mobility.car.good',
  'priority.price.matches': 'quiz.reason.priority.price.matches',
  'priority.school.matches': 'quiz.reason.priority.school.matches',
  'priority.calm.matches': 'quiz.reason.priority.calm.matches',
  'priority.social.matches': 'quiz.reason.priority.social.matches',
}

function ReasonChips({
  codes,
  t,
  compact = false,
}: {
  codes: string[]
  t: Translator
  compact?: boolean
}) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {codes.map((code) => {
        const key = REASON_KEYS[code]
        if (!key) return null
        return (
          <li
            key={code}
            className={`inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary ${compact ? 'h-6 px-2 text-[11.5px]' : 'h-7 px-2.5 text-[12.5px]'
              } font-semibold`}
          >
            <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            {t(key)}
          </li>
        )
      })}
    </ul>
  )
}

function labelForListingsCta(
  count: number,
  t: Translator,
): string {
  if (count === 0) return t('quiz.results.viewListings.zero')
  if (count === 1) return t('quiz.results.viewListings.one')
  return t('quiz.results.viewListings.other', { count })
}

function EmailCaptureCard({
  submissionId,
  t,
}: {
  submissionId: string
  t: Translator
}) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!email.trim() || pending) return
    startTransition(async () => {
      const res = await subscribeQuizEmailAction({
        submissionId,
        email,
      })
      setStatus(res.ok ? 'success' : 'error')
    })
  }

  if (status === 'success') {
    return (
      <section className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="text-[15px] font-semibold text-emerald-900">
          {t('quiz.results.emailSuccess')}
        </p>
      </section>
    )
  }

  return (
    <section className="mt-10 rounded-2xl border border-border bg-muted/40 p-6 sm:p-8">
      <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-primary">
        {t('quiz.results.emailEyebrow')}
      </span>
      <h3 className="mt-2 text-[22px] font-normal leading-[1.15] tracking-[-0.015em] text-foreground">
        {t('quiz.results.emailTitle')}
      </h3>
      <p className="mt-2 text-[14.5px] leading-[1.5] text-foreground/70">
        {t('quiz.results.emailLead')}
      </p>
      <form onSubmit={handleSubmit} className="mt-4">
        <fieldset disabled={pending} className="contents">
          <Field className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <FieldLabel htmlFor="quiz-email" className="sr-only">
              {t('quiz.results.emailPlaceholder')}
            </FieldLabel>
            <Input
              id="quiz-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('quiz.results.emailPlaceholder')}
              className="sm:flex-1"
            />
            <Button type="submit" className="sm:min-w-[140px]">
              {t('quiz.results.emailSubmit')}
            </Button>
          </Field>
          {status === 'error' ? (
            <FieldError className="mt-2 text-[13px] text-destructive">
              {t('quiz.results.emailError')}
            </FieldError>
          ) : (
            <FieldDescription className="sr-only">
              {t('quiz.results.emailLead')}
            </FieldDescription>
          )}
        </fieldset>
      </form>
    </section>
  )
}

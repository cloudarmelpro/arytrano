import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import {
  getQuizAnalytics,
  QUIZ_ANSWER_VALUES,
  type QuizAnswerKey,
  type AnswerDistribution,
} from '@/features/admin-quiz/server'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT, type Translator } from '@/lib/i18n/translate'
import type { MessageKey } from '@/lib/i18n/messages'

export const metadata: Metadata = {
  title: 'Quiz analytics · Admin AryTrano',
  robots: { index: false, follow: false },
}

const QUESTION_ORDER: QuizAnswerKey[] = [
  'budget',
  'school',
  'housingType',
  'vibe',
  'mobility',
  'priority',
]

export default async function AdminQuizAnalyticsPage() {
  const [stats, locale, neighborhoods] = await Promise.all([
    getQuizAnalytics(),
    getLocale(),
    prisma.neighborhood.findMany({
      select: { slug: true, nameFr: true },
    }),
  ])
  const t = getT(locale)
  const quartierLabel = new Map(neighborhoods.map((n) => [n.slug, n.nameFr]))

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-primary">
          {t('admin.quiz.page.title')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('admin.quiz.page.lead')}
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-4">
        <Kpi label={t('admin.quiz.kpi.total')} value={stats.totals.all} />
        <Kpi
          label={t('admin.quiz.kpi.last7Days')}
          value={stats.totals.last7Days}
        />
        <Kpi
          label={t('admin.quiz.kpi.last30Days')}
          value={stats.totals.last30Days}
        />
        <Kpi
          label={t('admin.quiz.kpi.emailRate')}
          value={`${stats.emailOptIn.rate}%`}
          help={t('admin.quiz.kpi.emailRate.help', {
            with: stats.emailOptIn.withEmail,
            without: stats.emailOptIn.withoutEmail,
          })}
        />
      </section>

      {stats.totals.all === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-muted/30 p-12 text-center text-sm text-muted-foreground">
          {t('admin.quiz.empty')}
        </div>
      ) : (
        <>
          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              {t('admin.quiz.section.locale')}
            </h2>
            <div className="flex flex-col gap-2 rounded-2xl bg-muted/40 p-5">
              <BarRow
                label="Français (fr-MG)"
                count={stats.byLocale['fr-MG']}
                total={stats.totals.all}
              />
              <BarRow
                label="Malagasy (mg)"
                count={stats.byLocale.mg}
                total={stats.totals.all}
              />
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              {t('admin.quiz.section.topQuartiers')}
            </h2>
            <p className="text-[12.5px] text-muted-foreground">
              {t('admin.quiz.section.topQuartiers.help')}
            </p>
            <div className="flex flex-col gap-2 rounded-2xl bg-muted/40 p-5">
              {stats.topQuartiers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t('admin.quiz.empty')}
                </p>
              ) : (
                stats.topQuartiers.map((q) => (
                  <BarRow
                    key={q.slug}
                    label={quartierLabel.get(q.slug) ?? q.slug}
                    count={q.count}
                    total={stats.totals.all}
                  />
                ))
              )}
            </div>
          </section>

          <section className="flex flex-col gap-5">
            <h2 className="text-lg font-semibold text-foreground">
              {t('admin.quiz.section.answers')}
            </h2>
            {QUESTION_ORDER.map((key) => (
              <QuestionBlock
                key={key}
                question={key}
                rows={stats.answers[key]}
                t={t}
              />
            ))}
          </section>
        </>
      )}
    </div>
  )
}

function Kpi({
  label,
  value,
  help,
}: {
  label: string
  value: number | string
  help?: string
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-muted/40 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </p>
      <p className="font-mono text-[22px] font-semibold leading-none text-foreground">
        {value}
      </p>
      {help ? (
        <p className="mt-0.5 text-[11.5px] leading-[1.4] text-muted-foreground/80">
          {help}
        </p>
      ) : null}
    </div>
  )
}

function BarRow({
  label,
  count,
  total,
}: {
  label: string
  count: number
  total: number
}) {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100)
  return (
    <div className="flex items-center gap-3">
      <span className="w-40 shrink-0 text-[13px] text-foreground">{label}</span>
      <div className="relative h-5 flex-1 overflow-hidden rounded-md bg-background">
        <div
          aria-hidden
          className="h-full rounded-md bg-primary/70 transition-[width]"
          style={{ width: `${Math.max(pct, 1)}%` }}
        />
      </div>
      <span className="w-24 shrink-0 text-right font-mono text-[12px] text-muted-foreground">
        {count} ({pct}%)
      </span>
    </div>
  )
}

function QuestionBlock({
  question,
  rows,
  t,
}: {
  question: QuizAnswerKey
  rows: AnswerDistribution[QuizAnswerKey]
  t: Translator
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-muted/40 p-5">
      <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-foreground">
        {t(`admin.quiz.question.${question}` as MessageKey)}
      </p>
      <div className="flex flex-col gap-2">
        {QUIZ_ANSWER_VALUES[question].map((value) => {
          const row = rows.find((r) => r.value === value)
          const count = row?.count ?? 0
          const pct = row?.pct ?? 0
          return (
            <div key={value} className="flex items-center gap-3">
              <span className="w-40 shrink-0 text-[12.5px] text-foreground">
                {t(
                  `admin.quiz.answer.${question}.${value}` as MessageKey,
                )}
              </span>
              <div className="relative h-4 flex-1 overflow-hidden rounded-md bg-background">
                <div
                  aria-hidden
                  className="h-full rounded-md bg-primary/60 transition-[width]"
                  style={{ width: `${Math.max(pct, 1)}%` }}
                />
              </div>
              <span className="w-20 shrink-0 text-right font-mono text-[11.5px] text-muted-foreground">
                {count} ({pct}%)
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

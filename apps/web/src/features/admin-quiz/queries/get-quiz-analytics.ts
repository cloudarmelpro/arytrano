import 'server-only'
import { prisma } from '@/lib/db'

/**
 * Quiz answer keys + their finite value spaces. Mirrors
 * `src/features/quiz/schemas/quiz-answer.ts`. Kept here as a
 * read-only constant so the admin analytics never holds a stale list
 * after a quiz schema change — the test suite would catch the drift
 * via the schema's Zod enum.
 *
 * Order matters : the bar charts render values in this order.
 */
export const QUIZ_ANSWER_VALUES = {
  budget: ['lt150k', '150_250k', '250_400k', 'gte400k'] as const,
  school: ['university', 'lycee', 'unsure'] as const,
  housingType: ['ROOM', 'STUDIO', 'APARTMENT', 'any'] as const,
  vibe: ['calm', 'lively', 'mixed'] as const,
  mobility: ['walk', 'taxibe', 'car'] as const,
  priority: ['price', 'school', 'calm', 'social'] as const,
} satisfies Record<string, readonly string[]>

export type QuizAnswerKey = keyof typeof QUIZ_ANSWER_VALUES

export type AnswerDistribution = {
  [K in QuizAnswerKey]: Array<{ value: string; count: number; pct: number }>
}

export type QuizAnalytics = {
  totals: {
    all: number
    last7Days: number
    last30Days: number
  }
  emailOptIn: {
    withEmail: number
    withoutEmail: number
    /** % of submissions that included an email — engagement leading indicator. */
    rate: number
  }
  byLocale: { 'fr-MG': number; mg: number }
  /** Per-question distribution. % rounded for display, sums may differ by 1. */
  answers: AnswerDistribution
  /** Top recommended quartiers (rank 1, 2, 3 collapsed). */
  topQuartiers: Array<{ slug: string; count: number; pct: number }>
}

/**
 * Aggregated stats for the /admin/quiz-analytics dashboard (T-043).
 *
 * All numbers are derived in-DB or in-process here — we avoid a chart
 * library on purpose. The page renders proportional bars with raw
 * Tailwind widths driven by the `pct` field, keeping the client
 * bundle near zero.
 *
 * Submissions are NOT filtered by user — anonymous + signed-in alike.
 * The quiz is a discovery funnel, not a personalized recommendation
 * system in v0.5.
 */
export async function getQuizAnalytics(): Promise<QuizAnalytics> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [all, last7Days, last30Days, withEmail, byLocaleRaw, submissions] =
    await Promise.all([
      prisma.quizSubmission.count(),
      prisma.quizSubmission.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.quizSubmission.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.quizSubmission.count({ where: { email: { not: null } } }),
      prisma.quizSubmission.groupBy({
        by: ['locale'],
        _count: { _all: true },
      }),
      // Pull the answer JSON + recommendedSlugs in one pass — we
      // aggregate in-process because Prisma can't groupBy a JSON
      // path nor unnest a String[]. v0.5 scale (target a few thousand
      // submissions / month) is fine for in-process loops; revisit
      // with a materialized view if volume crosses 100k.
      prisma.quizSubmission.findMany({
        select: { answers: true, recommendedSlugs: true },
        take: 10000,
        orderBy: { createdAt: 'desc' },
      }),
    ])

  const byLocale: QuizAnalytics['byLocale'] = { 'fr-MG': 0, mg: 0 }
  for (const row of byLocaleRaw) {
    if (row.locale === 'fr-MG' || row.locale === 'mg') {
      byLocale[row.locale] = row._count._all
    }
  }

  // ─── Per-question distribution ────────────────────────────────
  const counts: Record<QuizAnswerKey, Record<string, number>> = {
    budget: {},
    school: {},
    housingType: {},
    vibe: {},
    mobility: {},
    priority: {},
  }
  for (const s of submissions) {
    if (!s.answers || typeof s.answers !== 'object') continue
    const a = s.answers as Record<string, unknown>
    for (const key of Object.keys(counts) as QuizAnswerKey[]) {
      const value = a[key]
      if (typeof value !== 'string') continue
      counts[key][value] = (counts[key][value] ?? 0) + 1
    }
  }

  const totalForPct = submissions.length || 1
  const answers = Object.fromEntries(
    (Object.keys(QUIZ_ANSWER_VALUES) as QuizAnswerKey[]).map((key) => [
      key,
      QUIZ_ANSWER_VALUES[key].map((value) => {
        const count = counts[key][value] ?? 0
        return {
          value,
          count,
          pct: Math.round((count / totalForPct) * 100),
        }
      }),
    ]),
  ) as AnswerDistribution

  // ─── Top quartiers across all recommendations ─────────────────
  const quartierCounts = new Map<string, number>()
  for (const s of submissions) {
    for (const slug of s.recommendedSlugs) {
      quartierCounts.set(slug, (quartierCounts.get(slug) ?? 0) + 1)
    }
  }
  const topQuartiers = [...quartierCounts.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([slug, count]) => ({
      slug,
      count,
      pct: Math.round((count / totalForPct) * 100),
    }))

  return {
    totals: { all, last7Days, last30Days },
    emailOptIn: {
      withEmail,
      withoutEmail: all - withEmail,
      rate: all === 0 ? 0 : Math.round((withEmail / all) * 100),
    },
    byLocale,
    answers,
    topQuartiers,
  }
}

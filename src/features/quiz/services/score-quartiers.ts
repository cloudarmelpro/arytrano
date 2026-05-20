import type {
  QuartierProfile,
  QuizAnswers,
  ScoredQuartier,
  BudgetTier,
  Priority,
} from '../types'

/**
 * Score and rank quartiers given a set of quiz answers.
 *
 * Pure function — no DB access, no i18n. Returns slugs + scores +
 * machine-readable reason codes. The caller is responsible for
 * looking up display data (name, photo, listings count) and i18n.
 *
 * Scoring per quartier:
 *   - budget match     0 or 3
 *   - school match     0 to 3 (from schoolScores)
 *   - housing match    0 or 2 (or 0 if "any" answered → no signal)
 *   - vibe match       0 (mismatch), 2 (mixed bridges), 3 (exact)
 *   - mobility match   0 to 3 (from mobilityScores)
 *   - priority bonus   +3 if the quartier's strengths contain the
 *                      user's priority dimension (Q6)
 *
 * Max total ≈ 17. Top 3 returned, sorted desc by score then slug
 * (stable for deterministic snapshots).
 */
export function scoreQuartiers(
  answers: QuizAnswers,
  profiles: Record<string, QuartierProfile>,
  limit = 3,
): ScoredQuartier[] {
  const scored: ScoredQuartier[] = []

  for (const [slug, profile] of Object.entries(profiles)) {
    let score = 0
    const reasonCodes: string[] = []

    // 1. Budget
    if (budgetMatches(answers.budget, profile.priceTier)) {
      score += 3
      reasonCodes.push('budget.match')
    }

    // 2. School proximity
    if (answers.school === 'university') {
      score += profile.schoolScores.university
      if (profile.schoolScores.university >= 2) {
        reasonCodes.push('school.university.close')
      }
    } else if (answers.school === 'lycee') {
      score += profile.schoolScores.lycee
      if (profile.schoolScores.lycee >= 2) {
        reasonCodes.push('school.lycee.close')
      }
    }
    // 'unsure' contributes nothing — we don't penalize indecision.

    // 3. Housing type
    if (answers.housingType !== 'any') {
      if (profile.housingMix.includes(answers.housingType)) {
        score += 2
        reasonCodes.push('housingType.available')
      }
    }

    // 4. Vibe
    if (answers.vibe === profile.vibe) {
      score += 3
      reasonCodes.push('vibe.match')
    } else if (
      answers.vibe === 'mixed' ||
      profile.vibe === 'mixed'
    ) {
      // "Mixed" tolerates either side — half credit.
      score += 1
    }

    // 5. Mobility
    score += profile.mobilityScores[answers.mobility]
    if (profile.mobilityScores[answers.mobility] >= 2) {
      reasonCodes.push(`mobility.${answers.mobility}.good`)
    }

    // 6. Priority bonus (Q6) — +3 if this quartier's strengths
    // include the user's stated priority.
    if (profile.strengths.includes(answers.priority)) {
      score += 3
      reasonCodes.push(`priority.${answers.priority}.matches`)
    }

    scored.push({ slug, score, reasonCodes })
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.slug.localeCompare(b.slug)
  })

  return scored.slice(0, limit)
}

function budgetMatches(
  budget: BudgetTier,
  tier: QuartierProfile['priceTier'],
): boolean {
  // Map answer tiers onto profile tiers. We're generous: low/mid
  // budgets can match a slightly higher profile so users still get
  // recommendations near their cap.
  switch (budget) {
    case 'lt150k':
      return tier === 'low'
    case '150_250k':
      return tier === 'low' || tier === 'mid'
    case '250_400k':
      return tier === 'mid'
    case 'gte400k':
      return tier === 'mid' || tier === 'high'
  }
}

/**
 * Re-export so consumers can iterate priorities without importing
 * types from two places.
 */
export const ALL_PRIORITIES: Priority[] = [
  'price',
  'school',
  'calm',
  'social',
]

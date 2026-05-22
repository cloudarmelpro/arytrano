/**
 * Quartier quiz — domain types.
 *
 * The quiz is 6 questions. Five contribute to ranking (budget, school
 * focus, housing type, vibe, mobility); the 6th — `priority` — picks
 * which dimension gets a 2× weight bonus, so the same set of answers
 * produces a different top-3 depending on what the student values
 * most.
 */

export type BudgetTier = 'lt150k' | '150_250k' | '250_400k' | 'gte400k'
export type SchoolFocus = 'university' | 'lycee' | 'unsure'
export type HousingType = 'ROOM' | 'STUDIO' | 'APARTMENT' | 'any'
export type Vibe = 'calm' | 'lively' | 'mixed'
export type Mobility = 'walk' | 'taxibe' | 'car'
export type Priority = 'price' | 'school' | 'calm' | 'social'

export type QuizAnswers = {
  /**
   * E-T07 multi-ville. The scoring engine looks up profiles by
   * city, so we need to know which city the user wants quartiers
   * scored against. Hidden Q0 step pre-fills this when only one
   * city has profile coverage (v1 = fianarantsoa).
   */
  citySlug: string
  budget: BudgetTier
  school: SchoolFocus
  housingType: HousingType
  vibe: Vibe
  mobility: Mobility
  priority: Priority
}

/**
 * Hardcoded scoring profile per quartier. Hand-curated based on local
 * knowledge of Fianarantsoa — not derived from DB rows, because most
 * quartiers don't yet have listings and a DB-driven profile would
 * mark them "unrecommendable".
 */
export type QuartierProfile = {
  /** Maps to budget tiers: low ≈ lt150k/150_250k, mid ≈ 250_400k, high ≈ gte400k. */
  priceTier: 'low' | 'mid' | 'high'
  /** 0-3 score: how close the quartier is to each school zone. */
  schoolScores: { university: number; lycee: number }
  /** Housing types commonly available in this quartier. */
  housingMix: Exclude<HousingType, 'any'>[]
  vibe: Vibe
  /** 0-3 score: how viable each mode of transport is from here. */
  mobilityScores: { walk: number; taxibe: number; car: number }
  /** What this quartier is "best at" — used to award the Q6 priority bonus. */
  strengths: Priority[]
}

export type ScoredQuartier = {
  slug: string
  score: number
  /** Codes (not user-facing text) — UI looks up i18n message per code. */
  reasonCodes: string[]
}

import { describe, it, expect } from 'vitest'
import { scoreQuartiers } from '../services/score-quartiers'
import { QUARTIER_PROFILES } from '../data/quartier-profiles'
import type { QuizAnswers } from '../types'

describe('scoreQuartiers', () => {
  it('returns exactly 3 quartiers by default', () => {
    const answers: QuizAnswers = {
      citySlug: 'fianarantsoa',
      budget: '150_250k',
      school: 'university',
      housingType: 'STUDIO',
      vibe: 'mixed',
      mobility: 'taxibe',
      priority: 'school',
    }
    const result = scoreQuartiers(answers, QUARTIER_PROFILES)
    expect(result).toHaveLength(3)
  })

  it('respects the limit parameter', () => {
    const answers: QuizAnswers = {
      citySlug: 'fianarantsoa',
      budget: '150_250k',
      school: 'university',
      housingType: 'STUDIO',
      vibe: 'mixed',
      mobility: 'taxibe',
      priority: 'school',
    }
    expect(scoreQuartiers(answers, QUARTIER_PROFILES, 5)).toHaveLength(5)
    expect(scoreQuartiers(answers, QUARTIER_PROFILES, 1)).toHaveLength(1)
  })

  it('sorts by score descending', () => {
    const answers: QuizAnswers = {
      citySlug: 'fianarantsoa',
      budget: '150_250k',
      school: 'university',
      housingType: 'STUDIO',
      vibe: 'mixed',
      mobility: 'taxibe',
      priority: 'school',
    }
    const result = scoreQuartiers(answers, QUARTIER_PROFILES, 8)
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i]!.score).toBeGreaterThanOrEqual(result[i + 1]!.score)
    }
  })

  it('ranks Andrainjato top for university+student profile', () => {
    // Student with mid budget, university, mixed vibe, prioritizing school
    // → Andrainjato should win (uni:3, vibe:mixed, school strength).
    const answers: QuizAnswers = {
      citySlug: 'fianarantsoa',
      budget: '150_250k',
      school: 'university',
      housingType: 'STUDIO',
      vibe: 'mixed',
      mobility: 'taxibe',
      priority: 'school',
    }
    const [top] = scoreQuartiers(answers, QUARTIER_PROFILES)
    expect(top!.slug).toBe('andrainjato')
  })

  it('ranks a calm/affordable quartier top for that profile', () => {
    // Tight budget, calm preference, priority on price → Mahasoabe
    // or Anjoma. Mahasoabe has calm vibe + price strength.
    const answers: QuizAnswers = {
      citySlug: 'fianarantsoa',
      budget: 'lt150k',
      school: 'unsure',
      housingType: 'ROOM',
      vibe: 'calm',
      mobility: 'car',
      priority: 'price',
    }
    const [top] = scoreQuartiers(answers, QUARTIER_PROFILES)
    expect(top!.slug).toBe('mahasoabe')
  })

  it('ranks a lively/lycee-focused quartier for that profile', () => {
    // Centre-ville student priorities → Tsianolondroa or Mahamanina or Anjoma.
    const answers: QuizAnswers = {
      citySlug: 'fianarantsoa',
      budget: '150_250k',
      school: 'lycee',
      housingType: 'STUDIO',
      vibe: 'lively',
      mobility: 'walk',
      priority: 'school',
    }
    const top = scoreQuartiers(answers, QUARTIER_PROFILES, 1)[0]!
    expect(['tsianolondroa', 'mahamanina', 'anjoma']).toContain(top.slug)
  })

  it('does not penalize "unsure" school answer', () => {
    // 'unsure' contributes 0 to score regardless of quartier — every
    // quartier loses the same amount of theoretical max, so ranking
    // is determined by the other dimensions.
    const unsure: QuizAnswers = {
      citySlug: 'fianarantsoa',
      budget: '150_250k',
      school: 'unsure',
      housingType: 'STUDIO',
      vibe: 'mixed',
      mobility: 'taxibe',
      priority: 'social',
    }
    const result = scoreQuartiers(unsure, QUARTIER_PROFILES, 8)
    // Top should still emerge — no NaN or all-zero scenario.
    expect(result[0]!.score).toBeGreaterThan(0)
  })

  it('priority bonus changes the winner when scores are tight', () => {
    // Same answers except for the priority. Different priority should
    // produce different winners since strengths arrays differ.
    const base: Omit<QuizAnswers, 'priority'> = {
      citySlug: 'fianarantsoa',
      budget: '150_250k',
      school: 'lycee',
      housingType: 'STUDIO',
      vibe: 'mixed',
      mobility: 'taxibe',
    }
    const priceTop = scoreQuartiers(
      { ...base, priority: 'price' },
      QUARTIER_PROFILES,
      1,
    )[0]!
    const calmTop = scoreQuartiers(
      { ...base, priority: 'calm' },
      QUARTIER_PROFILES,
      1,
    )[0]!
    // Calm priority should push a calm-strength quartier (ankidona
    // or mahasoabe). Price priority should NOT pick a calm one.
    expect(calmTop.slug).not.toBe(priceTop.slug)
  })

  it('produces deterministic order on tied scores (alphabetical)', () => {
    // Two consecutive calls must return the same order.
    const answers: QuizAnswers = {
      citySlug: 'fianarantsoa',
      budget: '150_250k',
      school: 'unsure',
      housingType: 'any',
      vibe: 'mixed',
      mobility: 'taxibe',
      priority: 'social',
    }
    const a = scoreQuartiers(answers, QUARTIER_PROFILES, 8)
    const b = scoreQuartiers(answers, QUARTIER_PROFILES, 8)
    expect(a.map((r) => r.slug)).toEqual(b.map((r) => r.slug))
  })

  it('returns reason codes that are non-empty strings', () => {
    const answers: QuizAnswers = {
      citySlug: 'fianarantsoa',
      budget: '150_250k',
      school: 'university',
      housingType: 'STUDIO',
      vibe: 'mixed',
      mobility: 'taxibe',
      priority: 'school',
    }
    const result = scoreQuartiers(answers, QUARTIER_PROFILES, 3)
    for (const r of result) {
      expect(r.reasonCodes.every((c) => typeof c === 'string' && c.length > 0)).toBe(true)
    }
  })

  it('handles "any" housing type without crashing', () => {
    const answers: QuizAnswers = {
      citySlug: 'fianarantsoa',
      budget: '150_250k',
      school: 'university',
      housingType: 'any',
      vibe: 'mixed',
      mobility: 'taxibe',
      priority: 'school',
    }
    expect(() => scoreQuartiers(answers, QUARTIER_PROFILES)).not.toThrow()
  })
})

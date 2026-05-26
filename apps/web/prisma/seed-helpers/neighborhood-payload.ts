/**
 * Build the JSON payloads (editorial + quizProfile) stored on
 * `Neighborhood.editorial` and `Neighborhood.quizProfile`.
 *
 * E-T07 Batch A — the seed reads the existing single-source-of-truth
 * (i18n dictionaries + the TS profile map) and hydrates the new
 * JSONB columns. Batch B will then refactor the runtime consumers
 * to read from those columns instead of the TS modules.
 *
 * Why these payloads live here (seed-helpers) and not next to the
 * Prisma schema: this file imports from the app source tree
 * (`src/features/...`) which is fine in a seed context but would be a
 * code-smell inside `prisma/`. The barrier between "Prisma artefacts"
 * and "app code" stays clear.
 */

import { frMG } from '../../src/lib/i18n/messages/fr-MG'
import { mg } from '../../src/lib/i18n/messages/mg'
import { QUARTIER_DESCRIPTORS } from '../../src/features/landing/quartier-descriptors'
import { QUARTIER_PROFILES_BY_CITY } from '../../src/features/quiz/data/quartier-profiles'
import { DRAFT_EDITORIAL } from './editorial-drafts'

export type EditorialPayload = {
  fr: {
    tagline: string
    landmark: string
    ambiance: string
    walk: string
    transport: string
    distance: string
  }
  mg: {
    tagline: string
    landmark: string
    ambiance: string
    walk: string
    transport: string
    distance: string
  }
}

/**
 * Resolve the 6 editorial strings for a quartier slug, in both
 * locales. Resolution order:
 *  1. `QUARTIER_DESCRIPTORS` + i18n dictionaries (production content
 *     for Fianarantsoa — written from on-the-ground interviews).
 *  2. `DRAFT_EDITORIAL` (placeholder content for the 4 new cities —
 *     should be refined post-launch via `/admin/geo`).
 * Returns null when neither source has the slug.
 */
export function buildEditorialFor(slug: string): EditorialPayload | null {
  const d = QUARTIER_DESCRIPTORS[slug]
  if (d) {
    return {
      fr: {
        tagline: frMG[d.tagline],
        landmark: frMG[d.landmark],
        ambiance: frMG[d.ambiance],
        walk: frMG[d.walk],
        transport: frMG[d.transport],
        distance: frMG[d.distance],
      },
      mg: {
        tagline: mg[d.tagline],
        landmark: mg[d.landmark],
        ambiance: mg[d.ambiance],
        walk: mg[d.walk],
        transport: mg[d.transport],
        distance: mg[d.distance],
      },
    }
  }
  return DRAFT_EDITORIAL[slug] ?? null
}

/**
 * Resolve the quiz scoring profile for a (city, quartier) pair.
 * Returns null when the city has no profile coverage at all (none
 * today since we shipped profiles for all 5 launch cities, but the
 * null branch keeps the seed robust against a future city seeded
 * without a profile).
 */
export function buildQuizProfileFor(
  citySlug: string,
  quartierSlug: string,
) {
  const cityProfiles = QUARTIER_PROFILES_BY_CITY[citySlug]
  if (!cityProfiles) return null
  return cityProfiles[quartierSlug] ?? null
}

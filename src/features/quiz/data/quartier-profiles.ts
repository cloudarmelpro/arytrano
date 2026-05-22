import type { QuartierProfile } from '../types'

/**
 * Hand-curated quartier scoring profiles, keyed by `citySlug → quartierSlug`.
 *
 * Source of truth: editorial descriptors in
 * `src/features/landing/quartier-descriptors.ts` (ambiance, walk,
 * transport, distance text) translated into numeric scores. Reviewed
 * against on-the-ground knowledge of each city.
 *
 * Adding coverage for a new city :
 *   1. Seed its quartiers in `prisma/seed-helpers/cities.ts`
 *   2. Add editorial descriptors (FR + MG)
 *   3. Add a city entry here with a profile per quartier
 *   4. The quiz Q0 will automatically pick up the new city
 *
 * The numbers are deliberate, not heuristic — bumping a single score
 * shifts which quartier wins for borderline answer sets, so reviews
 * should treat this file like config.
 *
 * v1 coverage : Fianarantsoa. Other cities seeded in batch 1 are
 * usable for browsing but the quiz doesn't recommend them yet — Q0
 * lists only cities present in this map.
 */
export const QUARTIER_PROFILES_BY_CITY: Record<
  string,
  Record<string, QuartierProfile>
> = {
  fianarantsoa: {
  // Quartier étudiant historique, campus universitaire à proximité.
  // Animé semaine, calme weekend.
  andrainjato: {
    priceTier: 'mid',
    schoolScores: { university: 3, lycee: 1 },
    housingMix: ['ROOM', 'STUDIO', 'APARTMENT'],
    vibe: 'mixed',
    mobilityScores: { walk: 2, taxibe: 3, car: 3 },
    strengths: ['school', 'social'],
  },
  // Plus excentré, plus abordable, accès taxi-be solide.
  antarandolo: {
    priceTier: 'low',
    schoolScores: { university: 2, lycee: 1 },
    housingMix: ['ROOM', 'STUDIO'],
    vibe: 'mixed',
    mobilityScores: { walk: 1, taxibe: 3, car: 3 },
    strengths: ['price'],
  },
  // Centre-ville dense, commerces, lycées à pied.
  tsianolondroa: {
    priceTier: 'mid',
    schoolScores: { university: 1, lycee: 3 },
    housingMix: ['STUDIO', 'APARTMENT'],
    vibe: 'lively',
    mobilityScores: { walk: 3, taxibe: 3, car: 2 },
    strengths: ['school', 'social'],
  },
  // Marchés, vie locale dense, proche centre.
  mahamanina: {
    priceTier: 'mid',
    schoolScores: { university: 1, lycee: 3 },
    housingMix: ['ROOM', 'STUDIO'],
    vibe: 'lively',
    mobilityScores: { walk: 3, taxibe: 3, car: 2 },
    strengths: ['social', 'school'],
  },
  // Très animé, vie de quartier, abordable.
  anjoma: {
    priceTier: 'low',
    schoolScores: { university: 1, lycee: 3 },
    housingMix: ['ROOM', 'STUDIO'],
    vibe: 'lively',
    mobilityScores: { walk: 3, taxibe: 3, car: 2 },
    strengths: ['price', 'social'],
  },
  // Plus calme, résidentiel, prix légèrement plus haut.
  ankidona: {
    priceTier: 'high',
    schoolScores: { university: 0, lycee: 2 },
    housingMix: ['APARTMENT', 'STUDIO'],
    vibe: 'calm',
    mobilityScores: { walk: 1, taxibe: 2, car: 3 },
    strengths: ['calm'],
  },
  // Quartier scolaire et étudiant, vie locale dense.
  ambalavato: {
    priceTier: 'mid',
    schoolScores: { university: 2, lycee: 2 },
    housingMix: ['ROOM', 'STUDIO', 'APARTMENT'],
    vibe: 'mixed',
    mobilityScores: { walk: 2, taxibe: 2, car: 2 },
    strengths: ['school'],
  },
  // Périphérie sud, calme, accès véhicule recommandé.
  mahasoabe: {
    priceTier: 'low',
    schoolScores: { university: 0, lycee: 1 },
    housingMix: ['ROOM', 'APARTMENT'],
    vibe: 'calm',
    mobilityScores: { walk: 0, taxibe: 1, car: 3 },
    strengths: ['price', 'calm'],
  },
  },
  // Coverage for the other 4 seeded cities (Antananarivo, Toamasina,
  // Mahajanga, Toliara) is intentionally left empty — adding entries
  // below will surface them in the quiz Q0 automatically.
}

/**
 * Backward-compatible single-city alias. Kept so existing imports
 * don't break while v1 has only Fianarantsoa profile data. Deprecated
 * once additional cities ship — callers should switch to
 * `QUARTIER_PROFILES_BY_CITY[citySlug]`.
 */
export const QUARTIER_PROFILES = QUARTIER_PROFILES_BY_CITY.fianarantsoa

import type { QuartierProfile } from '../types'

/**
 * Hand-curated profile per Fianarantsoa quartier.
 *
 * Source of truth: the existing editorial descriptors in
 * `src/features/landing/quartier-descriptors.ts` (ambiance, walk,
 * transport, distance text) translated into numeric scores. Reviewed
 * against Fianarantsoa local context (university campus at
 * Andrainjato, lycée concentration in centre-ville).
 *
 * Keys match the canonical neighborhood slugs in `prisma/seed.ts`.
 * Adding a new quartier requires:
 *   1. Seed it in `prisma/seed.ts`
 *   2. Add an editorial descriptor entry
 *   3. Add a scoring profile here
 *
 * The numbers are deliberate, not heuristic — bumping a single score
 * shifts which quartier wins for borderline answer sets, so reviews
 * should treat this file like config.
 */
export const QUARTIER_PROFILES: Record<string, QuartierProfile> = {
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
}

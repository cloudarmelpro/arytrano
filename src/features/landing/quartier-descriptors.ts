import type { MessageKey } from '@/lib/i18n/messages'

/**
 * Editorial descriptors for the 8 seeded Fianarantsoa neighborhoods.
 *
 * Keys are the canonical neighborhood slugs (matches `prisma/seed.ts`).
 * Values are the i18n message keys used for the tagline + landmark
 * (landing mosaic) and the full ambiance/walk/transport/distance
 * (quartiers detail page).
 *
 * Centralized here so adding a new quartier only requires:
 *  1. Add it to `prisma/seed.ts` with a slug.
 *  2. Add 6 message keys per locale (tagline, landmark, ambiance,
 *     walk, transport, distance).
 *  3. Add the slug → keys mapping below.
 *
 * Previously duplicated in `LandingNeighborhoods.tsx` (taglines)
 * and `QuartiersBlocks.tsx` (full descriptors).
 */

export type QuartierTaglineDescriptor = {
  tagline: MessageKey
  landmark: MessageKey
}

export type QuartierFullDescriptor = QuartierTaglineDescriptor & {
  ambiance: MessageKey
  walk: MessageKey
  transport: MessageKey
  distance: MessageKey
}

export const QUARTIER_DESCRIPTORS: Record<string, QuartierFullDescriptor> = {
  andrainjato: {
    tagline: 'landing.neighborhoods.andrainjato.tagline',
    landmark: 'landing.neighborhoods.andrainjato.landmark',
    ambiance: 'quartiers.andrainjato.ambiance',
    walk: 'quartiers.andrainjato.walk',
    transport: 'quartiers.andrainjato.transport',
    distance: 'quartiers.andrainjato.distance',
  },
  antarandolo: {
    tagline: 'landing.neighborhoods.antarandolo.tagline',
    landmark: 'landing.neighborhoods.antarandolo.landmark',
    ambiance: 'quartiers.antarandolo.ambiance',
    walk: 'quartiers.antarandolo.walk',
    transport: 'quartiers.antarandolo.transport',
    distance: 'quartiers.antarandolo.distance',
  },
  tsianolondroa: {
    tagline: 'landing.neighborhoods.tsianolondroa.tagline',
    landmark: 'landing.neighborhoods.tsianolondroa.landmark',
    ambiance: 'quartiers.tsianolondroa.ambiance',
    walk: 'quartiers.tsianolondroa.walk',
    transport: 'quartiers.tsianolondroa.transport',
    distance: 'quartiers.tsianolondroa.distance',
  },
  mahamanina: {
    tagline: 'landing.neighborhoods.mahamanina.tagline',
    landmark: 'landing.neighborhoods.mahamanina.landmark',
    ambiance: 'quartiers.mahamanina.ambiance',
    walk: 'quartiers.mahamanina.walk',
    transport: 'quartiers.mahamanina.transport',
    distance: 'quartiers.mahamanina.distance',
  },
  anjoma: {
    tagline: 'landing.neighborhoods.anjoma.tagline',
    landmark: 'landing.neighborhoods.anjoma.landmark',
    ambiance: 'quartiers.anjoma.ambiance',
    walk: 'quartiers.anjoma.walk',
    transport: 'quartiers.anjoma.transport',
    distance: 'quartiers.anjoma.distance',
  },
  ankidona: {
    tagline: 'landing.neighborhoods.ankidona.tagline',
    landmark: 'landing.neighborhoods.ankidona.landmark',
    ambiance: 'quartiers.ankidona.ambiance',
    walk: 'quartiers.ankidona.walk',
    transport: 'quartiers.ankidona.transport',
    distance: 'quartiers.ankidona.distance',
  },
  ambalavato: {
    tagline: 'landing.neighborhoods.ambalavato.tagline',
    landmark: 'landing.neighborhoods.ambalavato.landmark',
    ambiance: 'quartiers.ambalavato.ambiance',
    walk: 'quartiers.ambalavato.walk',
    transport: 'quartiers.ambalavato.transport',
    distance: 'quartiers.ambalavato.distance',
  },
  mahasoabe: {
    tagline: 'landing.neighborhoods.mahasoabe.tagline',
    landmark: 'landing.neighborhoods.mahasoabe.landmark',
    ambiance: 'quartiers.mahasoabe.ambiance',
    walk: 'quartiers.mahasoabe.walk',
    transport: 'quartiers.mahasoabe.transport',
    distance: 'quartiers.mahasoabe.distance',
  },
}

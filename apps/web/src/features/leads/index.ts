/**
 * E-T28 — Client-safe public surface for the concierge lead feature.
 *
 * ONLY Zod schemas + types live here. The Prisma-backed services are
 * behind `features/leads/server.ts` (server-only barrel) — importing
 * those from a Client Component would poison the bundle (per memory
 * `feedback_feature_index_client_safe`).
 */

export {
  createInterestLeadSchema,
  claimLeadSchema,
  transitionLeadStatusSchema,
  linkLeadToLeaseSchema,
  moveInWindowSchema,
  leadStatusSchema,
  leadSourceSchema,
  leadActivityTypeSchema,
  type CreateInterestLeadInput,
  type ClaimLeadInput,
  type TransitionLeadStatusInput,
  type LinkLeadToLeaseInput,
} from './schemas'

// Server Actions — usable from Client Components (they're proxied
// over the wire by Next, no server imports leak). Surfacing them
// here so cross-feature consumers (e.g. listings InterestLeadCta)
// stop deep-importing from ./actions/. Audit fix 2026-06-12.
export { createInterestLeadAction } from './actions/create-interest-lead'

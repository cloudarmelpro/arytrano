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

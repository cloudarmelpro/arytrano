import 'server-only'

/**
 * E-T28 — Server-only public surface for the concierge lead feature.
 *
 * Anything that touches Prisma, Sentry, or rate-limit Redis lives
 * behind this barrel. The client-safe `features/leads/index.ts`
 * re-exports ONLY the Zod schemas + types (per memory
 * `feedback_feature_index_client_safe`).
 */

export {
  createInterestLead,
  throwIfRateLimited,
  type CreateInterestLeadOutcome,
} from './services/create-interest-lead'

export {
  claimLead,
  WIP_CAP_PER_OPERATOR,
  CLAIM_SLA_MS,
  type ClaimLeadOutcome,
} from './services/claim-lead'

export {
  transitionLeadStatus,
  type TransitionLeadStatusOutcome,
} from './services/transition-lead-status'

export {
  linkLeadToLease,
  type LinkLeadToLeaseOutcome,
} from './services/link-lead-to-lease'

export {
  sweepUnclaimedLeads,
  type SweepUnclaimedLeadsResult,
} from './services/sweep-unclaimed-leads'

export {
  sweepStaleClaimedLeads,
  type SweepStaleClaimedLeadsResult,
} from './services/sweep-stale-claimed-leads'

export {
  sweepLapsedLeads,
  type SweepLapsedLeadsResult,
} from './services/sweep-lapsed-leads'

/**
 * E-T27.3 — client-safe barrel for the disputes feature. Anything
 * that imports Prisma / server-only modules lives in `./server.ts`.
 * This module only re-exports Zod schemas + inferred input types
 * + action signatures (typed function references, not invocations).
 */

export {
  openDisputeSchema,
  postDisputeMessageSchema,
  claimDisputeSchema,
  resolveDisputeSchema,
  type OpenDisputeInput,
  type PostDisputeMessageInput,
  type ClaimDisputeInput,
  type ResolveDisputeInput,
} from './schemas'

export { openDisputeAction } from './actions/open-dispute'
export { postDisputeMessageAction } from './actions/post-message'
export {
  claimDisputeAction,
  resolveDisputeAction,
} from './actions/claim-and-resolve'

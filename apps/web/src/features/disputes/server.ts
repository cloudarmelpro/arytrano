import 'server-only'

export {
  openDispute,
  type OpenDisputeOutcome,
} from './services/open-dispute'

export {
  postDisputeMessage,
  type PostDisputeMessageOutcome,
} from './services/post-dispute-message'

export {
  claimDispute,
  type ClaimDisputeOutcome,
} from './services/claim-dispute'

export {
  resolveDispute,
  type ResolveDisputeOutcome,
} from './services/resolve-dispute'

export {
  getDisputeById,
  type DisputeDetail,
} from './queries/get-dispute-by-id'

export {
  listDisputesForAdmin,
} from './queries/list-disputes-for-admin'

import 'server-only'

/**
 * Server-only public surface of the payments feature. Anything that
 * imports Prisma, calls fetch to GoalPay, or otherwise must not ship
 * to the client bundle lives here.
 *
 * Client-safe exports (pure Zod schemas, types, the TransactionResult
 * Server Component) live in `./index.ts`.
 *
 * Memory rule `feedback_feature_index_client_safe` — index.ts must
 * NEVER re-export server-only modules, even when current consumers are
 * all server-side.
 */

export { goalPayProvider } from './goalpay/provider'
export { GoalPayClientError } from './goalpay/client'
export {
  recordWebhookEvent,
  type RecordWebhookOutcome,
} from './services/record-webhook-event'
export { reconcileStuckPayments } from './services/reconcile-stuck-payments'
export {
  findLeaseByPaymentReference,
  type LeaseForTransactionReturn,
} from './queries/find-lease-by-payment-reference'
export {
  resolveLeaseHrefForReturn,
  type ResolveLeaseHrefForReturnResult,
} from './queries/resolve-lease-href-for-return'

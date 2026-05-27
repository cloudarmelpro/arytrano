/**
 * Client-safe public surface of the payments feature.
 *
 * Anything exported from here is allowed to be imported from a Client
 * Component (`'use client'`) — no `server-only`, no Prisma, no fetch
 * to GoalPay, no env access. Server-only modules live in `./server.ts`.
 *
 * Memory rule `feedback_feature_index_client_safe` — re-exporting a
 * `'server-only'` module here poisons every client consumer's bundle
 * with a build-time error, even if only a type-safe symbol is used.
 */

export { goalPayWebhookPayloadSchema } from './schemas/webhook'
export type { GoalPayWebhookPayload } from './schemas/webhook'

export {
  TransactionResult,
  type TransactionStatus,
} from './components/TransactionResult'

// Public surface of the payments feature. Cross-feature consumers
// (the GoalPay webhook route, the leases feature, the cron route)
// import from here, never from internal paths. ARCHITECTURE.md rule #1.

export { goalPayProvider } from './goalpay/provider'
export { GoalPayClientError } from './goalpay/client'
export {
  recordWebhookEvent,
  type RecordWebhookOutcome,
} from './services/record-webhook-event'
export { reconcileStuckPayments } from './services/reconcile-stuck-payments'
export { goalPayWebhookPayloadSchema } from './schemas/webhook'
export type { GoalPayWebhookPayload } from './schemas/webhook'
export {
  findLeaseByPaymentReference,
  type LeaseForTransactionReturn,
} from './queries/find-lease-by-payment-reference'

// Public surface of the leases feature.
//
// Per ARCHITECTURE.md Rule 1, this file is the ONLY entry point for
// cross-feature consumers. Today the single cross-feature dependency
// is `app/api/webhooks/goalpay/route.ts` → `applyLeasePaymentSideEffect`
// (the payments webhook needs to advance the lease state machine).
//
// Dashboard pages (`app/dashboard/leases/...`) deep-import from
// `queries/`, `components/` — that is permitted because `app/` is not
// a feature module; Rule 1 governs feature-to-feature coupling only.

export {
  applyLeasePaymentSideEffect,
  type LeaseSideEffectOutcome,
} from './services/apply-lease-payment-side-effect'

// Pure pricing helper — client-safe (no Prisma, no env). Re-exposed
// here so cross-feature consumers (e.g. lead conversion) don't deep
// import from `./calculate-fees`. Audit fix 2026-06-12.
export { calculatePlatformFee } from './calculate-fees'

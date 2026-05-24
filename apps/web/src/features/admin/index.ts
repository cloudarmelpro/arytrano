/**
 * Public surface of the `admin` feature (client-safe).
 *
 * Server-only queries + services (getAdminStats, listAdminListings,
 * requireAdmin, decryptOwnerCin, etc.) live in `./server.ts` so
 * Client Components importing from this barrel can never accidentally
 * pull in `'server-only'` code.
 */
export { SuspendListingButton } from './components/SuspendListingButton'
export { VerifyListingButton } from './components/VerifyListingButton'
export { CinReviewRow } from './components/CinReviewRow'
export { ReportActions } from './components/ReportActions'

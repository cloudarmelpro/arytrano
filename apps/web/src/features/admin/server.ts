/**
 * Server-only surface of the `admin` feature. Prisma queries, services
 * that touch encrypted CIN ciphertext, and the `requireAdmin` guard.
 */
export { getAdminStats, type AdminStats } from './queries/get-admin-stats'
export {
  getAdminContext,
  type AdminContext,
} from './queries/get-admin-context'
export {
  listAdminListings,
  listAdminListingsQuerySchema,
  type ListAdminListingsQuery,
  type AdminListingRow,
  type AdminListingsPage,
} from './queries/list-admin-listings'
export {
  listCinQueue,
  type CinQueueRow,
} from './queries/list-cin-queue'
export {
  listReports,
  listReportsQuerySchema,
  type AdminReportRow,
} from './queries/list-reports'
export { requireAdmin } from './services/require-admin'
export {
  verifyOwnerCin,
  rejectOwnerCin,
  decryptOwnerCin,
  type CinReviewActionResult,
} from './services/review-cin'

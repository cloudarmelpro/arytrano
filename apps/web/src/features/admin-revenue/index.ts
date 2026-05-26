// Public surface of the admin-revenue feature. Only re-export server-side
// query functions — there are no Client Components or cross-feature
// services here, so the barrel stays narrow.
export { getRevenueStats, type RevenueStats } from './queries/get-revenue-stats'
export { listRecentPayments, type RecentPayment } from './queries/list-recent-payments'

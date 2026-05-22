/**
 * Server-only surface of the `admin-alerts` feature.
 * RSC pages import queries from here; client components stay on
 * the index barrel.
 */
export {
  listWhatsAppAlerts,
  type AdminAlertRow,
  type AdminAlertsPage,
  type AdminAlertsFilters,
} from './queries/list-whatsapp-alerts'
export {
  getAlertsStats,
  type AlertsStats,
} from './queries/get-alerts-stats'

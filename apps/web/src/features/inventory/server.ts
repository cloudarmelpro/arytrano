import 'server-only'

/**
 * E-T27.2 — server-only barrel for the inventory feature.
 */

export {
  upsertInventoryItem,
  type UpsertInventoryItemOutcome,
} from './services/upsert-inventory-item'

export {
  deleteInventoryItem,
  type DeleteInventoryItemOutcome,
} from './services/delete-inventory-item'

export {
  getInventoryForLease,
  type InventoryForLease,
} from './queries/get-inventory-for-lease'

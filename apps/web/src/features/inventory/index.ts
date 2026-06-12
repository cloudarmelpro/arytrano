/**
 * E-T27.2 — client-safe barrel : schemas + canonical room list.
 * The Prisma services live behind `server.ts` per memory
 * `feedback_feature_index_client_safe`.
 */

export {
  upsertInventoryItemSchema,
  deleteInventoryItemSchema,
  CANONICAL_ROOMS,
  type UpsertInventoryItemInput,
  type DeleteInventoryItemInput,
} from './schemas'

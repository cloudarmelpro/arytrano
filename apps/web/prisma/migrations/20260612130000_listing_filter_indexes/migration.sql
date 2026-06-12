-- Perf audit follow-up (2026-06-12)
-- The four sidebar filters added on 2026-06-09 (bedrooms, bathrooms,
-- furnished, type) had no composite index with `status`. Every
-- filtered /annonces query did a Seq Scan over PUBLISHED rows + a
-- recheck on the filter. Adds 80–150ms TTFB once volume grows.
--
-- Composite (status, X) lets the planner use an Index Scan even
-- when status='PUBLISHED' is the dominant filter (which it always
-- is for public listing queries).
--
-- Also adds the two FK coverage indexes the audit surfaced :
-- InventoryItem.uploadedById and DisputeMessage.authorId.

CREATE INDEX "Listing_status_type_idx"
  ON "Listing"("status", "type");

CREATE INDEX "Listing_status_bedrooms_idx"
  ON "Listing"("status", "bedrooms");

CREATE INDEX "Listing_status_bathrooms_idx"
  ON "Listing"("status", "bathrooms");

CREATE INDEX "Listing_status_furnished_idx"
  ON "Listing"("status", "furnished");

CREATE INDEX "InventoryItem_uploadedById_idx"
  ON "InventoryItem"("uploadedById");

CREATE INDEX "DisputeMessage_authorId_idx"
  ON "DisputeMessage"("authorId");

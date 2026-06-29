-- COM-08 — per-category email notification preferences. Default true
-- so the migration doesn't change behaviour for existing users.

ALTER TABLE "User"
  ADD COLUMN "savedSearchAlertsEnabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "listingExpirationAlertsEnabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "leaseUpdatesEnabled" BOOLEAN NOT NULL DEFAULT true;

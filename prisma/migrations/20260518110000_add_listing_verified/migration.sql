-- T-033 · Admin "Annonce vérifiée" marker. Additive — existing listings
-- start unverified (verifiedAt = NULL). Admins toggle via the dedicated
-- `verifyListing` service that also writes `verifiedBy`.

ALTER TABLE "Listing"
  ADD COLUMN "verifiedAt" TIMESTAMP(3),
  ADD COLUMN "verifiedBy" TEXT;

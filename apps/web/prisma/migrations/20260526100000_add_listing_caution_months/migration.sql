-- Add Listing.cautionMonths (E-T26 polish).
--
-- The caution policy is declared upfront on the listing — owner picks
-- a multiplier (typically 0-3 months of rent). The actual caution
-- amount in Ariary is derived at lease-signing time so the public
-- listing display and the lease wizard always show the same number.
--
-- Default 2 backfills existing rows safely (typical MG practice).

ALTER TABLE "Listing"
  ADD COLUMN "cautionMonths" INTEGER NOT NULL DEFAULT 2;

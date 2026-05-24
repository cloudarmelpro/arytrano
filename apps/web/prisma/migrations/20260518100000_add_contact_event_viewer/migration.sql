-- T-031 · Add `viewerId` to ContactEvent so reviews can be marked as
-- verified when the author has a prior contact event on the listing.
-- Additive — existing rows get NULL (no prior viewerId known), which
-- means past reviews stay unverified. Acceptable for v0.5.

ALTER TABLE "ContactEvent"
  ADD COLUMN "viewerId" TEXT;

ALTER TABLE "ContactEvent"
  ADD CONSTRAINT "ContactEvent_viewerId_fkey"
  FOREIGN KEY ("viewerId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "ContactEvent_listingId_viewerId_idx"
  ON "ContactEvent" ("listingId", "viewerId");

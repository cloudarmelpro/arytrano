-- AryTrano schema audit fixes
--   1. Listing.priceMonthlyMGA: Decimal(12, 2) → Int.
--      MGA has no subunit; existing values are integer multiples, so the
--      ::integer cast is loss-free. USING clause guarantees the cast
--      happens in-place without dropping the column.
--   2. Listing slug uniqueness becomes (neighborhoodId, slug) composite to
--      match the URL path /[city]/[neighborhood]/[slug] — drops the global
--      unique, adds the composite. Names match Prisma's @@unique convention.

ALTER TABLE "Listing"
  ALTER COLUMN "priceMonthlyMGA" SET DATA TYPE INTEGER
  USING ("priceMonthlyMGA"::integer);

DROP INDEX "Listing_slug_key";

CREATE UNIQUE INDEX "Listing_neighborhoodId_slug_key"
  ON "Listing" ("neighborhoodId", "slug");

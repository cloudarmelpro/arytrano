-- Drop the `watermarkOptIn` column from Listing.
--
-- The watermark feature (T-036) was deferred and is now being removed
-- entirely. The Cloudinary overlay was never enabled in production
-- (Strict Transformations blocked the transformation), so dropping the
-- column has no impact on existing listings — they all default to
-- `false` and were rendered without a watermark anyway.
--
-- Safe in dev (small table). For prod, this is a metadata-only DROP
-- COLUMN, no table rewrite — acceptable to run inline.

ALTER TABLE "Listing" DROP COLUMN "watermarkOptIn";

-- T-036 · Per-listing opt-in for the "AryTrano" Cloudinary text watermark
-- on public photo URLs. Default false — existing listings stay unchanged.

ALTER TABLE "Listing"
  ADD COLUMN "watermarkOptIn" BOOLEAN NOT NULL DEFAULT false;

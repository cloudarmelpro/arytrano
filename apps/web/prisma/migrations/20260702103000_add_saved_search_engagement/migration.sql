-- ANA-13 — saved-search engagement counters.

ALTER TABLE "SavedSearch"
  ADD COLUMN "matchCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "lastClickedAt" TIMESTAMP(3);

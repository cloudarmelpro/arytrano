-- E-T07 Geo CRUD Batch A — DB-driven editorial + quiz profile.
--
-- Adds two JSONB columns to Neighborhood that hold what used to live
-- in `features/landing/quartier-descriptors.ts` (editorial copy) and
-- `features/quiz/data/quartier-profiles.ts` (quiz scoring config).
--
-- The columns are nullable for two reasons:
--   1. Existing rows are populated lazily by the next `npx prisma db
--      seed` run — we don't want the migration itself to fail on a
--      mid-deploy DB with no seed data yet.
--   2. The 4 new cities (Antananarivo, Toamasina, Mahajanga, Toliara)
--      have profile coverage but NO editorial content yet — Batch B
--      consumers must fall back to a generic display when `editorial`
--      is null on those rows. Eventually the admin UI (Batch C) lets
--      content editors fill them in without a code deploy.
--
-- We use JSONB (not separate columns or a side table) because the
-- inner shape (`{ fr: { tagline, landmark, ambiance, walk, transport,
-- distance }, mg: {...} }`) is naturally hierarchical and we never
-- query inside it — every read pulls the whole blob, picks the locale
-- branch, renders the page. No GIN index needed.
--
-- Zod-validation on writes ships in Batch C alongside the admin form.
-- For now the seed is the only writer.

ALTER TABLE "Neighborhood"
  ADD COLUMN "editorial"   JSONB,
  ADD COLUMN "quizProfile" JSONB;

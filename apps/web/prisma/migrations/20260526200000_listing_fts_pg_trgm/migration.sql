-- E-T14 — full-text search acceleration via pg_trgm GIN indexes.
--
-- The application keeps using Prisma's ILIKE/`contains` operator
-- (no app refactor needed) but Postgres can now resolve the search
-- via these trigram indexes instead of a sequential scan.
--
-- Why trigram + ILIKE instead of tsvector + ts_query:
--   - Works transparently with the existing query builder (no need to
--     drop to $queryRaw and lose Prisma's type-safety / filter combine).
--   - Substring matches ("studi" matches "Studio Andrainjato"), which
--     matches what owners + students actually type.
--   - Index scales to millions of rows; at the v0 ~200-listing scale
--     the win is marginal, but the index is small and future-proofs us.
--
-- Listings status filter (status = 'PUBLISHED') stays index-covered by
-- the existing composite index [status, publishedAt].

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "Listing_title_trgm_idx"
  ON "Listing" USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Listing_description_trgm_idx"
  ON "Listing" USING GIN (description gin_trgm_ops);

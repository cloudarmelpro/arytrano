-- Partial index on OwnerProfile.verifiedAt — used by `getLandingStats`
-- (`count where verifiedAt IS NOT NULL`) on every landing pageload.
-- Partial form keeps the index tiny since only verified rows are stored.
--
-- Prisma can't express a partial index via `@@index`, so we hand-roll it
-- here. The shape is intentional: WHERE matches the query predicate
-- exactly so the planner short-circuits a sequential scan.
--
-- NOTE for prod: prefer `CREATE INDEX CONCURRENTLY ... IF NOT EXISTS`
-- below to avoid blocking writes on the OwnerProfile table. Prisma
-- migrate wraps statements in a transaction by default, which
-- forbids CONCURRENTLY — apply this migration via `psql` directly in
-- production, then run `prisma migrate resolve --applied` to mark it
-- as applied. See `docs/migration-playbook.md`.
CREATE INDEX IF NOT EXISTS "OwnerProfile_verifiedAt_partial_idx"
  ON "OwnerProfile" ("verifiedAt")
  WHERE "verifiedAt" IS NOT NULL;

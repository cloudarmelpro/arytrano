# Prisma migration playbook (prod-safe)

`prisma migrate dev` is fine in development. In **production**, every
migration runs against a live database with concurrent writes. A migration
that locks `Listing` for a minute is a customer-visible outage. This doc
codifies the patterns we apply to avoid that.

## TL;DR — before every prod migration

1. Generate the migration with `prisma migrate dev --create-only`.
2. **Read the generated SQL by hand.** Look for the four red flags below.
3. Rewrite the SQL using the safe pattern.
4. Test on a dump of prod-size data **before** the release window.
5. Apply via `psql` (not `prisma migrate deploy`) when the SQL needs
   `CONCURRENTLY`, then mark with `prisma migrate resolve --applied`.

## Red flags in generated SQL

### 🔴 `CREATE INDEX ...` without `CONCURRENTLY`

Default Prisma index creation locks the table in `ShareLock` for the
duration. On `Listing` or `ContactEvent` (hot write paths), every
INSERT/UPDATE waits.

**Safe pattern:**

```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS "Listing_status_neighborhoodId_publishedAt_idx"
  ON "Listing" ("status", "neighborhoodId", "publishedAt" DESC);
```

Caveats:
- `CONCURRENTLY` cannot run inside a transaction. Prisma wraps each
  migration in a transaction by default. Apply this kind of migration
  via `psql` directly, then run `prisma migrate resolve --applied
  <migration_name>` so the `_prisma_migrations` table stays in sync.
- For **partial** indexes (e.g. `WHERE col IS NOT NULL`), append the
  predicate after the column list. We use this for
  `OwnerProfile.verifiedAt`.

### 🔴 `ALTER TABLE … ADD CONSTRAINT … FOREIGN KEY` without `NOT VALID`

PostgreSQL scans every existing row to validate the FK, holding
`ShareRowExclusive` on the child and `AccessShare` on the parent. On
multi-million-row tables this can lock writes for minutes.

**Safe pattern (two steps):**

```sql
-- Step 1 — add the constraint but skip validation
ALTER TABLE "ContactEvent"
  ADD CONSTRAINT "ContactEvent_viewerId_fkey"
    FOREIGN KEY ("viewerId") REFERENCES "User"("id")
    ON DELETE SET NULL
    NOT VALID;

-- Step 2 — validate at leisure (only ShareUpdateExclusive)
ALTER TABLE "ContactEvent" VALIDATE CONSTRAINT "ContactEvent_viewerId_fkey";
```

Step 1 starts enforcing the FK on **new rows** immediately. Step 2 can
run later, even while the app is online.

### 🔴 `ALTER COLUMN … TYPE …` with a `USING` cast on a large table

Postgres rewrites the entire table + all its indexes. Holds
`AccessExclusiveLock` — a complete freeze of the table. Worse, a
`USING` cast that arithmetic-converts (e.g. `Decimal -> Integer`) can
silently lose precision if any row holds an unexpected value.

**Safe pattern (rolling rewrite):**

```sql
-- 1. Add the new column nullable, default 0
ALTER TABLE "Listing" ADD COLUMN "priceMonthlyMGA_int" INTEGER;

-- 2. Backfill in batches from a background worker
--    (LIMIT 1000 per loop, sleep 100ms — adapt to your DB load)
UPDATE "Listing"
  SET "priceMonthlyMGA_int" = "priceMonthlyMGA"::integer
  WHERE "priceMonthlyMGA_int" IS NULL
  AND "id" IN (SELECT "id" FROM "Listing" WHERE "priceMonthlyMGA_int" IS NULL LIMIT 1000);

-- 3. Once backfill done, app code dual-writes both columns
--    (deploy + verify reads of new column match old)

-- 4. Swap reads to new column, then drop the old one
ALTER TABLE "Listing" DROP COLUMN "priceMonthlyMGA";
ALTER TABLE "Listing" RENAME COLUMN "priceMonthlyMGA_int" TO "priceMonthlyMGA";
ALTER TABLE "Listing" ALTER COLUMN "priceMonthlyMGA" SET NOT NULL;
```

The single `ALTER COLUMN … TYPE INTEGER USING …` shortcut is fine on
small tables (<10k rows) during dev. On prod-size tables, prefer the
roll-out above.

### 🔴 `NOT NULL` added without backfill

```sql
ALTER TABLE "X" ALTER COLUMN "y" SET NOT NULL;  -- ⚠ scans all rows
```

If any row has NULL, the migration fails midway. If all rows are
non-null (default 0 backfilled), Postgres still scans them all.

**Safe pattern:**

```sql
-- 1. Add as NOT VALID
ALTER TABLE "X" ADD CONSTRAINT "X_y_not_null_chk"
  CHECK ("y" IS NOT NULL) NOT VALID;

-- 2. Backfill in batches if needed
UPDATE "X" SET "y" = 0 WHERE "y" IS NULL;

-- 3. Validate constraint (no lock on writes)
ALTER TABLE "X" VALIDATE CONSTRAINT "X_y_not_null_chk";

-- 4. Promote to NOT NULL (instant — already validated)
ALTER TABLE "X" ALTER COLUMN "y" SET NOT NULL;
ALTER TABLE "X" DROP CONSTRAINT "X_y_not_null_chk";
```

## Prisma 7 specifics

- `prisma migrate dev` always wraps the migration in a transaction. If
  you need `CONCURRENTLY` or other non-transactional statements, apply
  the SQL through `psql` and use `prisma migrate resolve --applied
  <migration>` to register it.
- The `--create-only` flag lets you inspect / hand-rewrite SQL before
  applying. **Use it for any prod-bound migration.**
- `migrate resolve --rolled-back` lets you mark a failed migration as
  unapplied if you need to retry with a different approach.

## Pre-prod checklist (per release)

- [ ] Migration files reviewed by hand
- [ ] No raw `CREATE INDEX` on `Listing`, `ContactEvent`, `Favorite`,
      `User` — use `CONCURRENTLY`
- [ ] No raw `ADD CONSTRAINT FOREIGN KEY` — use `NOT VALID` + later
      `VALIDATE`
- [ ] No raw `ALTER COLUMN TYPE` on tables > 10k rows — use rolling rewrite
- [ ] No raw `SET NOT NULL` without a `CHECK NOT VALID` pre-validation
- [ ] Tested on a anonymized dump of prod-size data
- [ ] Rollback plan documented (which `DROP INDEX` / `DROP CONSTRAINT`
      reverses the change if reads start failing)

## When in doubt

Open an issue, ping the team, and apply the migration during a known
low-traffic window. A 30-second freeze isn't worth a 24h on-call page.

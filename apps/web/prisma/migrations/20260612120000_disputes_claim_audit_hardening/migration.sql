-- E-T27.3 audit hardening (2026-06-12)
-- B1: separate claimedBy from resolvedBy so admin B cannot hijack admin A's claim
-- B2: snapshot leaseStatusAtOpen so resolving a dispute restores the original lease
--     status (instead of always forcing TERMINATED, which let owners unilaterally
--     end an ACTIVE lease via a frivolous dispute)
-- B5: partial unique index — at most one OPEN/IN_REVIEW dispute per lease,
--     enforced by the database (closes the TOCTOU on the prior service-side check)
-- Bonus: FK coverage on claimedById / resolvedById / openedById

-- Step 1 — add the new columns nullable so existing rows survive
ALTER TABLE "Dispute"
  ADD COLUMN "claimedById" TEXT,
  ADD COLUMN "claimedAt" TIMESTAMP(3),
  ADD COLUMN "leaseStatusAtOpen" "LeaseStatus";

-- Step 2 — backfill leaseStatusAtOpen for existing rows. The pre-fix code only
-- allowed disputes on ACTIVE or TERMINATED leases. We default to TERMINATED for
-- already-resolved rows (their lease is back to TERMINATED by definition), and
-- for live disputes we infer from the current Lease.status if it's not DISPUTED.
UPDATE "Dispute" d
   SET "leaseStatusAtOpen" = CASE
        WHEN l.status = 'DISPUTED' THEN 'TERMINATED'::"LeaseStatus"
        ELSE l.status
     END
  FROM "Lease" l
 WHERE d."leaseId" = l.id;

-- Defensive default for any row the join above didn't cover.
UPDATE "Dispute"
   SET "leaseStatusAtOpen" = 'TERMINATED'::"LeaseStatus"
 WHERE "leaseStatusAtOpen" IS NULL;

-- Step 3 — move resolvedById -> claimedById for rows that are still IN_REVIEW.
-- Under the old code, resolvedById was being abused as a "claimed by" assignment
-- pointer. We move it to the new field and clear resolvedById so it now reflects
-- ONLY the admin who rendered a verdict.
UPDATE "Dispute"
   SET "claimedById" = "resolvedById",
       "claimedAt"   = "updatedAt"
 WHERE status = 'IN_REVIEW'
   AND "resolvedById" IS NOT NULL;

UPDATE "Dispute"
   SET "resolvedById" = NULL
 WHERE status = 'IN_REVIEW';

-- For resolved rows, also stamp claimedById so the audit log is consistent
-- (the admin who resolved necessarily claimed at some earlier point).
UPDATE "Dispute"
   SET "claimedById" = "resolvedById",
       "claimedAt"   = "resolvedAt"
 WHERE "resolvedAt" IS NOT NULL
   AND "claimedById" IS NULL
   AND "resolvedById" IS NOT NULL;

-- Step 4 — make leaseStatusAtOpen NOT NULL once backfilled
ALTER TABLE "Dispute"
  ALTER COLUMN "leaseStatusAtOpen" SET NOT NULL;

-- Step 5 — FK constraint for claimedBy
ALTER TABLE "Dispute"
  ADD CONSTRAINT "Dispute_claimedById_fkey"
  FOREIGN KEY ("claimedById") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 6 — partial unique index : at most one live dispute per lease.
-- Postgres-specific WHERE clause (Prisma 7 cannot express this declaratively).
-- Historic resolved/withdrawn disputes are excluded so reopening after a
-- prior resolution is allowed (rate-limit is enforced at the service layer).
CREATE UNIQUE INDEX "Dispute_one_active_per_lease_uq"
  ON "Dispute"("leaseId")
  WHERE status IN ('OPEN', 'IN_REVIEW');

-- Step 7 — index FK columns for lookups by admin and for cascade cost
CREATE INDEX "Dispute_claimedById_idx"  ON "Dispute"("claimedById");
CREATE INDEX "Dispute_resolvedById_idx" ON "Dispute"("resolvedById");
CREATE INDEX "Dispute_openedById_idx"   ON "Dispute"("openedById");

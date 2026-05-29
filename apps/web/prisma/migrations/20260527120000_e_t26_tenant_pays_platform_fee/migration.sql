-- E-T26 fix (2026-05-27) — switch the lease fee model :
--
-- BEFORE : owner paid AryTrano (`signatureFeeMGA` flat 15k + `cautionCommissionMGA` 8% of caution)
-- AFTER  : tenant pays AryTrano (`platformFeeMGA` = 20% × monthlyRentMGA, snapshot)
--
-- The new column defaults to 0 so any pre-existing row (only the
-- 100 Ar prod test from S2-3) survives the migration without a manual
-- backfill. The dropped columns lose their audit value — for our v0
-- this is acceptable since no real production data was charged under
-- the old model.

ALTER TABLE "Lease" DROP COLUMN "signatureFeeMGA";
ALTER TABLE "Lease" DROP COLUMN "cautionCommissionMGA";
ALTER TABLE "Lease" ADD COLUMN "platformFeeMGA" INTEGER NOT NULL DEFAULT 0;

-- DRAFT loses its meaning in the new flow (owner creates straight to
-- PENDING_TENANT, no owner-side payment step). The enum value remains
-- valid for backward compat — existing DRAFT rows can stay as-is.
-- We update the `Lease.status` default for new rows :
ALTER TABLE "Lease" ALTER COLUMN "status" SET DEFAULT 'PENDING_TENANT';

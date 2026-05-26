-- E-T15 — GoalPay payment model migration
--
-- Changes:
--   1) Payment.amountMGA  Decimal(12,2) → Int  (safe: MGA no subunit, all values whole)
--   2) Payment            +expiresAt, +webhookReceivedAt, +completedAt (all nullable)
--   3) Payment.providerTxId  add UNIQUE constraint (replacing non-unique index)
--   4) Enum PaymentPurpose   add LEASE_SUCCESS_FEE  (for E-T26 lease success fee)
--   5) Enum PaymentStatus    add CANCELED, EXPIRED, REFUND_PENDING

-- 1) amountMGA Decimal → Int
ALTER TABLE "Payment"
  ALTER COLUMN "amountMGA" SET DATA TYPE INTEGER USING "amountMGA"::INTEGER;

-- 2) New nullable columns
ALTER TABLE "Payment" ADD COLUMN "expiresAt" TIMESTAMP(3);
ALTER TABLE "Payment" ADD COLUMN "webhookReceivedAt" TIMESTAMP(3);
ALTER TABLE "Payment" ADD COLUMN "completedAt" TIMESTAMP(3);

-- 3) providerTxId: drop non-unique index, add unique constraint (creates implicit index)
DROP INDEX IF EXISTS "Payment_providerTxId_idx";
CREATE UNIQUE INDEX "Payment_providerTxId_key" ON "Payment"("providerTxId");

-- 4) New PaymentPurpose enum value
ALTER TYPE "PaymentPurpose" ADD VALUE IF NOT EXISTS 'LEASE_SUCCESS_FEE';

-- 5) New PaymentStatus enum values (separate statements — Postgres 12+ allows in tx)
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'CANCELED';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'EXPIRED';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'REFUND_PENDING';

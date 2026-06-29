-- PAY-14 — collapse GoalPay webhook replays into a single PaymentEvent row.
-- dedupKey is sha256(reference + event + orderReference + amountMGA).
-- Nullable so legacy rows stay valid; a partial unique index gives us
-- O(1) duplicate detection on inserts.

ALTER TABLE "PaymentEvent" ADD COLUMN "dedupKey" TEXT;

CREATE UNIQUE INDEX "PaymentEvent_dedupKey_key" ON "PaymentEvent"("dedupKey");

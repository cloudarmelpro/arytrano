-- PAY-09 — manual refund finalisation fields on Payment.
-- All nullable so existing rows stay valid.

ALTER TABLE "Payment" ADD COLUMN "refundedAt" TIMESTAMP(3);
ALTER TABLE "Payment" ADD COLUMN "refundedById" TEXT;
ALTER TABLE "Payment" ADD COLUMN "refundNote" TEXT;

ALTER TABLE "Payment"
  ADD CONSTRAINT "Payment_refundedById_fkey"
  FOREIGN KEY ("refundedById") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

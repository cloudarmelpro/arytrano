-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "expirationAlertSentAt" TIMESTAMP(3),
ADD COLUMN     "expiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Listing_status_expiresAt_idx" ON "Listing"("status", "expiresAt");

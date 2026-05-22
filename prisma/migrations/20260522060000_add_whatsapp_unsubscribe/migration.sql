-- AlterTable
ALTER TABLE "WhatsAppAlert" ADD COLUMN     "unsubscribeToken" TEXT,
ADD COLUMN     "unsubscribedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppAlert_unsubscribeToken_key" ON "WhatsAppAlert"("unsubscribeToken");

-- CreateIndex
CREATE INDEX "WhatsAppAlert_unsubscribedAt_idx" ON "WhatsAppAlert"("unsubscribedAt");

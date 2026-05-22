-- AlterTable
ALTER TABLE "ContactEvent" ADD COLUMN     "reviewPromptSentAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "ContactEvent_reviewPromptSentAt_createdAt_idx" ON "ContactEvent"("reviewPromptSentAt", "createdAt");

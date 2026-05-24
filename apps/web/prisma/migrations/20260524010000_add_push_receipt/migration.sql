-- CreateTable
CREATE TABLE "PushReceipt" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PushReceipt_ticketId_key" ON "PushReceipt"("ticketId");

-- CreateIndex
CREATE INDEX "PushReceipt_sentAt_idx" ON "PushReceipt"("sentAt");

-- AddForeignKey
ALTER TABLE "PushReceipt" ADD CONSTRAINT "PushReceipt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

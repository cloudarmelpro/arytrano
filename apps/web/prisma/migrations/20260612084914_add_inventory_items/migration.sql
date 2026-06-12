-- CreateEnum
CREATE TYPE "InventoryPhase" AS ENUM ('ENTRY', 'EXIT');

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "leaseId" TEXT NOT NULL,
    "phase" "InventoryPhase" NOT NULL,
    "roomKey" TEXT NOT NULL,
    "notes" TEXT,
    "photoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InventoryItem_leaseId_phase_idx" ON "InventoryItem"("leaseId", "phase");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_leaseId_phase_roomKey_key" ON "InventoryItem"("leaseId", "phase", "roomKey");

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "Lease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

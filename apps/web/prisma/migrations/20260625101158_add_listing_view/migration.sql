-- DropIndex
DROP INDEX "InventoryItem_leaseId_phase_idx";

-- CreateTable
CREATE TABLE "ListingView" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "viewerHash" TEXT,
    "sessionHash" TEXT,
    "source" TEXT NOT NULL,
    "viewerUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ListingView_listingId_createdAt_idx" ON "ListingView"("listingId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ListingView_viewerHash_createdAt_idx" ON "ListingView"("viewerHash", "createdAt");

-- AddForeignKey
ALTER TABLE "ListingView" ADD CONSTRAINT "ListingView_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

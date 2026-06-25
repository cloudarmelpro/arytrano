-- CreateTable
CREATE TABLE "ListingVideo" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "cloudinaryId" TEXT NOT NULL,
    "posterUrl" TEXT NOT NULL,
    "posterBlurhash" TEXT,
    "durationSec" INTEGER NOT NULL,
    "bytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ListingVideo_listingId_key" ON "ListingVideo"("listingId");

-- AddForeignKey
ALTER TABLE "ListingVideo" ADD CONSTRAINT "ListingVideo_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

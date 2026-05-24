-- CreateIndex
CREATE INDEX "Listing_status_neighborhoodId_publishedAt_idx" ON "Listing"("status", "neighborhoodId", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "Listing_amenities_idx" ON "Listing" USING GIN ("amenities");

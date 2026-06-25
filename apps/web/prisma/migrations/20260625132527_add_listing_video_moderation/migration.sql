-- CreateEnum
CREATE TYPE "ListingVideoStatus" AS ENUM ('PUBLISHED', 'HIDDEN_BY_ADMIN');

-- AlterTable
ALTER TABLE "ListingVideo" ADD COLUMN     "hiddenAt" TIMESTAMP(3),
ADD COLUMN     "hiddenById" TEXT,
ADD COLUMN     "hiddenReason" TEXT,
ADD COLUMN     "status" "ListingVideoStatus" NOT NULL DEFAULT 'PUBLISHED';

-- CreateIndex
CREATE INDEX "ListingVideo_status_createdAt_idx" ON "ListingVideo"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "ListingVideo" ADD CONSTRAINT "ListingVideo_hiddenById_fkey" FOREIGN KEY ("hiddenById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "customAmenities" TEXT[] DEFAULT ARRAY[]::TEXT[];

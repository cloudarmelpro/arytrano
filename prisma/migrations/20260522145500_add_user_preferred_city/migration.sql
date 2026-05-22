-- AlterTable
ALTER TABLE "User" ADD COLUMN     "preferredCityId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_preferredCityId_fkey" FOREIGN KEY ("preferredCityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

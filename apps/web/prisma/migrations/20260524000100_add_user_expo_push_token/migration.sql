-- AlterTable
ALTER TABLE "User" ADD COLUMN     "expoPushToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_expoPushToken_key" ON "User"("expoPushToken");

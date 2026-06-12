-- AlterTable
ALTER TABLE "Lease" ADD COLUMN     "contractPdfGeneratedAt" TIMESTAMP(3),
ADD COLUMN     "contractPdfPublicId" TEXT,
ADD COLUMN     "contractPdfUrl" TEXT;

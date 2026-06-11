-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CLAIMED', 'IN_DISCUSSION', 'AWAITING_OWNER', 'AWAITING_TENANT', 'CONVERTED', 'LAPSED', 'REJECTED');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('WEB', 'MOBILE', 'REST');

-- CreateEnum
CREATE TYPE "LeadActivityType" AS ENUM ('CREATED', 'CLAIMED', 'MESSAGED', 'NO_RESPONSE_WARN', 'CONVERTED', 'LAPSED', 'REASSIGNED', 'REJECTED', 'NOTE');

-- CreateEnum
CREATE TYPE "LeadActorRole" AS ENUM ('TENANT', 'OWNER', 'OPERATOR', 'SYSTEM');

-- CreateEnum
CREATE TYPE "MoveInWindow" AS ENUM ('THIS_MONTH', 'NEXT_MONTH', 'IN_2_MONTHS', 'FLEXIBLE');

-- DropIndex
DROP INDEX "Listing_description_trgm_idx";

-- DropIndex
DROP INDEX "Listing_title_trgm_idx";

-- CreateTable
CREATE TABLE "LeadRequest" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "tenantUserId" TEXT,
    "tenantName" TEXT NOT NULL,
    "tenantPhone" TEXT NOT NULL,
    "tenantPhoneHash" TEXT NOT NULL,
    "moveInWindow" "MoveInWindow" NOT NULL,
    "budgetConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "source" "LeadSource" NOT NULL DEFAULT 'WEB',
    "claimedByUserId" TEXT,
    "claimedAt" TIMESTAMP(3),
    "slaDueAt" TIMESTAMP(3),
    "firstContactedAt" TIMESTAMP(3),
    "leaseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadActivity" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "type" "LeadActivityType" NOT NULL,
    "actorUserId" TEXT,
    "actorRole" "LeadActorRole" NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperatorShift" (
    "id" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OperatorShift_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeadRequest_leaseId_key" ON "LeadRequest"("leaseId");

-- CreateIndex
CREATE INDEX "LeadRequest_status_slaDueAt_idx" ON "LeadRequest"("status", "slaDueAt");

-- CreateIndex
CREATE INDEX "LeadRequest_listingId_status_idx" ON "LeadRequest"("listingId", "status");

-- CreateIndex
CREATE INDEX "LeadRequest_claimedByUserId_status_idx" ON "LeadRequest"("claimedByUserId", "status");

-- CreateIndex
CREATE INDEX "LeadRequest_tenantPhoneHash_listingId_createdAt_idx" ON "LeadRequest"("tenantPhoneHash", "listingId", "createdAt");

-- CreateIndex
CREATE INDEX "LeadActivity_leadId_createdAt_idx" ON "LeadActivity"("leadId", "createdAt");

-- CreateIndex
CREATE INDEX "LeadActivity_actorUserId_type_createdAt_idx" ON "LeadActivity"("actorUserId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "OperatorShift_startsAt_endsAt_idx" ON "OperatorShift"("startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "OperatorShift_operatorId_startsAt_idx" ON "OperatorShift"("operatorId", "startsAt");

-- AddForeignKey
ALTER TABLE "LeadRequest" ADD CONSTRAINT "LeadRequest_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadRequest" ADD CONSTRAINT "LeadRequest_tenantUserId_fkey" FOREIGN KEY ("tenantUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadRequest" ADD CONSTRAINT "LeadRequest_claimedByUserId_fkey" FOREIGN KEY ("claimedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadRequest" ADD CONSTRAINT "LeadRequest_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "Lease"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "LeadRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperatorShift" ADD CONSTRAINT "OperatorShift_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

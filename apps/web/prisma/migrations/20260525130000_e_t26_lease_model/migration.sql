-- E-T26 — Lease model + LeaseStatus enum + Listing.RENTED status
--
-- A Lease materializes a successful owner ↔ tenant agreement for a
-- specific listing. It is the trigger of the AryTrano success fee
-- (15 000 Ar + 8% of caution).

-- 1) Add RENTED to ListingStatus enum
ALTER TYPE "ListingStatus" ADD VALUE IF NOT EXISTS 'RENTED';

-- 2) Create LeaseStatus enum
CREATE TYPE "LeaseStatus" AS ENUM (
  'DRAFT',
  'PENDING_TENANT',
  'ACTIVE',
  'REFUSED',
  'TERMINATED',
  'DISPUTED'
);

-- 3) Create Lease table
CREATE TABLE "Lease" (
  "id"                    TEXT NOT NULL,
  "listingId"             TEXT NOT NULL,
  "ownerId"               TEXT NOT NULL,
  "tenantId"              TEXT NOT NULL,
  "monthlyRentMGA"        INTEGER NOT NULL,
  "cautionMGA"            INTEGER NOT NULL DEFAULT 0,
  "startDate"             TIMESTAMP(3) NOT NULL,
  "durationMonths"        INTEGER NOT NULL,
  "signatureFeeMGA"       INTEGER NOT NULL,
  "cautionCommissionMGA"  INTEGER NOT NULL,
  "paymentId"             TEXT,
  "status"                "LeaseStatus" NOT NULL DEFAULT 'DRAFT',
  "ownerSignedAt"         TIMESTAMP(3),
  "tenantSignedAt"        TIMESTAMP(3),
  "terminatedAt"          TIMESTAMP(3),
  "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"             TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Lease_pkey" PRIMARY KEY ("id")
);

-- 4) Indexes
CREATE UNIQUE INDEX "Lease_paymentId_key" ON "Lease"("paymentId");
CREATE INDEX "Lease_listingId_idx" ON "Lease"("listingId");
CREATE INDEX "Lease_ownerId_status_idx" ON "Lease"("ownerId", "status");
CREATE INDEX "Lease_tenantId_status_idx" ON "Lease"("tenantId", "status");
CREATE INDEX "Lease_status_createdAt_idx" ON "Lease"("status", "createdAt");

-- 5) Foreign keys (Restrict — leases are valuable financial records,
--    never silently dropped if owner/tenant/listing is removed).
ALTER TABLE "Lease"
  ADD CONSTRAINT "Lease_listingId_fkey"
  FOREIGN KEY ("listingId") REFERENCES "Listing"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Lease"
  ADD CONSTRAINT "Lease_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Lease"
  ADD CONSTRAINT "Lease_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Lease"
  ADD CONSTRAINT "Lease_paymentId_fkey"
  FOREIGN KEY ("paymentId") REFERENCES "Payment"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

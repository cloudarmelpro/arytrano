-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'OWNER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('FR_MG', 'MG');

-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('ROOM', 'STUDIO', 'APARTMENT', 'HOUSE');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'UNAVAILABLE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "ContactChannel" AS ENUM ('WHATSAPP', 'PHONE');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('SCAM', 'STOLEN_PHOTOS', 'WRONG_INFO', 'INAPPROPRIATE', 'ALREADY_RENTED', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PUBLISHED', 'HIDDEN', 'DELETED');

-- CreateEnum
CREATE TYPE "PaymentProviderName" AS ENUM ('GOALPAY');

-- CreateEnum
CREATE TYPE "PaymentPurpose" AS ENUM ('PREMIUM_LISTING', 'FEATURED_PLACEMENT');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('INITIATED', 'PENDING', 'CONFIRMED', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "name" TEXT,
    "image" TEXT,
    "phone" TEXT,
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "locale" "Locale" NOT NULL DEFAULT 'FR_MG',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "OwnerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cinCiphertext" BYTEA,
    "cinIv" BYTEA,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OwnerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameFr" TEXT NOT NULL,
    "nameMg" TEXT NOT NULL,
    "lat" DECIMAL(9,6) NOT NULL,
    "lng" DECIMAL(9,6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Neighborhood" (
    "id" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameFr" TEXT NOT NULL,
    "nameMg" TEXT NOT NULL,
    "lat" DECIMAL(9,6) NOT NULL,
    "lng" DECIMAL(9,6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Neighborhood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "neighborhoodId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ListingType" NOT NULL,
    "priceMonthlyMGA" DECIMAL(12,2) NOT NULL,
    "surfaceM2" INTEGER,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "furnished" BOOLEAN NOT NULL DEFAULT false,
    "lat" DECIMAL(9,6),
    "lng" DECIMAL(9,6),
    "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "suspendedReason" TEXT,
    "suspendedAt" TIMESTAMP(3),
    "suspendedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingPhoto" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "cloudinaryId" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "blurhash" TEXT,
    "altFr" TEXT,
    "altMg" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactEvent" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "channel" "ContactChannel" NOT NULL,
    "ipHash" TEXT NOT NULL,
    "uaHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "reporterId" TEXT,
    "reason" "ReportReason" NOT NULL,
    "details" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "verifiedStay" BOOLEAN NOT NULL DEFAULT false,
    "ownerResponse" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("userId","listingId")
);

-- CreateTable
CREATE TABLE "SavedSearch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filters" JSONB NOT NULL,
    "alertsOn" BOOLEAN NOT NULL DEFAULT false,
    "lastFiredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedSearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "provider" "PaymentProviderName" NOT NULL,
    "providerTxId" TEXT,
    "amountMGA" DECIMAL(12,2) NOT NULL,
    "purpose" "PaymentPurpose" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'INITIATED',
    "payerPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentEvent" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "rawPayload" JSONB NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_status_role_idx" ON "User"("status", "role");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "OwnerProfile_userId_key" ON "OwnerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "City_slug_key" ON "City"("slug");

-- CreateIndex
CREATE INDEX "Neighborhood_cityId_idx" ON "Neighborhood"("cityId");

-- CreateIndex
CREATE UNIQUE INDEX "Neighborhood_cityId_slug_key" ON "Neighborhood"("cityId", "slug");

-- CreateIndex
CREATE INDEX "Listing_status_cityId_neighborhoodId_idx" ON "Listing"("status", "cityId", "neighborhoodId");

-- CreateIndex
CREATE INDEX "Listing_status_publishedAt_idx" ON "Listing"("status", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "Listing_status_priceMonthlyMGA_idx" ON "Listing"("status", "priceMonthlyMGA");

-- CreateIndex
CREATE INDEX "Listing_ownerId_status_idx" ON "Listing"("ownerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_slug_key" ON "Listing"("slug");

-- CreateIndex
CREATE INDEX "ListingPhoto_listingId_idx" ON "ListingPhoto"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "ListingPhoto_listingId_position_key" ON "ListingPhoto"("listingId", "position");

-- CreateIndex
CREATE INDEX "ContactEvent_listingId_createdAt_idx" ON "ContactEvent"("listingId", "createdAt");

-- CreateIndex
CREATE INDEX "Report_status_createdAt_idx" ON "Report"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Report_listingId_idx" ON "Report"("listingId");

-- CreateIndex
CREATE INDEX "Review_listingId_status_createdAt_idx" ON "Review"("listingId", "status", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Review_listingId_authorId_key" ON "Review"("listingId", "authorId");

-- CreateIndex
CREATE INDEX "Favorite_userId_createdAt_idx" ON "Favorite"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "SavedSearch_userId_idx" ON "SavedSearch"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_idempotencyKey_key" ON "Payment"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Payment_userId_createdAt_idx" ON "Payment"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Payment_providerTxId_idx" ON "Payment"("providerTxId");

-- CreateIndex
CREATE INDEX "Payment_status_createdAt_idx" ON "Payment"("status", "createdAt");

-- CreateIndex
CREATE INDEX "PaymentEvent_paymentId_occurredAt_idx" ON "PaymentEvent"("paymentId", "occurredAt");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnerProfile" ADD CONSTRAINT "OwnerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Neighborhood" ADD CONSTRAINT "Neighborhood_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_neighborhoodId_fkey" FOREIGN KEY ("neighborhoodId") REFERENCES "Neighborhood"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingPhoto" ADD CONSTRAINT "ListingPhoto_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactEvent" ADD CONSTRAINT "ContactEvent_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedSearch" ADD CONSTRAINT "SavedSearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentEvent" ADD CONSTRAINT "PaymentEvent_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

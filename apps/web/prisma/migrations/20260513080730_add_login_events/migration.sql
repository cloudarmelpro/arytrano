-- CreateEnum
CREATE TYPE "LoginAuthMethod" AS ENUM ('CREDENTIALS', 'GOOGLE', 'FACEBOOK', 'MAGIC_LINK', 'MOBILE_JWT');

-- CreateTable
CREATE TABLE "LoginEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authMethod" "LoginAuthMethod" NOT NULL,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "deviceType" TEXT,
    "isMobileApp" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LoginEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LoginEvent_userId_occurredAt_idx" ON "LoginEvent"("userId", "occurredAt" DESC);

-- AddForeignKey
ALTER TABLE "LoginEvent" ADD CONSTRAINT "LoginEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

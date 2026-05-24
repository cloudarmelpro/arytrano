-- CreateTable
CREATE TABLE "WhatsAppAlert" (
    "id" TEXT NOT NULL,
    "phoneE164" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "quartierSlug" TEXT,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsAppAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppAlert_phoneE164_key" ON "WhatsAppAlert"("phoneE164");

-- CreateIndex
CREATE INDEX "WhatsAppAlert_quartierSlug_createdAt_idx" ON "WhatsAppAlert"("quartierSlug", "createdAt");

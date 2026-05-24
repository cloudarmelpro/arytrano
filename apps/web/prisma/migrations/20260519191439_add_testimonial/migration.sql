-- CreateEnum
CREATE TYPE "TestimonialAudience" AS ENUM ('STUDENT', 'OWNER');

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "audience" "TestimonialAudience" NOT NULL,
    "body" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorMeta" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Testimonial_audience_publishedAt_sortOrder_idx" ON "Testimonial"("audience", "publishedAt", "sortOrder");

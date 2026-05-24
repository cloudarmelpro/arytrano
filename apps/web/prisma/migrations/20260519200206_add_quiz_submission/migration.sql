-- CreateTable
CREATE TABLE "QuizSubmission" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "email" TEXT,
    "answers" JSONB NOT NULL,
    "recommendedSlugs" TEXT[],
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuizSubmission_createdAt_idx" ON "QuizSubmission"("createdAt");

-- CreateIndex
CREATE INDEX "QuizSubmission_email_idx" ON "QuizSubmission"("email");

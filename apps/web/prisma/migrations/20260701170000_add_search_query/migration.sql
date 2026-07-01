-- ANA-09 — search query analytics.

CREATE TABLE "SearchQuery" (
  "id"          TEXT NOT NULL,
  "q"           TEXT NOT NULL,
  "resultCount" INTEGER NOT NULL,
  "ipHash"      TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "SearchQuery_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SearchQuery_q_createdAt_idx" ON "SearchQuery"("q", "createdAt");
CREATE INDEX "SearchQuery_resultCount_createdAt_idx" ON "SearchQuery"("resultCount", "createdAt");
CREATE INDEX "SearchQuery_createdAt_idx" ON "SearchQuery"("createdAt");

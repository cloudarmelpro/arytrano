-- TRU-19 — soft-delete grace window.

ALTER TABLE "User" ADD COLUMN "deletionScheduledAt" TIMESTAMP(3);
CREATE INDEX "User_deletionScheduledAt_idx" ON "User"("deletionScheduledAt");

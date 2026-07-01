-- ADM-03 — track WHY a user was suspended so sign-in can surface a
-- friendly reason instead of a silent bail.

ALTER TABLE "User"
  ADD COLUMN "suspendedReason" TEXT,
  ADD COLUMN "suspendedAt" TIMESTAMP(3),
  ADD COLUMN "suspendedBy" TEXT;

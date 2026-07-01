-- TRU-02 — encrypted selfie alongside the encrypted CIN.

ALTER TABLE "OwnerProfile"
  ADD COLUMN "selfieCiphertext" BYTEA,
  ADD COLUMN "selfieIv" BYTEA,
  ADD COLUMN "selfieAuthTag" BYTEA,
  ADD COLUMN "selfieKeyVersion" INTEGER,
  ADD COLUMN "selfieMimeType" TEXT,
  ADD COLUMN "selfieUploadedAt" TIMESTAMP(3);

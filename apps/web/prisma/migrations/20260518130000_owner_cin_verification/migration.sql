-- T-037 · Owner CIN verification — additive columns on `OwnerProfile`
-- so the AES-256-GCM ciphertext, IV, auth tag, key version, MIME type,
-- and rejection outcome can be persisted. Existing rows stay valid
-- (every new column is nullable or has a default).

ALTER TABLE "OwnerProfile"
  ADD COLUMN "cinAuthTag"         BYTEA,
  ADD COLUMN "cinKeyVersion"      INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "cinMimeType"        TEXT,
  ADD COLUMN "cinUploadedAt"      TIMESTAMP(3),
  ADD COLUMN "cinRejectionReason" TEXT,
  ADD COLUMN "cinRejectedAt"      TIMESTAMP(3),
  ADD COLUMN "cinRejectedBy"      TEXT;

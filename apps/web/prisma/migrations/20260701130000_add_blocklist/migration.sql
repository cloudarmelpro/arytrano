-- TRU-11 — admin blocklist for abusive IPs / phones / emails.

CREATE TYPE "BlocklistKind" AS ENUM ('IP_HASH', 'PHONE', 'EMAIL');

CREATE TABLE "BlocklistEntry" (
  "id"          TEXT NOT NULL,
  "kind"        "BlocklistKind" NOT NULL,
  "value"       TEXT NOT NULL,
  "reason"      TEXT,
  "createdById" TEXT,
  "expiresAt"   TIMESTAMP(3),
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "BlocklistEntry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BlocklistEntry_kind_value_key" ON "BlocklistEntry"("kind", "value");
CREATE INDEX "BlocklistEntry_expiresAt_idx" ON "BlocklistEntry"("expiresAt");

ALTER TABLE "BlocklistEntry"
  ADD CONSTRAINT "BlocklistEntry_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- H1 audit fix — prevent concurrent `initiateLease` from creating
-- two PENDING_TENANT (or ACTIVE / DISPUTED) leases on the same
-- listing. Partial unique index guards the in-flight states without
-- blocking DRAFT / REFUSED / TERMINATED rows (which are historical
-- records and may co-exist).
--
-- Prisma's schema-level @@unique doesn't support filtered indexes
-- (Postgres-only feature). Hence a raw SQL migration. Future Prisma
-- query usage stays transparent — the index is enforced by the DB.

CREATE UNIQUE INDEX "Lease_listing_active_unique"
  ON "Lease" ("listingId")
  WHERE status IN ('PENDING_TENANT', 'ACTIVE', 'DISPUTED');

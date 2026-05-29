-- T-049 (2026-05-29) — Owner Terms acceptance gate
--
-- Tracks when (and which version of) the dedicated Owner Terms an
-- OWNER account has accepted. Used by the dashboard layout to block
-- owner-only activity (publishing listings, creating leases) until
-- acceptance.
--
-- For existing OWNER rows : the columns default to NULL so they will
-- be FORCED through the onboarding flow on next sign-in. This is the
-- "force acceptance for legacy owners" decision documented in
-- TICKETS.md, in line with the strict-but-clean legal posture.

ALTER TABLE "User" ADD COLUMN "ownerTermsAcceptedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "ownerTermsVersion"    TEXT;

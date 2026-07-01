-- OWN-20 — capture why the owner marked a listing UNAVAILABLE.

CREATE TYPE "UnavailableReason" AS ENUM (
  'RENTED_VIA_ARYTRANO',
  'RENTED_OFF_PLATFORM',
  'TAKING_A_BREAK',
  'OTHER'
);

ALTER TABLE "Listing"
  ADD COLUMN "unavailableReason" "UnavailableReason",
  ADD COLUMN "unavailableReasonAt" TIMESTAMP(3);

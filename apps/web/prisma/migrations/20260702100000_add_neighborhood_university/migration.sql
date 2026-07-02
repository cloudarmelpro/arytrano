-- TEN-21 — explicit neighborhood ↔ university tags.

CREATE TABLE "NeighborhoodUniversity" (
  "neighborhoodId" TEXT NOT NULL,
  "universityId"   TEXT NOT NULL,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "NeighborhoodUniversity_pkey" PRIMARY KEY ("neighborhoodId", "universityId")
);

CREATE INDEX "NeighborhoodUniversity_universityId_idx" ON "NeighborhoodUniversity"("universityId");

ALTER TABLE "NeighborhoodUniversity"
  ADD CONSTRAINT "NeighborhoodUniversity_neighborhoodId_fkey"
  FOREIGN KEY ("neighborhoodId") REFERENCES "Neighborhood"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "NeighborhoodUniversity"
  ADD CONSTRAINT "NeighborhoodUniversity_universityId_fkey"
  FOREIGN KEY ("universityId") REFERENCES "University"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- TEN-11 — university directory used by "search near campus".

CREATE TABLE "University" (
  "id"        TEXT NOT NULL,
  "cityId"    TEXT NOT NULL,
  "slug"      TEXT NOT NULL,
  "nameFr"    TEXT NOT NULL,
  "acronym"   TEXT NOT NULL,
  "lat"       DECIMAL(9,6) NOT NULL,
  "lng"       DECIMAL(9,6) NOT NULL,
  "address"   TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "University_slug_key" ON "University"("slug");
CREATE INDEX "University_cityId_idx" ON "University"("cityId");

ALTER TABLE "University"
  ADD CONSTRAINT "University_cityId_fkey"
  FOREIGN KEY ("cityId") REFERENCES "City"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

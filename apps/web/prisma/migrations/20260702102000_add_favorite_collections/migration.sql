-- TEN-02 — favorite collections (student wish lists).

CREATE TABLE "FavoriteCollection" (
  "id"         TEXT NOT NULL,
  "userId"     TEXT NOT NULL,
  "name"       TEXT NOT NULL,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL,

  CONSTRAINT "FavoriteCollection_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "FavoriteCollection_userId_createdAt_idx" ON "FavoriteCollection"("userId", "createdAt");

ALTER TABLE "FavoriteCollection"
  ADD CONSTRAINT "FavoriteCollection_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Favorite"
  ADD COLUMN "collectionId" TEXT;

CREATE INDEX "Favorite_collectionId_idx" ON "Favorite"("collectionId");

ALTER TABLE "Favorite"
  ADD CONSTRAINT "Favorite_collectionId_fkey"
  FOREIGN KEY ("collectionId") REFERENCES "FavoriteCollection"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

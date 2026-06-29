-- COM-12 — hard-bounce tracking. Default 0 / null so existing users
-- start with a clean counter.

ALTER TABLE "User"
  ADD COLUMN "emailBouncesHard" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "emailDisabledAt" TIMESTAMP(3);

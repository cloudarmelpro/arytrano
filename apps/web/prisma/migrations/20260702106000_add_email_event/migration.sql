-- COM-10 — transactional email tracking events from the ESP webhook.

CREATE TABLE "EmailEvent" (
  "id"        TEXT NOT NULL,
  "messageId" TEXT NOT NULL,
  "email"     TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "metadata"  JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "EmailEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EmailEvent_messageId_createdAt_idx" ON "EmailEvent"("messageId", "createdAt");
CREATE INDEX "EmailEvent_email_eventType_createdAt_idx" ON "EmailEvent"("email", "eventType", "createdAt");

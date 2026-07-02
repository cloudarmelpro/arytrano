-- CON-13 — newsletter email subscribers.

CREATE TABLE "NewsletterSubscriber" (
  "id"             TEXT NOT NULL,
  "email"          TEXT NOT NULL,
  "locale"         TEXT NOT NULL DEFAULT 'fr-MG',
  "source"         TEXT,
  "unsubscribedAt" TIMESTAMP(3),
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");
CREATE INDEX "NewsletterSubscriber_unsubscribedAt_idx" ON "NewsletterSubscriber"("unsubscribedAt");

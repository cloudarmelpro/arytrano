-- Fable-audit L1 — one-click unsubscribe token for newsletter.

ALTER TABLE "NewsletterSubscriber" ADD COLUMN "unsubscribeToken" TEXT;
CREATE UNIQUE INDEX "NewsletterSubscriber_unsubscribeToken_key"
  ON "NewsletterSubscriber"("unsubscribeToken");

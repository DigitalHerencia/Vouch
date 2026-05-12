-- Add provider Checkout Session tracking for Stripe-hosted Vouch payment authorization.
ALTER TABLE "payment_records" ADD COLUMN "providerCheckoutSessionId" TEXT;

CREATE UNIQUE INDEX "payment_records_providerCheckoutSessionId_key" ON "payment_records"("providerCheckoutSessionId");
CREATE INDEX "payment_records_providerCheckoutSessionId_idx" ON "payment_records"("providerCheckoutSessionId");

-- Align Vouch creation and authorization checkout state with the current protocol.
ALTER TYPE "VouchStatus" ADD VALUE IF NOT EXISTS 'protocol_fee_paid';

UPDATE "Vouch"
SET "status" = 'protocol_fee_paid'
WHERE "status" = 'active';

UPDATE "VouchRecoverySnapshot"
SET "status" = 'protocol_fee_paid'
WHERE "status" = 'active';

ALTER TABLE "Vouch"
ADD COLUMN "disclaimerAcceptedAt" TIMESTAMP(3);

ALTER TABLE "PaymentIntentRecord"
ALTER COLUMN "stripePaymentIntentId" DROP NOT NULL,
ADD COLUMN "stripeCheckoutSessionUrl" TEXT;

ALTER TABLE "VouchRecoverySnapshot"
ADD COLUMN "stripeCheckoutSessionUrl" TEXT;

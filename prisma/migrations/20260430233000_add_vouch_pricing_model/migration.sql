-- Additive migration for the merchant/customer Vouch pricing model.
-- Legacy amount_cents/platform_fee_cents remain for compatibility during rollout.

ALTER TABLE "vouches"
  ADD COLUMN "protectedAmountCents" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "merchantReceivesCents" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "vouchServiceFeeCents" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "processingFeeOffsetCents" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "applicationFeeAmountCents" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "customerTotalCents" INTEGER NOT NULL DEFAULT 0;

UPDATE "vouches"
SET
  "protectedAmountCents" = "amountCents",
  "merchantReceivesCents" = "amountCents",
  "vouchServiceFeeCents" = "platformFeeCents",
  "processingFeeOffsetCents" = 0,
  "applicationFeeAmountCents" = "platformFeeCents",
  "customerTotalCents" = "amountCents" + "platformFeeCents"
WHERE "protectedAmountCents" = 0
  AND "merchantReceivesCents" = 0
  AND "customerTotalCents" = 0;

ALTER TABLE "payment_records"
  ADD COLUMN "protectedAmountCents" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "merchantReceivesCents" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "vouchServiceFeeCents" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "processingFeeOffsetCents" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "applicationFeeAmountCents" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "customerTotalCents" INTEGER NOT NULL DEFAULT 0;

UPDATE "payment_records"
SET
  "protectedAmountCents" = "amountCents",
  "merchantReceivesCents" = "amountCents",
  "vouchServiceFeeCents" = "platformFeeCents",
  "processingFeeOffsetCents" = 0,
  "applicationFeeAmountCents" = "platformFeeCents",
  "customerTotalCents" = "amountCents" + "platformFeeCents"
WHERE "protectedAmountCents" = 0
  AND "merchantReceivesCents" = 0
  AND "customerTotalCents" = 0;

CREATE INDEX "vouches_protectedAmountCents_idx" ON "vouches"("protectedAmountCents");
CREATE INDEX "vouches_customerTotalCents_idx" ON "vouches"("customerTotalCents");

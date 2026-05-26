-- Separate merchant protocol fee records from customer authorization records.

CREATE TYPE "PaymentRecordPurpose" AS ENUM ('merchant_protocol_fee', 'customer_authorization');

ALTER TABLE "payment_records"
  ADD COLUMN "purpose" "PaymentRecordPurpose" NOT NULL DEFAULT 'customer_authorization';

DROP INDEX "payment_records_vouchId_key";

CREATE INDEX "payment_records_purpose_idx" ON "payment_records"("purpose");

CREATE UNIQUE INDEX "payment_records_vouchId_purpose_key" ON "payment_records"("vouchId", "purpose");

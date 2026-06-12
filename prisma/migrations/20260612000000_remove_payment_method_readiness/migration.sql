DROP INDEX IF EXISTS "PaymentCustomer_paymentMethodReady_idx";
DROP INDEX IF EXISTS "PaymentCustomer_defaultPaymentMethodId_idx";

ALTER TABLE "PaymentCustomer"
DROP COLUMN IF EXISTS "defaultPaymentMethodId",
DROP COLUMN IF EXISTS "paymentMethodReady",
DROP COLUMN IF EXISTS "lastSetupIntentId";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'suspended', 'disabled');

-- CreateEnum
CREATE TYPE "ParticipantRole" AS ENUM ('merchant', 'customer');

-- CreateEnum
CREATE TYPE "VouchStatus" AS ENUM ('draft', 'protocol_fee_required', 'protocol_fee_processing', 'protocol_fee_paid', 'deposit_authorization_created', 'deposit_authorized', 'confirmation_open', 'can_capture', 'captured', 'expired', 'void', 'archived');

-- CreateEnum
CREATE TYPE "PresenceConfirmationStatus" AS ENUM ('pending', 'merchant_confirmed', 'customer_confirmed', 'can_capture', 'void', 'sync_pending', 'auto_void');

-- CreateEnum
CREATE TYPE "ConfirmationSubmissionMode" AS ENUM ('online', 'offline_sync');

-- CreateEnum
CREATE TYPE "PresenceResolutionSource" AS ENUM ('online', 'offline_sync', 'server_reconciliation', 'auto_void');

-- CreateEnum
CREATE TYPE "PaymentIntentPurpose" AS ENUM ('merchant_protocol_fee', 'customer_deposit_authorization');

-- CreateEnum
CREATE TYPE "StripePaymentIntentStatus" AS ENUM ('requires_payment_method', 'requires_confirmation', 'requires_action', 'processing', 'requires_capture', 'canceled', 'succeeded');

-- CreateEnum
CREATE TYPE "StripeCaptureMethod" AS ENUM ('automatic', 'manual');

-- CreateEnum
CREATE TYPE "StripeChargeStatus" AS ENUM ('succeeded', 'pending', 'failed');

-- CreateEnum
CREATE TYPE "RefundReason" AS ENUM ('duplicate', 'fraudulent', 'requested_by_customer', 'expired_uncaptured_authorization', 'provider_reconciliation');

-- CreateEnum
CREATE TYPE "StripeRefundStatus" AS ENUM ('pending', 'requires_action', 'succeeded', 'failed', 'canceled');

-- CreateEnum
CREATE TYPE "StripePayoutStatus" AS ENUM ('pending', 'in_transit', 'paid', 'failed', 'canceled');

-- CreateEnum
CREATE TYPE "WebhookProvider" AS ENUM ('stripe', 'clerk');

-- CreateEnum
CREATE TYPE "WebhookProcessingStatus" AS ENUM ('received', 'processing', 'processed', 'ignored', 'failed');

-- CreateEnum
CREATE TYPE "AuditActorType" AS ENUM ('user', 'system', 'provider', 'support');

-- CreateEnum
CREATE TYPE "VouchTransitionType" AS ENUM ('protocol_fee_paid', 'deposit_authorization_created', 'deposit_authorization_requires_capture', 'merchant_confirmed', 'customer_confirmed', 'presence_can_capture', 'presence_void', 'capture_succeeded', 'authorization_released', 'expired', 'archived');

-- CreateEnum
CREATE TYPE "OperationalRetryOperation" AS ENUM ('sync_offline_confirmation', 'reconcile_payment_intent', 'reconcile_charge', 'reconcile_payout', 'auto_void_confirmation', 'create_recovery_snapshot');

-- CreateEnum
CREATE TYPE "OperationalRetryStatus" AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'abandoned');

-- CreateEnum
CREATE TYPE "VouchRecoverySnapshotReason" AS ENUM ('created', 'before_capture', 'offline_confirmation_synced', 'presence_auto_void', 'webhook_reconciliation', 'provider_reconciliation');

-- CreateEnum
CREATE TYPE "AnalyticsEventGroup" AS ENUM ('auth', 'onboarding', 'vouch', 'payment', 'dashboard', 'system');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "email" VARCHAR(320),
    "phone" VARCHAR(32),
    "displayName" VARCHAR(120),
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentCustomer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "defaultPaymentMethodId" TEXT,
    "paymentMethodReady" BOOLEAN NOT NULL DEFAULT false,
    "lastSetupIntentId" TEXT,
    "lastCustomerPortalSession" TEXT,
    "lastStripeEventId" TEXT,
    "syncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentCustomer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectedAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeAccountId" TEXT NOT NULL,
    "chargesEnabled" BOOLEAN NOT NULL DEFAULT false,
    "payoutsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "detailsSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "requirementsCurrentlyDue" JSONB,
    "requirementsEventuallyDue" JSONB,
    "disabledReason" TEXT,
    "lastAccountLinkId" TEXT,
    "lastLoginLinkId" TEXT,
    "lastStripeEventId" TEXT,
    "syncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConnectedAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vouch" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "customerId" TEXT,
    "amountCents" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'usd',
    "appointmentAt" TIMESTAMP(3) NOT NULL,
    "confirmationOpensAt" TIMESTAMP(3) NOT NULL,
    "confirmationExpiresAt" TIMESTAMP(3) NOT NULL,
    "merchantCodeHash" TEXT NOT NULL,
    "customerCodeHash" TEXT,
    "status" "VouchStatus" NOT NULL DEFAULT 'draft',
    "protocolFeePaidAt" TIMESTAMP(3),
    "authorizedAt" TIMESTAMP(3),
    "capturedAt" TIMESTAMP(3),
    "voidedAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vouch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresenceConfirmation" (
    "id" TEXT NOT NULL,
    "vouchId" TEXT NOT NULL,
    "status" "PresenceConfirmationStatus" NOT NULL DEFAULT 'pending',
    "windowOpensAt" TIMESTAMP(3) NOT NULL,
    "windowClosesAt" TIMESTAMP(3) NOT NULL,
    "merchantConfirmedAt" TIMESTAMP(3),
    "customerConfirmedAt" TIMESTAMP(3),
    "canCaptureAt" TIMESTAMP(3),
    "voidedAt" TIMESTAMP(3),
    "merchantCodeVerified" BOOLEAN NOT NULL DEFAULT false,
    "customerCodeVerified" BOOLEAN NOT NULL DEFAULT false,
    "resolutionSource" "PresenceResolutionSource",
    "failureReason" TEXT,
    "retryUntil" TIMESTAMP(3),
    "lastRetryAt" TIMESTAMP(3),
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PresenceConfirmation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresenceConfirmationAttempt" (
    "id" TEXT NOT NULL,
    "presenceConfirmationId" TEXT NOT NULL,
    "participantRole" "ParticipantRole" NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3) NOT NULL,
    "submissionMode" "ConfirmationSubmissionMode" NOT NULL DEFAULT 'online',
    "payloadHash" TEXT,
    "nonce" TEXT NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "rejectedReason" TEXT,

    CONSTRAINT "PresenceConfirmationAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentIntentRecord" (
    "id" TEXT NOT NULL,
    "vouchId" TEXT,
    "purpose" "PaymentIntentPurpose" NOT NULL,
    "participantRole" "ParticipantRole",
    "stripePaymentIntentId" TEXT NOT NULL,
    "stripeCheckoutSessionId" TEXT,
    "stripeCustomerId" TEXT,
    "stripeAccountId" TEXT,
    "amountCents" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'usd',
    "status" "StripePaymentIntentStatus" NOT NULL,
    "captureMethod" "StripeCaptureMethod",
    "captureBefore" TIMESTAMP(3),
    "authorizedAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "succeededAt" TIMESTAMP(3),
    "lastStripeEventId" TEXT,
    "syncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentIntentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChargeRecord" (
    "id" TEXT NOT NULL,
    "vouchId" TEXT,
    "paymentIntentRecordId" TEXT,
    "stripeChargeId" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT,
    "stripeCustomerId" TEXT,
    "stripeBalanceTransactionId" TEXT,
    "amountCents" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'usd',
    "status" "StripeChargeStatus",
    "captured" BOOLEAN NOT NULL DEFAULT false,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "refunded" BOOLEAN NOT NULL DEFAULT false,
    "disputed" BOOLEAN NOT NULL DEFAULT false,
    "capturedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChargeRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefundRecord" (
    "id" TEXT NOT NULL,
    "vouchId" TEXT,
    "chargeRecordId" TEXT,
    "paymentIntentRecordId" TEXT,
    "stripeRefundId" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT,
    "stripeChargeId" TEXT,
    "amountCents" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'usd',
    "reason" "RefundReason",
    "status" "StripeRefundStatus" NOT NULL,
    "lastStripeEventId" TEXT,
    "syncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefundRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayoutRecord" (
    "id" TEXT NOT NULL,
    "connectedAccountId" TEXT,
    "stripePayoutId" TEXT NOT NULL,
    "stripeAccountId" TEXT,
    "amountCents" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'usd',
    "status" "StripePayoutStatus" NOT NULL,
    "arrivalDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "failureCode" TEXT,
    "failureMessage" TEXT,
    "lastStripeEventId" TEXT,
    "syncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayoutRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderWebhookEvent" (
    "id" TEXT NOT NULL,
    "provider" "WebhookProvider" NOT NULL,
    "providerEventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "status" "WebhookProcessingStatus" NOT NULL DEFAULT 'received',
    "payload" JSONB,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "failureReason" TEXT,

    CONSTRAINT "ProviderWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StripeWebhookEvent" (
    "id" TEXT NOT NULL,
    "providerWebhookEventId" TEXT NOT NULL,
    "stripeEventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "vouchId" TEXT,
    "paymentIntentRecordId" TEXT,
    "chargeRecordId" TEXT,
    "refundRecordId" TEXT,
    "payoutRecordId" TEXT,
    "accountId" TEXT,
    "livemode" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StripeWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "actorType" "AuditActorType" NOT NULL DEFAULT 'system',
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VouchEvent" (
    "id" TEXT NOT NULL,
    "vouchId" TEXT NOT NULL,
    "type" "VouchTransitionType" NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VouchEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationalRetry" (
    "id" TEXT NOT NULL,
    "vouchId" TEXT,
    "operation" "OperationalRetryOperation" NOT NULL,
    "status" "OperationalRetryStatus" NOT NULL DEFAULT 'pending',
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 24,
    "nextAttemptAt" TIMESTAMP(3),
    "lastAttemptAt" TIMESTAMP(3),
    "lockedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperationalRetry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VouchRecoverySnapshot" (
    "id" TEXT NOT NULL,
    "vouchId" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "reason" "VouchRecoverySnapshotReason" NOT NULL DEFAULT 'created',
    "merchantId" TEXT NOT NULL,
    "customerId" TEXT,
    "amountCents" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "appointmentAt" TIMESTAMP(3) NOT NULL,
    "confirmationOpensAt" TIMESTAMP(3) NOT NULL,
    "confirmationExpiresAt" TIMESTAMP(3) NOT NULL,
    "status" "VouchStatus" NOT NULL,
    "protocolFeePaidAt" TIMESTAMP(3),
    "authorizedAt" TIMESTAMP(3),
    "capturedAt" TIMESTAMP(3),
    "voidedAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "archived" BOOLEAN NOT NULL,
    "presenceStatus" "PresenceConfirmationStatus",
    "presenceCanCaptureAt" TIMESTAMP(3),
    "presenceVoidedAt" TIMESTAMP(3),
    "merchantCodeHash" TEXT NOT NULL,
    "customerCodeHash" TEXT,
    "stripePaymentIntentId" TEXT,
    "stripeCheckoutSessionId" TEXT,
    "stripeChargeId" TEXT,
    "stripeBalanceTransactionId" TEXT,
    "lastStripeEventId" TEXT,
    "sourceVersion" INTEGER NOT NULL DEFAULT 1,
    "checksumHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VouchRecoverySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "eventName" TEXT NOT NULL,
    "eventGroup" "AnalyticsEventGroup" NOT NULL,
    "properties" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkUserId_key" ON "User"("clerkUserId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentCustomer_userId_key" ON "PaymentCustomer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentCustomer_stripeCustomerId_key" ON "PaymentCustomer"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "PaymentCustomer_paymentMethodReady_idx" ON "PaymentCustomer"("paymentMethodReady");

-- CreateIndex
CREATE INDEX "PaymentCustomer_defaultPaymentMethodId_idx" ON "PaymentCustomer"("defaultPaymentMethodId");

-- CreateIndex
CREATE UNIQUE INDEX "ConnectedAccount_userId_key" ON "ConnectedAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ConnectedAccount_stripeAccountId_key" ON "ConnectedAccount"("stripeAccountId");

-- CreateIndex
CREATE INDEX "ConnectedAccount_chargesEnabled_payoutsEnabled_idx" ON "ConnectedAccount"("chargesEnabled", "payoutsEnabled");

-- CreateIndex
CREATE UNIQUE INDEX "Vouch_publicId_key" ON "Vouch"("publicId");

-- CreateIndex
CREATE INDEX "Vouch_merchantId_archived_appointmentAt_idx" ON "Vouch"("merchantId", "archived", "appointmentAt");

-- CreateIndex
CREATE INDEX "Vouch_customerId_archived_appointmentAt_idx" ON "Vouch"("customerId", "archived", "appointmentAt");

-- CreateIndex
CREATE INDEX "Vouch_status_archived_idx" ON "Vouch"("status", "archived");

-- CreateIndex
CREATE INDEX "Vouch_appointmentAt_idx" ON "Vouch"("appointmentAt");

-- CreateIndex
CREATE INDEX "Vouch_expiredAt_idx" ON "Vouch"("expiredAt");

-- CreateIndex
CREATE UNIQUE INDEX "PresenceConfirmation_vouchId_key" ON "PresenceConfirmation"("vouchId");

-- CreateIndex
CREATE INDEX "PresenceConfirmation_status_windowClosesAt_idx" ON "PresenceConfirmation"("status", "windowClosesAt");

-- CreateIndex
CREATE INDEX "PresenceConfirmation_retryUntil_status_idx" ON "PresenceConfirmation"("retryUntil", "status");

-- CreateIndex
CREATE INDEX "PresenceConfirmationAttempt_presenceConfirmationId_particip_idx" ON "PresenceConfirmationAttempt"("presenceConfirmationId", "participantRole");

-- CreateIndex
CREATE INDEX "PresenceConfirmationAttempt_submittedAt_idx" ON "PresenceConfirmationAttempt"("submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PresenceConfirmationAttempt_presenceConfirmationId_particip_key" ON "PresenceConfirmationAttempt"("presenceConfirmationId", "participantRole", "nonce");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentIntentRecord_stripePaymentIntentId_key" ON "PaymentIntentRecord"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentIntentRecord_stripeCheckoutSessionId_key" ON "PaymentIntentRecord"("stripeCheckoutSessionId");

-- CreateIndex
CREATE INDEX "PaymentIntentRecord_vouchId_purpose_idx" ON "PaymentIntentRecord"("vouchId", "purpose");

-- CreateIndex
CREATE INDEX "PaymentIntentRecord_purpose_status_idx" ON "PaymentIntentRecord"("purpose", "status");

-- CreateIndex
CREATE INDEX "PaymentIntentRecord_participantRole_idx" ON "PaymentIntentRecord"("participantRole");

-- CreateIndex
CREATE INDEX "PaymentIntentRecord_stripeAccountId_idx" ON "PaymentIntentRecord"("stripeAccountId");

-- CreateIndex
CREATE INDEX "PaymentIntentRecord_status_idx" ON "PaymentIntentRecord"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ChargeRecord_stripeChargeId_key" ON "ChargeRecord"("stripeChargeId");

-- CreateIndex
CREATE INDEX "ChargeRecord_vouchId_idx" ON "ChargeRecord"("vouchId");

-- CreateIndex
CREATE INDEX "ChargeRecord_paymentIntentRecordId_idx" ON "ChargeRecord"("paymentIntentRecordId");

-- CreateIndex
CREATE INDEX "ChargeRecord_stripePaymentIntentId_idx" ON "ChargeRecord"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "ChargeRecord_stripeBalanceTransactionId_idx" ON "ChargeRecord"("stripeBalanceTransactionId");

-- CreateIndex
CREATE INDEX "ChargeRecord_captured_paid_idx" ON "ChargeRecord"("captured", "paid");

-- CreateIndex
CREATE UNIQUE INDEX "RefundRecord_stripeRefundId_key" ON "RefundRecord"("stripeRefundId");

-- CreateIndex
CREATE INDEX "RefundRecord_vouchId_idx" ON "RefundRecord"("vouchId");

-- CreateIndex
CREATE INDEX "RefundRecord_chargeRecordId_idx" ON "RefundRecord"("chargeRecordId");

-- CreateIndex
CREATE INDEX "RefundRecord_paymentIntentRecordId_idx" ON "RefundRecord"("paymentIntentRecordId");

-- CreateIndex
CREATE INDEX "RefundRecord_status_idx" ON "RefundRecord"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PayoutRecord_stripePayoutId_key" ON "PayoutRecord"("stripePayoutId");

-- CreateIndex
CREATE INDEX "PayoutRecord_connectedAccountId_status_idx" ON "PayoutRecord"("connectedAccountId", "status");

-- CreateIndex
CREATE INDEX "PayoutRecord_stripeAccountId_idx" ON "PayoutRecord"("stripeAccountId");

-- CreateIndex
CREATE INDEX "PayoutRecord_arrivalDate_idx" ON "PayoutRecord"("arrivalDate");

-- CreateIndex
CREATE INDEX "ProviderWebhookEvent_provider_eventType_idx" ON "ProviderWebhookEvent"("provider", "eventType");

-- CreateIndex
CREATE INDEX "ProviderWebhookEvent_status_receivedAt_idx" ON "ProviderWebhookEvent"("status", "receivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderWebhookEvent_provider_providerEventId_key" ON "ProviderWebhookEvent"("provider", "providerEventId");

-- CreateIndex
CREATE UNIQUE INDEX "StripeWebhookEvent_providerWebhookEventId_key" ON "StripeWebhookEvent"("providerWebhookEventId");

-- CreateIndex
CREATE UNIQUE INDEX "StripeWebhookEvent_stripeEventId_key" ON "StripeWebhookEvent"("stripeEventId");

-- CreateIndex
CREATE INDEX "StripeWebhookEvent_eventType_createdAt_idx" ON "StripeWebhookEvent"("eventType", "createdAt");

-- CreateIndex
CREATE INDEX "StripeWebhookEvent_vouchId_idx" ON "StripeWebhookEvent"("vouchId");

-- CreateIndex
CREATE INDEX "StripeWebhookEvent_paymentIntentRecordId_idx" ON "StripeWebhookEvent"("paymentIntentRecordId");

-- CreateIndex
CREATE INDEX "StripeWebhookEvent_chargeRecordId_idx" ON "StripeWebhookEvent"("chargeRecordId");

-- CreateIndex
CREATE INDEX "StripeWebhookEvent_refundRecordId_idx" ON "StripeWebhookEvent"("refundRecordId");

-- CreateIndex
CREATE INDEX "StripeWebhookEvent_payoutRecordId_idx" ON "StripeWebhookEvent"("payoutRecordId");

-- CreateIndex
CREATE INDEX "StripeWebhookEvent_accountId_idx" ON "StripeWebhookEvent"("accountId");

-- CreateIndex
CREATE INDEX "AuditEvent_actorUserId_createdAt_idx" ON "AuditEvent"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_entityType_entityId_createdAt_idx" ON "AuditEvent"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_action_createdAt_idx" ON "AuditEvent"("action", "createdAt");

-- CreateIndex
CREATE INDEX "VouchEvent_vouchId_createdAt_idx" ON "VouchEvent"("vouchId", "createdAt");

-- CreateIndex
CREATE INDEX "VouchEvent_type_idx" ON "VouchEvent"("type");

-- CreateIndex
CREATE INDEX "OperationalRetry_status_nextAttemptAt_idx" ON "OperationalRetry"("status", "nextAttemptAt");

-- CreateIndex
CREATE INDEX "OperationalRetry_operation_status_idx" ON "OperationalRetry"("operation", "status");

-- CreateIndex
CREATE INDEX "OperationalRetry_entityType_entityId_idx" ON "OperationalRetry"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "OperationalRetry_vouchId_idx" ON "OperationalRetry"("vouchId");

-- CreateIndex
CREATE INDEX "VouchRecoverySnapshot_vouchId_createdAt_idx" ON "VouchRecoverySnapshot"("vouchId", "createdAt");

-- CreateIndex
CREATE INDEX "VouchRecoverySnapshot_publicId_idx" ON "VouchRecoverySnapshot"("publicId");

-- CreateIndex
CREATE INDEX "VouchRecoverySnapshot_reason_idx" ON "VouchRecoverySnapshot"("reason");

-- CreateIndex
CREATE INDEX "VouchRecoverySnapshot_createdAt_idx" ON "VouchRecoverySnapshot"("createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_userId_createdAt_idx" ON "AnalyticsEvent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_eventGroup_eventName_createdAt_idx" ON "AnalyticsEvent"("eventGroup", "eventName", "createdAt");

-- AddForeignKey
ALTER TABLE "PaymentCustomer" ADD CONSTRAINT "PaymentCustomer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectedAccount" ADD CONSTRAINT "ConnectedAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vouch" ADD CONSTRAINT "Vouch_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vouch" ADD CONSTRAINT "Vouch_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresenceConfirmation" ADD CONSTRAINT "PresenceConfirmation_vouchId_fkey" FOREIGN KEY ("vouchId") REFERENCES "Vouch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresenceConfirmationAttempt" ADD CONSTRAINT "PresenceConfirmationAttempt_presenceConfirmationId_fkey" FOREIGN KEY ("presenceConfirmationId") REFERENCES "PresenceConfirmation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentIntentRecord" ADD CONSTRAINT "PaymentIntentRecord_vouchId_fkey" FOREIGN KEY ("vouchId") REFERENCES "Vouch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChargeRecord" ADD CONSTRAINT "ChargeRecord_vouchId_fkey" FOREIGN KEY ("vouchId") REFERENCES "Vouch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChargeRecord" ADD CONSTRAINT "ChargeRecord_paymentIntentRecordId_fkey" FOREIGN KEY ("paymentIntentRecordId") REFERENCES "PaymentIntentRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundRecord" ADD CONSTRAINT "RefundRecord_vouchId_fkey" FOREIGN KEY ("vouchId") REFERENCES "Vouch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundRecord" ADD CONSTRAINT "RefundRecord_chargeRecordId_fkey" FOREIGN KEY ("chargeRecordId") REFERENCES "ChargeRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundRecord" ADD CONSTRAINT "RefundRecord_paymentIntentRecordId_fkey" FOREIGN KEY ("paymentIntentRecordId") REFERENCES "PaymentIntentRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutRecord" ADD CONSTRAINT "PayoutRecord_connectedAccountId_fkey" FOREIGN KEY ("connectedAccountId") REFERENCES "ConnectedAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StripeWebhookEvent" ADD CONSTRAINT "StripeWebhookEvent_providerWebhookEventId_fkey" FOREIGN KEY ("providerWebhookEventId") REFERENCES "ProviderWebhookEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StripeWebhookEvent" ADD CONSTRAINT "StripeWebhookEvent_vouchId_fkey" FOREIGN KEY ("vouchId") REFERENCES "Vouch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VouchEvent" ADD CONSTRAINT "VouchEvent_vouchId_fkey" FOREIGN KEY ("vouchId") REFERENCES "Vouch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationalRetry" ADD CONSTRAINT "OperationalRetry_vouchId_fkey" FOREIGN KEY ("vouchId") REFERENCES "Vouch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VouchRecoverySnapshot" ADD CONSTRAINT "VouchRecoverySnapshot_vouchId_fkey" FOREIGN KEY ("vouchId") REFERENCES "Vouch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

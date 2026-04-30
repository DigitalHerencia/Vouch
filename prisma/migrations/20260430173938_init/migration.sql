-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'disabled');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('unstarted', 'pending', 'verified', 'rejected', 'requires_action', 'expired');

-- CreateEnum
CREATE TYPE "PaymentReadinessStatus" AS ENUM ('not_started', 'requires_action', 'ready', 'failed');

-- CreateEnum
CREATE TYPE "PayoutReadinessStatus" AS ENUM ('not_started', 'requires_action', 'ready', 'restricted', 'failed');

-- CreateEnum
CREATE TYPE "VouchStatus" AS ENUM ('pending', 'active', 'completed', 'expired', 'refunded', 'canceled', 'failed');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('created', 'sent', 'opened', 'accepted', 'declined', 'expired', 'invalidated');

-- CreateEnum
CREATE TYPE "ParticipantRole" AS ENUM ('payer', 'payee');

-- CreateEnum
CREATE TYPE "ConfirmationStatus" AS ENUM ('not_confirmed', 'confirmed', 'ineligible', 'window_not_open', 'window_closed');

-- CreateEnum
CREATE TYPE "AggregateConfirmationStatus" AS ENUM ('none_confirmed', 'payer_confirmed', 'payee_confirmed', 'both_confirmed');

-- CreateEnum
CREATE TYPE "ConfirmationMethod" AS ENUM ('manual', 'gps', 'system');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('stripe');

-- CreateEnum
CREATE TYPE "VerificationProvider" AS ENUM ('stripe_identity');

-- CreateEnum
CREATE TYPE "WebhookProvider" AS ENUM ('clerk', 'stripe', 'stripe_identity');

-- CreateEnum
CREATE TYPE "ProviderWebhookStatus" AS ENUM ('received', 'processed', 'ignored', 'failed');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('not_started', 'requires_payment_method', 'authorized', 'captured', 'release_pending', 'released', 'refund_pending', 'refunded', 'voided', 'failed');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('not_required', 'pending', 'succeeded', 'failed');

-- CreateEnum
CREATE TYPE "RefundReason" AS ENUM ('not_accepted', 'confirmation_incomplete', 'canceled_before_acceptance', 'payment_failure', 'provider_required');

-- CreateEnum
CREATE TYPE "AuditActorType" AS ENUM ('user', 'system', 'admin', 'payment_provider', 'auth_provider', 'verification_provider');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('email');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('queued', 'sent', 'failed', 'skipped');

-- CreateEnum
CREATE TYPE "AnalyticsEventGroup" AS ENUM ('acquisition', 'setup', 'vouch', 'payment', 'notification', 'admin');

-- CreateEnum
CREATE TYPE "Environment" AS ENUM ('development', 'preview', 'production');

-- CreateEnum
CREATE TYPE "AdminSafeRetryOperation" AS ENUM ('retry_notification_send', 'retry_provider_reconciliation', 'retry_webhook_processing', 'retry_refund_status_sync');

-- CreateEnum
CREATE TYPE "OperationalRetryStatus" AS ENUM ('started', 'completed', 'failed', 'skipped');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "email" VARCHAR(320),
    "phone" VARCHAR(32),
    "displayName" VARCHAR(120),
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "identityStatus" "VerificationStatus" NOT NULL DEFAULT 'unstarted',
    "adultStatus" "VerificationStatus" NOT NULL DEFAULT 'unstarted',
    "paymentReadiness" "PaymentReadinessStatus" NOT NULL DEFAULT 'not_started',
    "payoutReadiness" "PayoutReadinessStatus" NOT NULL DEFAULT 'not_started',
    "provider" "VerificationProvider",
    "providerReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_customers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL DEFAULT 'stripe',
    "providerCustomerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connected_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL DEFAULT 'stripe',
    "providerAccountId" TEXT NOT NULL,
    "readiness" "PayoutReadinessStatus" NOT NULL DEFAULT 'not_started',
    "chargesEnabled" BOOLEAN NOT NULL DEFAULT false,
    "payoutsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "detailsSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "connected_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "terms_acceptances" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "termsVersion" VARCHAR(64) NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipHash" TEXT,
    "userAgentHash" TEXT,

    CONSTRAINT "terms_acceptances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vouches" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "payerId" TEXT NOT NULL,
    "payeeId" TEXT,
    "amountCents" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'usd',
    "platformFeeCents" INTEGER NOT NULL DEFAULT 0,
    "status" "VouchStatus" NOT NULL DEFAULT 'pending',
    "label" VARCHAR(120),
    "meetingStartsAt" TIMESTAMP(3) NOT NULL,
    "confirmationOpensAt" TIMESTAMP(3) NOT NULL,
    "confirmationExpiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vouches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL,
    "vouchId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "recipientEmail" VARCHAR(320),
    "status" "InvitationStatus" NOT NULL DEFAULT 'created',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "openedAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "declinedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "presence_confirmations" (
    "id" TEXT NOT NULL,
    "vouchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "participantRole" "ParticipantRole" NOT NULL,
    "status" "ConfirmationStatus" NOT NULL DEFAULT 'confirmed',
    "method" "ConfirmationMethod" NOT NULL DEFAULT 'manual',
    "confirmedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "presence_confirmations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_records" (
    "id" TEXT NOT NULL,
    "vouchId" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL DEFAULT 'stripe',
    "providerPaymentId" TEXT,
    "providerChargeId" TEXT,
    "providerTransferId" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'not_started',
    "amountCents" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'usd',
    "platformFeeCents" INTEGER NOT NULL DEFAULT 0,
    "lastErrorCode" TEXT,
    "lastErrorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refund_records" (
    "id" TEXT NOT NULL,
    "vouchId" TEXT NOT NULL,
    "paymentRecordId" TEXT NOT NULL,
    "providerRefundId" TEXT,
    "status" "RefundStatus" NOT NULL DEFAULT 'not_required',
    "reason" "RefundReason",
    "amountCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refund_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_webhook_events" (
    "id" TEXT NOT NULL,
    "provider" "WebhookProvider" NOT NULL,
    "providerEventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "status" "ProviderWebhookStatus" NOT NULL DEFAULT 'received',
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "processingError" TEXT,
    "safeMetadata" JSONB,

    CONSTRAINT "provider_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clerk_sessions" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT,
    "status" TEXT NOT NULL,
    "lastEventType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "removedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "clerk_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clerk_emails" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT,
    "status" TEXT,
    "toEmail" VARCHAR(320),
    "lastEventType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "clerk_emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clerk_sms" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT,
    "status" TEXT,
    "toPhone" VARCHAR(32),
    "lastEventType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "clerk_sms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clerk_invitations" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT,
    "emailAddress" VARCHAR(320),
    "status" TEXT NOT NULL,
    "lastEventType" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "clerk_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_webhook_events" (
    "id" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL DEFAULT 'stripe',
    "providerEventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "providerWebhookEventId" TEXT,
    "vouchId" TEXT,
    "paymentRecordId" TEXT,
    "refundRecordId" TEXT,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "processingError" TEXT,
    "safeMetadata" JSONB,

    CONSTRAINT "payment_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_events" (
    "id" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "actorType" "AuditActorType" NOT NULL,
    "actorUserId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "requestId" TEXT,
    "participantSafe" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_events" (
    "id" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'email',
    "status" "NotificationStatus" NOT NULL DEFAULT 'queued',
    "recipientUserId" TEXT NOT NULL,
    "vouchId" TEXT,
    "providerMessageId" TEXT,
    "errorCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),

    CONSTRAINT "notification_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "eventGroup" "AnalyticsEventGroup" NOT NULL,
    "environment" "Environment" NOT NULL DEFAULT 'development',
    "userId" TEXT,
    "sessionId" TEXT,
    "requestId" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "properties" JSONB,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operational_retries" (
    "id" TEXT NOT NULL,
    "operation" "AdminSafeRetryOperation" NOT NULL,
    "status" "OperationalRetryStatus" NOT NULL DEFAULT 'started',
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "adminUserId" TEXT,
    "reason" TEXT,
    "errorCode" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operational_retries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerkUserId_key" ON "users"("clerkUserId");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "verification_profiles_userId_key" ON "verification_profiles"("userId");

-- CreateIndex
CREATE INDEX "verification_profiles_identityStatus_idx" ON "verification_profiles"("identityStatus");

-- CreateIndex
CREATE INDEX "verification_profiles_adultStatus_idx" ON "verification_profiles"("adultStatus");

-- CreateIndex
CREATE INDEX "verification_profiles_paymentReadiness_idx" ON "verification_profiles"("paymentReadiness");

-- CreateIndex
CREATE INDEX "verification_profiles_payoutReadiness_idx" ON "verification_profiles"("payoutReadiness");

-- CreateIndex
CREATE UNIQUE INDEX "payment_customers_userId_key" ON "payment_customers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_customers_providerCustomerId_key" ON "payment_customers"("providerCustomerId");

-- CreateIndex
CREATE INDEX "payment_customers_provider_idx" ON "payment_customers"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "connected_accounts_userId_key" ON "connected_accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "connected_accounts_providerAccountId_key" ON "connected_accounts"("providerAccountId");

-- CreateIndex
CREATE INDEX "connected_accounts_readiness_idx" ON "connected_accounts"("readiness");

-- CreateIndex
CREATE INDEX "connected_accounts_chargesEnabled_idx" ON "connected_accounts"("chargesEnabled");

-- CreateIndex
CREATE INDEX "connected_accounts_payoutsEnabled_idx" ON "connected_accounts"("payoutsEnabled");

-- CreateIndex
CREATE INDEX "terms_acceptances_userId_acceptedAt_idx" ON "terms_acceptances"("userId", "acceptedAt");

-- CreateIndex
CREATE UNIQUE INDEX "terms_acceptances_userId_termsVersion_key" ON "terms_acceptances"("userId", "termsVersion");

-- CreateIndex
CREATE UNIQUE INDEX "vouches_publicId_key" ON "vouches"("publicId");

-- CreateIndex
CREATE INDEX "vouches_payerId_idx" ON "vouches"("payerId");

-- CreateIndex
CREATE INDEX "vouches_payeeId_idx" ON "vouches"("payeeId");

-- CreateIndex
CREATE INDEX "vouches_status_idx" ON "vouches"("status");

-- CreateIndex
CREATE INDEX "vouches_confirmationExpiresAt_idx" ON "vouches"("confirmationExpiresAt");

-- CreateIndex
CREATE INDEX "vouches_payerId_status_confirmationExpiresAt_idx" ON "vouches"("payerId", "status", "confirmationExpiresAt");

-- CreateIndex
CREATE INDEX "vouches_payeeId_status_confirmationExpiresAt_idx" ON "vouches"("payeeId", "status", "confirmationExpiresAt");

-- CreateIndex
CREATE INDEX "vouches_payerId_createdAt_idx" ON "vouches"("payerId", "createdAt");

-- CreateIndex
CREATE INDEX "vouches_payeeId_createdAt_idx" ON "vouches"("payeeId", "createdAt");

-- CreateIndex
CREATE INDEX "vouches_status_confirmationExpiresAt_idx" ON "vouches"("status", "confirmationExpiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_vouchId_key" ON "invitations"("vouchId");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_tokenHash_key" ON "invitations"("tokenHash");

-- CreateIndex
CREATE INDEX "invitations_tokenHash_idx" ON "invitations"("tokenHash");

-- CreateIndex
CREATE INDEX "invitations_status_idx" ON "invitations"("status");

-- CreateIndex
CREATE INDEX "invitations_expiresAt_idx" ON "invitations"("expiresAt");

-- CreateIndex
CREATE INDEX "invitations_recipientEmail_idx" ON "invitations"("recipientEmail");

-- CreateIndex
CREATE INDEX "presence_confirmations_vouchId_idx" ON "presence_confirmations"("vouchId");

-- CreateIndex
CREATE INDEX "presence_confirmations_userId_idx" ON "presence_confirmations"("userId");

-- CreateIndex
CREATE INDEX "presence_confirmations_participantRole_idx" ON "presence_confirmations"("participantRole");

-- CreateIndex
CREATE INDEX "presence_confirmations_confirmedAt_idx" ON "presence_confirmations"("confirmedAt");

-- CreateIndex
CREATE UNIQUE INDEX "presence_confirmations_vouchId_participantRole_key" ON "presence_confirmations"("vouchId", "participantRole");

-- CreateIndex
CREATE UNIQUE INDEX "presence_confirmations_vouchId_userId_key" ON "presence_confirmations"("vouchId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_records_vouchId_key" ON "payment_records"("vouchId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_records_providerPaymentId_key" ON "payment_records"("providerPaymentId");

-- CreateIndex
CREATE INDEX "payment_records_provider_idx" ON "payment_records"("provider");

-- CreateIndex
CREATE INDEX "payment_records_providerPaymentId_idx" ON "payment_records"("providerPaymentId");

-- CreateIndex
CREATE INDEX "payment_records_providerChargeId_idx" ON "payment_records"("providerChargeId");

-- CreateIndex
CREATE INDEX "payment_records_providerTransferId_idx" ON "payment_records"("providerTransferId");

-- CreateIndex
CREATE INDEX "payment_records_status_idx" ON "payment_records"("status");

-- CreateIndex
CREATE INDEX "payment_records_vouchId_status_idx" ON "payment_records"("vouchId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "refund_records_vouchId_key" ON "refund_records"("vouchId");

-- CreateIndex
CREATE UNIQUE INDEX "refund_records_paymentRecordId_key" ON "refund_records"("paymentRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "refund_records_providerRefundId_key" ON "refund_records"("providerRefundId");

-- CreateIndex
CREATE INDEX "refund_records_status_idx" ON "refund_records"("status");

-- CreateIndex
CREATE INDEX "refund_records_reason_idx" ON "refund_records"("reason");

-- CreateIndex
CREATE INDEX "refund_records_providerRefundId_idx" ON "refund_records"("providerRefundId");

-- CreateIndex
CREATE INDEX "provider_webhook_events_provider_idx" ON "provider_webhook_events"("provider");

-- CreateIndex
CREATE INDEX "provider_webhook_events_eventType_idx" ON "provider_webhook_events"("eventType");

-- CreateIndex
CREATE INDEX "provider_webhook_events_status_idx" ON "provider_webhook_events"("status");

-- CreateIndex
CREATE INDEX "provider_webhook_events_processed_idx" ON "provider_webhook_events"("processed");

-- CreateIndex
CREATE INDEX "provider_webhook_events_receivedAt_idx" ON "provider_webhook_events"("receivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "provider_webhook_events_provider_providerEventId_key" ON "provider_webhook_events"("provider", "providerEventId");

-- CreateIndex
CREATE INDEX "clerk_sessions_clerkUserId_idx" ON "clerk_sessions"("clerkUserId");

-- CreateIndex
CREATE INDEX "clerk_sessions_status_idx" ON "clerk_sessions"("status");

-- CreateIndex
CREATE INDEX "clerk_emails_clerkUserId_idx" ON "clerk_emails"("clerkUserId");

-- CreateIndex
CREATE INDEX "clerk_emails_status_idx" ON "clerk_emails"("status");

-- CreateIndex
CREATE INDEX "clerk_sms_clerkUserId_idx" ON "clerk_sms"("clerkUserId");

-- CreateIndex
CREATE INDEX "clerk_sms_status_idx" ON "clerk_sms"("status");

-- CreateIndex
CREATE INDEX "clerk_invitations_clerkUserId_idx" ON "clerk_invitations"("clerkUserId");

-- CreateIndex
CREATE INDEX "clerk_invitations_emailAddress_idx" ON "clerk_invitations"("emailAddress");

-- CreateIndex
CREATE INDEX "clerk_invitations_status_idx" ON "clerk_invitations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payment_webhook_events_providerEventId_key" ON "payment_webhook_events"("providerEventId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_webhook_events_providerWebhookEventId_key" ON "payment_webhook_events"("providerWebhookEventId");

-- CreateIndex
CREATE INDEX "payment_webhook_events_provider_idx" ON "payment_webhook_events"("provider");

-- CreateIndex
CREATE INDEX "payment_webhook_events_eventType_idx" ON "payment_webhook_events"("eventType");

-- CreateIndex
CREATE INDEX "payment_webhook_events_processed_idx" ON "payment_webhook_events"("processed");

-- CreateIndex
CREATE INDEX "payment_webhook_events_receivedAt_idx" ON "payment_webhook_events"("receivedAt");

-- CreateIndex
CREATE INDEX "payment_webhook_events_vouchId_idx" ON "payment_webhook_events"("vouchId");

-- CreateIndex
CREATE INDEX "payment_webhook_events_paymentRecordId_idx" ON "payment_webhook_events"("paymentRecordId");

-- CreateIndex
CREATE INDEX "payment_webhook_events_refundRecordId_idx" ON "payment_webhook_events"("refundRecordId");

-- CreateIndex
CREATE INDEX "audit_events_eventName_idx" ON "audit_events"("eventName");

-- CreateIndex
CREATE INDEX "audit_events_actorType_idx" ON "audit_events"("actorType");

-- CreateIndex
CREATE INDEX "audit_events_actorUserId_idx" ON "audit_events"("actorUserId");

-- CreateIndex
CREATE INDEX "audit_events_entityType_entityId_idx" ON "audit_events"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_events_entityType_entityId_createdAt_idx" ON "audit_events"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_events_participantSafe_idx" ON "audit_events"("participantSafe");

-- CreateIndex
CREATE INDEX "audit_events_createdAt_idx" ON "audit_events"("createdAt");

-- CreateIndex
CREATE INDEX "notification_events_recipientUserId_idx" ON "notification_events"("recipientUserId");

-- CreateIndex
CREATE INDEX "notification_events_vouchId_idx" ON "notification_events"("vouchId");

-- CreateIndex
CREATE INDEX "notification_events_vouchId_status_idx" ON "notification_events"("vouchId", "status");

-- CreateIndex
CREATE INDEX "notification_events_eventName_idx" ON "notification_events"("eventName");

-- CreateIndex
CREATE INDEX "notification_events_channel_idx" ON "notification_events"("channel");

-- CreateIndex
CREATE INDEX "notification_events_status_idx" ON "notification_events"("status");

-- CreateIndex
CREATE INDEX "notification_events_errorCode_idx" ON "notification_events"("errorCode");

-- CreateIndex
CREATE INDEX "notification_events_createdAt_idx" ON "notification_events"("createdAt");

-- CreateIndex
CREATE INDEX "analytics_events_eventName_idx" ON "analytics_events"("eventName");

-- CreateIndex
CREATE INDEX "analytics_events_eventGroup_idx" ON "analytics_events"("eventGroup");

-- CreateIndex
CREATE INDEX "analytics_events_environment_idx" ON "analytics_events"("environment");

-- CreateIndex
CREATE INDEX "analytics_events_userId_idx" ON "analytics_events"("userId");

-- CreateIndex
CREATE INDEX "analytics_events_sessionId_idx" ON "analytics_events"("sessionId");

-- CreateIndex
CREATE INDEX "analytics_events_requestId_idx" ON "analytics_events"("requestId");

-- CreateIndex
CREATE INDEX "analytics_events_occurredAt_idx" ON "analytics_events"("occurredAt");

-- CreateIndex
CREATE INDEX "operational_retries_operation_idx" ON "operational_retries"("operation");

-- CreateIndex
CREATE INDEX "operational_retries_status_idx" ON "operational_retries"("status");

-- CreateIndex
CREATE INDEX "operational_retries_entityType_entityId_idx" ON "operational_retries"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "operational_retries_adminUserId_idx" ON "operational_retries"("adminUserId");

-- CreateIndex
CREATE INDEX "operational_retries_startedAt_idx" ON "operational_retries"("startedAt");

-- AddForeignKey
ALTER TABLE "verification_profiles" ADD CONSTRAINT "verification_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_customers" ADD CONSTRAINT "payment_customers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connected_accounts" ADD CONSTRAINT "connected_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terms_acceptances" ADD CONSTRAINT "terms_acceptances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vouches" ADD CONSTRAINT "vouches_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vouches" ADD CONSTRAINT "vouches_payeeId_fkey" FOREIGN KEY ("payeeId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_vouchId_fkey" FOREIGN KEY ("vouchId") REFERENCES "vouches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presence_confirmations" ADD CONSTRAINT "presence_confirmations_vouchId_fkey" FOREIGN KEY ("vouchId") REFERENCES "vouches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presence_confirmations" ADD CONSTRAINT "presence_confirmations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_vouchId_fkey" FOREIGN KEY ("vouchId") REFERENCES "vouches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund_records" ADD CONSTRAINT "refund_records_vouchId_fkey" FOREIGN KEY ("vouchId") REFERENCES "vouches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund_records" ADD CONSTRAINT "refund_records_paymentRecordId_fkey" FOREIGN KEY ("paymentRecordId") REFERENCES "payment_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_webhook_events" ADD CONSTRAINT "payment_webhook_events_providerWebhookEventId_fkey" FOREIGN KEY ("providerWebhookEventId") REFERENCES "provider_webhook_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_webhook_events" ADD CONSTRAINT "payment_webhook_events_vouchId_fkey" FOREIGN KEY ("vouchId") REFERENCES "vouches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_webhook_events" ADD CONSTRAINT "payment_webhook_events_paymentRecordId_fkey" FOREIGN KEY ("paymentRecordId") REFERENCES "payment_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_webhook_events" ADD CONSTRAINT "payment_webhook_events_refundRecordId_fkey" FOREIGN KEY ("refundRecordId") REFERENCES "refund_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_events" ADD CONSTRAINT "notification_events_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_events" ADD CONSTRAINT "notification_events_vouchId_fkey" FOREIGN KEY ("vouchId") REFERENCES "vouches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operational_retries" ADD CONSTRAINT "operational_retries_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

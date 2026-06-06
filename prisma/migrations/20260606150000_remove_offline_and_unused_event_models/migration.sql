DROP TABLE IF EXISTS "VouchEvent";
DROP TABLE IF EXISTS "AnalyticsEvent";

ALTER TABLE "PresenceConfirmationAttempt" DROP COLUMN IF EXISTS "payloadHash";
ALTER TABLE "PresenceConfirmation"
  DROP COLUMN IF EXISTS "retryUntil",
  DROP COLUMN IF EXISTS "lastRetryAt",
  DROP COLUMN IF EXISTS "retryCount";

ALTER TYPE "PresenceConfirmationStatus" RENAME TO "PresenceConfirmationStatus_old";
CREATE TYPE "PresenceConfirmationStatus" AS ENUM (
  'pending',
  'merchant_confirmed',
  'customer_confirmed',
  'can_capture',
  'void',
  'auto_void'
);
ALTER TABLE "PresenceConfirmation"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "PresenceConfirmationStatus"
    USING (
      CASE WHEN "status"::text = 'sync_pending' THEN 'void' ELSE "status"::text END
    )::"PresenceConfirmationStatus",
  ALTER COLUMN "status" SET DEFAULT 'pending';
ALTER TABLE "VouchRecoverySnapshot"
  ALTER COLUMN "presenceStatus" TYPE "PresenceConfirmationStatus"
    USING (
      CASE WHEN "presenceStatus"::text = 'sync_pending' THEN 'void' ELSE "presenceStatus"::text END
    )::"PresenceConfirmationStatus";
DROP TYPE "PresenceConfirmationStatus_old";

ALTER TYPE "ConfirmationSubmissionMode" RENAME TO "ConfirmationSubmissionMode_old";
CREATE TYPE "ConfirmationSubmissionMode" AS ENUM ('online');
ALTER TABLE "PresenceConfirmationAttempt"
  ALTER COLUMN "submissionMode" DROP DEFAULT,
  ALTER COLUMN "submissionMode" TYPE "ConfirmationSubmissionMode"
    USING 'online'::"ConfirmationSubmissionMode",
  ALTER COLUMN "submissionMode" SET DEFAULT 'online';
DROP TYPE "ConfirmationSubmissionMode_old";

ALTER TYPE "PresenceResolutionSource" RENAME TO "PresenceResolutionSource_old";
CREATE TYPE "PresenceResolutionSource" AS ENUM ('online', 'auto_void');
ALTER TABLE "PresenceConfirmation"
  ALTER COLUMN "resolutionSource" TYPE "PresenceResolutionSource"
    USING (
      CASE
        WHEN "resolutionSource"::text IN ('offline_sync', 'server_reconciliation')
          THEN 'auto_void'
        ELSE "resolutionSource"::text
      END
    )::"PresenceResolutionSource";
DROP TYPE "PresenceResolutionSource_old";

DELETE FROM "OperationalRetry"
WHERE "operation"::text <> 'reconcile_payment_intent';
ALTER TYPE "OperationalRetryOperation" RENAME TO "OperationalRetryOperation_old";
CREATE TYPE "OperationalRetryOperation" AS ENUM ('reconcile_payment_intent');
ALTER TABLE "OperationalRetry"
  ALTER COLUMN "operation" TYPE "OperationalRetryOperation"
    USING "operation"::text::"OperationalRetryOperation";
DROP TYPE "OperationalRetryOperation_old";

ALTER TYPE "VouchRecoverySnapshotReason" RENAME TO "VouchRecoverySnapshotReason_old";
CREATE TYPE "VouchRecoverySnapshotReason" AS ENUM (
  'created',
  'before_capture',
  'presence_auto_void',
  'webhook_reconciliation',
  'provider_reconciliation'
);
ALTER TABLE "VouchRecoverySnapshot"
  ALTER COLUMN "reason" DROP DEFAULT,
  ALTER COLUMN "reason" TYPE "VouchRecoverySnapshotReason"
    USING (
      CASE
        WHEN "reason"::text = 'offline_confirmation_synced' THEN 'provider_reconciliation'
        ELSE "reason"::text
      END
    )::"VouchRecoverySnapshotReason",
  ALTER COLUMN "reason" SET DEFAULT 'created';
DROP TYPE "VouchRecoverySnapshotReason_old";

DROP TYPE IF EXISTS "VouchTransitionType";
DROP TYPE IF EXISTS "AnalyticsEventGroup";

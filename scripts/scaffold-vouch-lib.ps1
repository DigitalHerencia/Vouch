#Requires -Version 7.0

<#
.SYNOPSIS
  Scaffolds Vouch lib-layer server files.

.DESCRIPTION
  Creates stubs for:
  - lib/actions/*
  - lib/fetcher/*
  - lib/db/transactions/*
  - lib/db/selects/*
  - lib/db/mappers/*
  - lib/auth/*
  - lib/authz/*
  - lib/constants/*
  - lib/integrations/*
  - supporting cache/env/errors/security/domain helper folders

.NOTES
  Existing lib/db/prisma.ts and lib/utils.ts are intentionally not touched.
  Uses .NET directory creation to avoid PowerShell LiteralPath/New-Item issues.
#>

param(
  [string]$Root = (Get-Location).Path,
  [switch]$Overwrite,
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$Utf8NoBom = [System.Text.UTF8Encoding]::new($false)

function Write-Step {
  param([string]$Message)
  Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Write-Skip {
  param([string]$Message)
  Write-Host "skip: $Message" -ForegroundColor DarkGray
}

function Ensure-Directory {
  param([string]$Path)

  if ($DryRun) {
    Write-Host "mkdir $Path"
    return
  }

  if (-not (Test-Path -LiteralPath $Path)) {
    [System.IO.Directory]::CreateDirectory($Path) | Out-Null
  }
}

function Write-TextFile {
  param(
    [string]$Path,
    [string]$Content
  )

  $parent = Split-Path -Parent $Path
  Ensure-Directory -Path $parent

  if ((Test-Path -LiteralPath $Path) -and -not $Overwrite) {
    Write-Skip $Path
    return
  }

  if ($DryRun) {
    Write-Host "write $Path"
    return
  }

  [System.IO.File]::WriteAllText($Path, $Content, $Utf8NoBom)
  Write-Host "wrote: $Path"
}

function New-AsyncFunctionModule {
  param(
    [string[]]$Functions,
    [string]$Kind,
    [string]$RelativePath
  )

  $lines = New-Object System.Collections.Generic.List[string]

  switch ($Kind) {
    "action" {
      $lines.Add('"use server"')
      $lines.Add("")
      $lines.Add("// Auto-generated action stubs. Implement authenticate -> authorize -> validate -> transact -> audit -> revalidate.")
    }
    "fetcher" {
      $lines.Add('import "server-only"')
      $lines.Add("")
      $lines.Add("// Auto-generated fetcher stubs. Implement authenticate -> authorize -> minimal select -> DTO mapping.")
    }
    "transaction" {
      $lines.Add('import "server-only"')
      $lines.Add("")
      $lines.Add("type Tx = unknown")
      $lines.Add("")
      $lines.Add("// Auto-generated transaction stubs. Replace Tx with Prisma.TransactionClient after generated client is available.")
    }
    "server" {
      $lines.Add('import "server-only"')
      $lines.Add("")
      $lines.Add("// Auto-generated server helper stubs.")
    }
    default {
      $lines.Add("// Auto-generated module stubs.")
    }
  }

  $lines.Add("")

  foreach ($fn in $Functions) {
    if ($Kind -eq "transaction") {
      $lines.Add("export async function $fn(_tx: Tx, _input?: unknown): Promise<never> {")
      $lines.Add("  throw new Error(`$fn not implemented in $RelativePath`)")
      $lines.Add("}")
      $lines.Add("")
    } else {
      $lines.Add("export async function $fn(..._args: unknown[]): Promise<never> {")
      $lines.Add("  throw new Error(`$fn not implemented in $RelativePath`)")
      $lines.Add("}")
      $lines.Add("")
    }
  }

  return ($lines -join "`n")
}

function New-SelectModule {
  param(
    [string[]]$Names,
    [string]$RelativePath
  )

  $lines = New-Object System.Collections.Generic.List[string]
  $lines.Add('import "server-only"')
  $lines.Add("")
  $lines.Add("// Auto-generated Prisma select/include projection stubs.")
  $lines.Add("// Replace empty objects with Prisma-safe select shapes before wiring fetchers.")
  $lines.Add("")

  foreach ($name in $Names) {
    $lines.Add("export const $name = {} as const")
  }

  $lines.Add("")
  return ($lines -join "`n")
}

function New-MapperModule {
  param(
    [string[]]$Names,
    [string]$RelativePath
  )

  $lines = New-Object System.Collections.Generic.List[string]
  $lines.Add('import "server-only"')
  $lines.Add("")
  $lines.Add("// Auto-generated DTO mapper stubs.")
  $lines.Add("// These should convert Prisma records into transport-safe DTO/read models.")
  $lines.Add("")

  foreach ($name in $Names) {
    $lines.Add("export function $name(_record: unknown): never {")
    $lines.Add("  throw new Error(`$name not implemented in $RelativePath`)")
    $lines.Add("}")
    $lines.Add("")
  }

  return ($lines -join "`n")
}

function Write-ModuleMap {
  param(
    [hashtable]$Map,
    [string]$Kind
  )

  foreach ($relativePath in $Map.Keys) {
    $fullPath = Join-Path $Root $relativePath
    $content = New-AsyncFunctionModule -Functions $Map[$relativePath] -Kind $Kind -RelativePath $relativePath
    Write-TextFile -Path $fullPath -Content $content
  }
}

function Write-SelectMap {
  param([hashtable]$Map)

  foreach ($relativePath in $Map.Keys) {
    $fullPath = Join-Path $Root $relativePath
    $content = New-SelectModule -Names $Map[$relativePath] -RelativePath $relativePath
    Write-TextFile -Path $fullPath -Content $content
  }
}

function Write-MapperMap {
  param([hashtable]$Map)

  foreach ($relativePath in $Map.Keys) {
    $fullPath = Join-Path $Root $relativePath
    $content = New-MapperModule -Names $Map[$relativePath] -RelativePath $relativePath
    Write-TextFile -Path $fullPath -Content $content
  }
}

Write-Step "Scaffolding Vouch lib layer"

# -------------------------------------------------------------------
# lib/actions
# -------------------------------------------------------------------

$actionModules = @{
  "lib/actions/marketingActions.ts" = @(
    "trackMarketingPageViewed",
    "trackMarketingCtaClicked"
  )

  "lib/actions/authActions.ts" = @(
    "syncClerkUser",
    "handleClerkWebhook",
    "ensureLocalUserForSession",
    "updateLastSignedInAt",
    "resolvePostAuthRedirect"
  )

  "lib/actions/userActions.ts" = @(
    "upsertUserFromAuthProvider",
    "updatePrivateAccountInfo",
    "markUserDisabled",
    "markUserActive"
  )

  "lib/actions/setupActions.ts" = @(
    "acceptTerms",
    "refreshSetupStatus",
    "continueAfterSetup",
    "startRequiredSetupForCreate",
    "startRequiredSetupForAccept",
    "startRequiredSetupForConfirm"
  )

  "lib/actions/verificationActions.ts" = @(
    "startIdentityVerification",
    "startAdultVerification",
    "handleVerificationProviderReturn",
    "reconcileVerificationProfile",
    "markVerificationRequiresAction",
    "markVerificationRejected",
    "markVerificationVerified"
  )

  "lib/actions/paymentActions.ts" = @(
    "startPaymentMethodSetup",
    "handlePaymentMethodSetupReturn",
    "refreshPaymentReadiness",
    "startPayoutOnboarding",
    "handlePayoutOnboardingReturn",
    "refreshPayoutReadiness",
    "initializeVouchPayment",
    "authorizeVouchPayment",
    "captureOrReleaseVouchPayment",
    "refundOrVoidVouchPayment",
    "handleStripeWebhook",
    "recordPaymentWebhookEvent",
    "processPaymentWebhookEvent",
    "reconcilePaymentStatus",
    "reconcileRefundStatus",
    "markPaymentFailed"
  )

  "lib/actions/vouchActions.ts" = @(
    "createVouch",
    "validateCreateVouchDraft",
    "calculatePlatformFee",
    "createVouchInvitation",
    "sendVouchInvitation",
    "resendVouchInvitation",
    "invalidateVouchInvitation",
    "markInviteOpened",
    "acceptVouch",
    "declineVouch",
    "cancelPendingVouch",
    "confirmPresence",
    "recordPresenceConfirmation",
    "preventDuplicateConfirmation",
    "evaluateAggregateConfirmation",
    "completeVouchIfBothConfirmed",
    "expireUnresolvedVouches",
    "expireVouch",
    "refundExpiredVouch",
    "markVouchFailed",
    "retryFailedVouchResolution"
  )

  "lib/actions/dashboardActions.ts" = @(
    "updateDashboardPreferences"
  )

  "lib/actions/settingsActions.ts" = @(
    "updateProfileBasics",
    "refreshAccountReadiness",
    "startSettingsPaymentSetup",
    "startSettingsPayoutSetup",
    "startSettingsVerification",
    "acceptSettingsTerms"
  )

  "lib/actions/adminActions.ts" = @(
    "disableUserAccount",
    "retryNotificationSend",
    "retryProviderReconciliation",
    "retryWebhookProcessing",
    "retryRefundStatusSync",
    "recordAdminViewAuditEvent",
    "recordAdminSafeRetryStarted",
    "recordAdminSafeRetryCompleted"
  )

  "lib/actions/auditActions.ts" = @(
    "writeAuditEvent",
    "writeUserAuditEvent",
    "writeVouchAuditEvent",
    "writePaymentAuditEvent",
    "writeWebhookAuditEvent",
    "writeAdminAuditEvent",
    "writeNotificationAuditEvent"
  )

  "lib/actions/notificationActions.ts" = @(
    "queueInviteNotification",
    "queueVouchAcceptedNotification",
    "queueConfirmationWindowOpenNotification",
    "queueConfirmationRecordedNotification",
    "queueVouchCompletedNotification",
    "queueVouchExpiredRefundedNotification",
    "queuePaymentFailedNotification",
    "sendQueuedNotification",
    "retryNotification",
    "updateNotificationDeliveryStatus",
    "markNotificationFailed",
    "markNotificationSkipped"
  )

  "lib/actions/analyticsActions.ts" = @(
    "trackMarketingEvent",
    "trackSetupEvent",
    "trackVouchLifecycleEvent",
    "trackPaymentEvent",
    "trackNotificationEvent",
    "trackAdminOperationalEvent"
  )

  "lib/actions/systemActions.ts" = @(
    "healthcheck",
    "revalidateVouchTags",
    "revalidateUserVouches",
    "revalidateAdminOperationalViews",
    "recordServerActionFailure",
    "recordOperationalError"
  )
}

Write-ModuleMap -Map $actionModules -Kind "action"

# -------------------------------------------------------------------
# lib/fetcher
# -------------------------------------------------------------------

$fetcherModules = @{
  "lib/fetcher/marketingFetchers.ts" = @(
    "getLandingPageContent",
    "getHowItWorksContent",
    "getPricingContent",
    "getFaqContent",
    "getTermsPageContent",
    "getPrivacyPageContent",
    "getPublicNavigation",
    "getPublicFooterContent"
  )

  "lib/fetcher/authFetchers.ts" = @(
    "getCurrentUser",
    "getCurrentUserId",
    "requireUser",
    "requireActiveUser",
    "getAuthPageState",
    "getSignInPageState",
    "getSignUpPageState",
    "getAuthCallbackState",
    "getSignedOutRedirectState",
    "getUserSetupStatus",
    "getUserAuthzSnapshot",
    "getContextualParticipantRole",
    "getInvitePreservedAuthContext"
  )

  "lib/fetcher/userFetchers.ts" = @(
    "getUserById",
    "getUserByClerkUserId",
    "getCurrentUserProfile",
    "getCurrentUserAccountStatus",
    "getCurrentUserOperationalSnapshot",
    "getUserPrivateAccountInfo",
    "getUserSafeDisplayIdentity",
    "getUserEmailSummary"
  )

  "lib/fetcher/setupFetchers.ts" = @(
    "getSetupPageState",
    "getSetupChecklist",
    "getSetupProgress",
    "getSetupBlockersForAction",
    "getCreateVouchSetupGate",
    "getAcceptVouchSetupGate",
    "getConfirmPresenceSetupGate",
    "getTermsAcceptanceStatus",
    "getSetupReturnContext",
    "getAccountReadinessSummary"
  )

  "lib/fetcher/verificationFetchers.ts" = @(
    "getVerificationStatus",
    "getIdentityVerificationState",
    "getAdultVerificationState",
    "getVerificationProviderReturnState",
    "getVerificationBlockedState",
    "getVerificationStatusCard"
  )

  "lib/fetcher/paymentFetchers.ts" = @(
    "getPaymentSettingsPageState",
    "getPaymentMethodReadiness",
    "getPaymentMethodSetupState",
    "getPaymentMethodProviderRedirectState",
    "getPaymentMethodReadyState",
    "getPaymentMethodFailedState",
    "getPayoutSettingsPageState",
    "getPayoutReadiness",
    "getPayoutSetupState",
    "getPayoutProviderRedirectState",
    "getPayoutReadyState",
    "getPayoutRestrictedState",
    "getPayoutSetupFailedState",
    "getParticipantSafePaymentSummary",
    "getParticipantSafeRefundSummary",
    "getPaymentStatusCard",
    "getRefundStatusCard",
    "getProviderUnavailableState"
  )

  "lib/fetcher/vouchFetchers.ts" = @(
    "getCreateVouchPageState",
    "getCreateVouchBlockedState",
    "getCreateVouchFeePreview",
    "getCreateVouchReviewState",
    "getCreateVouchSuccessState",
    "getCreateVouchPaymentProcessingState",
    "getCreateVouchPaymentFailedState",
    "getInviteLandingState",
    "getInviteLandingUnauthenticatedState",
    "getInviteLandingAuthenticatedState",
    "getInviteInvalidState",
    "getInviteExpiredState",
    "getInviteAlreadyAcceptedState",
    "getInvitedVouchSummary",
    "getAcceptVouchPageState",
    "getAcceptVouchSetupBlockedState",
    "getAcceptVouchPayoutRequiredState",
    "getAcceptVouchTermsRequiredState",
    "getSelfAcceptanceDeniedState",
    "listUserVouches",
    "listPayerVouches",
    "listPayeeVouches",
    "getVouchDetailForParticipant",
    "getVouchDetailPendingPayerState",
    "getVouchDetailPendingInviteSentState",
    "getVouchDetailActiveBeforeWindowState",
    "getVouchDetailActiveWindowOpenState",
    "getVouchDetailPayerConfirmedState",
    "getVouchDetailPayeeConfirmedState",
    "getVouchDetailProcessingReleaseState",
    "getVouchDetailCompletedState",
    "getVouchDetailExpiredState",
    "getVouchDetailRefundedState",
    "getVouchDetailFailedPaymentState",
    "getVouchDetailFailedReleaseState",
    "getVouchDetailFailedRefundState",
    "getVouchDetailUnauthorizedOrNotFoundState",
    "getConfirmPresencePageState",
    "getConfirmPresencePayerState",
    "getConfirmPresencePayeeState",
    "getConfirmBeforeWindowState",
    "getConfirmWindowOpenState",
    "getConfirmAlreadyConfirmedState",
    "getConfirmWaitingForOtherPartyState",
    "getConfirmBothConfirmedSuccessState",
    "getConfirmWindowClosedState",
    "getConfirmDuplicateErrorState",
    "getConfirmUnauthorizedState",
    "getConfirmProviderFailureState",
    "getShareVouchState",
    "getInviteLinkState",
    "getSendInvitationState",
    "getVouchConfirmationState",
    "getVouchWindowSummary",
    "getVouchPaymentSummary",
    "getVouchTimeline",
    "getParticipantSafeAuditTimeline",
    "getWhatHappensNextState"
  )

  "lib/fetcher/dashboardFetchers.ts" = @(
    "getDashboardPageState",
    "getDashboardSummary",
    "getDashboardSetupBanner",
    "getActionRequiredVouches",
    "getActiveVouches",
    "getPendingVouches",
    "getCompletedVouches",
    "getExpiredRefundedVouches",
    "getPayerDashboardSummary",
    "getPayeeDashboardSummary",
    "getDashboardEmptyState",
    "getDashboardErrorState",
    "parseDashboardSearchParams"
  )

  "lib/fetcher/settingsFetchers.ts" = @(
    "getAccountSettings",
    "getProfileBasics",
    "getPrivateAccountInfo",
    "getAccountStatusCard",
    "getVerificationStatusCard",
    "getPaymentReadinessCard",
    "getPayoutReadinessCard",
    "getTermsStatusCard",
    "getSettingsLoadingState",
    "getSettingsErrorState"
  )

  "lib/fetcher/adminFetchers.ts" = @(
    "getAdminDashboardState",
    "getAdminDashboardSummary",
    "getAdminFailureHeavyState",
    "listAdminVouches",
    "getAdminVouchDetail",
    "getAdminVouchCompletedState",
    "getAdminVouchExpiredRefundedState",
    "getAdminVouchPaymentFailedState",
    "listAdminUsers",
    "getAdminUserDetail",
    "listAdminPayments",
    "getAdminPaymentDetail",
    "listAdminWebhookEvents",
    "getAdminWebhookEventDetail",
    "listAdminAuditEvents",
    "getAdminAuditEventDetail",
    "getAdminSafeRetryPreview",
    "getAdminUnauthorizedState"
  )

  "lib/fetcher/auditFetchers.ts" = @(
    "getParticipantSafeAuditTimeline",
    "getAdminAuditTimeline",
    "listAuditEvents",
    "getAuditEventDetail",
    "getVouchAuditSummary",
    "getPaymentAuditSummary",
    "getUserAuditSummary"
  )

  "lib/fetcher/notificationFetchers.ts" = @(
    "listUserNotificationEvents",
    "getNotificationDeliveryState",
    "getNotificationPreferences",
    "listAdminNotificationEvents",
    "listNotificationEventsForVouch",
    "getNotificationEventDetail"
  )

  "lib/fetcher/analyticsFetchers.ts" = @(
    "getLifecycleAnalyticsSummary",
    "getSetupFunnelSummary",
    "getVouchFunnelSummary",
    "getPaymentFailureAnalytics",
    "getNotificationDeliveryAnalytics",
    "getAdminOperationalAnalytics"
  )

  "lib/fetcher/systemFetchers.ts" = @(
    "getGlobalLoadingShellState",
    "getRouteLoadingSkeletonState",
    "getGlobalErrorState",
    "getProtectedRouteUnauthorizedState",
    "getEntityNotFoundState",
    "getServerActionFailureState",
    "getPaymentProviderUnavailableState",
    "getMaintenanceOrDegradedServiceState"
  )
}

Write-ModuleMap -Map $fetcherModules -Kind "fetcher"

# -------------------------------------------------------------------
# lib/db/transactions
# -------------------------------------------------------------------

$transactionModules = @{
  "lib/db/transactions/authTransactions.ts" = @(
    "upsertUserFromClerkTx",
    "createDefaultVerificationProfileTx",
    "syncUserEmailFromClerkTx",
    "syncUserPhoneFromClerkTx",
    "syncUserDisplayNameFromClerkTx",
    "softDisableUserFromClerkDeletedTx",
    "ensureUserSetupRecordsTx",
    "recordClerkWebhookProcessedTx",
    "recordClerkWebhookIgnoredTx",
    "recordClerkWebhookFailedTx"
  )

  "lib/db/transactions/userTransactions.ts" = @(
    "createUserTx",
    "updateUserPrivateAccountInfoTx",
    "updateUserStatusTx",
    "disableUserTx",
    "reactivateUserTx",
    "updateLastSignedInAtTx"
  )

  "lib/db/transactions/setupTransactions.ts" = @(
    "acceptTermsTx",
    "ensureTermsAcceptanceTx",
    "updateSetupGateSnapshotTx",
    "markSetupBlockedTx",
    "markSetupReturnedFromInviteTx",
    "markSetupReturnedFromCreateTx"
  )

  "lib/db/transactions/verificationTransactions.ts" = @(
    "createVerificationProfileTx",
    "updateIdentityVerificationStatusTx",
    "updateAdultVerificationStatusTx",
    "updateVerificationProviderReferenceTx",
    "markVerificationPendingTx",
    "markVerificationVerifiedTx",
    "markVerificationRejectedTx",
    "markVerificationRequiresActionTx",
    "markVerificationExpiredTx"
  )

  "lib/db/transactions/paymentTransactions.ts" = @(
    "upsertPaymentCustomerTx",
    "updatePaymentReadinessTx",
    "upsertConnectedAccountTx",
    "updateConnectedAccountReadinessTx",
    "updateConnectedAccountCapabilitiesTx",
    "createPaymentRecordTx",
    "updatePaymentRecordStatusTx",
    "markPaymentAuthorizedTx",
    "markPaymentCapturedTx",
    "markPaymentReleasePendingTx",
    "markPaymentReleasedTx",
    "markPaymentRefundPendingTx",
    "markPaymentRefundedTx",
    "markPaymentVoidedTx",
    "markPaymentFailedTx",
    "createRefundRecordTx",
    "updateRefundRecordStatusTx",
    "markRefundSucceededTx",
    "markRefundFailedTx",
    "recordPaymentWebhookEventTx",
    "markPaymentWebhookProcessedTx",
    "markPaymentWebhookIgnoredTx",
    "markPaymentWebhookFailedTx"
  )

  "lib/db/transactions/vouchTransactions.ts" = @(
    "createVouchTx",
    "updateVouchStatusTx",
    "bindPayeeToVouchTx",
    "cancelPendingVouchTx",
    "markVouchActiveTx",
    "markVouchCompletedTx",
    "markVouchExpiredTx",
    "markVouchRefundedTx",
    "markVouchCanceledTx",
    "markVouchFailedTx",
    "completeVouchWithPaymentReleaseTx",
    "expireVouchWithRefundTx",
    "markResolutionFailureTx"
  )

  "lib/db/transactions/invitationTransactions.ts" = @(
    "createInvitationTx",
    "markInvitationSentTx",
    "markInvitationOpenedTx",
    "markInvitationAcceptedTx",
    "markInvitationDeclinedTx",
    "markInvitationExpiredTx",
    "invalidateInvitationTx",
    "rotateInvitationTokenHashTx"
  )

  "lib/db/transactions/confirmationTransactions.ts" = @(
    "createPresenceConfirmationTx",
    "assertNoDuplicateConfirmationTx",
    "getAggregateConfirmationStatusTx",
    "markConfirmationWindowOpenedTx"
  )

  "lib/db/transactions/auditTransactions.ts" = @(
    "writeAuditEventTx",
    "writeUserAuditEventTx",
    "writeAuthProviderAuditEventTx",
    "writeVerificationAuditEventTx",
    "writeVouchAuditEventTx",
    "writePaymentAuditEventTx",
    "writeWebhookAuditEventTx",
    "writeNotificationAuditEventTx",
    "writeAdminAuditEventTx"
  )

  "lib/db/transactions/notificationTransactions.ts" = @(
    "queueNotificationTx",
    "markNotificationSentTx",
    "markNotificationFailedTx",
    "markNotificationSkippedTx",
    "updateNotificationDeliveryStatusTx",
    "retryNotificationTx"
  )

  "lib/db/transactions/adminTransactions.ts" = @(
    "disableUserOperationallyTx",
    "recordAdminViewedUserTx",
    "recordAdminViewedVouchTx",
    "recordAdminViewedPaymentTx",
    "recordAdminSafeRetryStartedTx",
    "recordAdminSafeRetryCompletedTx",
    "recordAdminSafeRetryFailedTx"
  )

  "lib/db/transactions/analyticsTransactions.ts" = @(
    "recordAnalyticsEventTx",
    "recordMarketingAnalyticsEventTx",
    "recordSetupAnalyticsEventTx",
    "recordVouchLifecycleAnalyticsEventTx",
    "recordPaymentAnalyticsEventTx",
    "recordNotificationAnalyticsEventTx",
    "recordAdminAnalyticsEventTx"
  )

  "lib/db/transactions/systemTransactions.ts" = @(
    "recordOperationalErrorTx",
    "recordServerActionFailureTx",
    "recordProviderUnavailableTx",
    "recordMaintenanceBannerTx"
  )
}

Write-ModuleMap -Map $transactionModules -Kind "transaction"

# -------------------------------------------------------------------
# lib/db/selects
# -------------------------------------------------------------------

$selectModules = @{
  "lib/db/selects/user.selects.ts" = @(
    "userIdSelect",
    "userAuthLookupSelect",
    "userSessionSelect",
    "userSafeIdentitySelect",
    "userPrivateAccountSelect",
    "userAccountStatusSelect",
    "userOperationalSnapshotSelect",
    "userWithReadinessSelect",
    "adminUserListItemSelect",
    "adminUserDetailSelect"
  )

  "lib/db/selects/auth.selects.ts" = @(
    "currentUserAuthSelect",
    "activeUserGateSelect",
    "adminCapabilitySelect",
    "contextualParticipantRoleSelect",
    "inviteCandidateAuthSelect",
    "authWebhookUserSyncSelect"
  )

  "lib/db/selects/setup.selects.ts" = @(
    "setupChecklistSelect",
    "setupProgressSelect",
    "createVouchSetupGateSelect",
    "acceptVouchSetupGateSelect",
    "confirmPresenceSetupGateSelect",
    "accountReadinessSummarySelect",
    "termsAcceptanceStatusSelect"
  )

  "lib/db/selects/verification.selects.ts" = @(
    "verificationStatusSelect",
    "identityVerificationStateSelect",
    "adultVerificationStateSelect",
    "verificationStatusCardSelect",
    "adminVerificationSummarySelect"
  )

  "lib/db/selects/payment.selects.ts" = @(
    "paymentCustomerReadinessSelect",
    "connectedAccountReadinessSelect",
    "paymentSettingsSelect",
    "payoutSettingsSelect",
    "paymentRecordParticipantSummarySelect",
    "refundRecordParticipantSummarySelect",
    "paymentStatusCardSelect",
    "refundStatusCardSelect",
    "adminPaymentListItemSelect",
    "adminPaymentDetailSelect",
    "paymentWebhookEventListItemSelect",
    "paymentWebhookEventDetailSelect"
  )

  "lib/db/selects/vouch.selects.ts" = @(
    "vouchIdSelect",
    "vouchCardSelect",
    "vouchListItemSelect",
    "payerVouchListItemSelect",
    "payeeVouchListItemSelect",
    "vouchDetailBaseSelect",
    "vouchDetailForParticipantSelect",
    "vouchDetailPendingPayerSelect",
    "vouchDetailPendingInviteSentSelect",
    "vouchDetailActiveBeforeWindowSelect",
    "vouchDetailActiveWindowOpenSelect",
    "vouchDetailCompletedSelect",
    "vouchDetailExpiredSelect",
    "vouchDetailRefundedSelect",
    "vouchDetailFailedSelect",
    "vouchConfirmationStateSelect",
    "vouchWindowSummarySelect",
    "vouchPaymentSummarySelect",
    "vouchTimelineSelect",
    "whatHappensNextSelect",
    "adminVouchListItemSelect",
    "adminVouchDetailSelect",
    "adminVouchFailureStateSelect"
  )

  "lib/db/selects/invitation.selects.ts" = @(
    "invitationTokenLookupSelect",
    "invitationSummarySelect",
    "invitationStatusSelect",
    "invitedVouchSummarySelect",
    "adminInvitationSelect"
  )

  "lib/db/selects/confirmation.selects.ts" = @(
    "confirmationParticipantSummarySelect",
    "confirmationStatusSelect",
    "aggregateConfirmationSelect",
    "confirmPresenceEligibilitySelect",
    "adminConfirmationSelect"
  )

  "lib/db/selects/audit.selects.ts" = @(
    "participantSafeAuditTimelineItemSelect",
    "participantSafeAuditTimelineSelect",
    "adminAuditListItemSelect",
    "adminAuditEventDetailSelect",
    "vouchAuditSummarySelect",
    "paymentAuditSummarySelect",
    "userAuditSummarySelect"
  )

  "lib/db/selects/notification.selects.ts" = @(
    "notificationEventListItemSelect",
    "notificationEventDetailSelect",
    "notificationDeliveryStateSelect",
    "vouchNotificationEventsSelect",
    "adminNotificationEventSelect"
  )

  "lib/db/selects/dashboard.selects.ts" = @(
    "dashboardSummarySelect",
    "actionRequiredVouchSelect",
    "activeVouchSelect",
    "pendingVouchSelect",
    "completedVouchSelect",
    "expiredRefundedVouchSelect",
    "payerDashboardSummarySelect",
    "payeeDashboardSummarySelect"
  )

  "lib/db/selects/settings.selects.ts" = @(
    "accountSettingsSelect",
    "profileBasicsSelect",
    "privateAccountInfoSelect",
    "accountStatusCardSelect",
    "verificationStatusCardSelect",
    "paymentReadinessCardSelect",
    "payoutReadinessCardSelect",
    "termsStatusCardSelect"
  )

  "lib/db/selects/admin.selects.ts" = @(
    "adminDashboardSummarySelect",
    "adminFailureHeavySummarySelect",
    "adminVouchListSelect",
    "adminVouchDetailSelect",
    "adminVouchPaymentFailureSelect",
    "adminUserListSelect",
    "adminUserDetailSelect",
    "adminPaymentListSelect",
    "adminPaymentDetailSelect",
    "adminWebhookEventListSelect",
    "adminWebhookEventDetailSelect",
    "adminAuditLogSelect",
    "adminAuditEventDetailSelect"
  )
}

Write-SelectMap -Map $selectModules

# -------------------------------------------------------------------
# lib/db/mappers
# -------------------------------------------------------------------

$mapperModules = @{
  "lib/db/mappers/user.mappers.ts" = @(
    "mapUserSafeIdentity",
    "mapUserPrivateAccount",
    "mapUserAccountStatus",
    "mapAdminUserListItem",
    "mapAdminUserDetail"
  )

  "lib/db/mappers/auth.mappers.ts" = @(
    "mapSessionUser",
    "mapAuthzSnapshot",
    "mapContextualParticipantRole"
  )

  "lib/db/mappers/setup.mappers.ts" = @(
    "mapSetupChecklist",
    "mapSetupProgress",
    "mapSetupGateResult",
    "mapAccountReadinessSummary"
  )

  "lib/db/mappers/verification.mappers.ts" = @(
    "mapVerificationStatusCard",
    "mapIdentityVerificationState",
    "mapAdultVerificationState"
  )

  "lib/db/mappers/payment.mappers.ts" = @(
    "mapPaymentReadiness",
    "mapPayoutReadiness",
    "mapPaymentStatusCard",
    "mapRefundStatusCard",
    "mapAdminPaymentListItem",
    "mapAdminPaymentDetail"
  )

  "lib/db/mappers/vouch.mappers.ts" = @(
    "mapVouchCard",
    "mapVouchListItem",
    "mapVouchDetail",
    "mapVouchConfirmationState",
    "mapVouchWindowSummary",
    "mapVouchPaymentSummary",
    "mapWhatHappensNext"
  )

  "lib/db/mappers/invitation.mappers.ts" = @(
    "mapInvitationSummary",
    "mapInvitedVouchSummary",
    "mapInviteLandingState"
  )

  "lib/db/mappers/confirmation.mappers.ts" = @(
    "mapConfirmationParticipantSummary",
    "mapAggregateConfirmationStatus",
    "mapConfirmPresenceEligibility"
  )

  "lib/db/mappers/audit.mappers.ts" = @(
    "mapParticipantSafeAuditTimelineItem",
    "mapAdminAuditListItem",
    "mapAdminAuditEventDetail"
  )

  "lib/db/mappers/notification.mappers.ts" = @(
    "mapNotificationEventListItem",
    "mapNotificationEventDetail",
    "mapNotificationDeliveryState"
  )

  "lib/db/mappers/dashboard.mappers.ts" = @(
    "mapDashboardSummary",
    "mapDashboardSection",
    "mapActionRequiredVouch"
  )

  "lib/db/mappers/settings.mappers.ts" = @(
    "mapAccountSettings",
    "mapProfileBasics",
    "mapTermsStatusCard"
  )

  "lib/db/mappers/admin.mappers.ts" = @(
    "mapAdminDashboardSummary",
    "mapAdminFailureHeavySummary",
    "mapAdminSafeRetryPreview"
  )
}

Write-MapperMap -Map $mapperModules

# -------------------------------------------------------------------
# Auth / Authz / Cache / Domain helpers
# -------------------------------------------------------------------

$serverHelperModules = @{
  "lib/auth/current-user.ts" = @(
    "getCurrentUser",
    "getCurrentUserId",
    "requireUser",
    "requireActiveUser"
  )

  "lib/auth/clerk.ts" = @(
    "mapClerkUserToLocalInput",
    "extractPrimaryEmailFromClerkUser",
    "extractDisplayNameFromClerkUser"
  )

  "lib/auth/webhooks.ts" = @(
    "verifyClerkWebhook",
    "parseClerkWebhookEvent",
    "handleVerifiedClerkWebhook"
  )

  "lib/auth/redirects.ts" = @(
    "resolvePostAuthRedirect",
    "sanitizeAuthReturnTo",
    "buildInviteAuthRedirect"
  )

  "lib/auth/setup-gates.ts" = @(
    "getUserSetupStatus",
    "assertCreateVouchSetupReady",
    "assertAcceptVouchSetupReady",
    "assertConfirmPresenceSetupReady"
  )

  "lib/authz/policies.ts" = @(
    "canViewVouch",
    "canCreateVouch",
    "canAcceptVouch",
    "canDeclineVouch",
    "canConfirmPresence",
    "canViewAdmin"
  )

  "lib/authz/participants.ts" = @(
    "assertVouchParticipant",
    "assertPayer",
    "assertPayee",
    "assertInviteCandidate",
    "getParticipantRoleForVouch"
  )

  "lib/authz/admin.ts" = @(
    "assertAdmin",
    "canViewOperationalState",
    "canRunSafeRetry",
    "canDisableUserOperationally"
  )

  "lib/authz/capabilities.ts" = @(
    "getUserCapabilities",
    "hasCapability",
    "assertCapability"
  )

  "lib/authz/assertions.ts" = @(
    "deny",
    "assertAllowed",
    "assertActiveAccount",
    "assertNotSelfAcceptance"
  )

  "lib/cache/revalidate.ts" = @(
    "revalidateVouch",
    "revalidateUserVouches",
    "revalidateDashboard",
    "revalidateAdminOperationalViews"
  )

  "lib/vouch/state.ts" = @(
    "deriveVouchDetailVariant",
    "deriveAggregateConfirmationStatus",
    "deriveNextVouchAction",
    "assertValidVouchTransition"
  )

  "lib/vouch/fees.ts" = @(
    "calculatePlatformFeeCents",
    "calculateTotalAuthorizationCents"
  )

  "lib/vouch/time-windows.ts" = @(
    "isConfirmationWindowOpen",
    "isConfirmationWindowClosed",
    "assertValidConfirmationWindow"
  )

  "lib/vouch/resolution.ts" = @(
    "shouldReleaseFunds",
    "shouldExpireVouch",
    "shouldRefundOrVoid"
  )

  "lib/invitations/tokens.ts" = @(
    "createInvitationToken",
    "hashInvitationToken",
    "verifyInvitationTokenHash"
  )

  "lib/notifications/queue.ts" = @(
    "queueDomainNotification",
    "dispatchQueuedNotification",
    "markNotificationDeliveryResult"
  )

  "lib/security/hash.ts" = @(
    "hashSensitiveValue",
    "compareSensitiveHash"
  )

  "lib/security/idempotency.ts" = @(
    "createIdempotencyKey",
    "assertIdempotencyKey"
  )

  "lib/security/rate-limit.ts" = @(
    "rateLimitSensitiveAction",
    "rateLimitWebhook",
    "rateLimitAuthAction"
  )

  "lib/security/request.ts" = @(
    "getRequestId",
    "getClientIpHash",
    "getUserAgentHash"
  )

  "lib/errors/action-errors.ts" = @(
    "toActionFailure",
    "toFieldErrors",
    "isRetryableProviderError"
  )

  "lib/observability/logger.ts" = @(
    "logInfo",
    "logWarn",
    "logError",
    "logAuditSafe"
  )

  "lib/jobs/expire-vouches.ts" = @(
    "runExpireUnresolvedVouchesJob",
    "findExpiredUnresolvedVouches"
  )

  "lib/jobs/reconcile-payments.ts" = @(
    "runPaymentReconciliationJob",
    "reconcileStuckPaymentRecords"
  )
}

Write-ModuleMap -Map $serverHelperModules -Kind "server"

# -------------------------------------------------------------------
# Integrations
# -------------------------------------------------------------------

$integrationModules = @{
  "lib/integrations/stripe/client.ts" = @(
    "getStripeServerClient"
  )

  "lib/integrations/stripe/payment-intents.ts" = @(
    "createStripePaymentAuthorization",
    "captureStripePayment",
    "voidStripeAuthorization",
    "refundStripePayment"
  )

  "lib/integrations/stripe/connect.ts" = @(
    "createStripeConnectAccount",
    "createStripeConnectOnboardingLink",
    "refreshStripeConnectReadiness"
  )

  "lib/integrations/stripe/identity.ts" = @(
    "createStripeIdentitySession",
    "refreshStripeIdentityStatus"
  )

  "lib/integrations/stripe/webhooks.ts" = @(
    "verifyStripeWebhookSignature",
    "parseStripeWebhookEvent",
    "mapStripeWebhookToPaymentUpdate"
  )

  "lib/integrations/clerk/webhooks.ts" = @(
    "verifyClerkWebhookSignature",
    "mapClerkWebhookToUserSyncInput"
  )

  "lib/integrations/email/provider.ts" = @(
    "sendEmail",
    "sendLifecycleEmail"
  )

  "lib/integrations/email/templates.ts" = @(
    "renderInviteEmail",
    "renderVouchAcceptedEmail",
    "renderConfirmationWindowOpenEmail",
    "renderConfirmationRecordedEmail",
    "renderVouchCompletedEmail",
    "renderVouchExpiredRefundedEmail",
    "renderPaymentFailedEmail"
  )
}

Write-ModuleMap -Map $integrationModules -Kind "server"

# -------------------------------------------------------------------
# Constants and plain modules
# -------------------------------------------------------------------

$plainFiles = @{
  "lib/constants/app.ts" = @'
export const APP_NAME = "Vouch"
export const APP_DESCRIPTION = "Commitment-backed payment coordination for appointments and in-person agreements."
export const DEFAULT_CURRENCY = "usd"
'@

  "lib/constants/routes.ts" = @'
export const ROUTES = {
  home: "/",
  dashboard: "/dashboard",
  setup: "/setup",
  settings: "/settings",
  vouches: "/vouches",
  newVouch: "/vouches/new",
  admin: "/admin",
} as const

export function vouchDetailPath(vouchId: string) {
  return `/vouches/${vouchId}`
}

export function vouchConfirmPath(vouchId: string) {
  return `/vouches/${vouchId}/confirm`
}

export function invitePath(token: string) {
  return `/vouches/invite/${token}`
}
'@

  "lib/constants/cache-tags.ts" = @'
export const CACHE_TAGS = {
  vouches: "vouches",
  payments: "payments",
  adminVouches: "admin:vouches",
} as const

export function vouchTag(vouchId: string) {
  return `vouch:${vouchId}`
}

export function userVouchesTag(userId: string) {
  return `user:${userId}:vouches`
}

export function paymentTag(paymentId: string) {
  return `payment:${paymentId}`
}

export function verificationTag(userId: string) {
  return `verification:${userId}`
}

export function vouchAuditTag(vouchId: string) {
  return `audit:vouch:${vouchId}`
}
'@

  "lib/constants/limits.ts" = @'
export const VOUCH_LIMITS = {
  minAmountCents: 500,
  maxAmountCents: 250000,
  maxLabelLength: 120,
  maxPrivateNoteLength: 500,
  inviteTokenBytes: 32,
} as const
'@

  "lib/constants/status.ts" = @'
export const FINAL_VOUCH_STATUSES = ["completed", "expired", "refunded", "canceled", "failed"] as const
export const ACTIVE_VOUCH_STATUSES = ["pending", "active"] as const
export const PARTICIPANT_ROLES = ["payer", "payee"] as const
'@

  "lib/constants/providers.ts" = @'
export const PAYMENT_PROVIDER = "stripe"
export const VERIFICATION_PROVIDER = "stripe_identity"
export const AUTH_PROVIDER = "clerk"
'@

  "lib/constants/terms.ts" = @'
export const CURRENT_TERMS_VERSION = "2026-04-24"
'@

  "lib/constants/admin.ts" = @'
export const ADMIN_SAFE_RETRY_OPERATIONS = [
  "retry_notification_send",
  "retry_provider_reconciliation",
  "retry_webhook_processing",
  "retry_refund_status_sync",
] as const
'@

  "lib/env.ts" = @'
import "server-only"

export function getRequiredEnv(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

export function getOptionalEnv(name: string): string | undefined {
  return process.env[name]
}
'@

  "lib/constants/index.ts" = @'
export * from "./app"
export * from "./routes"
export * from "./cache-tags"
export * from "./limits"
export * from "./status"
export * from "./providers"
export * from "./terms"
export * from "./admin"
'@
}

foreach ($relativePath in $plainFiles.Keys) {
  Write-TextFile -Path (Join-Path $Root $relativePath) -Content $plainFiles[$relativePath]
}

# -------------------------------------------------------------------
# Directory placeholders for future modules
# -------------------------------------------------------------------

$directories = @(
  "lib/db/transactions",
  "lib/db/selects",
  "lib/db/mappers",
  "lib/actions",
  "lib/fetcher",
  "lib/auth",
  "lib/authz",
  "lib/constants",
  "lib/integrations/stripe",
  "lib/integrations/clerk",
  "lib/integrations/email",
  "lib/cache",
  "lib/vouch",
  "lib/invitations",
  "lib/notifications",
  "lib/security",
  "lib/errors",
  "lib/observability",
  "lib/jobs"
)

foreach ($dir in $directories) {
  Ensure-Directory -Path (Join-Path $Root $dir)
}

Write-Step "Done"
Write-Host "Existing files intentionally preserved unless targeted with -Overwrite:" -ForegroundColor Yellow
Write-Host "  lib/db/prisma.ts"
Write-Host "  lib/utils.ts"

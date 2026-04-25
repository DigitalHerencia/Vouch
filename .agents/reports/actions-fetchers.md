Below is the **server-side read/write surface** implied by the mockups, page inventory, component mapping, and Vouch governance.

I’m using your requested flat file shape:

```txt
@/lib/fetcher/{domain}Fetchers.ts
@/lib/actions/{domain}Actions.ts
```

**Note:** the source docs call for `lib/<domain>/fetchers/` and `lib/<domain>/actions/`; this is the same architecture expressed as flat domain files. Fetchers are authenticated/authorized server reads that return DTOs, and actions are server mutations that authenticate, authorize, validate, transact, audit, and revalidate.

---

# 1. `@/lib/fetcher/marketingFetchers.ts`

Public pages can mostly use static content modules, but a fetcher file is useful if you want consistent DTOs for marketing/legal sections.

```ts
export async function getLandingPageContent()
export async function getHowItWorksContent()
export async function getPricingContent()
export async function getFaqContent()
export async function getTermsPageContent()
export async function getPrivacyPageContent()
export async function getPublicNavigation()
export async function getPublicFooterContent()
```

## `@/lib/actions/marketingActions.ts`

Keep this thin. No marketplace tracking, no lead marketplace behavior.

```ts
export async function trackMarketingPageViewed(input)
export async function trackMarketingCtaClicked(input)
```

Public/marketing pages include landing, how-it-works, pricing, FAQ, terms, privacy, 404, and public error states.

---

# 2. `@/lib/fetcher/authFetchers.ts`

```ts
export async function getCurrentUser()
export async function getCurrentUserId()
export async function requireUser()
export async function requireActiveUser()

export async function getAuthPageState(input)
export async function getSignInPageState(input)
export async function getSignUpPageState(input)
export async function getAuthCallbackState(input)
export async function getSignedOutRedirectState(input)

export async function getUserSetupStatus(userId)
export async function getUserAuthzSnapshot(userId)
export async function getContextualParticipantRole(input)
export async function getInvitePreservedAuthContext(token)
```

## `@/lib/actions/authActions.ts`

```ts
export async function syncClerkUser(input)
export async function handleClerkWebhook(input)
export async function ensureLocalUserForSession()
export async function updateLastSignedInAt()
export async function resolvePostAuthRedirect(input)
```

Auth must resolve current user, account status, participant role, admin capability, verification readiness, payment readiness, payout readiness, and terms acceptance server-side. Required auth helpers include `getCurrentUser`, `requireUser`, `requireActiveUser`, `getCurrentUserId`, `syncClerkUser`, and `getUserSetupStatus`.

---

# 3. `@/lib/fetcher/userFetchers.ts`

```ts
export async function getUserById(userId)
export async function getUserByClerkUserId(clerkUserId)
export async function getCurrentUserProfile()
export async function getCurrentUserAccountStatus()
export async function getCurrentUserOperationalSnapshot()

export async function getUserPrivateAccountInfo()
export async function getUserSafeDisplayIdentity(userId)
export async function getUserEmailSummary(userId)
```

## `@/lib/actions/userActions.ts`

```ts
export async function upsertUserFromAuthProvider(input)
export async function updatePrivateAccountInfo(input)
export async function markUserDisabled(input) // admin-gated wrapper may live in adminActions
export async function markUserActive(input) // admin-gated wrapper may live in adminActions
```

Keep this private-account-only. No public profile, public bio, portfolio, ratings, reviews, services, categories, badges, or reputation fields.

---

# 4. `@/lib/fetcher/setupFetchers.ts`

```ts
export async function getSetupPageState(input)
export async function getSetupChecklist(userId)
export async function getSetupProgress(userId)
export async function getSetupBlockersForAction(input)

export async function getCreateVouchSetupGate(userId)
export async function getAcceptVouchSetupGate(input)
export async function getConfirmPresenceSetupGate(input)

export async function getTermsAcceptanceStatus(userId)
export async function getSetupReturnContext(input)
export async function getAccountReadinessSummary(userId)
```

## `@/lib/actions/setupActions.ts`

```ts
export async function acceptTerms(input)
export async function refreshSetupStatus()
export async function continueAfterSetup(input)

export async function startRequiredSetupForCreate(input)
export async function startRequiredSetupForAccept(input)
export async function startRequiredSetupForConfirm(input)
```

Setup supports incomplete/all-complete states, verification blockers, payment blockers, payout blockers, terms acceptance, and return-from-invite/create states.

---

# 5. `@/lib/fetcher/verificationFetchers.ts`

```ts
export async function getVerificationStatus(userId)
export async function getIdentityVerificationState(userId)
export async function getAdultVerificationState(userId)
export async function getVerificationProviderReturnState(input)
export async function getVerificationBlockedState(userId)
export async function getVerificationStatusCard(userId)
```

## `@/lib/actions/verificationActions.ts`

```ts
export async function startIdentityVerification(input)
export async function startAdultVerification(input)
export async function handleVerificationProviderReturn(input)
export async function reconcileVerificationProfile(input)
export async function markVerificationRequiresAction(input)
export async function markVerificationRejected(input)
export async function markVerificationVerified(input)
```

Verification is part of readiness gating; create requires identity/adult/payment/terms, accept requires identity/adult/payout/terms, and confirm requires active participant + active Vouch + open window + no duplicate confirmation.

---

# 6. `@/lib/fetcher/paymentFetchers.ts`

```ts
export async function getPaymentSettingsPageState(userId)
export async function getPaymentMethodReadiness(userId)
export async function getPaymentMethodSetupState(userId)
export async function getPaymentMethodProviderRedirectState(input)
export async function getPaymentMethodReadyState(userId)
export async function getPaymentMethodFailedState(userId)

export async function getPayoutSettingsPageState(userId)
export async function getPayoutReadiness(userId)
export async function getPayoutSetupState(userId)
export async function getPayoutProviderRedirectState(input)
export async function getPayoutReadyState(userId)
export async function getPayoutRestrictedState(userId)
export async function getPayoutSetupFailedState(userId)

export async function getParticipantSafePaymentSummary(vouchId)
export async function getParticipantSafeRefundSummary(vouchId)
export async function getPaymentStatusCard(vouchId)
export async function getRefundStatusCard(vouchId)
export async function getProviderUnavailableState()
```

## `@/lib/actions/paymentActions.ts`

```ts
export async function startPaymentMethodSetup(input)
export async function handlePaymentMethodSetupReturn(input)
export async function refreshPaymentReadiness(input)

export async function startPayoutOnboarding(input)
export async function handlePayoutOnboardingReturn(input)
export async function refreshPayoutReadiness(input)

export async function initializeVouchPayment(input)
export async function authorizeVouchPayment(input)
export async function captureOrReleaseVouchPayment(input)
export async function refundOrVoidVouchPayment(input)

export async function handleStripeWebhook(input)
export async function recordPaymentWebhookEvent(input)
export async function processPaymentWebhookEvent(input)
export async function reconcilePaymentStatus(input)
export async function reconcileRefundStatus(input)
export async function markPaymentFailed(input)
```

Payment/payout setup needs setup, redirect/loading, ready, failed, restricted, and overview states. Payment implementation must create records, track provider IDs/statuses, handle release/refund/provider failures, verify webhooks, and reconcile local state.

---

# 7. `@/lib/fetcher/vouchFetchers.ts`

This is the core read surface.

```ts
// Create flow
export async function getCreateVouchPageState(input)
export async function getCreateVouchBlockedState(userId)
export async function getCreateVouchFeePreview(input)
export async function getCreateVouchReviewState(input)
export async function getCreateVouchSuccessState(vouchId)
export async function getCreateVouchPaymentProcessingState(vouchId)
export async function getCreateVouchPaymentFailedState(vouchId)

// Invite / accept flow
export async function getInviteLandingState(token)
export async function getInviteLandingUnauthenticatedState(token)
export async function getInviteLandingAuthenticatedState(input)
export async function getInviteInvalidState(token)
export async function getInviteExpiredState(token)
export async function getInviteAlreadyAcceptedState(token)
export async function getInvitedVouchSummary(token)
export async function getAcceptVouchPageState(input)
export async function getAcceptVouchSetupBlockedState(input)
export async function getAcceptVouchPayoutRequiredState(input)
export async function getAcceptVouchTermsRequiredState(input)
export async function getSelfAcceptanceDeniedState(input)

// Vouch list/detail
export async function listUserVouches(input)
export async function listPayerVouches(input)
export async function listPayeeVouches(input)
export async function getVouchDetailForParticipant(input)
export async function getVouchDetailPendingPayerState(vouchId)
export async function getVouchDetailPendingInviteSentState(vouchId)
export async function getVouchDetailActiveBeforeWindowState(vouchId)
export async function getVouchDetailActiveWindowOpenState(vouchId)
export async function getVouchDetailPayerConfirmedState(vouchId)
export async function getVouchDetailPayeeConfirmedState(vouchId)
export async function getVouchDetailProcessingReleaseState(vouchId)
export async function getVouchDetailCompletedState(vouchId)
export async function getVouchDetailExpiredState(vouchId)
export async function getVouchDetailRefundedState(vouchId)
export async function getVouchDetailFailedPaymentState(vouchId)
export async function getVouchDetailFailedReleaseState(vouchId)
export async function getVouchDetailFailedRefundState(vouchId)
export async function getVouchDetailUnauthorizedOrNotFoundState(vouchId)

// Confirmation
export async function getConfirmPresencePageState(input)
export async function getConfirmPresencePayerState(vouchId)
export async function getConfirmPresencePayeeState(vouchId)
export async function getConfirmBeforeWindowState(vouchId)
export async function getConfirmWindowOpenState(vouchId)
export async function getConfirmAlreadyConfirmedState(vouchId)
export async function getConfirmWaitingForOtherPartyState(vouchId)
export async function getConfirmBothConfirmedSuccessState(vouchId)
export async function getConfirmWindowClosedState(vouchId)
export async function getConfirmDuplicateErrorState(vouchId)
export async function getConfirmUnauthorizedState(vouchId)
export async function getConfirmProviderFailureState(vouchId)

// Share
export async function getShareVouchState(vouchId)
export async function getInviteLinkState(vouchId)
export async function getSendInvitationState(vouchId)

// Timeline / summaries
export async function getVouchConfirmationState(vouchId)
export async function getVouchWindowSummary(vouchId)
export async function getVouchPaymentSummary(vouchId)
export async function getVouchTimeline(vouchId)
export async function getParticipantSafeAuditTimeline(vouchId)
export async function getWhatHappensNextState(vouchId)
```

## `@/lib/actions/vouchActions.ts`

```ts
// Create
export async function createVouch(input)
export async function validateCreateVouchDraft(input)
export async function calculatePlatformFee(input)
export async function createVouchInvitation(input)

// Share / invite
export async function sendVouchInvitation(input)
export async function resendVouchInvitation(input)
export async function invalidateVouchInvitation(input)
export async function markInviteOpened(input)

// Accept / decline
export async function acceptVouch(input)
export async function declineVouch(input)
export async function cancelPendingVouch(input)

// Confirmation
export async function confirmPresence(input)
export async function recordPresenceConfirmation(input)
export async function preventDuplicateConfirmation(input)
export async function evaluateAggregateConfirmation(input)

// Resolution
export async function completeVouchIfBothConfirmed(input)
export async function expireUnresolvedVouches(input)
export async function expireVouch(input)
export async function refundExpiredVouch(input)
export async function markVouchFailed(input)
export async function retryFailedVouchResolution(input)
```

Create, invite/accept, detail, confirmation, and payment failure states are explicitly represented in the page inventory. The backlog calls out `createVouch`, `acceptVouch`, `declineVouch`, manual `confirmPresence`, expiration/refund/non-capture, audit, and revalidation as core implementation work.

---

# 8. `@/lib/fetcher/dashboardFetchers.ts`

```ts
export async function getDashboardPageState(input)
export async function getDashboardSummary(userId)
export async function getDashboardSetupBanner(userId)

export async function getActionRequiredVouches(input)
export async function getActiveVouches(input)
export async function getPendingVouches(input)
export async function getCompletedVouches(input)
export async function getExpiredRefundedVouches(input)

export async function getPayerDashboardSummary(userId)
export async function getPayeeDashboardSummary(userId)

export async function getDashboardEmptyState(userId)
export async function getDashboardErrorState(input)
export async function parseDashboardSearchParams(searchParams)
```

## `@/lib/actions/dashboardActions.ts`

Probably **none for MVP**.

Use URL search params for status/page/sort instead of persisting dashboard state. If you later save user preferences:

```ts
export async function updateDashboardPreferences(input)
```

Dashboard states include empty, action-required, active, mixed, payer-focused, payee-focused, loading, error, and filtered Vouch list states. The backlog specifically calls for participant-scoped dashboard sections and Vouch list fetchers.

---

# 9. `@/lib/fetcher/settingsFetchers.ts`

```ts
export async function getAccountSettings(input)
export async function getProfileBasics(userId)
export async function getPrivateAccountInfo(userId)
export async function getAccountStatusCard(userId)

export async function getVerificationStatusCard(userId)
export async function getPaymentReadinessCard(userId)
export async function getPayoutReadinessCard(userId)
export async function getTermsStatusCard(userId)

export async function getSettingsLoadingState()
export async function getSettingsErrorState(input)
```

## `@/lib/actions/settingsActions.ts`

```ts
export async function updateProfileBasics(input)
export async function refreshAccountReadiness(input)
export async function startSettingsPaymentSetup(input)
export async function startSettingsPayoutSetup(input)
export async function startSettingsVerification(input)
export async function acceptSettingsTerms(input)
```

Settings/account views must show account basics, verification status, payment readiness, payout readiness, terms/legal status, account disabled, loading, and error states. The private account/readiness instructions require `getAccountSettings`, `getSetupStatus`, `getVerificationStatus`, `getPaymentReadiness`, and `getPayoutReadiness`.

---

# 10. `@/lib/fetcher/adminFetchers.ts`

```ts
export async function getAdminDashboardState(input)
export async function getAdminDashboardSummary(input)
export async function getAdminFailureHeavyState(input)

export async function listAdminVouches(input)
export async function getAdminVouchDetail(input)
export async function getAdminVouchCompletedState(input)
export async function getAdminVouchExpiredRefundedState(input)
export async function getAdminVouchPaymentFailedState(input)

export async function listAdminUsers(input)
export async function getAdminUserDetail(input)

export async function listAdminPayments(input)
export async function getAdminPaymentDetail(input)

export async function listAdminWebhookEvents(input)
export async function getAdminWebhookEventDetail(input)

export async function listAdminAuditEvents(input)
export async function getAdminAuditEventDetail(input)

export async function getAdminSafeRetryPreview(input)
export async function getAdminUnauthorizedState(input)
```

## `@/lib/actions/adminActions.ts`

```ts
export async function disableUserAccount(input)

export async function retryNotificationSend(input)
export async function retryProviderReconciliation(input)
export async function retryWebhookProcessing(input)
export async function retryRefundStatusSync(input)

export async function recordAdminViewAuditEvent(input)
export async function recordAdminSafeRetryStarted(input)
export async function recordAdminSafeRetryCompleted(input)
```

Admin may view users, verification summaries, Vouches, invitations, confirmations, payment/refund records, webhook events, notification events, audit events, and failure states; admin may only perform safe idempotent retries, account disable if policy allows, and operational inspection. Do **not** implement dispute decisions, awards, forced release, manual completion, confirmation rewrites, evidence upload, claims, messages, ratings, or blame assignment.

---

# 11. `@/lib/fetcher/auditFetchers.ts`

```ts
export async function getParticipantSafeAuditTimeline(input)
export async function getAdminAuditTimeline(input)

export async function listAuditEvents(input)
export async function getAuditEventDetail(input)

export async function getVouchAuditSummary(vouchId)
export async function getPaymentAuditSummary(paymentId)
export async function getUserAuditSummary(userId)
```

## `@/lib/actions/auditActions.ts`

These are mostly **internal server utilities**, not user-triggered actions.

```ts
export async function writeAuditEvent(input)
export async function writeUserAuditEvent(input)
export async function writeVouchAuditEvent(input)
export async function writePaymentAuditEvent(input)
export async function writeWebhookAuditEvent(input)
export async function writeAdminAuditEvent(input)
export async function writeNotificationAuditEvent(input)
```

Every important action must create an audit event, including user creation, verification, Vouch creation/acceptance/confirmation/completion/expiration/refund/failure, webhook processing, and admin activity.

---

# 12. `@/lib/fetcher/notificationFetchers.ts`

```ts
export async function listUserNotificationEvents(input)
export async function getNotificationDeliveryState(input)
export async function getNotificationPreferences(userId)

export async function listAdminNotificationEvents(input)
export async function listNotificationEventsForVouch(vouchId)
export async function getNotificationEventDetail(input)
```

## `@/lib/actions/notificationActions.ts`

```ts
export async function queueInviteNotification(input)
export async function queueVouchAcceptedNotification(input)
export async function queueConfirmationWindowOpenNotification(input)
export async function queueConfirmationRecordedNotification(input)
export async function queueVouchCompletedNotification(input)
export async function queueVouchExpiredRefundedNotification(input)
export async function queuePaymentFailedNotification(input)

export async function sendQueuedNotification(input)
export async function retryNotification(input)
export async function updateNotificationDeliveryStatus(input)
export async function markNotificationFailed(input)
export async function markNotificationSkipped(input)
```

Notification/email templates include invite, accepted, confirmation window open, confirmation recorded, completed, expired/refunded, and payment failed.

---

# 13. `@/lib/fetcher/analyticsFetchers.ts`

Mostly admin/ops aggregate reads, not behavioral surveillance.

```ts
export async function getLifecycleAnalyticsSummary(input)
export async function getSetupFunnelSummary(input)
export async function getVouchFunnelSummary(input)
export async function getPaymentFailureAnalytics(input)
export async function getNotificationDeliveryAnalytics(input)
export async function getAdminOperationalAnalytics(input)
```

## `@/lib/actions/analyticsActions.ts`

Internal event writers only.

```ts
export async function trackMarketingEvent(input)
export async function trackSetupEvent(input)
export async function trackVouchLifecycleEvent(input)
export async function trackPaymentEvent(input)
export async function trackNotificationEvent(input)
export async function trackAdminOperationalEvent(input)
```

Keep analytics privacy-minimized. No service-category, profile-view, search-query, review, message, or dispute analytics.

---

# 14. `@/lib/fetcher/systemFetchers.ts`

```ts
export async function getGlobalLoadingShellState()
export async function getRouteLoadingSkeletonState(input)
export async function getGlobalErrorState(input)
export async function getProtectedRouteUnauthorizedState(input)
export async function getEntityNotFoundState(input)
export async function getServerActionFailureState(input)
export async function getPaymentProviderUnavailableState()
export async function getMaintenanceOrDegradedServiceState()
```

## `@/lib/actions/systemActions.ts`

```ts
export async function healthcheck()
export async function revalidateVouchTags(input)
export async function revalidateUserVouches(input)
export async function revalidateAdminOperationalViews(input)
export async function recordServerActionFailure(input)
export async function recordOperationalError(input)
```

System/shared states include global loading, route skeleton, global error, protected unauthorized, entity not found, toast states, form/action errors, payment provider unavailable, and degraded service banners.

---

# Recommended Initial Implementation Order

```txt
1. authFetchers.ts / authActions.ts
2. setupFetchers.ts / setupActions.ts
3. paymentFetchers.ts / paymentActions.ts
4. vouchFetchers.ts / vouchActions.ts
5. dashboardFetchers.ts
6. settingsFetchers.ts / settingsActions.ts
7. adminFetchers.ts / adminActions.ts
8. auditActions.ts
9. notificationActions.ts
10. analyticsActions.ts
```

The reason: the core loop depends on auth/authz + setup gates first, then payment readiness, then create/invite/accept/confirm/resolve, then dashboard/detail/admin visibility. The handoff/backlog similarly prioritizes auth/authz, Vouch lifecycle, Stripe Connect architecture, UI surfaces, and validation gates.

## Clerk webhook subscription decision

For **Vouch MVP**, subscribe the Clerk endpoint only to the user lifecycle events required to keep the local `User` / readiness base records synced:

| Clerk event                                  |              Apply? | Why                                                                                                                                                                                                                                                                 |
| -------------------------------------------- | ------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `user.created`                               |  **Yes — required** | Creates/upserts local `User`, creates default `VerificationProfile`, writes audit event. Clerk’s own sync guide identifies this as the event for initial local DB insertion. ([Clerk][1])                                                                           |
| `user.updated`                               |  **Yes — required** | Syncs email/name/phone/status-safe profile fields when changed in Clerk. Clerk recommends syncing only what you need. ([Clerk][1])                                                                                                                                  |
| `user.deleted`                               |  **Yes — required** | Do **not** hard-delete if the user has Vouch history. Soft-disable/anonymize where appropriate so audit, payment, and participant records remain internally consistent. Clerk describes this event as the hook for deleting or flagging users locally. ([Clerk][1]) |
| `session.created` / session lifecycle events | **No for MVP core** | Webhooks are asynchronous and should not be relied on for synchronous onboarding/access flows. Use Clerk server session helpers inside app code for auth state. If later needed, add session events only for analytics/audit telemetry. ([Clerk][2])                |
| `organization.*` / membership events         |              **No** | Vouch does not use Clerk organizations or marketplace/team membership semantics.                                                                                                                                                                                    |
| Clerk Billing events                         |              **No** | Vouch payment coordination is Stripe/Connect-backed, not Clerk Billing. Clerk Billing webhook docs also mark Billing as beta/experimental. ([Clerk][3])                                                                                                             |
| Email/SMS/password events                    |      **No for MVP** | Use `user.updated` for safe user profile sync. Do not build verification/payment readiness off auth-factor events.                                                                                                                                                  |

**Configured endpoint:**

```txt
POST /api/webhooks/clerk
```

**Required Clerk Dashboard subscriptions:**

```txt
user.created
user.updated
user.deleted
```

Clerk webhooks use Svix, include event payloads with `data`, `object`, `type`, `timestamp`, and `instance_id`, and must be signature-verified before processing. ([Clerk][2]) The route must be public because incoming webhook requests do not contain user auth, but the handler must verify the webhook signature with Clerk’s webhook tooling before trusting the payload. ([Clerk][1])

---

# Required `@/lib/db/transactions`

These are **database mutation primitives**, not server actions. Server actions/webhook handlers call them after auth/signature verification, Zod parsing, and authorization.

Use this convention:

```ts
type Tx = Prisma.TransactionClient
```

Recommended structure:

```txt
@/lib/db/transactions/
  authTransactions.ts
  userTransactions.ts
  setupTransactions.ts
  verificationTransactions.ts
  paymentTransactions.ts
  vouchTransactions.ts
  invitationTransactions.ts
  confirmationTransactions.ts
  auditTransactions.ts
  notificationTransactions.ts
  adminTransactions.ts
  analyticsTransactions.ts
  systemTransactions.ts
```

The source architecture requires actions to authenticate, authorize, validate, execute transactions/provider operations, audit, revalidate, and return typed results; fetchers must return transport-safe read models rather than raw Prisma objects. The auth instructions make the server authoritative for current user, account status, participant role, admin capability, verification readiness, payment readiness, payout readiness, and terms acceptance.

---

## 1. `@/lib/db/transactions/authTransactions.ts`

```ts
export async function upsertUserFromClerkTx(tx, input)
export async function createDefaultVerificationProfileTx(tx, input)
export async function syncUserEmailFromClerkTx(tx, input)
export async function syncUserPhoneFromClerkTx(tx, input)
export async function syncUserDisplayNameFromClerkTx(tx, input)
export async function softDisableUserFromClerkDeletedTx(tx, input)
export async function ensureUserSetupRecordsTx(tx, input)
export async function recordClerkWebhookProcessedTx(tx, input)
export async function recordClerkWebhookIgnoredTx(tx, input)
export async function recordClerkWebhookFailedTx(tx, input)
```

### Important schema note

The existing source requires Clerk webhook processing to be signed, idempotent, upsert the local user, create default verification profile, write audit, and avoid storing the full Clerk payload. To make that actually enforceable, you need an idempotency ledger.

Best implementation options:

```txt
Option A — preferred:
  Add AuthWebhookEvent / ProviderWebhookEvent through contract update.

Option B — minimum viable:
  Store Clerk svix-id in AuditEvent.request_id and enforce uniqueness if schema allows it.

Option C — weak:
  Application-level dedupe only. Not recommended.
```

Do **not** store the full Clerk payload. The database rules prohibit full Clerk payload storage and require storing only provider IDs/statuses/timestamps/safe metadata.

---

## 2. `@/lib/db/transactions/userTransactions.ts`

```ts
export async function createUserTx(tx, input)
export async function updateUserPrivateAccountInfoTx(tx, input)
export async function updateUserStatusTx(tx, input)
export async function disableUserTx(tx, input)
export async function reactivateUserTx(tx, input)
export async function updateLastSignedInAtTx(tx, input)
```

Use only private account fields:

```txt
email
phone
displayName
status
clerkUserId
```

No public profile fields, portfolio, services, categories, ratings, reviews, badges, or reputation.

---

## 3. `@/lib/db/transactions/setupTransactions.ts`

```ts
export async function acceptTermsTx(tx, input)
export async function ensureTermsAcceptanceTx(tx, input)
export async function updateSetupGateSnapshotTx(tx, input)
export async function markSetupBlockedTx(tx, input)
export async function markSetupReturnedFromInviteTx(tx, input)
export async function markSetupReturnedFromCreateTx(tx, input)
```

Most setup state should be computed from canonical records, not persisted as duplicate truth. Persist only durable facts:

```txt
TermsAcceptance
VerificationProfile statuses
PaymentCustomer readiness
ConnectedAccount readiness
User.status
```

---

## 4. `@/lib/db/transactions/verificationTransactions.ts`

```ts
export async function createVerificationProfileTx(tx, input)
export async function updateIdentityVerificationStatusTx(tx, input)
export async function updateAdultVerificationStatusTx(tx, input)
export async function updateVerificationProviderReferenceTx(tx, input)
export async function markVerificationPendingTx(tx, input)
export async function markVerificationVerifiedTx(tx, input)
export async function markVerificationRejectedTx(tx, input)
export async function markVerificationRequiresActionTx(tx, input)
export async function markVerificationExpiredTx(tx, input)
```

Verification provider payloads should be reduced to references/statuses/failure codes only.

---

## 5. `@/lib/db/transactions/paymentTransactions.ts`

```ts
export async function upsertPaymentCustomerTx(tx, input)
export async function updatePaymentReadinessTx(tx, input)

export async function upsertConnectedAccountTx(tx, input)
export async function updateConnectedAccountReadinessTx(tx, input)
export async function updateConnectedAccountCapabilitiesTx(tx, input)

export async function createPaymentRecordTx(tx, input)
export async function updatePaymentRecordStatusTx(tx, input)
export async function markPaymentAuthorizedTx(tx, input)
export async function markPaymentCapturedTx(tx, input)
export async function markPaymentReleasePendingTx(tx, input)
export async function markPaymentReleasedTx(tx, input)
export async function markPaymentRefundPendingTx(tx, input)
export async function markPaymentRefundedTx(tx, input)
export async function markPaymentVoidedTx(tx, input)
export async function markPaymentFailedTx(tx, input)

export async function createRefundRecordTx(tx, input)
export async function updateRefundRecordStatusTx(tx, input)
export async function markRefundSucceededTx(tx, input)
export async function markRefundFailedTx(tx, input)

export async function recordPaymentWebhookEventTx(tx, input)
export async function markPaymentWebhookProcessedTx(tx, input)
export async function markPaymentWebhookIgnoredTx(tx, input)
export async function markPaymentWebhookFailedTx(tx, input)
```

The persistence contract requires `PaymentWebhookEvent` to support unique provider event IDs, processed flags, received/processed timestamps, and processing errors for idempotency.

---

## 6. `@/lib/db/transactions/vouchTransactions.ts`

```ts
export async function createVouchTx(tx, input)
export async function updateVouchStatusTx(tx, input)
export async function bindPayeeToVouchTx(tx, input)
export async function cancelPendingVouchTx(tx, input)
export async function markVouchActiveTx(tx, input)
export async function markVouchCompletedTx(tx, input)
export async function markVouchExpiredTx(tx, input)
export async function markVouchRefundedTx(tx, input)
export async function markVouchCanceledTx(tx, input)
export async function markVouchFailedTx(tx, input)

export async function completeVouchWithPaymentReleaseTx(tx, input)
export async function expireVouchWithRefundTx(tx, input)
export async function markResolutionFailureTx(tx, input)
```

The Vouch constraints require payer immutability, nullable payee until acceptance, no payer/payee equality, default pending status, confirmation opening before expiration, and lifecycle timestamps for final states.

---

## 7. `@/lib/db/transactions/invitationTransactions.ts`

```ts
export async function createInvitationTx(tx, input)
export async function markInvitationSentTx(tx, input)
export async function markInvitationOpenedTx(tx, input)
export async function markInvitationAcceptedTx(tx, input)
export async function markInvitationDeclinedTx(tx, input)
export async function markInvitationExpiredTx(tx, input)
export async function invalidateInvitationTx(tx, input)
export async function rotateInvitationTokenHashTx(tx, input)
```

Invitation constraints require one invitation per Vouch, unique token hash, no plaintext token storage, expiration timestamp, and opened/accepted/declined timestamps.

---

## 8. `@/lib/db/transactions/confirmationTransactions.ts`

```ts
export async function createPresenceConfirmationTx(tx, input)
export async function assertNoDuplicateConfirmationTx(tx, input)
export async function getAggregateConfirmationStatusTx(tx, input)
export async function markConfirmationWindowOpenedTx(tx, input)
```

Presence confirmation constraints require one confirmation per Vouch per participant role and one confirmation per Vouch per user.

---

## 9. `@/lib/db/transactions/auditTransactions.ts`

```ts
export async function writeAuditEventTx(tx, input)
export async function writeUserAuditEventTx(tx, input)
export async function writeAuthProviderAuditEventTx(tx, input)
export async function writeVerificationAuditEventTx(tx, input)
export async function writeVouchAuditEventTx(tx, input)
export async function writePaymentAuditEventTx(tx, input)
export async function writeWebhookAuditEventTx(tx, input)
export async function writeNotificationAuditEventTx(tx, input)
export async function writeAdminAuditEventTx(tx, input)
```

Audit metadata must stay safe: no raw card data, identity documents, full provider payloads, secrets, private messages, detailed meeting purpose, or public service descriptions.

---

## 10. `@/lib/db/transactions/notificationTransactions.ts`

```ts
export async function queueNotificationTx(tx, input)
export async function markNotificationSentTx(tx, input)
export async function markNotificationFailedTx(tx, input)
export async function markNotificationSkippedTx(tx, input)
export async function updateNotificationDeliveryStatusTx(tx, input)
export async function retryNotificationTx(tx, input)
```

Initial notification types:

```txt
invite
accepted
confirmation_window
confirmation_recorded
completed
expired
failed
```

---

## 11. `@/lib/db/transactions/adminTransactions.ts`

```ts
export async function disableUserOperationallyTx(tx, input)
export async function recordAdminViewedUserTx(tx, input)
export async function recordAdminViewedVouchTx(tx, input)
export async function recordAdminViewedPaymentTx(tx, input)

export async function recordAdminSafeRetryStartedTx(tx, input)
export async function recordAdminSafeRetryCompletedTx(tx, input)
export async function recordAdminSafeRetryFailedTx(tx, input)
```

Admin transactions must not mutate human truth:

```txt
no award funds
no force release
no rewrite confirmation
no edit confirmation timestamp
no dispute case
no evidence upload
```

---

## 12. `@/lib/db/transactions/analyticsTransactions.ts`

```ts
export async function recordAnalyticsEventTx(tx, input)
export async function recordMarketingAnalyticsEventTx(tx, input)
export async function recordSetupAnalyticsEventTx(tx, input)
export async function recordVouchLifecycleAnalyticsEventTx(tx, input)
export async function recordPaymentAnalyticsEventTx(tx, input)
export async function recordNotificationAnalyticsEventTx(tx, input)
export async function recordAdminAnalyticsEventTx(tx, input)
```

Only if analytics events are persisted locally. Otherwise these can remain adapter calls outside DB transactions.

---

## 13. `@/lib/db/transactions/systemTransactions.ts`

```ts
export async function recordOperationalErrorTx(tx, input)
export async function recordServerActionFailureTx(tx, input)
export async function recordProviderUnavailableTx(tx, input)
export async function recordMaintenanceBannerTx(tx, input)
```

Use sparingly. Most system states should be rendered from current facts, not persisted.

---

# Required `@/lib/db/selects` for DTO mapping

These are **Prisma select/include projection constants** that feed DTO mappers. They are not DTOs.

Recommended structure:

```txt
@/lib/db/selects/
  user.selects.ts
  auth.selects.ts
  setup.selects.ts
  verification.selects.ts
  payment.selects.ts
  vouch.selects.ts
  invitation.selects.ts
  confirmation.selects.ts
  audit.selects.ts
  notification.selects.ts
  dashboard.selects.ts
  settings.selects.ts
  admin.selects.ts
```

The database instructions explicitly say to centralize reusable query shapes in `lib/db/selects/*` and map Prisma records into DTOs before returning to features. Fetchers should query with minimal selects, map to DTO/read models, apply intentional cache policy, and return only what the consuming feature needs.

---

## 1. `@/lib/db/selects/user.selects.ts`

```ts
export const userIdSelect
export const userAuthLookupSelect
export const userSessionSelect
export const userSafeIdentitySelect
export const userPrivateAccountSelect
export const userAccountStatusSelect
export const userOperationalSnapshotSelect
export const userWithReadinessSelect
export const adminUserListItemSelect
export const adminUserDetailSelect
```

### Fields included

```txt
id
clerkUserId
email
phone
displayName
status
createdAt
updatedAt
verificationProfile minimal readiness fields
paymentCustomer minimal readiness fields
connectedAccount minimal readiness fields
termsAcceptances latest/current version only
```

### Fields excluded

```txt
raw provider payloads
full metadata
secrets
public profile fields
marketplace/reputation fields
```

---

## 2. `@/lib/db/selects/auth.selects.ts`

```ts
export const currentUserAuthSelect
export const activeUserGateSelect
export const adminCapabilitySelect
export const contextualParticipantRoleSelect
export const inviteCandidateAuthSelect
export const authWebhookUserSyncSelect
```

Used by:

```txt
getCurrentUser()
requireUser()
requireActiveUser()
getUserAuthzSnapshot()
getContextualParticipantRole()
getInvitePreservedAuthContext()
```

---

## 3. `@/lib/db/selects/setup.selects.ts`

```ts
export const setupChecklistSelect
export const setupProgressSelect
export const createVouchSetupGateSelect
export const acceptVouchSetupGateSelect
export const confirmPresenceSetupGateSelect
export const accountReadinessSummarySelect
export const termsAcceptanceStatusSelect
```

### Include only gate facts

```txt
User.status
VerificationProfile.identityStatus
VerificationProfile.adultStatus
VerificationProfile.paymentReadiness
VerificationProfile.payoutReadiness
latest TermsAcceptance
PaymentCustomer existence/readiness
ConnectedAccount readiness
```

Setup screens must distinguish what is required now, what is optional later, why each item is required, and which action is blocked.

---

## 4. `@/lib/db/selects/verification.selects.ts`

```ts
export const verificationStatusSelect
export const identityVerificationStateSelect
export const adultVerificationStateSelect
export const verificationStatusCardSelect
export const adminVerificationSummarySelect
```

### Fields

```txt
id
userId
identityStatus
adultStatus
paymentReadiness
payoutReadiness
providerReference redacted/masked only if needed
createdAt
updatedAt
```

---

## 5. `@/lib/db/selects/payment.selects.ts`

```ts
export const paymentCustomerReadinessSelect
export const connectedAccountReadinessSelect
export const paymentSettingsSelect
export const payoutSettingsSelect

export const paymentRecordParticipantSummarySelect
export const refundRecordParticipantSummarySelect
export const paymentStatusCardSelect
export const refundStatusCardSelect

export const adminPaymentListItemSelect
export const adminPaymentDetailSelect
export const paymentWebhookEventListItemSelect
export const paymentWebhookEventDetailSelect
```

### Participant-safe payment fields

```txt
amountCents
currency
platformFeeCents
status
createdAt
updatedAt
safe failure code if needed
```

### Admin-only payment fields

```txt
provider
redacted provider payment id
redacted charge id
redacted transfer id
redacted refund id
status
lastErrorCode
safe lastErrorMessage
timestamps
```

No raw Stripe payloads, raw card data, or full provider records.

---

## 6. `@/lib/db/selects/vouch.selects.ts`

```ts
export const vouchIdSelect
export const vouchCardSelect
export const vouchListItemSelect
export const payerVouchListItemSelect
export const payeeVouchListItemSelect

export const vouchDetailBaseSelect
export const vouchDetailForParticipantSelect
export const vouchDetailPendingPayerSelect
export const vouchDetailPendingInviteSentSelect
export const vouchDetailActiveBeforeWindowSelect
export const vouchDetailActiveWindowOpenSelect
export const vouchDetailCompletedSelect
export const vouchDetailExpiredSelect
export const vouchDetailRefundedSelect
export const vouchDetailFailedSelect

export const vouchConfirmationStateSelect
export const vouchWindowSummarySelect
export const vouchPaymentSummarySelect
export const vouchTimelineSelect
export const whatHappensNextSelect

export const adminVouchListItemSelect
export const adminVouchDetailSelect
export const adminVouchFailureStateSelect
```

### Base fields

```txt
id
publicId
payerId
payeeId
amountCents
currency
platformFeeCents
status
label
meetingStartsAt
confirmationOpensAt
confirmationExpiresAt
acceptedAt
completedAt
expiredAt
canceledAt
failedAt
createdAt
updatedAt
```

### Nested participant-safe relations

```txt
payer: userSafeIdentitySelect
payee: userSafeIdentitySelect
invitation: invitationSummarySelect
presenceConfirmations: confirmationParticipantSummarySelect
paymentRecord: paymentRecordParticipantSummarySelect
refundRecord: refundRecordParticipantSummarySelect
auditEvents: participantSafeAuditTimelineItemSelect
```

Vouch detail is the critical screen because it must expose status, amount, required action, deadline, missing confirmation, and final outcome clearly.

---

## 7. `@/lib/db/selects/invitation.selects.ts`

```ts
export const invitationTokenLookupSelect
export const invitationSummarySelect
export const invitationStatusSelect
export const invitedVouchSummarySelect
export const adminInvitationSelect
```

### Token lookup requirements

```txt
id
vouchId
tokenHash
recipientEmail
status
expiresAt
openedAt
acceptedAt
declinedAt
createdAt
updatedAt
vouch minimal pending summary
```

Never select or store plaintext invite tokens.

---

## 8. `@/lib/db/selects/confirmation.selects.ts`

```ts
export const confirmationParticipantSummarySelect
export const confirmationStatusSelect
export const aggregateConfirmationSelect
export const confirmPresenceEligibilitySelect
export const adminConfirmationSelect
```

### Fields

```txt
id
vouchId
userId
participantRole
status
method
confirmedAt
createdAt
user safe identity where needed
```

---

## 9. `@/lib/db/selects/audit.selects.ts`

```ts
export const participantSafeAuditTimelineItemSelect
export const participantSafeAuditTimelineSelect
export const adminAuditListItemSelect
export const adminAuditEventDetailSelect
export const vouchAuditSummarySelect
export const paymentAuditSummarySelect
export const userAuditSummarySelect
```

### Participant-safe fields

```txt
eventName
actorType
entityType
entityId
createdAt
participantSafe
safe metadata only
```

### Admin fields

```txt
eventName
actorType
actorUserId
entityType
entityId
requestId
createdAt
safe metadata
```

Do not select unsafe metadata into user-facing timelines.

---

## 10. `@/lib/db/selects/notification.selects.ts`

```ts
export const notificationEventListItemSelect
export const notificationEventDetailSelect
export const notificationDeliveryStateSelect
export const vouchNotificationEventsSelect
export const adminNotificationEventSelect
```

### Fields

```txt
id
recipientUserId
vouchId
type
channel
status
providerMessageId redacted if needed
failureCode
createdAt
sentAt
failedAt
```

---

## 11. `@/lib/db/selects/dashboard.selects.ts`

```ts
export const dashboardSummarySelect
export const actionRequiredVouchSelect
export const activeVouchSelect
export const pendingVouchSelect
export const completedVouchSelect
export const expiredRefundedVouchSelect
export const payerDashboardSummarySelect
export const payeeDashboardSummarySelect
```

These can reuse `vouchCardSelect` / `vouchListItemSelect` internally.

Dashboard states include empty, action-required, active, mixed, payer-focused, payee-focused, loading, error, and filtered list states.

---

## 12. `@/lib/db/selects/settings.selects.ts`

```ts
export const accountSettingsSelect
export const profileBasicsSelect
export const privateAccountInfoSelect
export const accountStatusCardSelect
export const verificationStatusCardSelect
export const paymentReadinessCardSelect
export const payoutReadinessCardSelect
export const termsStatusCardSelect
```

Settings page states include account overview, profile/private account info, verification status, payment readiness, payout readiness, terms/legal status, disabled state, loading, and error.

---

## 13. `@/lib/db/selects/admin.selects.ts`

```ts
export const adminDashboardSummarySelect
export const adminFailureHeavySummarySelect

export const adminVouchListSelect
export const adminVouchDetailSelect
export const adminVouchPaymentFailureSelect

export const adminUserListSelect
export const adminUserDetailSelect

export const adminPaymentListSelect
export const adminPaymentDetailSelect

export const adminWebhookEventListSelect
export const adminWebhookEventDetailSelect

export const adminAuditLogSelect
export const adminAuditEventDetailSelect
```

Admin surfaces must stay operational-only: dashboard, failure-heavy state, Vouch list/detail, users, payments, webhooks, audit, and safe retry confirmation/results.

---

# Required Prisma indexes supporting these selects

Based on the source database instructions, add indexes for:

```txt
Vouch.payerId
Vouch.payeeId
Vouch.status
Vouch.confirmationExpiresAt
Invitation.tokenHash
PaymentRecord.providerPaymentId
PaymentWebhookEvent.providerEventId
AuditEvent.entityType + entityId
NotificationEvent.recipientUserId
NotificationEvent.vouchId
```

The source also explicitly calls out participant dashboard query indexes. I would implement these composite indexes too:

```txt
@@index([payerId, status, confirmationExpiresAt])
@@index([payeeId, status, confirmationExpiresAt])
@@index([payerId, createdAt])
@@index([payeeId, createdAt])
@@index([status, confirmationExpiresAt])
@@index([entityType, entityId, createdAt]) // AuditEvent
@@index([vouchId, status])                 // NotificationEvent
```

---

# Stop-condition before coding

Before generating actual transaction code, resolve this schema decision:

```txt
Do we add AuthWebhookEvent / ProviderWebhookEvent?
```

My recommendation: **yes**, add a generic provider webhook ledger:

```txt
ProviderWebhookEvent
  id
  provider        // clerk | stripe
  providerEventId // svix-id for Clerk, event.id for Stripe
  eventType
  processed
  receivedAt
  processedAt
  processingError
```

That avoids making `PaymentWebhookEvent` carry auth-provider concerns and gives Clerk/Stripe the same idempotency pattern. Without this, `user.created`, `user.updated`, and `user.deleted` cannot be made strongly idempotent at the database layer.

[1]: https://clerk.com/docs/users/sync-data-to-your-backend?utm_source=chatgpt.com "Sync Clerk data to your app with webhooks - Webhooks | Clerk Docs"
[2]: https://clerk.com/docs/guides/development/webhooks/overview?utm_source=chatgpt.com "Webhooks overview | Clerk Docs"
[3]: https://clerk.com/docs/js-frontend/billing/events-webhooks?utm_source=chatgpt.com "Clerk billing webhooks"

## Scope Guard

This pass includes **domain types/interfaces** and **Zod validation/sanitization schemas only**.

Excluded on purpose:

```txt
DTOs
Read models
Prisma model mirrors
Transaction types
Repository/query result shapes
Payment provider payload shapes
```

Use `z.infer<typeof SomeSchema>` for mutation/query input types wherever possible. Do **not** hand-write duplicate input interfaces unless a type is not directly schema-derived.

The source model normalizes Vouch around canonical entities, actors, actions, states, permissions, events, outcomes, and constraints, so the type/schema layer should preserve that vocabulary rather than invent new terms. The required UI/page states cover auth, setup, payment/payout, dashboard, create, accept, detail, confirmation, admin, and shared system states.

---

# Directory Shape

```txt
types/
  common.ts
  marketing.ts
  auth.ts
  user.ts
  setup.ts
  verification.ts
  payment.ts
  vouch.ts
  dashboard.ts
  settings.ts
  admin.ts
  audit.ts
  notification.ts
  analytics.ts
  system.ts

schema/
  common.ts
  marketing.ts
  auth.ts
  user.ts
  setup.ts
  verification.ts
  payment.ts
  vouch.ts
  dashboard.ts
  settings.ts
  admin.ts
  audit.ts
  notification.ts
  analytics.ts
  system.ts
```

---

# 1. `/types/common.ts`

Core transport-safe primitives and reusable discriminants. These are not DTOs; they are base primitives used by other domain types.

```ts
export type ID = string
export type PublicID = string
export type UserID = string
export type VouchID = string
export type InvitationToken = string
export type ISODateTime = string
export type CurrencyCode = "usd"
export type MoneyCents = number
export type PercentageBasisPoints = number

export type Environment = "development" | "preview" | "production"
export type SortDirection = "asc" | "desc"
export type AsyncStatus = "idle" | "pending" | "success" | "error"
export type PageMode =
    | "default"
    | "loading"
    | "error"
    | "empty"
    | "blocked"
    | "success"
export type DeviceVariant = "desktop" | "mobile"

export type ActionResult<T> =
    | { ok: true; data: T }
    | {
          ok: false
          code?: string
          formError?: string
          fieldErrors?: Record<string, string[]>
      }

export interface PaginationInput {
    page?: number
    pageSize?: number
}

export interface PaginationState {
    page: number
    pageSize: number
    totalItems?: number
    totalPages?: number
}

export interface DateRangeInput {
    from?: ISODateTime
    to?: ISODateTime
}

export interface SelectOption<TValue extends string = string> {
    value: TValue
    label: string
    disabled?: boolean
}

export interface FieldErrorState {
    field: string
    message: string
}

export interface ServerErrorState {
    code: string
    title: string
    message: string
    retryable: boolean
}
```

## `/schema/common.ts`

```ts
export const idSchema
export const publicIdSchema
export const userIdSchema
export const vouchIdSchema
export const invitationTokenSchema
export const isoDateTimeSchema
export const currencyCodeSchema
export const moneyCentsSchema
export const positiveMoneyCentsSchema
export const percentageBasisPointsSchema

export const paginationInputSchema
export const dateRangeInputSchema
export const internalReturnToPathSchema
export const emailSchema
export const optionalEmailSchema
export const trimmedStringSchema
export const optionalTrimmedStringSchema
export const shortLabelSchema
export const privateNoteSchema
export const safeSearchParamSchema
```

## Required sanitizers

```ts
export function emptyStringToUndefined(value: unknown): unknown
export function trimString(value: unknown): unknown
export function normalizeEmail(value: unknown): unknown
export function normalizeCurrency(value: unknown): unknown
export function sanitizeInternalPath(value: unknown): string | undefined
export function coercePositiveInt(value: unknown): unknown
export function coerceMoneyCents(value: unknown): unknown
```

---

# 2. `/types/marketing.ts`

```ts
export type MarketingPageID =
    | "home"
    | "how_it_works"
    | "pricing"
    | "faq"
    | "terms"
    | "privacy"

export type MarketingCtaID =
    | "create_vouch"
    | "how_it_works"
    | "sign_in"
    | "get_started"
    | "learn_principles"

export type LegalPageID = "terms" | "privacy"

export interface PublicNavigationItem {
    label: string
    href: string
    external?: boolean
}

export interface MarketingEventInput {
    pageId: MarketingPageID
    path: string
    referrerDomain?: string
}

export interface MarketingCtaEventInput {
    ctaId: MarketingCtaID
    pageId: MarketingPageID
    destination?: string
}
```

## `/schema/marketing.ts`

```ts
export const marketingPageIdSchema
export const marketingCtaIdSchema
export const legalPageIdSchema

export const marketingPageViewedSchema
export const marketingCtaClickedSchema
export const publicNavigationItemSchema
```

## Sanitization

```ts
export const sanitizedMarketingPathSchema
export const sanitizedReferrerDomainSchema
```

Keep analytics minimal: page views and CTA clicks only. No provider discovery, search, profiles, categories, reviews, or marketplace behavior.

---

# 3. `/types/auth.ts`

```ts
export type BaseRole =
    | "anonymous"
    | "authenticated_user"
    | "admin"
    | "system"
    | "payment_provider"
    | "auth_provider"
    | "verification_provider"

export type ContextualRole = "payer" | "payee" | "invited_payee_candidate"

export type AuthEntryContext =
    | "landing"
    | "invite"
    | "create_vouch"
    | "dashboard"
    | "unknown"

export type AuthPageVariant =
    | "sign_in"
    | "sign_in_error"
    | "sign_up"
    | "sign_up_from_invite"
    | "sign_up_from_create_vouch"
    | "verification_pending"
    | "callback_loading"
    | "auth_error"
    | "signed_out_redirect"

export interface AuthRedirectContext {
    entryContext: AuthEntryContext
    returnTo?: string
    inviteToken?: string
}

export interface SessionUser {
    id: UserID
    clerkUserId: string
    email?: string
    displayName?: string
    status: UserStatus
    baseRole: BaseRole
}

export interface AuthzSnapshot {
    userId: UserID
    baseRole: BaseRole
    contextualRoles: ContextualRole[]
    isAdmin: boolean
    isActive: boolean
}

export interface ClerkUserSyncInput {
    clerkUserId: string
    email?: string
    displayName?: string
}
```

## `/schema/auth.ts`

```ts
export const baseRoleSchema
export const contextualRoleSchema
export const authEntryContextSchema
export const authPageVariantSchema

export const authRedirectContextSchema
export const signInSearchParamsSchema
export const signUpSearchParamsSchema
export const authCallbackSearchParamsSchema
export const signedOutRedirectSearchParamsSchema

export const clerkUserSyncSchema
export const clerkWebhookHeadersSchema
export const clerkWebhookEventEnvelopeSchema
```

## Sanitization

```ts
export const sanitizedReturnToSchema
export const sanitizedInviteTokenFromSearchParamsSchema
```

The auth layer must support Clerk-backed user sync, server-side authz, participant role resolution, and setup gate enforcement. The server-first decision explicitly puts auth, payment, authorization, confirmation, and lifecycle state under server authority.

---

# 4. `/types/user.ts`

```ts
export type UserStatus = "active" | "disabled"

export interface UserSafeIdentity {
    userId: UserID
    displayName?: string
    email?: string
}

export interface PrivateAccountInfo {
    userId: UserID
    email?: string
    phone?: string
    displayName?: string
    status: UserStatus
}

export interface ProfileBasicsInput {
    displayName?: string
    phone?: string
}

export interface UserStatusChangeInput {
    userId: UserID
    reason?: string
}

export type AccountPageVariant =
    | "overview"
    | "private_info"
    | "disabled"
    | "loading"
    | "error"
```

## `/schema/user.ts`

```ts
export const userStatusSchema
export const profileBasicsInputSchema
export const userStatusChangeInputSchema
export const userSafeIdentitySchema
export const privateAccountInfoSchema
```

## Sanitization

```ts
export const displayNameSchema
export const optionalPhoneSchema
```

Do not create public profile types. The page inventory explicitly forbids public profiles, ratings, search/discovery, messaging, reviews, and provider directories.

---

# 5. `/types/setup.ts`

```ts
export type SetupRequirement =
    | "account_active"
    | "identity_verified"
    | "adult_verified"
    | "payment_ready"
    | "payout_ready"
    | "terms_accepted"

export type SetupRequirementStatus =
    | "complete"
    | "pending"
    | "requires_action"
    | "blocked"
    | "not_started"
    | "failed"

export type SetupActionContext =
    | "create_vouch"
    | "accept_vouch"
    | "confirm_presence"
    | "settings"
    | "dashboard"

export interface SetupChecklistItemState {
    requirement: SetupRequirement
    status: SetupRequirementStatus
    title: string
    description: string
    actionLabel?: string
    blockedReason?: string
}

export interface SetupGateResult {
    allowed: boolean
    actionContext: SetupActionContext
    missingRequirements: SetupRequirement[]
    blockedRequirements: SetupRequirement[]
}

export interface AcceptTermsInput {
    termsVersion: string
    returnTo?: string
}
```

## `/schema/setup.ts`

```ts
export const setupRequirementSchema
export const setupRequirementStatusSchema
export const setupActionContextSchema

export const setupGateInputSchema
export const setupReturnContextSchema
export const acceptTermsInputSchema
export const setupChecklistSearchParamsSchema
```

## Sanitization

```ts
export const sanitizedTermsVersionSchema
export const sanitizedSetupReturnToSchema
```

Setup must support incomplete, complete, blocked-by-verification, blocked-by-payment-method, blocked-by-payout, terms acceptance, return-from-invite, and return-from-create states.

---

# 6. `/types/verification.ts`

```ts
export type VerificationStatus =
    | "unstarted"
    | "pending"
    | "verified"
    | "rejected"
    | "requires_action"
    | "expired"

export type VerificationKind = "identity" | "adult"

export interface VerificationStartInput {
    kind: VerificationKind
    returnTo?: string
}

export interface VerificationProviderReturnInput {
    provider: "stripe_identity"
    sessionId?: string
    returnTo?: string
}

export interface VerificationStatusUpdateInput {
    userId: UserID
    identityStatus?: VerificationStatus
    adultStatus?: VerificationStatus
    providerReference?: string
    failureCode?: string
}

export type VerificationPageVariant =
    | "start"
    | "pending"
    | "success"
    | "rejected"
    | "requires_action"
    | "failed"
```

## `/schema/verification.ts`

```ts
export const verificationStatusSchema
export const verificationKindSchema

export const verificationStartInputSchema
export const verificationProviderReturnInputSchema
export const verificationStatusUpdateInputSchema
export const verificationPageVariantSchema
```

## Sanitization

```ts
export const sanitizedVerificationProviderReferenceSchema
export const sanitizedVerificationFailureCodeSchema
```

Verification states are canonical and must align with `unstarted`, `pending`, `verified`, `rejected`, `requires_action`, and `expired`.

---

# 7. `/types/payment.ts`

```ts
export type PaymentProvider = "stripe"
export type VerificationProvider = "stripe_identity"

export type PaymentReadinessStatus =
    | "not_started"
    | "requires_action"
    | "ready"
    | "failed"

export type PayoutReadinessStatus =
    | "not_started"
    | "requires_action"
    | "ready"
    | "restricted"
    | "failed"

export type PaymentStatus =
    | "not_started"
    | "requires_payment_method"
    | "authorized"
    | "captured"
    | "release_pending"
    | "released"
    | "refund_pending"
    | "refunded"
    | "voided"
    | "failed"

export type RefundStatus = "not_required" | "pending" | "succeeded" | "failed"

export type RefundReason =
    | "not_accepted"
    | "confirmation_incomplete"
    | "canceled_before_acceptance"
    | "payment_failure"
    | "provider_required"

export interface StartPaymentMethodSetupInput {
    returnTo?: string
}

export interface StartPayoutOnboardingInput {
    returnTo?: string
}

export interface PaymentProviderReturnInput {
    provider: PaymentProvider
    setupSessionId?: string
    returnTo?: string
}

export interface PaymentOperationInput {
    vouchId: VouchID
    idempotencyKey?: string
}

export interface PaymentFailureInput {
    vouchId?: VouchID
    paymentRecordId?: ID
    failureStage: PaymentFailureStage
    failureCode?: string
    safeMessage?: string
}

export type PaymentFailureStage =
    | "create"
    | "accept"
    | "confirm"
    | "release"
    | "refund"
    | "webhook"
    | "unknown"
```

## `/schema/payment.ts`

```ts
export const paymentProviderSchema
export const paymentReadinessStatusSchema
export const payoutReadinessStatusSchema
export const paymentStatusSchema
export const refundStatusSchema
export const refundReasonSchema
export const paymentFailureStageSchema

export const startPaymentMethodSetupInputSchema
export const startPayoutOnboardingInputSchema
export const paymentProviderReturnInputSchema

export const paymentOperationInputSchema
export const initializeVouchPaymentInputSchema
export const authorizeVouchPaymentInputSchema
export const captureOrReleaseVouchPaymentInputSchema
export const refundOrVoidVouchPaymentInputSchema

export const paymentFailureInputSchema
export const stripeWebhookHeadersSchema
export const paymentWebhookEnvelopeSchema
export const paymentWebhookProcessInputSchema
```

## Sanitization

```ts
export const sanitizedProviderReferenceSchema
export const sanitizedPaymentFailureCodeSchema
export const sanitizedSafePaymentMessageSchema
export const idempotencyKeySchema
```

Do not model raw Stripe payloads as app types. Store provider references/statuses only. The source constraints prohibit direct custody and require payment state to reference provider infrastructure.

---

# 8. `/types/vouch.ts`

This is the central type file. Keep it to domain enums, input shapes, state discriminants, and validation-related helper types. Do **not** put Vouch detail DTOs here yet.

```ts
export type VouchStatus =
    | "pending"
    | "active"
    | "completed"
    | "expired"
    | "refunded"
    | "canceled"
    | "failed"

export type InvitationStatus =
    | "created"
    | "sent"
    | "opened"
    | "accepted"
    | "declined"
    | "expired"
    | "invalidated"

export type ParticipantRole = "payer" | "payee"

export type ConfirmationStatus =
    | "not_confirmed"
    | "confirmed"
    | "ineligible"
    | "window_not_open"
    | "window_closed"

export type AggregateConfirmationStatus =
    | "none_confirmed"
    | "payer_confirmed"
    | "payee_confirmed"
    | "both_confirmed"

export type ConfirmationMethod = "manual" | "gps" | "system"

export type RecipientMethod = "email" | "share_link"

export interface CreateVouchInput {
    amountCents: MoneyCents
    currency: CurrencyCode
    meetingStartsAt: ISODateTime
    confirmationOpensAt: ISODateTime
    confirmationExpiresAt: ISODateTime
    recipientMethod: RecipientMethod
    recipientEmail?: string
    label?: string
    privateNote?: string
    acceptedTerms: boolean
}

export interface CreateVouchDraftInput extends Partial<CreateVouchInput> {}

export interface FeePreviewInput {
    amountCents: MoneyCents
    currency: CurrencyCode
}

export interface SendVouchInvitationInput {
    vouchId: VouchID
    recipientEmail: string
}

export interface ResendVouchInvitationInput {
    vouchId: VouchID
}

export interface InviteTokenInput {
    token: InvitationToken
}

export interface AcceptVouchInput {
    token: InvitationToken
    acceptedTerms: boolean
}

export interface DeclineVouchInput {
    token: InvitationToken
    reason?: string
}

export interface CancelPendingVouchInput {
    vouchId: VouchID
    reason?: string
}

export interface ConfirmPresenceInput {
    vouchId: VouchID
    participantRole: ParticipantRole
    method: ConfirmationMethod
}

export interface VouchListQuery {
    status?: VouchListStatusFilter
    page?: number
    sort?: VouchListSort
}

export type VouchListStatusFilter =
    | "pending"
    | "active"
    | "completed"
    | "expired"
    | "refunded"
    | "action_required"
    | "all"

export type VouchListSort = "newest" | "oldest" | "deadline"

export type VouchDetailVariant =
    | "pending_payer"
    | "pending_invite_sent"
    | "active_before_window"
    | "active_window_open"
    | "payer_confirmed_waiting_for_payee"
    | "payee_confirmed_waiting_for_payer"
    | "both_confirmed_processing_release"
    | "completed"
    | "expired"
    | "refunded"
    | "failed_payment"
    | "failed_release"
    | "failed_refund"
    | "unauthorized_or_not_found"
    | "loading"

export type ConfirmPresenceVariant =
    | "payer"
    | "payee"
    | "before_window"
    | "window_open"
    | "already_confirmed"
    | "waiting_for_other_party"
    | "both_confirmed_success"
    | "window_closed"
    | "duplicate_confirmation_error"
    | "unauthorized_participant"
    | "provider_payment_failure"
```

## `/schema/vouch.ts`

```ts
export const vouchStatusSchema
export const invitationStatusSchema
export const participantRoleSchema
export const confirmationStatusSchema
export const aggregateConfirmationStatusSchema
export const confirmationMethodSchema
export const recipientMethodSchema

export const createVouchInputSchema
export const createVouchDraftInputSchema
export const feePreviewInputSchema

export const sendVouchInvitationInputSchema
export const resendVouchInvitationInputSchema
export const inviteTokenInputSchema
export const acceptVouchInputSchema
export const declineVouchInputSchema
export const cancelPendingVouchInputSchema
export const confirmPresenceInputSchema

export const vouchIdParamSchema
export const inviteTokenParamSchema
export const vouchListQuerySchema
export const vouchDetailVariantSchema
export const confirmPresenceVariantSchema
```

## Required refinements

```ts
createVouchInputSchema.superRefine(...)
```

Must enforce:

```txt
amountCents >= platform minimum
currency === 'usd'
confirmationOpensAt < confirmationExpiresAt
meetingStartsAt <= confirmationOpensAt, unless policy changes
recipientEmail required when recipientMethod === 'email'
recipientEmail omitted/ignored when recipientMethod === 'share_link'
label max 120 chars
privateNote not public and not used as a searchable purpose field
acceptedTerms === true
```

## Sanitization

```ts
export const sanitizedVouchLabelSchema
export const sanitizedPrivateNoteSchema
export const sanitizedInviteTokenSchema
export const sanitizedDeclineReasonSchema
```

Vouch canonical states, invitation states, confirmation states, aggregate confirmation states, and payment states are all explicitly normalized in the source material. Vouch detail is the critical screen because the user must understand status, amount, action, deadline, missing confirmation, and final outcome without ambiguity.

---

# 9. `/types/dashboard.ts`

```ts
export type DashboardSectionID =
    | "action_required"
    | "active"
    | "pending"
    | "completed"
    | "expired_refunded"

export type DashboardVariant =
    | "empty"
    | "action_required"
    | "active_vouches"
    | "mixed_vouch_states"
    | "payer_focused"
    | "payee_focused"
    | "loading"
    | "error"

export interface DashboardSearchParams {
    status?: DashboardSectionID | "all"
    page?: number
    sort?: VouchListSort
}

export interface DashboardSectionState {
    id: DashboardSectionID
    title: string
    count: number
    collapsed?: boolean
}
```

## `/schema/dashboard.ts`

```ts
export const dashboardSectionIdSchema
export const dashboardVariantSchema
export const dashboardSearchParamsSchema
export const dashboardSortSchema
```

## Sanitization

```ts
export const sanitizedDashboardStatusParamSchema
export const sanitizedDashboardSortParamSchema
```

Dashboard states and filtered Vouch list states are part of the required page inventory.

---

# 10. `/types/settings.ts`

```ts
export type SettingsPageVariant =
    | "overview"
    | "profile_basics"
    | "verification_status"
    | "payment_readiness"
    | "payout_readiness"
    | "terms_legal_status"
    | "account_disabled"
    | "loading"
    | "error"

export type SettingsSectionID =
    | "profile"
    | "verification"
    | "payment"
    | "payout"
    | "terms"
    | "security"

export interface SettingsSearchParams {
    section?: SettingsSectionID
    returnTo?: string
}

export interface UpdateProfileBasicsInput {
    displayName?: string
    phone?: string
}
```

## `/schema/settings.ts`

```ts
export const settingsPageVariantSchema
export const settingsSectionIdSchema
export const settingsSearchParamsSchema
export const updateProfileBasicsInputSchema
```

## Sanitization

```ts
export const sanitizedSettingsSectionParamSchema
export const sanitizedSettingsReturnToSchema
```

Settings/account pages require profile basics, private account info, verification status, payment readiness, payout readiness, terms/legal status, disabled state, loading state, and error state.

---

# 11. `/types/admin.ts`

```ts
export type AdminRouteSection =
    | "dashboard"
    | "vouches"
    | "users"
    | "payments"
    | "webhooks"
    | "audit"

export type AdminPageVariant =
    | "dashboard"
    | "failure_heavy"
    | "vouch_list"
    | "vouch_detail"
    | "user_list"
    | "user_detail"
    | "payment_list"
    | "payment_detail"
    | "webhook_event_list"
    | "webhook_event_detail"
    | "audit_log"
    | "audit_event_detail"
    | "safe_retry_confirmation"
    | "safe_retry_success"
    | "safe_retry_failure"
    | "unauthorized"

export type AdminSafeRetryOperation =
    | "retry_notification_send"
    | "retry_provider_reconciliation"
    | "retry_webhook_processing"
    | "retry_refund_status_sync"

export interface AdminVouchFilterInput {
    status?: VouchStatus
    paymentStatus?: PaymentStatus
    page?: number
    sort?: "newest" | "oldest" | "deadline" | "failure"
}

export interface AdminUserFilterInput {
    status?: UserStatus
    page?: number
    sort?: "newest" | "oldest"
}

export interface AdminPaymentFilterInput {
    paymentStatus?: PaymentStatus
    refundStatus?: RefundStatus
    page?: number
}

export interface AdminSafeRetryInput {
    operation: AdminSafeRetryOperation
    entityId: ID
    reason?: string
}

export interface AdminDisableUserInput {
    userId: UserID
    reason: string
}
```

## `/schema/admin.ts`

```ts
export const adminRouteSectionSchema
export const adminPageVariantSchema
export const adminSafeRetryOperationSchema

export const adminVouchFilterInputSchema
export const adminUserFilterInputSchema
export const adminPaymentFilterInputSchema
export const adminWebhookFilterInputSchema
export const adminAuditFilterInputSchema

export const adminSafeRetryInputSchema
export const adminDisableUserInputSchema
```

## Sanitization

```ts
export const sanitizedAdminReasonSchema
export const sanitizedAdminSortParamSchema
export const redactedProviderReferenceSchema
```

Admin states must stay operational only: dashboard, failure-heavy, Vouch/user/payment/webhook/audit list/detail, safe retry confirmation/result, and unauthorized/non-admin denied. No dispute cases, evidence upload, manual fund award, or confirmation rewrite screens.

---

# 12. `/types/audit.ts`

```ts
export type AuditActorType =
    | "user"
    | "system"
    | "admin"
    | "payment_provider"
    | "auth_provider"
    | "verification_provider"

export type AuditEntityType =
    | "User"
    | "VerificationProfile"
    | "PaymentCustomer"
    | "ConnectedAccount"
    | "Vouch"
    | "Invitation"
    | "PresenceConfirmation"
    | "PaymentRecord"
    | "RefundRecord"
    | "TermsAcceptance"
    | "NotificationEvent"
    | "PaymentWebhookEvent"

export type AuditEventName =
    | "user.created"
    | "user.signed_in"
    | "user.verification.started"
    | "user.verification.completed"
    | "user.verification.rejected"
    | "user.payment_method.added"
    | "user.connected_account.created"
    | "user.connected_account.ready"
    | "user.terms.accepted"
    | "vouch.created"
    | "vouch.invite.sent"
    | "vouch.invite.opened"
    | "vouch.accepted"
    | "vouch.declined"
    | "vouch.canceled"
    | "vouch.confirmation_window.opened"
    | "vouch.payer_confirmed"
    | "vouch.payee_confirmed"
    | "vouch.completed"
    | "vouch.expired"
    | "vouch.refunded"
    | "vouch.failed"
    | "payment.initialized"
    | "payment.authorized"
    | "payment.captured"
    | "payment.release_requested"
    | "payment.released"
    | "payment.refund_requested"
    | "payment.refunded"
    | "payment.voided"
    | "payment.failed"
    | "payment.webhook_received"
    | "payment.webhook_processed"
    | "payment.webhook_ignored"
    | "payment.reconciliation_failed"
    | "admin.user.viewed"
    | "admin.vouch.viewed"
    | "admin.payment.viewed"
    | "admin.retry.started"
    | "admin.retry.completed"
    | "admin.account.disabled"

export interface WriteAuditEventInput {
    eventName: AuditEventName
    actorType: AuditActorType
    actorUserId?: UserID
    entityType: AuditEntityType
    entityId: ID
    requestId?: string
    participantSafe?: boolean
    metadata?: Record<string, unknown>
}

export interface AuditFilterInput {
    entityType?: AuditEntityType
    entityId?: ID
    actorType?: AuditActorType
    eventName?: AuditEventName
    page?: number
}
```

## `/schema/audit.ts`

```ts
export const auditActorTypeSchema
export const auditEntityTypeSchema
export const auditEventNameSchema

export const writeAuditEventInputSchema
export const auditFilterInputSchema
export const participantSafeAuditFilterSchema
```

## Sanitization

```ts
export const safeAuditMetadataSchema
export const requestIdSchema
```

Audit events should reflect the canonical event set. The source lists user, Vouch, payment, notification, and admin events as canonical events.

---

# 13. `/types/notification.ts`

```ts
export type NotificationChannel = "email"

export type NotificationStatus = "queued" | "sent" | "failed" | "skipped"

export type NotificationType =
    | "invite"
    | "vouch_accepted"
    | "confirmation_window_open"
    | "confirmation_recorded"
    | "vouch_completed"
    | "vouch_expired_refunded"
    | "payment_failed"

export interface QueueNotificationInput {
    type: NotificationType
    channel: NotificationChannel
    recipientUserId?: UserID
    recipientEmail?: string
    vouchId?: VouchID
}

export interface SendQueuedNotificationInput {
    notificationEventId: ID
}

export interface UpdateNotificationDeliveryStatusInput {
    notificationEventId: ID
    status: NotificationStatus
    providerMessageId?: string
    failureCode?: string
}
```

## `/schema/notification.ts`

```ts
export const notificationChannelSchema
export const notificationStatusSchema
export const notificationTypeSchema

export const queueNotificationInputSchema
export const sendQueuedNotificationInputSchema
export const updateNotificationDeliveryStatusInputSchema
export const notificationFilterInputSchema
```

## Sanitization

```ts
export const sanitizedNotificationFailureCodeSchema
export const sanitizedProviderMessageIdSchema
```

The required notification/email states include invite, accepted, confirmation window open, confirmation recorded, completed, expired/refunded, and payment failed.

---

# 14. `/types/analytics.ts`

```ts
export type AnalyticsEventGroup =
    | "acquisition"
    | "setup"
    | "vouch"
    | "payment"
    | "notification"
    | "admin"

export type AnalyticsEventName =
    | "marketing.page_viewed"
    | "marketing.cta_clicked"
    | "auth.sign_up_started"
    | "auth.sign_up_completed"
    | "auth.sign_in_completed"
    | "setup.checklist_viewed"
    | "setup.verification_started"
    | "setup.verification_completed"
    | "setup.verification_failed"
    | "setup.payment_started"
    | "setup.payment_ready"
    | "setup.payout_started"
    | "setup.payout_ready"
    | "setup.terms_accepted"
    | "vouch.create_started"
    | "vouch.create_submitted"
    | "vouch.created"
    | "vouch.invite_copied"
    | "vouch.invite_sent"
    | "vouch.invite_opened"
    | "vouch.accept_started"
    | "vouch.accepted"
    | "vouch.declined"
    | "vouch.canceled"
    | "vouch.confirmation_window_opened"
    | "vouch.confirmation_submitted"
    | "vouch.partially_confirmed"
    | "vouch.completed"
    | "vouch.expired"
    | "vouch.refunded"
    | "vouch.failed"
    | "payment.initialized"
    | "payment.authorized"
    | "payment.release_requested"
    | "payment.released"
    | "payment.refund_requested"
    | "payment.refunded"
    | "payment.failed"
    | "notification.queued"
    | "notification.sent"
    | "notification.failed"
    | "admin.dashboard_viewed"
    | "admin.vouch_viewed"
    | "admin.safe_retry_started"
    | "admin.safe_retry_completed"

export interface TrackAnalyticsEventInput {
    eventName: AnalyticsEventName
    occurredAt?: ISODateTime
    userId?: UserID
    sessionId?: string
    requestId?: string
    properties?: Record<string, unknown>
}
```

## `/schema/analytics.ts`

```ts
export const analyticsEventGroupSchema
export const analyticsEventNameSchema
export const trackAnalyticsEventInputSchema

export const marketingAnalyticsPropertiesSchema
export const setupAnalyticsPropertiesSchema
export const vouchAnalyticsPropertiesSchema
export const paymentAnalyticsPropertiesSchema
export const notificationAnalyticsPropertiesSchema
export const adminAnalyticsPropertiesSchema
```

## Sanitization

```ts
export const privacySafeAnalyticsPropertiesSchema
export const pseudonymousIdSchema
```

Explicitly prohibit raw card data, raw identity documents, detailed meeting purpose, profile/search/review/message/dispute analytics, and full provider payloads.

---

# 15. `/types/system.ts`

```ts
export type SystemPageVariant =
    | "global_loading"
    | "route_loading_skeleton"
    | "global_error"
    | "protected_route_unauthorized"
    | "entity_not_found"
    | "toast_notification"
    | "form_validation_error"
    | "server_action_failure"
    | "payment_provider_unavailable"
    | "maintenance"
    | "degraded_service"

export type ToastIntent = "success" | "info" | "warning" | "error"

export interface ToastState {
    intent: ToastIntent
    title: string
    message?: string
}

export interface ProtectedRouteUnauthorizedInput {
    path: string
    requiredRole?: BaseRole
    requiredCapability?: string
}

export interface EntityNotFoundInput {
    entityType: string
    entityId?: string
}

export interface ServerActionFailureInput {
    actionName: string
    code?: string
    message?: string
    requestId?: string
}
```

## `/schema/system.ts`

```ts
export const systemPageVariantSchema
export const toastIntentSchema
export const toastStateSchema

export const protectedRouteUnauthorizedInputSchema
export const entityNotFoundInputSchema
export const serverActionFailureInputSchema
export const healthcheckSchema
export const revalidateTagInputSchema
```

## Sanitization

```ts
export const sanitizedErrorMessageSchema
export const sanitizedEntityTypeSchema
export const sanitizedActionNameSchema
```

Shared system states include loading shell, route skeleton, global error, unauthorized, not found, toast, form validation error, server action failure, payment provider unavailable, and degraded service banner.

---

# Recommended Build Order

```txt
1. schema/common.ts + types/common.ts
2. types/vouch.ts + schema/vouch.ts
3. types/auth.ts + schema/auth.ts
4. types/setup.ts + schema/setup.ts
5. types/verification.ts + schema/verification.ts
6. types/payment.ts + schema/payment.ts
7. types/user.ts + schema/user.ts
8. types/dashboard.ts + schema/dashboard.ts
9. types/settings.ts + schema/settings.ts
10. types/admin.ts + schema/admin.ts
11. types/audit.ts + schema/audit.ts
12. types/notification.ts + schema/notification.ts
13. types/analytics.ts + schema/analytics.ts
14. types/system.ts + schema/system.ts
15. types/marketing.ts + schema/marketing.ts
```

# Critical Implementation Rule

For action inputs, prefer this pattern:

```ts
// schema/vouch.ts
export const createVouchInputSchema = z.object({ ... })

// types/vouch.ts
export type CreateVouchInput = z.infer<typeof createVouchInputSchema>
```

Do not duplicate Zod-derived input interfaces unless you need a non-schema type such as a union state, discriminant, or frontend-only page variant.

#Requires -Version 7.0

<#
.SYNOPSIS
  Scaffolds Vouch /types and /schemas files.

.DESCRIPTION
  Creates:
  - types/common.ts
  - types/{domain}.ts
  - schemas/common.ts
  - schemas/{domain}.ts
  - index barrel files

  Scope intentionally excludes:
  - DTOs
  - read models
  - Prisma mirrors
  - transaction types
  - repository/query result shapes
  - payment provider payload shapes

.NOTES
  Uses single-quoted here-strings to preserve TypeScript literals.
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

Write-Step "Scaffolding Vouch types and Zod schemas"

$files = [ordered]@{
  "schemas/common.ts" = @'
import { z } from "zod"

export function emptyStringToUndefined(value: unknown): unknown {
  return value === "" ? undefined : value
}

export function trimString(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value
}

export function normalizeEmail(value: unknown): unknown {
  return typeof value === "string" ? value.trim().toLowerCase() : value
}

export function normalizeCurrency(value: unknown): unknown {
  return typeof value === "string" ? value.trim().toLowerCase() : value
}

export function sanitizeInternalPath(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined

  const trimmed = value.trim()

  if (!trimmed.startsWith("/")) return undefined
  if (trimmed.startsWith("//")) return undefined
  if (trimmed.includes("://")) return undefined
  if (trimmed.includes("\\") || trimmed.includes("\0")) return undefined

  return trimmed
}

export function coercePositiveInt(value: unknown): unknown {
  if (typeof value === "string" && value.trim() !== "") {
    return Number.parseInt(value, 10)
  }

  return value
}

export function coerceMoneyCents(value: unknown): unknown {
  if (typeof value === "string" && value.trim() !== "") {
    return Math.round(Number(value))
  }

  return value
}

export const idSchema = z.string().min(1).max(128)
export const publicIdSchema = z.string().min(1).max(128)
export const userIdSchema = idSchema
export const vouchIdSchema = idSchema
export const invitationTokenSchema = z.string().min(16).max(256)

export const isoDateTimeSchema = z
  .string()
  .datetime({ offset: true })
  .or(z.string().datetime({ offset: false }))

export const currencyCodeSchema = z.preprocess(normalizeCurrency, z.literal("usd"))

export const moneyCentsSchema = z.preprocess(
  coerceMoneyCents,
  z.number().int().nonnegative()
)

export const positiveMoneyCentsSchema = z.preprocess(
  coerceMoneyCents,
  z.number().int().positive()
)

export const percentageBasisPointsSchema = z.number().int().min(0).max(10_000)

export const paginationInputSchema = z.object({
  page: z.preprocess(coercePositiveInt, z.number().int().min(1)).optional(),
  pageSize: z.preprocess(coercePositiveInt, z.number().int().min(1).max(100)).optional(),
})

export const dateRangeInputSchema = z
  .object({
    from: isoDateTimeSchema.optional(),
    to: isoDateTimeSchema.optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.from || !value.to) return

    if (new Date(value.from).getTime() > new Date(value.to).getTime()) {
      ctx.addIssue({
        code: "custom",
        path: ["to"],
        message: "End date must be after start date.",
      })
    }
  })

export const internalReturnToPathSchema = z
  .preprocess(emptyStringToUndefined, z.string().optional())
  .transform(sanitizeInternalPath)

export const emailSchema = z.preprocess(
  normalizeEmail,
  z.string().email().max(320)
)

export const optionalEmailSchema = z.preprocess(
  emptyStringToUndefined,
  emailSchema.optional()
)

export const trimmedStringSchema = z.preprocess(trimString, z.string())
export const optionalTrimmedStringSchema = z.preprocess(
  emptyStringToUndefined,
  trimmedStringSchema.optional()
)

export const shortLabelSchema = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().min(1).max(120).optional()
)

export const privateNoteSchema = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().max(500).optional()
)

export const safeSearchParamSchema = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().max(128).optional()
)

export const safeMetadataSchema = z.record(z.string(), z.unknown()).default({})
'@

  "schemas/marketing.ts" = @'
import { z } from "zod"
import { internalReturnToPathSchema } from "./common"

export const marketingPageIdSchema = z.enum([
  "home",
  "how_it_works",
  "pricing",
  "faq",
  "terms",
  "privacy",
])

export const marketingCtaIdSchema = z.enum([
  "create_vouch",
  "how_it_works",
  "sign_in",
  "get_started",
  "learn_principles",
])

export const legalPageIdSchema = z.enum(["terms", "privacy"])

export const sanitizedMarketingPathSchema = internalReturnToPathSchema

export const sanitizedReferrerDomainSchema = z
  .string()
  .trim()
  .max(253)
  .regex(/^[a-z0-9.-]+$/i)
  .optional()

export const publicNavigationItemSchema = z.object({
  label: z.string().trim().min(1).max(80),
  href: internalReturnToPathSchema,
  external: z.boolean().optional(),
})

export const marketingPageViewedSchema = z.object({
  pageId: marketingPageIdSchema,
  path: sanitizedMarketingPathSchema,
  referrerDomain: sanitizedReferrerDomainSchema,
})

export const marketingCtaClickedSchema = z.object({
  ctaId: marketingCtaIdSchema,
  pageId: marketingPageIdSchema,
  destination: internalReturnToPathSchema.optional(),
})
'@

  "schemas/user.ts" = @'
import { z } from "zod"
import {
  emailSchema,
  optionalEmailSchema,
  optionalTrimmedStringSchema,
  userIdSchema,
} from "./common"

export const userStatusSchema = z.enum(["active", "disabled"])

export const displayNameSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : value),
  z.string().min(1).max(120).optional()
)

export const optionalPhoneSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value
    const trimmed = value.trim()
    return trimmed === "" ? undefined : trimmed
  },
  z.string().min(7).max(32).optional()
)

export const profileBasicsInputSchema = z.object({
  displayName: displayNameSchema,
  phone: optionalPhoneSchema,
})

export const userStatusChangeInputSchema = z.object({
  userId: userIdSchema,
  reason: optionalTrimmedStringSchema,
})

export const userSafeIdentitySchema = z.object({
  userId: userIdSchema,
  displayName: displayNameSchema,
  email: optionalEmailSchema,
})

export const privateAccountInfoSchema = z.object({
  userId: userIdSchema,
  email: emailSchema.optional(),
  phone: optionalPhoneSchema,
  displayName: displayNameSchema,
  status: userStatusSchema,
})

export const accountPageVariantSchema = z.enum([
  "overview",
  "private_info",
  "disabled",
  "loading",
  "error",
])
'@

  "schemas/auth.ts" = @'
import { z } from "zod"
import {
  emailSchema,
  internalReturnToPathSchema,
  invitationTokenSchema,
  optionalEmailSchema,
  userIdSchema,
} from "./common"
import { userStatusSchema } from "./user"

export const baseRoleSchema = z.enum([
  "anonymous",
  "authenticated_user",
  "admin",
  "system",
  "payment_provider",
  "auth_provider",
  "verification_provider",
])

export const contextualRoleSchema = z.enum([
  "payer",
  "payee",
  "invited_payee_candidate",
])

export const authEntryContextSchema = z.enum([
  "landing",
  "invite",
  "create_vouch",
  "dashboard",
  "unknown",
])

export const authPageVariantSchema = z.enum([
  "sign_in",
  "sign_in_error",
  "sign_up",
  "sign_up_from_invite",
  "sign_up_from_create_vouch",
  "verification_pending",
  "callback_loading",
  "auth_error",
  "signed_out_redirect",
])

export const sanitizedReturnToSchema = internalReturnToPathSchema
export const sanitizedInviteTokenFromSearchParamsSchema = invitationTokenSchema.optional()

export const authRedirectContextSchema = z.object({
  entryContext: authEntryContextSchema,
  returnTo: sanitizedReturnToSchema.optional(),
  inviteToken: invitationTokenSchema.optional(),
})

export const signInSearchParamsSchema = z.object({
  redirect_url: sanitizedReturnToSchema.optional(),
  returnTo: sanitizedReturnToSchema.optional(),
  inviteToken: invitationTokenSchema.optional(),
})

export const signUpSearchParamsSchema = signInSearchParamsSchema

export const authCallbackSearchParamsSchema = z.object({
  returnTo: sanitizedReturnToSchema.optional(),
  inviteToken: invitationTokenSchema.optional(),
})

export const signedOutRedirectSearchParamsSchema = z.object({
  returnTo: sanitizedReturnToSchema.optional(),
})

export const sessionUserSchema = z.object({
  id: userIdSchema,
  clerkUserId: z.string().min(1),
  email: optionalEmailSchema,
  displayName: z.string().min(1).max(120).optional(),
  status: userStatusSchema,
  baseRole: baseRoleSchema,
})

export const authzSnapshotSchema = z.object({
  userId: userIdSchema,
  baseRole: baseRoleSchema,
  contextualRoles: z.array(contextualRoleSchema),
  isAdmin: z.boolean(),
  isActive: z.boolean(),
})

export const clerkUserSyncSchema = z.object({
  clerkUserId: z.string().min(1),
  email: emailSchema.optional(),
  displayName: z.string().trim().min(1).max(120).optional(),
})

export const clerkWebhookHeadersSchema = z.object({
  "svix-id": z.string().min(1),
  "svix-timestamp": z.string().min(1),
  "svix-signature": z.string().min(1),
})

export const clerkWebhookEventEnvelopeSchema = z.object({
  data: z.unknown(),
  object: z.string().optional(),
  type: z.enum(["user.created", "user.updated", "user.deleted"]),
  timestamp: z.number().optional(),
  instance_id: z.string().optional(),
})
'@

  "schemas/setup.ts" = @'
import { z } from "zod"
import { internalReturnToPathSchema, userIdSchema } from "./common"

export const setupRequirementSchema = z.enum([
  "account_active",
  "identity_verified",
  "adult_verified",
  "payment_ready",
  "payout_ready",
  "terms_accepted",
])

export const setupRequirementStatusSchema = z.enum([
  "complete",
  "pending",
  "requires_action",
  "blocked",
  "not_started",
  "failed",
])

export const setupActionContextSchema = z.enum([
  "create_vouch",
  "accept_vouch",
  "confirm_presence",
  "settings",
  "dashboard",
])

export const sanitizedTermsVersionSchema = z.string().trim().min(1).max(64)
export const sanitizedSetupReturnToSchema = internalReturnToPathSchema

export const setupChecklistItemStateSchema = z.object({
  requirement: setupRequirementSchema,
  status: setupRequirementStatusSchema,
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(500),
  actionLabel: z.string().min(1).max(80).optional(),
  blockedReason: z.string().min(1).max(240).optional(),
})

export const setupGateInputSchema = z.object({
  userId: userIdSchema,
  actionContext: setupActionContextSchema,
})

export const setupGateResultSchema = z.object({
  allowed: z.boolean(),
  actionContext: setupActionContextSchema,
  missingRequirements: z.array(setupRequirementSchema),
  blockedRequirements: z.array(setupRequirementSchema),
})

export const setupReturnContextSchema = z.object({
  returnTo: sanitizedSetupReturnToSchema.optional(),
  actionContext: setupActionContextSchema.optional(),
})

export const acceptTermsInputSchema = z.object({
  termsVersion: sanitizedTermsVersionSchema,
  returnTo: sanitizedSetupReturnToSchema.optional(),
})

export const setupChecklistSearchParamsSchema = z.object({
  returnTo: sanitizedSetupReturnToSchema.optional(),
  context: setupActionContextSchema.optional(),
})
'@

  "schemas/verification.ts" = @'
import { z } from "zod"
import {
  internalReturnToPathSchema,
  optionalTrimmedStringSchema,
  userIdSchema,
} from "./common"

export const verificationStatusSchema = z.enum([
  "unstarted",
  "pending",
  "verified",
  "rejected",
  "requires_action",
  "expired",
])

export const verificationKindSchema = z.enum(["identity", "adult"])
export const verificationProviderSchema = z.enum(["stripe_identity"])

export const sanitizedVerificationProviderReferenceSchema = optionalTrimmedStringSchema
export const sanitizedVerificationFailureCodeSchema = optionalTrimmedStringSchema

export const verificationStartInputSchema = z.object({
  kind: verificationKindSchema,
  returnTo: internalReturnToPathSchema.optional(),
})

export const verificationProviderReturnInputSchema = z.object({
  provider: verificationProviderSchema,
  sessionId: optionalTrimmedStringSchema,
  returnTo: internalReturnToPathSchema.optional(),
})

export const verificationStatusUpdateInputSchema = z.object({
  userId: userIdSchema,
  identityStatus: verificationStatusSchema.optional(),
  adultStatus: verificationStatusSchema.optional(),
  providerReference: sanitizedVerificationProviderReferenceSchema,
  failureCode: sanitizedVerificationFailureCodeSchema,
})

export const verificationPageVariantSchema = z.enum([
  "start",
  "pending",
  "success",
  "rejected",
  "requires_action",
  "failed",
])
'@

  "schemas/payment.ts" = @'
import { z } from "zod"
import {
  idSchema,
  internalReturnToPathSchema,
  optionalTrimmedStringSchema,
  vouchIdSchema,
} from "./common"

export const paymentProviderSchema = z.enum(["stripe"])
export const verificationProviderSchema = z.enum(["stripe_identity"])

export const paymentReadinessStatusSchema = z.enum([
  "not_started",
  "requires_action",
  "ready",
  "failed",
])

export const payoutReadinessStatusSchema = z.enum([
  "not_started",
  "requires_action",
  "ready",
  "restricted",
  "failed",
])

export const paymentStatusSchema = z.enum([
  "not_started",
  "requires_payment_method",
  "authorized",
  "captured",
  "release_pending",
  "released",
  "refund_pending",
  "refunded",
  "voided",
  "failed",
])

export const refundStatusSchema = z.enum([
  "not_required",
  "pending",
  "succeeded",
  "failed",
])

export const refundReasonSchema = z.enum([
  "not_accepted",
  "confirmation_incomplete",
  "canceled_before_acceptance",
  "payment_failure",
  "provider_required",
])

export const paymentFailureStageSchema = z.enum([
  "create",
  "accept",
  "confirm",
  "release",
  "refund",
  "webhook",
  "unknown",
])

export const sanitizedProviderReferenceSchema = optionalTrimmedStringSchema
export const sanitizedPaymentFailureCodeSchema = optionalTrimmedStringSchema
export const sanitizedSafePaymentMessageSchema = optionalTrimmedStringSchema

export const idempotencyKeySchema = z
  .string()
  .trim()
  .min(8)
  .max(128)
  .regex(/^[a-zA-Z0-9:_-]+$/)

export const startPaymentMethodSetupInputSchema = z.object({
  returnTo: internalReturnToPathSchema.optional(),
})

export const startPayoutOnboardingInputSchema = z.object({
  returnTo: internalReturnToPathSchema.optional(),
})

export const paymentProviderReturnInputSchema = z.object({
  provider: paymentProviderSchema,
  setupSessionId: optionalTrimmedStringSchema,
  returnTo: internalReturnToPathSchema.optional(),
})

export const paymentOperationInputSchema = z.object({
  vouchId: vouchIdSchema,
  idempotencyKey: idempotencyKeySchema.optional(),
})

export const initializeVouchPaymentInputSchema = paymentOperationInputSchema
export const authorizeVouchPaymentInputSchema = paymentOperationInputSchema
export const captureOrReleaseVouchPaymentInputSchema = paymentOperationInputSchema
export const refundOrVoidVouchPaymentInputSchema = paymentOperationInputSchema

export const paymentFailureInputSchema = z.object({
  vouchId: vouchIdSchema.optional(),
  paymentRecordId: idSchema.optional(),
  failureStage: paymentFailureStageSchema,
  failureCode: sanitizedPaymentFailureCodeSchema,
  safeMessage: sanitizedSafePaymentMessageSchema,
})

export const stripeWebhookHeadersSchema = z.object({
  "stripe-signature": z.string().min(1),
})

export const paymentWebhookEnvelopeSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  data: z.unknown().optional(),
})

export const paymentWebhookProcessInputSchema = z.object({
  providerEventId: z.string().min(1),
  eventType: z.string().min(1),
  idempotencyKey: idempotencyKeySchema.optional(),
})
'@

  "schemas/vouch.ts" = @'
import { z } from "zod"
import {
  currencyCodeSchema,
  emailSchema,
  invitationTokenSchema,
  isoDateTimeSchema,
  optionalTrimmedStringSchema,
  positiveMoneyCentsSchema,
  privateNoteSchema,
  shortLabelSchema,
  vouchIdSchema,
} from "./common"

const PLATFORM_MIN_AMOUNT_CENTS = 500

export const vouchStatusSchema = z.enum([
  "pending",
  "active",
  "completed",
  "expired",
  "refunded",
  "canceled",
  "failed",
])

export const invitationStatusSchema = z.enum([
  "created",
  "sent",
  "opened",
  "accepted",
  "declined",
  "expired",
  "invalidated",
])

export const participantRoleSchema = z.enum(["payer", "payee"])

export const confirmationStatusSchema = z.enum([
  "not_confirmed",
  "confirmed",
  "ineligible",
  "window_not_open",
  "window_closed",
])

export const aggregateConfirmationStatusSchema = z.enum([
  "none_confirmed",
  "payer_confirmed",
  "payee_confirmed",
  "both_confirmed",
])

export const confirmationMethodSchema = z.enum(["manual", "gps", "system"])
export const recipientMethodSchema = z.enum(["email", "share_link"])

export const sanitizedVouchLabelSchema = shortLabelSchema
export const sanitizedPrivateNoteSchema = privateNoteSchema
export const sanitizedInviteTokenSchema = invitationTokenSchema
export const sanitizedDeclineReasonSchema = optionalTrimmedStringSchema

export const createVouchInputSchema = z
  .object({
    amountCents: positiveMoneyCentsSchema,
    currency: currencyCodeSchema,
    meetingStartsAt: isoDateTimeSchema,
    confirmationOpensAt: isoDateTimeSchema,
    confirmationExpiresAt: isoDateTimeSchema,
    recipientMethod: recipientMethodSchema,
    recipientEmail: emailSchema.optional(),
    label: sanitizedVouchLabelSchema,
    privateNote: sanitizedPrivateNoteSchema,
    acceptedTerms: z.literal(true),
  })
  .superRefine((value, ctx) => {
    if (value.amountCents < PLATFORM_MIN_AMOUNT_CENTS) {
      ctx.addIssue({
        code: "custom",
        path: ["amountCents"],
        message: `Amount must be at least ${PLATFORM_MIN_AMOUNT_CENTS} cents.`,
      })
    }

    const meetingStartsAt = new Date(value.meetingStartsAt).getTime()
    const confirmationOpensAt = new Date(value.confirmationOpensAt).getTime()
    const confirmationExpiresAt = new Date(value.confirmationExpiresAt).getTime()

    if (confirmationOpensAt >= confirmationExpiresAt) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmationExpiresAt"],
        message: "Confirmation expiration must be after confirmation opening.",
      })
    }

    if (meetingStartsAt > confirmationOpensAt) {
      ctx.addIssue({
        code: "custom",
        path: ["meetingStartsAt"],
        message: "Meeting start must be before or at confirmation opening.",
      })
    }

    if (value.recipientMethod === "email" && !value.recipientEmail) {
      ctx.addIssue({
        code: "custom",
        path: ["recipientEmail"],
        message: "Recipient email is required when sending by email.",
      })
    }

    if (value.recipientMethod === "share_link" && value.recipientEmail) {
      ctx.addIssue({
        code: "custom",
        path: ["recipientEmail"],
        message: "Recipient email should be omitted when using a share link.",
      })
    }
  })

export const createVouchDraftInputSchema = createVouchInputSchema.partial().extend({
  acceptedTerms: z.boolean().optional(),
})

export const feePreviewInputSchema = z.object({
  amountCents: positiveMoneyCentsSchema,
  currency: currencyCodeSchema,
})

export const sendVouchInvitationInputSchema = z.object({
  vouchId: vouchIdSchema,
  recipientEmail: emailSchema,
})

export const resendVouchInvitationInputSchema = z.object({
  vouchId: vouchIdSchema,
})

export const inviteTokenInputSchema = z.object({
  token: sanitizedInviteTokenSchema,
})

export const acceptVouchInputSchema = z.object({
  token: sanitizedInviteTokenSchema,
  acceptedTerms: z.literal(true),
})

export const declineVouchInputSchema = z.object({
  token: sanitizedInviteTokenSchema,
  reason: sanitizedDeclineReasonSchema,
})

export const cancelPendingVouchInputSchema = z.object({
  vouchId: vouchIdSchema,
  reason: sanitizedDeclineReasonSchema,
})

export const confirmPresenceInputSchema = z.object({
  vouchId: vouchIdSchema,
  participantRole: participantRoleSchema,
  method: confirmationMethodSchema.default("manual"),
})

export const vouchIdParamSchema = z.object({
  vouchId: vouchIdSchema,
})

export const inviteTokenParamSchema = z.object({
  token: sanitizedInviteTokenSchema,
})

export const vouchListStatusFilterSchema = z.enum([
  "pending",
  "active",
  "completed",
  "expired",
  "refunded",
  "action_required",
  "all",
])

export const vouchListSortSchema = z.enum(["newest", "oldest", "deadline"])

export const vouchListQuerySchema = z.object({
  status: vouchListStatusFilterSchema.optional(),
  page: z.coerce.number().int().min(1).optional(),
  sort: vouchListSortSchema.optional(),
})

export const vouchDetailVariantSchema = z.enum([
  "pending_payer",
  "pending_invite_sent",
  "active_before_window",
  "active_window_open",
  "payer_confirmed_waiting_for_payee",
  "payee_confirmed_waiting_for_payer",
  "both_confirmed_processing_release",
  "completed",
  "expired",
  "refunded",
  "failed_payment",
  "failed_release",
  "failed_refund",
  "unauthorized_or_not_found",
  "loading",
])

export const confirmPresenceVariantSchema = z.enum([
  "payer",
  "payee",
  "before_window",
  "window_open",
  "already_confirmed",
  "waiting_for_other_party",
  "both_confirmed_success",
  "window_closed",
  "duplicate_confirmation_error",
  "unauthorized_participant",
  "provider_payment_failure",
])
'@

  "schemas/dashboard.ts" = @'
import { z } from "zod"
import { vouchListSortSchema } from "./vouch"

export const dashboardSectionIdSchema = z.enum([
  "action_required",
  "active",
  "pending",
  "completed",
  "expired_refunded",
])

export const dashboardVariantSchema = z.enum([
  "empty",
  "action_required",
  "active_vouches",
  "mixed_vouch_states",
  "payer_focused",
  "payee_focused",
  "loading",
  "error",
])

export const sanitizedDashboardStatusParamSchema = dashboardSectionIdSchema
  .or(z.literal("all"))
  .optional()

export const sanitizedDashboardSortParamSchema = vouchListSortSchema.optional()
export const dashboardSortSchema = vouchListSortSchema

export const dashboardSearchParamsSchema = z.object({
  status: sanitizedDashboardStatusParamSchema,
  page: z.coerce.number().int().min(1).optional(),
  sort: sanitizedDashboardSortParamSchema,
})

export const dashboardSectionStateSchema = z.object({
  id: dashboardSectionIdSchema,
  title: z.string().min(1).max(120),
  count: z.number().int().nonnegative(),
  collapsed: z.boolean().optional(),
})
'@

  "schemas/settings.ts" = @'
import { z } from "zod"
import { internalReturnToPathSchema } from "./common"
import { profileBasicsInputSchema } from "./user"

export const settingsPageVariantSchema = z.enum([
  "overview",
  "profile_basics",
  "verification_status",
  "payment_readiness",
  "payout_readiness",
  "terms_legal_status",
  "account_disabled",
  "loading",
  "error",
])

export const settingsSectionIdSchema = z.enum([
  "profile",
  "verification",
  "payment",
  "payout",
  "terms",
  "security",
])

export const sanitizedSettingsSectionParamSchema = settingsSectionIdSchema.optional()
export const sanitizedSettingsReturnToSchema = internalReturnToPathSchema

export const settingsSearchParamsSchema = z.object({
  section: sanitizedSettingsSectionParamSchema,
  returnTo: sanitizedSettingsReturnToSchema.optional(),
})

export const updateProfileBasicsInputSchema = profileBasicsInputSchema
'@

  "schemas/admin.ts" = @'
import { z } from "zod"
import { idSchema, optionalTrimmedStringSchema, userIdSchema } from "./common"
import { paymentStatusSchema, refundStatusSchema } from "./payment"
import { userStatusSchema } from "./user"
import { vouchStatusSchema } from "./vouch"

export const adminRouteSectionSchema = z.enum([
  "dashboard",
  "vouches",
  "users",
  "payments",
  "webhooks",
  "audit",
])

export const adminPageVariantSchema = z.enum([
  "dashboard",
  "failure_heavy",
  "vouch_list",
  "vouch_detail",
  "user_list",
  "user_detail",
  "payment_list",
  "payment_detail",
  "webhook_event_list",
  "webhook_event_detail",
  "audit_log",
  "audit_event_detail",
  "safe_retry_confirmation",
  "safe_retry_success",
  "safe_retry_failure",
  "unauthorized",
])

export const adminSafeRetryOperationSchema = z.enum([
  "retry_notification_send",
  "retry_provider_reconciliation",
  "retry_webhook_processing",
  "retry_refund_status_sync",
])

export const sanitizedAdminReasonSchema = z.string().trim().min(1).max(500)
export const sanitizedAdminSortParamSchema = z.enum([
  "newest",
  "oldest",
  "deadline",
  "failure",
]).optional()

export const redactedProviderReferenceSchema = z.string().max(256).optional()

export const adminVouchFilterInputSchema = z.object({
  status: vouchStatusSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
  page: z.coerce.number().int().min(1).optional(),
  sort: sanitizedAdminSortParamSchema,
})

export const adminUserFilterInputSchema = z.object({
  status: userStatusSchema.optional(),
  page: z.coerce.number().int().min(1).optional(),
  sort: z.enum(["newest", "oldest"]).optional(),
})

export const adminPaymentFilterInputSchema = z.object({
  paymentStatus: paymentStatusSchema.optional(),
  refundStatus: refundStatusSchema.optional(),
  page: z.coerce.number().int().min(1).optional(),
})

export const adminWebhookFilterInputSchema = z.object({
  eventType: optionalTrimmedStringSchema,
  processed: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).optional(),
})

export const adminAuditFilterInputSchema = z.object({
  entityType: optionalTrimmedStringSchema,
  entityId: optionalTrimmedStringSchema,
  eventName: optionalTrimmedStringSchema,
  page: z.coerce.number().int().min(1).optional(),
})

export const adminSafeRetryInputSchema = z.object({
  operation: adminSafeRetryOperationSchema,
  entityId: idSchema,
  reason: sanitizedAdminReasonSchema.optional(),
})

export const adminDisableUserInputSchema = z.object({
  userId: userIdSchema,
  reason: sanitizedAdminReasonSchema,
})
'@

  "schemas/audit.ts" = @'
import { z } from "zod"
import { idSchema, optionalTrimmedStringSchema, safeMetadataSchema, userIdSchema } from "./common"

export const auditActorTypeSchema = z.enum([
  "user",
  "system",
  "admin",
  "payment_provider",
  "auth_provider",
  "verification_provider",
])

export const auditEntityTypeSchema = z.enum([
  "User",
  "VerificationProfile",
  "PaymentCustomer",
  "ConnectedAccount",
  "Vouch",
  "Invitation",
  "PresenceConfirmation",
  "PaymentRecord",
  "RefundRecord",
  "TermsAcceptance",
  "NotificationEvent",
  "PaymentWebhookEvent",
])

export const auditEventNameSchema = z.enum([
  "user.created",
  "user.signed_in",
  "user.verification.started",
  "user.verification.completed",
  "user.verification.rejected",
  "user.payment_method.added",
  "user.connected_account.created",
  "user.connected_account.ready",
  "user.terms.accepted",
  "vouch.created",
  "vouch.invite.sent",
  "vouch.invite.opened",
  "vouch.accepted",
  "vouch.declined",
  "vouch.canceled",
  "vouch.confirmation_window.opened",
  "vouch.payer_confirmed",
  "vouch.payee_confirmed",
  "vouch.completed",
  "vouch.expired",
  "vouch.refunded",
  "vouch.failed",
  "payment.initialized",
  "payment.authorized",
  "payment.captured",
  "payment.release_requested",
  "payment.released",
  "payment.refund_requested",
  "payment.refunded",
  "payment.voided",
  "payment.failed",
  "payment.webhook_received",
  "payment.webhook_processed",
  "payment.webhook_ignored",
  "payment.reconciliation_failed",
  "admin.user.viewed",
  "admin.vouch.viewed",
  "admin.payment.viewed",
  "admin.retry.started",
  "admin.retry.completed",
  "admin.account.disabled",
])

export const safeAuditMetadataSchema = safeMetadataSchema
export const requestIdSchema = optionalTrimmedStringSchema

export const writeAuditEventInputSchema = z.object({
  eventName: auditEventNameSchema,
  actorType: auditActorTypeSchema,
  actorUserId: userIdSchema.optional(),
  entityType: auditEntityTypeSchema,
  entityId: idSchema,
  requestId: requestIdSchema,
  participantSafe: z.boolean().optional(),
  metadata: safeAuditMetadataSchema.optional(),
})

export const auditFilterInputSchema = z.object({
  entityType: auditEntityTypeSchema.optional(),
  entityId: idSchema.optional(),
  actorType: auditActorTypeSchema.optional(),
  eventName: auditEventNameSchema.optional(),
  page: z.coerce.number().int().min(1).optional(),
})

export const participantSafeAuditFilterSchema = auditFilterInputSchema.extend({
  participantSafe: z.literal(true).default(true),
})
'@

  "schemas/notification.ts" = @'
import { z } from "zod"
import {
  emailSchema,
  idSchema,
  optionalEmailSchema,
  optionalTrimmedStringSchema,
  userIdSchema,
  vouchIdSchema,
} from "./common"

export const notificationChannelSchema = z.enum(["email"])
export const notificationStatusSchema = z.enum(["queued", "sent", "failed", "skipped"])

export const notificationTypeSchema = z.enum([
  "invite",
  "vouch_accepted",
  "confirmation_window_open",
  "confirmation_recorded",
  "vouch_completed",
  "vouch_expired_refunded",
  "payment_failed",
])

export const sanitizedNotificationFailureCodeSchema = optionalTrimmedStringSchema
export const sanitizedProviderMessageIdSchema = optionalTrimmedStringSchema

export const queueNotificationInputSchema = z
  .object({
    type: notificationTypeSchema,
    channel: notificationChannelSchema.default("email"),
    recipientUserId: userIdSchema.optional(),
    recipientEmail: optionalEmailSchema,
    vouchId: vouchIdSchema.optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.recipientUserId && !value.recipientEmail) {
      ctx.addIssue({
        code: "custom",
        path: ["recipientEmail"],
        message: "A recipient user ID or recipient email is required.",
      })
    }
  })

export const sendQueuedNotificationInputSchema = z.object({
  notificationEventId: idSchema,
})

export const updateNotificationDeliveryStatusInputSchema = z.object({
  notificationEventId: idSchema,
  status: notificationStatusSchema,
  providerMessageId: sanitizedProviderMessageIdSchema,
  failureCode: sanitizedNotificationFailureCodeSchema,
})

export const notificationFilterInputSchema = z.object({
  recipientUserId: userIdSchema.optional(),
  recipientEmail: emailSchema.optional(),
  vouchId: vouchIdSchema.optional(),
  status: notificationStatusSchema.optional(),
  type: notificationTypeSchema.optional(),
  page: z.coerce.number().int().min(1).optional(),
})
'@

  "schemas/analytics.ts" = @'
import { z } from "zod"
import { isoDateTimeSchema, safeMetadataSchema, userIdSchema } from "./common"

export const analyticsEventGroupSchema = z.enum([
  "acquisition",
  "setup",
  "vouch",
  "payment",
  "notification",
  "admin",
])

export const analyticsEventNameSchema = z.enum([
  "marketing.page_viewed",
  "marketing.cta_clicked",
  "auth.sign_up_started",
  "auth.sign_up_completed",
  "auth.sign_in_completed",
  "setup.checklist_viewed",
  "setup.verification_started",
  "setup.verification_completed",
  "setup.verification_failed",
  "setup.payment_started",
  "setup.payment_ready",
  "setup.payout_started",
  "setup.payout_ready",
  "setup.terms_accepted",
  "vouch.create_started",
  "vouch.create_submitted",
  "vouch.created",
  "vouch.invite_copied",
  "vouch.invite_sent",
  "vouch.invite_opened",
  "vouch.accept_started",
  "vouch.accepted",
  "vouch.declined",
  "vouch.canceled",
  "vouch.confirmation_window_opened",
  "vouch.confirmation_submitted",
  "vouch.partially_confirmed",
  "vouch.completed",
  "vouch.expired",
  "vouch.refunded",
  "vouch.failed",
  "payment.initialized",
  "payment.authorized",
  "payment.release_requested",
  "payment.released",
  "payment.refund_requested",
  "payment.refunded",
  "payment.failed",
  "notification.queued",
  "notification.sent",
  "notification.failed",
  "admin.dashboard_viewed",
  "admin.vouch_viewed",
  "admin.safe_retry_started",
  "admin.safe_retry_completed",
])

export const privacySafeAnalyticsPropertiesSchema = safeMetadataSchema
export const pseudonymousIdSchema = z.string().trim().min(1).max(128).optional()

export const trackAnalyticsEventInputSchema = z.object({
  eventName: analyticsEventNameSchema,
  occurredAt: isoDateTimeSchema.optional(),
  userId: userIdSchema.optional(),
  sessionId: pseudonymousIdSchema,
  requestId: pseudonymousIdSchema,
  properties: privacySafeAnalyticsPropertiesSchema.optional(),
})

export const marketingAnalyticsPropertiesSchema = privacySafeAnalyticsPropertiesSchema
export const setupAnalyticsPropertiesSchema = privacySafeAnalyticsPropertiesSchema
export const vouchAnalyticsPropertiesSchema = privacySafeAnalyticsPropertiesSchema
export const paymentAnalyticsPropertiesSchema = privacySafeAnalyticsPropertiesSchema
export const notificationAnalyticsPropertiesSchema = privacySafeAnalyticsPropertiesSchema
export const adminAnalyticsPropertiesSchema = privacySafeAnalyticsPropertiesSchema
'@

  "schemas/system.ts" = @'
import { z } from "zod"
import { internalReturnToPathSchema, optionalTrimmedStringSchema } from "./common"
import { baseRoleSchema } from "./auth"

export const systemPageVariantSchema = z.enum([
  "global_loading",
  "route_loading_skeleton",
  "global_error",
  "protected_route_unauthorized",
  "entity_not_found",
  "toast_notification",
  "form_validation_error",
  "server_action_failure",
  "payment_provider_unavailable",
  "maintenance",
  "degraded_service",
])

export const toastIntentSchema = z.enum(["success", "info", "warning", "error"])

export const toastStateSchema = z.object({
  intent: toastIntentSchema,
  title: z.string().min(1).max(120),
  message: z.string().max(500).optional(),
})

export const sanitizedErrorMessageSchema = optionalTrimmedStringSchema
export const sanitizedEntityTypeSchema = z.string().trim().min(1).max(80)
export const sanitizedActionNameSchema = z.string().trim().min(1).max(120)

export const protectedRouteUnauthorizedInputSchema = z.object({
  path: internalReturnToPathSchema,
  requiredRole: baseRoleSchema.optional(),
  requiredCapability: optionalTrimmedStringSchema,
})

export const entityNotFoundInputSchema = z.object({
  entityType: sanitizedEntityTypeSchema,
  entityId: optionalTrimmedStringSchema,
})

export const serverActionFailureInputSchema = z.object({
  actionName: sanitizedActionNameSchema,
  code: optionalTrimmedStringSchema,
  message: sanitizedErrorMessageSchema,
  requestId: optionalTrimmedStringSchema,
})

export const healthcheckSchema = z.object({
  ok: z.boolean(),
  service: z.string().min(1).max(80),
})

export const revalidateTagInputSchema = z.object({
  tag: z.string().trim().min(1).max(160),
})
'@

  "types/common.ts" = @'
import type { z } from "zod"
import type {
  currencyCodeSchema,
  dateRangeInputSchema,
  idSchema,
  isoDateTimeSchema,
  moneyCentsSchema,
  paginationInputSchema,
  percentageBasisPointsSchema,
  publicIdSchema,
  userIdSchema,
  vouchIdSchema,
  invitationTokenSchema,
} from "@/schemas/common"

export type ID = z.infer<typeof idSchema>
export type PublicID = z.infer<typeof publicIdSchema>
export type UserID = z.infer<typeof userIdSchema>
export type VouchID = z.infer<typeof vouchIdSchema>
export type InvitationToken = z.infer<typeof invitationTokenSchema>
export type ISODateTime = z.infer<typeof isoDateTimeSchema>
export type CurrencyCode = z.infer<typeof currencyCodeSchema>
export type MoneyCents = z.infer<typeof moneyCentsSchema>
export type PercentageBasisPoints = z.infer<typeof percentageBasisPointsSchema>

export type Environment = "development" | "preview" | "production"
export type SortDirection = "asc" | "desc"
export type AsyncStatus = "idle" | "pending" | "success" | "error"
export type PageMode = "default" | "loading" | "error" | "empty" | "blocked" | "success"
export type DeviceVariant = "desktop" | "mobile"

export type ActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false
      code?: string
      formError?: string
      fieldErrors?: Record<string, string[]>
    }

export type PaginationInput = z.infer<typeof paginationInputSchema>

export interface PaginationState {
  page: number
  pageSize: number
  totalItems?: number
  totalPages?: number
}

export type DateRangeInput = z.infer<typeof dateRangeInputSchema>

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
'@

  "types/marketing.ts" = @'
import type { z } from "zod"
import type {
  legalPageIdSchema,
  marketingCtaClickedSchema,
  marketingCtaIdSchema,
  marketingPageIdSchema,
  marketingPageViewedSchema,
  publicNavigationItemSchema,
} from "@/schemas/marketing"

export type MarketingPageID = z.infer<typeof marketingPageIdSchema>
export type MarketingCtaID = z.infer<typeof marketingCtaIdSchema>
export type LegalPageID = z.infer<typeof legalPageIdSchema>
export type PublicNavigationItem = z.infer<typeof publicNavigationItemSchema>
export type MarketingEventInput = z.infer<typeof marketingPageViewedSchema>
export type MarketingCtaEventInput = z.infer<typeof marketingCtaClickedSchema>
'@

  "types/user.ts" = @'
import type { z } from "zod"
import type {
  accountPageVariantSchema,
  privateAccountInfoSchema,
  profileBasicsInputSchema,
  userSafeIdentitySchema,
  userStatusChangeInputSchema,
  userStatusSchema,
} from "@/schemas/user"

export type UserStatus = z.infer<typeof userStatusSchema>
export type UserSafeIdentity = z.infer<typeof userSafeIdentitySchema>
export type PrivateAccountInfo = z.infer<typeof privateAccountInfoSchema>
export type ProfileBasicsInput = z.infer<typeof profileBasicsInputSchema>
export type UserStatusChangeInput = z.infer<typeof userStatusChangeInputSchema>
export type AccountPageVariant = z.infer<typeof accountPageVariantSchema>
'@

  "types/auth.ts" = @'
import type { z } from "zod"
import type {
  authEntryContextSchema,
  authPageVariantSchema,
  authRedirectContextSchema,
  authzSnapshotSchema,
  baseRoleSchema,
  clerkUserSyncSchema,
  contextualRoleSchema,
  sessionUserSchema,
} from "@/schemas/auth"

export type BaseRole = z.infer<typeof baseRoleSchema>
export type ContextualRole = z.infer<typeof contextualRoleSchema>
export type AuthEntryContext = z.infer<typeof authEntryContextSchema>
export type AuthPageVariant = z.infer<typeof authPageVariantSchema>
export type AuthRedirectContext = z.infer<typeof authRedirectContextSchema>
export type SessionUser = z.infer<typeof sessionUserSchema>
export type AuthzSnapshot = z.infer<typeof authzSnapshotSchema>
export type ClerkUserSyncInput = z.infer<typeof clerkUserSyncSchema>
'@

  "types/setup.ts" = @'
import type { z } from "zod"
import type {
  acceptTermsInputSchema,
  setupActionContextSchema,
  setupChecklistItemStateSchema,
  setupGateResultSchema,
  setupRequirementSchema,
  setupRequirementStatusSchema,
} from "@/schemas/setup"

export type SetupRequirement = z.infer<typeof setupRequirementSchema>
export type SetupRequirementStatus = z.infer<typeof setupRequirementStatusSchema>
export type SetupActionContext = z.infer<typeof setupActionContextSchema>
export type SetupChecklistItemState = z.infer<typeof setupChecklistItemStateSchema>
export type SetupGateResult = z.infer<typeof setupGateResultSchema>
export type AcceptTermsInput = z.infer<typeof acceptTermsInputSchema>
'@

  "types/verification.ts" = @'
import type { z } from "zod"
import type {
  verificationKindSchema,
  verificationPageVariantSchema,
  verificationProviderReturnInputSchema,
  verificationStartInputSchema,
  verificationStatusSchema,
  verificationStatusUpdateInputSchema,
} from "@/schemas/verification"

export type VerificationStatus = z.infer<typeof verificationStatusSchema>
export type VerificationKind = z.infer<typeof verificationKindSchema>
export type VerificationStartInput = z.infer<typeof verificationStartInputSchema>
export type VerificationProviderReturnInput = z.infer<typeof verificationProviderReturnInputSchema>
export type VerificationStatusUpdateInput = z.infer<typeof verificationStatusUpdateInputSchema>
export type VerificationPageVariant = z.infer<typeof verificationPageVariantSchema>
'@

  "types/payment.ts" = @'
import type { z } from "zod"
import type {
  paymentFailureInputSchema,
  paymentFailureStageSchema,
  paymentOperationInputSchema,
  paymentProviderReturnInputSchema,
  paymentProviderSchema,
  paymentReadinessStatusSchema,
  paymentStatusSchema,
  payoutReadinessStatusSchema,
  refundReasonSchema,
  refundStatusSchema,
  startPaymentMethodSetupInputSchema,
  startPayoutOnboardingInputSchema,
  verificationProviderSchema,
} from "@/schemas/payment"

export type PaymentProvider = z.infer<typeof paymentProviderSchema>
export type VerificationProvider = z.infer<typeof verificationProviderSchema>
export type PaymentReadinessStatus = z.infer<typeof paymentReadinessStatusSchema>
export type PayoutReadinessStatus = z.infer<typeof payoutReadinessStatusSchema>
export type PaymentStatus = z.infer<typeof paymentStatusSchema>
export type RefundStatus = z.infer<typeof refundStatusSchema>
export type RefundReason = z.infer<typeof refundReasonSchema>
export type StartPaymentMethodSetupInput = z.infer<typeof startPaymentMethodSetupInputSchema>
export type StartPayoutOnboardingInput = z.infer<typeof startPayoutOnboardingInputSchema>
export type PaymentProviderReturnInput = z.infer<typeof paymentProviderReturnInputSchema>
export type PaymentOperationInput = z.infer<typeof paymentOperationInputSchema>
export type PaymentFailureInput = z.infer<typeof paymentFailureInputSchema>
export type PaymentFailureStage = z.infer<typeof paymentFailureStageSchema>
'@

  "types/vouch.ts" = @'
import type { z } from "zod"
import type {
  acceptVouchInputSchema,
  aggregateConfirmationStatusSchema,
  cancelPendingVouchInputSchema,
  confirmPresenceInputSchema,
  confirmPresenceVariantSchema,
  confirmationMethodSchema,
  confirmationStatusSchema,
  createVouchDraftInputSchema,
  createVouchInputSchema,
  declineVouchInputSchema,
  feePreviewInputSchema,
  invitationStatusSchema,
  inviteTokenInputSchema,
  participantRoleSchema,
  recipientMethodSchema,
  resendVouchInvitationInputSchema,
  sendVouchInvitationInputSchema,
  vouchDetailVariantSchema,
  vouchListQuerySchema,
  vouchListSortSchema,
  vouchListStatusFilterSchema,
  vouchStatusSchema,
} from "@/schemas/vouch"

export type VouchStatus = z.infer<typeof vouchStatusSchema>
export type InvitationStatus = z.infer<typeof invitationStatusSchema>
export type ParticipantRole = z.infer<typeof participantRoleSchema>
export type ConfirmationStatus = z.infer<typeof confirmationStatusSchema>
export type AggregateConfirmationStatus = z.infer<typeof aggregateConfirmationStatusSchema>
export type ConfirmationMethod = z.infer<typeof confirmationMethodSchema>
export type RecipientMethod = z.infer<typeof recipientMethodSchema>

export type CreateVouchInput = z.infer<typeof createVouchInputSchema>
export type CreateVouchDraftInput = z.infer<typeof createVouchDraftInputSchema>
export type FeePreviewInput = z.infer<typeof feePreviewInputSchema>
export type SendVouchInvitationInput = z.infer<typeof sendVouchInvitationInputSchema>
export type ResendVouchInvitationInput = z.infer<typeof resendVouchInvitationInputSchema>
export type InviteTokenInput = z.infer<typeof inviteTokenInputSchema>
export type AcceptVouchInput = z.infer<typeof acceptVouchInputSchema>
export type DeclineVouchInput = z.infer<typeof declineVouchInputSchema>
export type CancelPendingVouchInput = z.infer<typeof cancelPendingVouchInputSchema>
export type ConfirmPresenceInput = z.infer<typeof confirmPresenceInputSchema>

export type VouchListQuery = z.infer<typeof vouchListQuerySchema>
export type VouchListStatusFilter = z.infer<typeof vouchListStatusFilterSchema>
export type VouchListSort = z.infer<typeof vouchListSortSchema>
export type VouchDetailVariant = z.infer<typeof vouchDetailVariantSchema>
export type ConfirmPresenceVariant = z.infer<typeof confirmPresenceVariantSchema>
'@

  "types/dashboard.ts" = @'
import type { z } from "zod"
import type {
  dashboardSearchParamsSchema,
  dashboardSectionIdSchema,
  dashboardSectionStateSchema,
  dashboardVariantSchema,
} from "@/schemas/dashboard"

export type DashboardSectionID = z.infer<typeof dashboardSectionIdSchema>
export type DashboardVariant = z.infer<typeof dashboardVariantSchema>
export type DashboardSearchParams = z.infer<typeof dashboardSearchParamsSchema>
export type DashboardSectionState = z.infer<typeof dashboardSectionStateSchema>
'@

  "types/settings.ts" = @'
import type { z } from "zod"
import type {
  settingsPageVariantSchema,
  settingsSearchParamsSchema,
  settingsSectionIdSchema,
  updateProfileBasicsInputSchema,
} from "@/schemas/settings"

export type SettingsPageVariant = z.infer<typeof settingsPageVariantSchema>
export type SettingsSectionID = z.infer<typeof settingsSectionIdSchema>
export type SettingsSearchParams = z.infer<typeof settingsSearchParamsSchema>
export type UpdateProfileBasicsInput = z.infer<typeof updateProfileBasicsInputSchema>
'@

  "types/admin.ts" = @'
import type { z } from "zod"
import type {
  adminDisableUserInputSchema,
  adminPageVariantSchema,
  adminPaymentFilterInputSchema,
  adminRouteSectionSchema,
  adminSafeRetryInputSchema,
  adminSafeRetryOperationSchema,
  adminUserFilterInputSchema,
  adminVouchFilterInputSchema,
} from "@/schemas/admin"

export type AdminRouteSection = z.infer<typeof adminRouteSectionSchema>
export type AdminPageVariant = z.infer<typeof adminPageVariantSchema>
export type AdminSafeRetryOperation = z.infer<typeof adminSafeRetryOperationSchema>
export type AdminVouchFilterInput = z.infer<typeof adminVouchFilterInputSchema>
export type AdminUserFilterInput = z.infer<typeof adminUserFilterInputSchema>
export type AdminPaymentFilterInput = z.infer<typeof adminPaymentFilterInputSchema>
export type AdminSafeRetryInput = z.infer<typeof adminSafeRetryInputSchema>
export type AdminDisableUserInput = z.infer<typeof adminDisableUserInputSchema>
'@

  "types/audit.ts" = @'
import type { z } from "zod"
import type {
  auditActorTypeSchema,
  auditEntityTypeSchema,
  auditEventNameSchema,
  auditFilterInputSchema,
  writeAuditEventInputSchema,
} from "@/schemas/audit"

export type AuditActorType = z.infer<typeof auditActorTypeSchema>
export type AuditEntityType = z.infer<typeof auditEntityTypeSchema>
export type AuditEventName = z.infer<typeof auditEventNameSchema>
export type WriteAuditEventInput = z.infer<typeof writeAuditEventInputSchema>
export type AuditFilterInput = z.infer<typeof auditFilterInputSchema>
'@

  "types/notification.ts" = @'
import type { z } from "zod"
import type {
  notificationChannelSchema,
  notificationStatusSchema,
  notificationTypeSchema,
  queueNotificationInputSchema,
  sendQueuedNotificationInputSchema,
  updateNotificationDeliveryStatusInputSchema,
} from "@/schemas/notification"

export type NotificationChannel = z.infer<typeof notificationChannelSchema>
export type NotificationStatus = z.infer<typeof notificationStatusSchema>
export type NotificationType = z.infer<typeof notificationTypeSchema>
export type QueueNotificationInput = z.infer<typeof queueNotificationInputSchema>
export type SendQueuedNotificationInput = z.infer<typeof sendQueuedNotificationInputSchema>
export type UpdateNotificationDeliveryStatusInput = z.infer<
  typeof updateNotificationDeliveryStatusInputSchema
>
'@

  "types/analytics.ts" = @'
import type { z } from "zod"
import type {
  analyticsEventGroupSchema,
  analyticsEventNameSchema,
  trackAnalyticsEventInputSchema,
} from "@/schemas/analytics"

export type AnalyticsEventGroup = z.infer<typeof analyticsEventGroupSchema>
export type AnalyticsEventName = z.infer<typeof analyticsEventNameSchema>
export type TrackAnalyticsEventInput = z.infer<typeof trackAnalyticsEventInputSchema>
'@

  "types/system.ts" = @'
import type { z } from "zod"
import type {
  entityNotFoundInputSchema,
  protectedRouteUnauthorizedInputSchema,
  serverActionFailureInputSchema,
  systemPageVariantSchema,
  toastIntentSchema,
  toastStateSchema,
} from "@/schemas/system"

export type SystemPageVariant = z.infer<typeof systemPageVariantSchema>
export type ToastIntent = z.infer<typeof toastIntentSchema>
export type ToastState = z.infer<typeof toastStateSchema>
export type ProtectedRouteUnauthorizedInput = z.infer<typeof protectedRouteUnauthorizedInputSchema>
export type EntityNotFoundInput = z.infer<typeof entityNotFoundInputSchema>
export type ServerActionFailureInput = z.infer<typeof serverActionFailureInputSchema>
'@

  "schemas/index.ts" = @'
export * from "./common"
export * from "./marketing"
export * from "./auth"
export * from "./user"
export * from "./setup"
export * from "./verification"
export * from "./payment"
export * from "./vouch"
export * from "./dashboard"
export * from "./settings"
export * from "./admin"
export * from "./audit"
export * from "./notification"
export * from "./analytics"
export * from "./system"
'@

  "types/index.ts" = @'
export * from "./common"
export * from "./marketing"
export * from "./auth"
export * from "./user"
export * from "./setup"
export * from "./verification"
export * from "./payment"
export * from "./vouch"
export * from "./dashboard"
export * from "./settings"
export * from "./admin"
export * from "./audit"
export * from "./notification"
export * from "./analytics"
export * from "./system"
'@
}

foreach ($relativePath in $files.Keys) {
  Write-TextFile -Path (Join-Path $Root $relativePath) -Content $files[$relativePath]
}

Write-Step "Done"
Write-Host "Created/updated Vouch types and schemas." -ForegroundColor Green
Write-Host "Run next:" -ForegroundColor Yellow
Write-Host "  pnpm format"
Write-Host "  pnpm lint"
Write-Host "  pnpm typecheck"

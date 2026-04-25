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
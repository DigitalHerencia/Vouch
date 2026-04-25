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
  inviteTokenParamSchema,
  participantRoleSchema,
  recipientMethodSchema,
  resendVouchInvitationInputSchema,
  sendVouchInvitationInputSchema,
  vouchDetailVariantSchema,
  vouchIdParamSchema,
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
export type VouchIdParam = z.infer<typeof vouchIdParamSchema>
export type InviteTokenParam = z.infer<typeof inviteTokenParamSchema>

export type VouchListQuery = z.infer<typeof vouchListQuerySchema>
export type VouchListStatusFilter = z.infer<typeof vouchListStatusFilterSchema>
export type VouchListSort = z.infer<typeof vouchListSortSchema>
export type VouchDetailVariant = z.infer<typeof vouchDetailVariantSchema>
export type ConfirmPresenceVariant = z.infer<typeof confirmPresenceVariantSchema>

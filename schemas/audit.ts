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

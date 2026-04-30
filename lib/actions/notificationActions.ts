"use server"

import { revalidatePath } from "next/cache"

import { requireActiveUser } from "@/lib/fetchers/authFetchers"
import { assertCapability } from "@/lib/authz/capabilities"
import { prisma } from "@/lib/db/prisma"
import { sendLifecycleEmail } from "@/lib/integrations/email/provider"
import {
  markNotificationFailedTx,
  markNotificationSentTx,
  markNotificationSkippedTx,
  queueNotificationTx,
  retryNotificationTx,
  updateNotificationDeliveryStatusTx,
} from "@/lib/db/transactions/notificationTransactions"
import {
  queueNotificationInputSchema,
  notificationFailureInputSchema,
  sendQueuedNotificationInputSchema,
  updateNotificationDeliveryStatusInputSchema,
} from "@/schemas/notification"
import { actionFailure, actionSuccess, type ActionResult } from "@/types/action-result"
import type { NotificationStatus, NotificationType } from "@/types/notification"

type FieldErrors = Record<string, string[]>

type NotificationActionResult = {
  notificationEventId: string
  type: NotificationType
  channel: "email"
  recipientUserId: string
  vouchId: string | null
  status: NotificationStatus
  providerMessageId: string | null
  errorCode: string | null
  sentAt: string | null
  failedAt: string | null
  createdAt: string
}

type NotificationRecord = {
  id: string
  eventName: string
  channel: "email"
  recipientUserId: string
  vouchId: string | null
  status: string
  providerMessageId: string | null
  errorCode: string | null
  sentAt: Date | null
  failedAt: Date | null
  createdAt: Date
}

function getFieldErrors(error: {
  issues: Array<{ path: PropertyKey[]; message: string }>
}): FieldErrors {
  const fieldErrors: FieldErrors = {}

  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "form")
    fieldErrors[field] ??= []
    fieldErrors[field].push(issue.message)
  }

  return fieldErrors
}

function toNotificationStatus(status: string): NotificationStatus {
  if (status === "queued" || status === "sent" || status === "failed" || status === "skipped") {
    return status
  }

  return "failed"
}

function toNotificationType(eventName: string): NotificationType {
  switch (eventName) {
    case "invite":
    case "vouch_accepted":
    case "confirmation_window_open":
    case "confirmation_recorded":
    case "vouch_completed":
    case "vouch_expired_refunded":
    case "payment_failed":
      return eventName
    default:
      return "payment_failed"
  }
}

function toNotificationActionResult(record: NotificationRecord): NotificationActionResult {
  return {
    notificationEventId: record.id,
    type: toNotificationType(record.eventName),
    channel: record.channel,
    recipientUserId: record.recipientUserId,
    vouchId: record.vouchId,
    status: toNotificationStatus(record.status),
    providerMessageId: record.providerMessageId,
    errorCode: record.errorCode,
    sentAt: record.sentAt ? record.sentAt.toISOString() : null,
    failedAt: record.failedAt ? record.failedAt.toISOString() : null,
    createdAt: record.createdAt.toISOString(),
  }
}

async function revalidateNotificationSurfaces(input: {
  recipientUserId?: string | null
  vouchId?: string | null
}): Promise<void> {
  revalidatePath("/dashboard")
  revalidatePath("/vouches")
  revalidatePath("/admin")
  revalidatePath("/admin/notifications")

  if (input.vouchId) {
    revalidatePath(`/vouches/${input.vouchId}`)
    revalidatePath(`/admin/vouches/${input.vouchId}`)
  }

  if (input.recipientUserId) {
    revalidatePath("/settings")
  }
}

async function resolveRecipientUserId(input: {
  recipientUserId?: string
  recipientEmail?: string
}): Promise<string | null> {
  if (input.recipientUserId) return input.recipientUserId

  if (!input.recipientEmail) return null

  const user = await prisma.user.findFirst({
    where: {
      email: input.recipientEmail,
    },
    select: {
      id: true,
    },
  })

  return user?.id ?? null
}

async function queueLifecycleNotification(
  input: unknown,
  type: NotificationType
): Promise<ActionResult<NotificationActionResult>> {
  const user = await requireActiveUser()

  const parsed = queueNotificationInputSchema.safeParse({
    ...(typeof input === "object" && input ? input : {}),
    type,
    channel: "email",
  })

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the notification queue fields.",
      getFieldErrors(parsed.error)
    )
  }

  const recipientUserId = await resolveRecipientUserId({
    ...(parsed.data.recipientUserId ? { recipientUserId: parsed.data.recipientUserId } : {}),
    ...(parsed.data.recipientEmail ? { recipientEmail: parsed.data.recipientEmail } : {}),
  })

  if (!recipientUserId) {
    return actionFailure("RECIPIENT_NOT_FOUND", "Notification recipient must be an existing user.")
  }

  const queued = await prisma.$transaction(async (tx) => {
    const notification = await queueNotificationTx(tx, {
      type: parsed.data.type,
      channel: parsed.data.channel,
      recipientUserId,
      ...(parsed.data.vouchId ? { vouchId: parsed.data.vouchId } : {}),
    })

    await tx.auditEvent.create({
      data: {
        eventName: "notification.queued",
        actorType: "system",
        actorUserId: user.id,
        entityType: "NotificationEvent",
        entityId: notification.id,
        participantSafe: false,
        metadata: {
          notification_type: parsed.data.type,
          channel: parsed.data.channel,
          ...(parsed.data.vouchId ? { vouch_id: parsed.data.vouchId } : {}),
        },
      },
    })

    return notification
  })

  await revalidateNotificationSurfaces({
    recipientUserId: queued.recipientUserId,
    vouchId: queued.vouchId,
  })

  return actionSuccess(toNotificationActionResult(queued))
}

async function getAuthorizedNotification(input: {
  notificationEventId: string
  requireAdminForNonRecipient?: boolean
}) {
  const user = await requireActiveUser()

  const notification = await prisma.notificationEvent.findUnique({
    where: {
      id: input.notificationEventId,
    },
    select: {
      id: true,
      eventName: true,
      channel: true,
      recipientUserId: true,
      vouchId: true,
      status: true,
      providerMessageId: true,
      errorCode: true,
      sentAt: true,
      failedAt: true,
      createdAt: true,
    },
  })

  if (!notification) {
    return {
      user,
      notification: null,
      failure: actionFailure("NOT_FOUND", "Notification event not found.") as ActionResult<never>,
    }
  }

  if (notification.recipientUserId !== user.id && !user.isAdmin) {
    return {
      user,
      notification,
      failure: actionFailure(
        "AUTHZ_DENIED",
        "You cannot access this notification."
      ) as ActionResult<never>,
    }
  }

  if (input.requireAdminForNonRecipient && notification.recipientUserId !== user.id) {
    assertCapability(user, "retry_safe_technical_operation")
  }

  return {
    user,
    notification,
    failure: null,
  }
}

export async function queueInviteNotification(
  input: unknown
): Promise<ActionResult<NotificationActionResult>> {
  return queueLifecycleNotification(input, "invite")
}

export async function queueVouchAcceptedNotification(
  input: unknown
): Promise<ActionResult<NotificationActionResult>> {
  return queueLifecycleNotification(input, "vouch_accepted")
}

export async function queueConfirmationWindowOpenNotification(
  input: unknown
): Promise<ActionResult<NotificationActionResult>> {
  return queueLifecycleNotification(input, "confirmation_window_open")
}

export async function queueConfirmationRecordedNotification(
  input: unknown
): Promise<ActionResult<NotificationActionResult>> {
  return queueLifecycleNotification(input, "confirmation_recorded")
}

export async function queueVouchCompletedNotification(
  input: unknown
): Promise<ActionResult<NotificationActionResult>> {
  return queueLifecycleNotification(input, "vouch_completed")
}

export async function queueVouchExpiredRefundedNotification(
  input: unknown
): Promise<ActionResult<NotificationActionResult>> {
  return queueLifecycleNotification(input, "vouch_expired_refunded")
}

export async function queuePaymentFailedNotification(
  input: unknown
): Promise<ActionResult<NotificationActionResult>> {
  return queueLifecycleNotification(input, "payment_failed")
}

export async function sendQueuedNotification(
  input: unknown
): Promise<ActionResult<NotificationActionResult>> {
  const parsed = sendQueuedNotificationInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the notification send fields.",
      getFieldErrors(parsed.error)
    )
  }

  const { user, notification, failure } = await getAuthorizedNotification({
    notificationEventId: parsed.data.notificationEventId,
  })

  if (failure) return failure
  if (!notification) return actionFailure("NOT_FOUND", "Notification event not found.")

  if (notification.status !== "queued") {
    return actionFailure("INVALID_NOTIFICATION_STATE", "Only queued notifications can be sent.")
  }

  const sent = await prisma.$transaction(async (tx) => {
    const updated = await markNotificationSentTx(tx, {
      notificationEventId: notification.id,
      providerMessageId: `local:${notification.id}`,
    })

    await tx.auditEvent.create({
      data: {
        eventName: "notification.sent",
        actorType: "system",
        actorUserId: user.id,
        entityType: "NotificationEvent",
        entityId: updated.id,
        participantSafe: false,
        metadata: {
          notification_type: updated.eventName,
          channel: updated.channel,
          ...(updated.vouchId ? { vouch_id: updated.vouchId } : {}),
        },
      },
    })

    return updated
  })

  await revalidateNotificationSurfaces({
    recipientUserId: sent.recipientUserId,
    vouchId: sent.vouchId,
  })

  return actionSuccess(toNotificationActionResult(sent))
}

export async function retryNotification(
  input: unknown
): Promise<ActionResult<NotificationActionResult>> {
  const parsed = sendQueuedNotificationInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the notification retry fields.",
      getFieldErrors(parsed.error)
    )
  }

  const user = await requireActiveUser()
  assertCapability(user, "retry_safe_technical_operation")

  const existing = await prisma.notificationEvent.findUnique({
    where: {
      id: parsed.data.notificationEventId,
    },
    select: {
      id: true,
      status: true,
    },
  })

  if (!existing) {
    return actionFailure("NOT_FOUND", "Notification event not found.")
  }

  const retried = await prisma.$transaction(async (tx) => {
    const updated = await retryNotificationTx(tx, {
      notificationEventId: existing.id,
    })

    await tx.auditEvent.create({
      data: {
        eventName: "admin.retry.started",
        actorType: "admin",
        actorUserId: user.id,
        entityType: "NotificationEvent",
        entityId: updated.id,
        participantSafe: false,
        metadata: {
          operation: "retry_notification_send",
          notification_type: updated.eventName,
        },
      },
    })

    return updated
  })

  await revalidateNotificationSurfaces({
    recipientUserId: retried.recipientUserId,
    vouchId: retried.vouchId,
  })

  return actionSuccess(toNotificationActionResult(retried))
}

export async function updateNotificationDeliveryStatus(
  input: unknown
): Promise<ActionResult<NotificationActionResult>> {
  const parsed = updateNotificationDeliveryStatusInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the notification delivery fields.",
      getFieldErrors(parsed.error)
    )
  }

  const user = await requireActiveUser()
  assertCapability(user, "retry_safe_technical_operation")

  const updated = await prisma.$transaction(async (tx) => {
    const notification = await updateNotificationDeliveryStatusTx(tx, {
      notificationEventId: parsed.data.notificationEventId,
      status: parsed.data.status,
      ...(parsed.data.providerMessageId
        ? { providerMessageId: parsed.data.providerMessageId }
        : {}),
      ...(parsed.data.failureCode ? { failureCode: parsed.data.failureCode } : {}),
    })

    await tx.auditEvent.create({
      data: {
        eventName:
          parsed.data.status === "sent"
            ? "notification.sent"
            : parsed.data.status === "failed"
              ? "notification.failed"
              : "notification.delivery_updated",
        actorType: "system",
        actorUserId: user.id,
        entityType: "NotificationEvent",
        entityId: notification.id,
        participantSafe: false,
        metadata: {
          notification_type: notification.eventName,
          channel: notification.channel,
          status: parsed.data.status,
          ...(parsed.data.failureCode ? { failure_code: parsed.data.failureCode } : {}),
          ...(notification.vouchId ? { vouch_id: notification.vouchId } : {}),
        },
      },
    })

    return notification
  })

  await revalidateNotificationSurfaces({
    recipientUserId: updated.recipientUserId,
    vouchId: updated.vouchId,
  })

  return actionSuccess(toNotificationActionResult(updated))
}

export async function markNotificationFailed(
  input: unknown
): Promise<ActionResult<NotificationActionResult>> {
  const parsed = notificationFailureInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the notification failure fields.",
      getFieldErrors(parsed.error)
    )
  }

  const user = await requireActiveUser()
  assertCapability(user, "retry_safe_technical_operation")

  const failed = await prisma.$transaction(async (tx) => {
    const notification = await markNotificationFailedTx(tx, {
      notificationEventId: parsed.data.notificationEventId,
      ...(parsed.data.failureCode ? { errorCode: parsed.data.failureCode } : {}),
    })

    await tx.auditEvent.create({
      data: {
        eventName: "notification.failed",
        actorType: "system",
        actorUserId: user.id,
        entityType: "NotificationEvent",
        entityId: notification.id,
        participantSafe: false,
        metadata: {
          notification_type: notification.eventName,
          channel: notification.channel,
          ...(parsed.data.failureCode ? { failure_code: parsed.data.failureCode } : {}),
          ...(notification.vouchId ? { vouch_id: notification.vouchId } : {}),
        },
      },
    })

    return notification
  })

  await revalidateNotificationSurfaces({
    recipientUserId: failed.recipientUserId,
    vouchId: failed.vouchId,
  })

  return actionSuccess(toNotificationActionResult(failed))
}

export async function markNotificationSkipped(
  input: unknown
): Promise<ActionResult<NotificationActionResult>> {
  const parsed = sendQueuedNotificationInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the notification skip fields.",
      getFieldErrors(parsed.error)
    )
  }

  const user = await requireActiveUser()
  assertCapability(user, "retry_safe_technical_operation")

  const skipped = await prisma.$transaction(async (tx) => {
    const notification = await markNotificationSkippedTx(tx, {
      notificationEventId: parsed.data.notificationEventId,
    })

    await tx.auditEvent.create({
      data: {
        eventName: "notification.skipped",
        actorType: "system",
        actorUserId: user.id,
        entityType: "NotificationEvent",
        entityId: notification.id,
        participantSafe: false,
        metadata: {
          notification_type: notification.eventName,
          channel: notification.channel,
          ...(notification.vouchId ? { vouch_id: notification.vouchId } : {}),
        },
      },
    })

    return notification
  })

  await revalidateNotificationSurfaces({
    recipientUserId: skipped.recipientUserId,
    vouchId: skipped.vouchId,
  })

  return actionSuccess(toNotificationActionResult(skipped))
}

export async function queueDomainNotification(input: {
  type: NotificationType
  recipientUserId: string
  vouchId?: string | null
}) {
  return prisma.notificationEvent.create({
    data: {
      eventName: input.type,
      channel: "email",
      recipientUserId: input.recipientUserId,
      ...(input.vouchId ? { vouchId: input.vouchId } : {}),
      status: "queued",
    },
  })
}

export async function dispatchQueuedNotification(input: { notificationEventId: string }) {
  const notification = await prisma.notificationEvent.findUnique({
    where: { id: input.notificationEventId },
    select: {
      id: true,
      eventName: true,
      recipient: { select: { email: true } },
      vouchId: true,
      status: true,
    },
  })

  if (!notification) throw new Error("NOTIFICATION_NOT_FOUND")
  if (notification.status !== "queued") return notification
  if (!notification.recipient.email) {
    return markNotificationDeliveryResult({
      notificationEventId: notification.id,
      status: "skipped",
      errorCode: "RECIPIENT_EMAIL_MISSING",
    })
  }

  const sent = await sendLifecycleEmail({
    to: notification.recipient.email,
    type: notification.eventName as NotificationType,
    vouchId: notification.vouchId,
  })

  return markNotificationDeliveryResult({
    notificationEventId: notification.id,
    status: "sent",
    providerMessageId: sent.providerMessageId,
  })
}

export async function markNotificationDeliveryResult(input: {
  notificationEventId: string
  status: "sent" | "failed" | "skipped"
  providerMessageId?: string
  errorCode?: string
}) {
  return prisma.notificationEvent.update({
    where: { id: input.notificationEventId },
    data: {
      status: input.status,
      ...(input.providerMessageId ? { providerMessageId: input.providerMessageId } : {}),
      ...(input.errorCode ? { errorCode: input.errorCode } : {}),
      ...(input.status === "sent" ? { sentAt: new Date(), failedAt: null } : {}),
      ...(input.status === "failed" ? { failedAt: new Date() } : {}),
    },
  })
}

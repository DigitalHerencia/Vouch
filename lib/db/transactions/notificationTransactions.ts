import "server-only"

import type { PrismaClient } from "@/prisma/generated/prisma/client"

import type {
  QueueNotificationInput,
  UpdateNotificationDeliveryStatusInput,
} from "@/types/notification"
import {
  queueNotificationInputSchema,
  updateNotificationDeliveryStatusInputSchema,
} from "@/schemas/notification"

type Tx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>

type NotificationEventResult = {
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

const NOTIFICATION_EVENT_SELECT = {
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
} as const

export async function queueNotificationTx(
  tx: Tx,
  input: QueueNotificationInput
): Promise<NotificationEventResult> {
  const parsed = queueNotificationInputSchema.parse(input)

  const recipientUserId = parsed.recipientUserId ?? "system"

  return tx.notificationEvent.create({
    data: {
      eventName: parsed.type,
      channel: parsed.channel,
      recipientUserId,
      ...(parsed.vouchId !== undefined ? { vouchId: parsed.vouchId } : {}),
      status: "queued",
    },
    select: NOTIFICATION_EVENT_SELECT,
  })
}

export async function markNotificationSentTx(
  tx: Tx,
  input: { notificationEventId: string; providerMessageId?: string }
): Promise<NotificationEventResult> {
  return tx.notificationEvent.update({
    where: {
      id: input.notificationEventId,
    },
    data: {
      status: "sent",
      sentAt: new Date(),
      ...(input.providerMessageId !== undefined
        ? { providerMessageId: input.providerMessageId }
        : {}),
      errorCode: null,
    },
    select: NOTIFICATION_EVENT_SELECT,
  })
}

export async function markNotificationFailedTx(
  tx: Tx,
  input: { notificationEventId: string; errorCode?: string }
): Promise<NotificationEventResult> {
  return tx.notificationEvent.update({
    where: {
      id: input.notificationEventId,
    },
    data: {
      status: "failed",
      failedAt: new Date(),
      ...(input.errorCode !== undefined ? { errorCode: input.errorCode } : {}),
    },
    select: NOTIFICATION_EVENT_SELECT,
  })
}

export async function markNotificationSkippedTx(
  tx: Tx,
  input: { notificationEventId: string }
): Promise<NotificationEventResult> {
  return tx.notificationEvent.update({
    where: {
      id: input.notificationEventId,
    },
    data: {
      status: "skipped",
    },
    select: NOTIFICATION_EVENT_SELECT,
  })
}

export async function updateNotificationDeliveryStatusTx(
  tx: Tx,
  input: UpdateNotificationDeliveryStatusInput
): Promise<NotificationEventResult> {
  const parsed = updateNotificationDeliveryStatusInputSchema.parse(input)

  return tx.notificationEvent.update({
    where: {
      id: parsed.notificationEventId,
    },
    data: {
      status: parsed.status,
      ...(parsed.providerMessageId !== undefined
        ? { providerMessageId: parsed.providerMessageId }
        : {}),
      ...(parsed.failureCode !== undefined ? { errorCode: parsed.failureCode } : {}),
      ...(parsed.status === "sent" ? { sentAt: new Date() } : {}),
      ...(parsed.status === "failed" ? { failedAt: new Date() } : {}),
    },
    select: NOTIFICATION_EVENT_SELECT,
  })
}

export async function retryNotificationTx(
  tx: Tx,
  input: { notificationEventId: string }
): Promise<NotificationEventResult> {
  return tx.notificationEvent.update({
    where: {
      id: input.notificationEventId,
    },
    data: {
      status: "queued",
      providerMessageId: null,
      errorCode: null,
      sentAt: null,
      failedAt: null,
    },
    select: NOTIFICATION_EVENT_SELECT,
  })
}

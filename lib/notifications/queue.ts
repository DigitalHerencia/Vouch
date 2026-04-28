import "server-only"

import { prisma } from "@/lib/db/prisma"
import { sendLifecycleEmail } from "@/lib/integrations/email/provider"
import type { NotificationType } from "@/types/notification"

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

import "server-only"

import type { Prisma } from "@/prisma/generated/prisma/client"

export const notificationEventListItemSelect = {
  id: true,
  recipientUserId: true,
  vouchId: true,
  eventName: true,
  channel: true,
  status: true,
  providerMessageId: true,
  errorCode: true,
  createdAt: true,
  sentAt: true,
  failedAt: true,
} as const satisfies Prisma.NotificationEventSelect

export const notificationEventDetailSelect = {
  ...notificationEventListItemSelect,
  recipient: {
    select: {
      id: true,
      email: true,
      displayName: true,
      status: true,
    },
  },
  vouch: {
    select: {
      id: true,
      publicId: true,
      status: true,
      payerId: true,
      payeeId: true,
    },
  },
} as const satisfies Prisma.NotificationEventSelect

export const notificationDeliveryStateSelect = notificationEventListItemSelect

export const vouchNotificationEventsSelect = {
  id: true,
  eventName: true,
  channel: true,
  status: true,
  recipientUserId: true,
  vouchId: true,
  errorCode: true,
  createdAt: true,
  sentAt: true,
  failedAt: true,
} as const satisfies Prisma.NotificationEventSelect

export const adminNotificationEventSelect = notificationEventDetailSelect

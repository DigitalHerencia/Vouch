import "server-only"

import { unstable_noStore as noStore } from "next/cache"

import { requireActiveUser } from "@/lib/fetchers/authFetchers"
import { prisma } from "@/lib/db/prisma"
import {
  adminNotificationEventSelect,
  notificationDeliveryStateSelect,
  notificationEventDetailSelect,
  notificationEventListItemSelect,
  vouchNotificationEventsSelect,
} from "@/lib/db/selects/notification.selects"

const DEFAULT_PAGE_SIZE = 25

const iso = (value: Date | null | undefined) => (value ? value.toISOString() : null)

function mapDates<T>(value: T): T {
  if (!value || typeof value !== "object") return value
  if (value instanceof Date) return iso(value) as T
  if (Array.isArray(value)) return value.map(mapDates) as T

  const out: Record<string, unknown> = {}
  for (const [key, child] of Object.entries(value)) out[key] = mapDates(child)

  return out as T
}

function pageArgs(input?: { page?: number; pageSize?: number }) {
  const page = Math.max(input?.page ?? 1, 1)
  const pageSize = Math.min(Math.max(input?.pageSize ?? DEFAULT_PAGE_SIZE, 1), 100)

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  }
}

async function requireAdmin() {
  const user = await requireActiveUser()

  const isAdmin =
    user.email === process.env.ADMIN_EMAIL ||
    process.env.ADMIN_USER_IDS?.split(",")
      .map((id) => id.trim())
      .includes(user.id)

  if (!isAdmin) throw new Error("ADMIN_UNAUTHORIZED")

  return user
}

async function canReadVouchNotifications(vouchId: string) {
  const user = await requireActiveUser()

  const vouch = await prisma.vouch.findFirst({
    where: {
      id: vouchId,
      OR: [{ payerId: user.id }, { payeeId: user.id }],
    },
    select: { id: true },
  })

  if (vouch) return true

  const isAdmin =
    user.email === process.env.ADMIN_EMAIL ||
    process.env.ADMIN_USER_IDS?.split(",")
      .map((id) => id.trim())
      .includes(user.id)

  return isAdmin
}

export async function listUserNotificationEvents(input?: {
  userId?: string
  status?: string
  page?: number
  pageSize?: number
}) {
  noStore()

  const user = await requireActiveUser()
  const userId = input?.userId ?? user.id

  if (user.id !== userId) return []

  const page = pageArgs(input)

  const rows = await prisma.notificationEvent.findMany({
    where: {
      recipientUserId: userId,
      ...(input?.status ? { status: input.status as any } : {}),
    },
    orderBy: { createdAt: "desc" },
    skip: page.skip,
    take: page.take,
    select: notificationEventListItemSelect,
  })

  return rows.map(mapDates)
}

export async function getNotificationDeliveryState(input: { notificationEventId: string }) {
  noStore()

  const user = await requireActiveUser()

  const event = await prisma.notificationEvent.findFirst({
    where: {
      id: input.notificationEventId,
      recipientUserId: user.id,
    },
    select: notificationDeliveryStateSelect,
  })

  return event ? mapDates(event) : null
}

export async function getNotificationPreferences(userId: string) {
  noStore()

  const user = await requireActiveUser()
  if (user.id !== userId) return null

  return {
    userId,
    channels: {
      email: {
        enabled: true,
        requiredForTransactional: true,
      },
    },
    events: {
      invite: true,
      accepted: true,
      confirmationWindowOpen: true,
      confirmationRecorded: true,
      completed: true,
      expiredRefunded: true,
      paymentFailed: true,
    },
  }
}

export async function listAdminNotificationEvents(input?: {
  status?: string
  eventName?: string
  recipientUserId?: string
  vouchId?: string
  page?: number
  pageSize?: number
}) {
  noStore()
  await requireAdmin()

  const page = pageArgs(input)

  const rows = await prisma.notificationEvent.findMany({
    where: {
      ...(input?.status ? { status: input.status as any } : {}),
      ...(input?.eventName ? { eventName: input.eventName } : {}),
      ...(input?.recipientUserId ? { recipientUserId: input.recipientUserId } : {}),
      ...(input?.vouchId ? { vouchId: input.vouchId } : {}),
    },
    orderBy: { createdAt: "desc" },
    skip: page.skip,
    take: page.take,
    select: adminNotificationEventSelect,
  })

  return rows.map(mapDates)
}

export async function listNotificationEventsForVouch(vouchId: string) {
  noStore()

  const allowed = await canReadVouchNotifications(vouchId)
  if (!allowed) return []

  const rows = await prisma.notificationEvent.findMany({
    where: { vouchId },
    orderBy: { createdAt: "desc" },
    select: vouchNotificationEventsSelect,
  })

  return rows.map(mapDates)
}

export async function getNotificationEventDetail(input: { notificationEventId: string }) {
  noStore()

  const user = await requireActiveUser()

  const ownEvent = await prisma.notificationEvent.findFirst({
    where: {
      id: input.notificationEventId,
      recipientUserId: user.id,
    },
    select: notificationEventDetailSelect,
  })

  if (ownEvent) return mapDates(ownEvent)

  const isAdmin =
    user.email === process.env.ADMIN_EMAIL ||
    process.env.ADMIN_USER_IDS?.split(",")
      .map((id) => id.trim())
      .includes(user.id)

  if (!isAdmin) return null

  return mapDates(
    await prisma.notificationEvent.findUnique({
      where: { id: input.notificationEventId },
      select: adminNotificationEventSelect,
    })
  )
}

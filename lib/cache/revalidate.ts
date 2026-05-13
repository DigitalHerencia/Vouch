import "server-only"

import { revalidatePath, revalidateTag } from "next/cache"

export async function revalidateVouch(vouchId: string): Promise<void> {
  revalidateTag(`vouch:${vouchId}`, "max")
  revalidatePath(`/vouches/${vouchId}`)
}

export async function revalidateUserVouches(userId: string): Promise<void> {
  revalidateTag(`user:${userId}:vouches`, "max")
  revalidatePath("/dashboard")
}

export async function revalidateDashboard(): Promise<void> {
  revalidateTag("dashboard", "max")
  revalidatePath("/dashboard")
}

export async function revalidateAdminOperationalViews(): Promise<void> {
  revalidateTag("admin", "max")
  revalidatePath("/admin")
}

export async function revalidatePayment(paymentId: string): Promise<void> {
  revalidateTag(`payment:${paymentId}`, "max")
  revalidatePath("/admin/payments")
}

export async function revalidateAdminPayments(): Promise<void> {
  revalidateTag("admin:payments", "max")
  revalidatePath("/admin/payments")
}

export async function revalidateAdminUsers(): Promise<void> {
  revalidateTag("admin:users", "max")
  revalidatePath("/admin/users")
}

export async function revalidateAdminWebhooks(): Promise<void> {
  revalidateTag("admin:webhooks", "max")
  revalidatePath("/admin/webhooks")
}

export async function revalidateNotifications(input: {
  userId?: string | null
  vouchId?: string | null
  notificationEventId?: string | null
}): Promise<void> {
  revalidateTag("notifications", "max")
  if (input.userId) revalidateTag(`user:${input.userId}:notifications`, "max")
  if (input.notificationEventId) revalidateTag(`notification:${input.notificationEventId}`, "max")
  revalidatePath("/dashboard")
  if (input.vouchId) revalidatePath(`/vouches/${input.vouchId}`)
}

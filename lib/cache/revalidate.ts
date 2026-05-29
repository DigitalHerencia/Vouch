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

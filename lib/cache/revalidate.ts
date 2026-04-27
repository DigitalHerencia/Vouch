import "server-only"

import { revalidatePath, revalidateTag } from "next/cache"

export async function revalidateVouch(vouchId: string): Promise<void> {
  revalidateTag(`vouch:${vouchId}`)
  revalidatePath(`/vouches/${vouchId}`)
}

export async function revalidateUserVouches(userId: string): Promise<void> {
  revalidateTag(`user:${userId}:vouches`)
  revalidatePath("/vouches")
}

export async function revalidateDashboard(): Promise<void> {
  revalidateTag("dashboard")
  revalidatePath("/dashboard")
}

export async function revalidateAdminOperationalViews(): Promise<void> {
  revalidateTag("admin")
  revalidatePath("/admin")
}

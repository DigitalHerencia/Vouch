"use server"

import { currentUser as getClerkCurrentUser } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

import { mapClerkUserToLocalInput, type LocalUserSyncInput } from "@/lib/auth/clerk"
import { getPostAuthRedirect } from "@/lib/auth/redirects"
import { prisma } from "@/lib/db/prisma"
import {
  createDefaultVerificationProfileTx,
  upsertUserFromClerkTx,
} from "@/lib/db/transactions/authTransactions"

export async function syncClerkUser(input: LocalUserSyncInput) {
  const user = await prisma.$transaction(async (tx) => {
    const syncedUser = await upsertUserFromClerkTx(tx, input)
    await createDefaultVerificationProfileTx(tx, { userId: syncedUser.id })
    await tx.auditEvent.create({
      data: {
        eventName: "user.synced",
        actorType: "auth_provider",
        entityType: "user",
        entityId: syncedUser.id,
        metadata: { clerk_user_id: syncedUser.clerkUserId },
      },
    })
    return syncedUser
  })

  revalidatePath("/dashboard")
  revalidatePath("/setup")
  return { ok: true as const, data: { userId: user.id } }
}

export async function handleClerkWebhook(event: unknown) {
  const { handleVerifiedClerkWebhook } = await import("@/lib/auth/webhooks")
  return handleVerifiedClerkWebhook(event)
}

export async function ensureLocalUserForSession() {
  const clerkUser = await getClerkCurrentUser()
  if (!clerkUser) {
    return { ok: false as const, code: "UNAUTHENTICATED" }
  }

  return syncClerkUser(mapClerkUserToLocalInput(clerkUser))
}

export async function updateLastSignedInAt(): Promise<never> {
  throw new Error("UNSUPPORTED_FIELD: User.lastSignedInAt is not present in the Prisma schema.")
}

export async function resolvePostAuthRedirect(input?: unknown) {
  const params =
    input && typeof input === "object"
      ? (input as {
          redirect_url?: string | string[]
          redirectUrl?: string | string[]
          return_to?: string | string[]
          returnTo?: string | string[]
        })
      : {}

  return { ok: true as const, data: { redirectTo: getPostAuthRedirect(params) } }
}

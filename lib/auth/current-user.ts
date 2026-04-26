import "server-only"

import { auth, currentUser as getClerkCurrentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

import { mapClerkUserToLocalInput } from "@/lib/auth/clerk"
import { prisma } from "@/lib/db/prisma"
import { createDefaultVerificationProfileTx, upsertUserFromClerkTx } from "@/lib/db/transactions/authTransactions"

export type CurrentUser = {
  id: string
  clerkUserId: string
  email: string | null
  phone: string | null
  displayName: string | null
  status: "active" | "disabled"
  isAdmin: boolean
}

function isAdminFromClaims(sessionClaims: unknown): boolean {
  if (!sessionClaims || typeof sessionClaims !== "object") {
    return false
  }

  const claims = sessionClaims as {
    publicMetadata?: { role?: unknown; isAdmin?: unknown }
    metadata?: { role?: unknown; isAdmin?: unknown }
  }
  const metadata = claims.publicMetadata ?? claims.metadata
  return metadata?.role === "admin" || metadata?.isAdmin === true
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const authState = await auth()

  if (!authState.isAuthenticated || !authState.userId) {
    return null
  }

  let user = await prisma.user.findUnique({
    where: { clerkUserId: authState.userId },
    select: {
      id: true,
      clerkUserId: true,
      email: true,
      phone: true,
      displayName: true,
      status: true,
    },
  })

  if (!user) {
    const clerkUser = await getClerkCurrentUser()
    if (!clerkUser) {
      return null
    }

    user = await prisma.$transaction(async (tx) => {
      const syncedUser = await upsertUserFromClerkTx(tx, mapClerkUserToLocalInput(clerkUser))
      await createDefaultVerificationProfileTx(tx, { userId: syncedUser.id })
      await tx.auditEvent.create({
        data: {
          eventName: "user.synced_from_session",
          actorType: "auth_provider",
          entityType: "user",
          entityId: syncedUser.id,
          metadata: { clerk_user_id: syncedUser.clerkUserId },
        },
      })
      return syncedUser
    })
  }

  return {
    ...user,
    isAdmin: isAdminFromClaims(authState.sessionClaims),
  }
}

export async function getCurrentUserId(): Promise<string | null> {
  return (await getCurrentUser())?.id ?? null
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/sign-in")
  }
  return user
}

export async function requireActiveUser(): Promise<CurrentUser> {
  const user = await requireUser()
  if (user.status !== "active") {
    throw new Error("AUTHZ_DENIED: active user required")
  }
  return user
}

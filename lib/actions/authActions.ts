// lib/actions/authActions.ts

"use server"

import { revalidatePath } from "next/cache"
import {
  getCurrentClerkUser,
  mapClerkUserToLocalInput,
  type LocalUserSyncInput,
} from "@/lib/auth/clerk"
import { getPostAuthRedirect } from "@/lib/auth/redirects"
import { prisma } from "@/lib/db/prisma"
import {
  createDefaultVerificationProfileTx,
  recordTermsAcceptanceTx,
  upsertUserFromClerkTx,
} from "@/lib/db/transactions/authTransactions"
import { getClientIpHash, getRequestId, getUserAgentHash } from "@/lib/security/request"

const CURRENT_TERMS_VERSION = "2026-05-22"

async function syncClerkUser(input: LocalUserSyncInput) {
  const user = await prisma.$transaction(async (tx) => {
    const syncedUser = await upsertUserFromClerkTx(tx, input)
    await createDefaultVerificationProfileTx(tx, { userId: syncedUser.id })
    await tx.auditEvent.create({
      data: {
        eventName: "user.synced",
        actorType: "clerk",
        entityType: "user",
        entityId: syncedUser.id,
        metadata: { clerk_user_id: syncedUser.clerkUserId },
      },
    })
    return syncedUser
  })

  revalidatePath("/dashboard")
  return { ok: true as const, data: { userId: user.id } }
}

export async function completeSignUpWithTermsAcceptance(input: { acceptedUserAgreement: boolean }) {
  if (input.acceptedUserAgreement !== true) {
    return {
      ok: false as const,
      code: "TERMS_ACCEPTANCE_REQUIRED" as const,
      message: "You must accept the User Agreement before creating an account.",
    }
  }

  const localUser = await ensureLocalUserForSession()
  if (!localUser.ok) return localUser

  const acceptedAt = new Date()
  const [requestId, ipHash, userAgentHash] = await Promise.all([
    getRequestId(),
    getClientIpHash(),
    getUserAgentHash(),
  ])

  await prisma.$transaction((tx) =>
    recordTermsAcceptanceTx(tx, {
      userId: localUser.data.userId,
      termsVersion: CURRENT_TERMS_VERSION,
      acceptedAt,
      ipHash,
      userAgentHash,
      requestId,
    })
  )

  revalidatePath("/dashboard")
  return { ok: true as const, data: { userId: localUser.data.userId } }
}

async function ensureLocalUserForSession() {
  const clerkUser = await getCurrentClerkUser()
  if (!clerkUser) {
    return { ok: false as const, code: "UNAUTHENTICATED" }
  }

  return syncClerkUser(mapClerkUserToLocalInput(clerkUser))
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

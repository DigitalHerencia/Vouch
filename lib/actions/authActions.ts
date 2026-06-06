// lib/actions/authActions.ts

"use server"

import { revalidatePath } from "next/cache"
import { getCurrentClerkAuth } from "@/lib/auth/clerk"
import { prisma } from "@/lib/db/prisma"
import { recordTermsAcceptanceTx } from "@/lib/db/transactions/authTransactions"
import { getClientIpHash, getRequestId, getUserAgentHash } from "@/lib/security/request"

const CURRENT_TERMS_VERSION = "2026-05-22"

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
  const auth = await getCurrentClerkAuth()
  if (!auth.userId) {
    return { ok: false as const, code: "UNAUTHENTICATED" }
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: auth.userId },
    select: { id: true },
  })
  return user
    ? { ok: true as const, data: { userId: user.id } }
    : {
        ok: false as const,
        code: "LOCAL_USER_SYNC_PENDING" as const,
        message: "Account setup is still syncing. Try again shortly.",
      }
}

import "server-only"

import { requireActiveUser } from "@/lib/auth/current-user"
import { prisma } from "@/lib/db/prisma"
import type { VerificationStatus } from "@/types/verification"

export type VerificationStatusReadModel = {
  identityStatus: VerificationStatus
  adultStatus: VerificationStatus
  provider: "stripe_identity" | null
  providerReference: string | null
  paymentReadiness: "not_started" | "requires_action" | "ready" | "failed"
  payoutReadiness: "not_started" | "requires_action" | "ready" | "restricted" | "failed"
  updatedAt: string | null
}

export async function getVerificationStatus(): Promise<VerificationStatusReadModel> {
  const user = await requireActiveUser()
  const profile = await prisma.verificationProfile.findUnique({
    where: { userId: user.id },
    select: {
      identityStatus: true,
      adultStatus: true,
      provider: true,
      providerReference: true,
      paymentReadiness: true,
      payoutReadiness: true,
      updatedAt: true,
    },
  })

  return {
    identityStatus: profile?.identityStatus ?? "unstarted",
    adultStatus: profile?.adultStatus ?? "unstarted",
    provider: profile?.provider ?? null,
    providerReference: profile?.providerReference ?? null,
    paymentReadiness: profile?.paymentReadiness ?? "not_started",
    payoutReadiness: profile?.payoutReadiness ?? "not_started",
    updatedAt: profile?.updatedAt.toISOString() ?? null,
  }
}

export async function getIdentityVerificationState(): Promise<Pick<VerificationStatusReadModel, "identityStatus" | "provider" | "providerReference" | "updatedAt">> {
  const status = await getVerificationStatus()
  return {
    identityStatus: status.identityStatus,
    provider: status.provider,
    providerReference: status.providerReference,
    updatedAt: status.updatedAt,
  }
}

export async function getAdultVerificationState(): Promise<Pick<VerificationStatusReadModel, "adultStatus" | "provider" | "providerReference" | "updatedAt">> {
  const status = await getVerificationStatus()
  return {
    adultStatus: status.adultStatus,
    provider: status.provider,
    providerReference: status.providerReference,
    updatedAt: status.updatedAt,
  }
}

export async function getVerificationProviderReturnState(): Promise<VerificationStatusReadModel> {
  return getVerificationStatus()
}

export async function getVerificationBlockedState(): Promise<{ blocked: boolean; reason: string | null }> {
  const status = await getVerificationStatus()
  const blocked =
    status.identityStatus === "rejected" ||
    status.identityStatus === "expired" ||
    status.adultStatus === "rejected" ||
    status.adultStatus === "expired"

  return {
    blocked,
    reason: blocked ? "Verification must be completed before payment-backed flows." : null,
  }
}

export async function getVerificationStatusCard(): Promise<VerificationStatusReadModel> {
  return getVerificationStatus()
}

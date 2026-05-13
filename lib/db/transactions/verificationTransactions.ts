import "server-only"

import type { PrismaClient } from "@/prisma/generated/prisma/client"
import type { PaymentReadinessStatus, PayoutReadinessStatus } from "@/types/payment"
import type { VerificationStatus } from "@/types/verification"

type Tx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>

export async function createVerificationProfileTx(tx: Tx, input: { userId: string }) {
  return tx.verificationProfile.upsert({
    where: { userId: input.userId },
    create: { userId: input.userId },
    update: {},
  })
}

export async function updateIdentityVerificationStatusTx(
  tx: Tx,
  input: {
    userId: string
    status: VerificationStatus
    providerReference?: string
    failureCode?: string
  }
) {
  return updateVerificationProfileTx(tx, {
    ...input,
    identityStatus: input.status,
  })
}

export async function updateAdultVerificationStatusTx(
  tx: Tx,
  input: {
    userId: string
    status: VerificationStatus
    providerReference?: string
    failureCode?: string
  }
) {
  return updateVerificationProfileTx(tx, {
    ...input,
    adultStatus: input.status,
  })
}

export async function updateVerificationProviderReferenceTx(
  tx: Tx,
  input: { userId: string; providerReference?: string }
) {
  return updateVerificationProfileTx(tx, input)
}

export async function markVerificationPendingTx(tx: Tx, input: { userId: string }) {
  return updateVerificationProfileTx(tx, {
    userId: input.userId,
    identityStatus: "pending",
    adultStatus: "pending",
  })
}

export async function markVerificationVerifiedTx(tx: Tx, input: { userId: string }) {
  return updateVerificationProfileTx(tx, {
    userId: input.userId,
    identityStatus: "verified",
    adultStatus: "verified",
  })
}

export async function markVerificationRejectedTx(
  tx: Tx,
  input: { userId: string; failureCode?: string }
) {
  return updateVerificationProfileTx(tx, {
    userId: input.userId,
    identityStatus: "rejected",
    adultStatus: "rejected",
    ...(input.failureCode ? { failureCode: input.failureCode } : {}),
  })
}

export async function markVerificationRequiresActionTx(tx: Tx, input: { userId: string }) {
  return updateVerificationProfileTx(tx, {
    userId: input.userId,
    identityStatus: "requires_action",
    adultStatus: "requires_action",
  })
}

export async function markVerificationExpiredTx(tx: Tx, input: { userId: string }) {
  return updateVerificationProfileTx(tx, {
    userId: input.userId,
    identityStatus: "expired",
    adultStatus: "expired",
  })
}

export async function updateVerificationProfileTx(
  tx: Tx,
  input: {
    userId: string
    identityStatus?: VerificationStatus
    adultStatus?: VerificationStatus
    paymentReadiness?: PaymentReadinessStatus
    payoutReadiness?: PayoutReadinessStatus
    providerReference?: string
    failureCode?: string
  }
) {
  return tx.verificationProfile.upsert({
    where: { userId: input.userId },
    create: {
      userId: input.userId,
      identityStatus: input.identityStatus ?? "unstarted",
      adultStatus: input.adultStatus ?? "unstarted",
      paymentReadiness: input.paymentReadiness ?? "not_started",
      payoutReadiness: input.payoutReadiness ?? "not_started",
      provider: input.providerReference ? "stripe_identity" : null,
      providerReference: input.providerReference ?? null,
    },
    update: {
      ...(input.identityStatus ? { identityStatus: input.identityStatus } : {}),
      ...(input.adultStatus ? { adultStatus: input.adultStatus } : {}),
      ...(input.paymentReadiness ? { paymentReadiness: input.paymentReadiness } : {}),
      ...(input.payoutReadiness ? { payoutReadiness: input.payoutReadiness } : {}),
      ...(input.providerReference
        ? { provider: "stripe_identity", providerReference: input.providerReference }
        : {}),
    },
  })
}

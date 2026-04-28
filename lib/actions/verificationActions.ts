"use server"

import { requireActiveUser } from "@/lib/auth/current-user"
import { prisma } from "@/lib/db/prisma"
import { createStripeIdentitySession, refreshStripeIdentityStatus } from "@/lib/integrations/stripe/identity"
import {
  markVerificationPendingTx,
  markVerificationRejectedTx,
  markVerificationRequiresActionTx,
  markVerificationVerifiedTx,
  updateVerificationProfileTx,
} from "@/lib/db/transactions/verificationTransactions"
import {
  verificationProviderReturnInputSchema,
  verificationStartInputSchema,
  verificationStatusUpdateInputSchema,
} from "@/schemas/verification"
import { actionFailure, actionSuccess, type ActionResult } from "@/types/action-result"
import type { VerificationStatusReadModel } from "@/lib/fetchers/verificationFetchers"
import { getVerificationStatus } from "@/lib/fetchers/verificationFetchers"

export async function startIdentityVerification(
  input?: unknown
): Promise<ActionResult<VerificationStatusReadModel>> {
  const user = await requireActiveUser()
  const parsed = verificationStartInputSchema.safeParse({
    kind: "identity",
    ...(typeof input === "object" && input ? input : {}),
  })
  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the verification request.",
      parsed.error.flatten().fieldErrors
    )
  }
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  const session = await createStripeIdentitySession({
    userId: user.id,
    returnUrl: `${appUrl}/settings/verification`,
  })

  await prisma.$transaction(async (tx) => {
    await updateVerificationProfileTx(tx, {
      userId: user.id,
      identityStatus: "pending",
      adultStatus: "pending",
      providerReference: session.providerReference,
    })
    await tx.auditEvent.create({
      data: {
        eventName: "verification.identity.started",
        actorType: "user",
        actorUserId: user.id,
        entityType: "verification_profile",
        entityId: user.id,
        metadata: { provider: "stripe_identity", provider_reference: session.providerReference },
      },
    })
  })
  return actionSuccess(await getVerificationStatus(user.id))
}

export async function startAdultVerification(
  input?: unknown
): Promise<ActionResult<VerificationStatusReadModel>> {
  const user = await requireActiveUser()
  const parsed = verificationStartInputSchema.safeParse({
    kind: "adult",
    ...(typeof input === "object" && input ? input : {}),
  })
  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the verification request.",
      parsed.error.flatten().fieldErrors
    )
  }
  await prisma.$transaction(async (tx) => {
    await updateVerificationProfileTx(tx, {
      userId: user.id,
      adultStatus: "pending",
    })
    await tx.auditEvent.create({
      data: {
        eventName: "verification.adult.started",
        actorType: "user",
        actorUserId: user.id,
        entityType: "verification_profile",
        entityId: user.id,
        metadata: { provider: "stripe_identity" },
      },
    })
  })
  return actionSuccess(await getVerificationStatus(user.id))
}

export async function handleVerificationProviderReturn(
  input: unknown
): Promise<ActionResult<VerificationStatusReadModel>> {
  const user = await requireActiveUser()
  const parsed = verificationProviderReturnInputSchema.safeParse(input)
  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the provider return parameters.",
      parsed.error.flatten().fieldErrors
    )
  }
  return actionSuccess(await getVerificationStatus(user.id))
}

export async function reconcileVerificationProfile(
  input: unknown
): Promise<ActionResult<VerificationStatusReadModel>> {
  const user = await requireActiveUser()
  const parsed = verificationStatusUpdateInputSchema.safeParse({
    userId: user.id,
    ...(typeof input === "object" && input ? input : {}),
  })
  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the verification status update.",
      parsed.error.flatten().fieldErrors
    )
  }
  const profile = await prisma.verificationProfile.findUnique({
    where: { userId: user.id },
    select: { providerReference: true },
  })
  const providerStatus = profile?.providerReference
    ? await refreshStripeIdentityStatus({ providerReference: profile.providerReference })
    : null

  await prisma.$transaction(async (tx) => {
    await updateVerificationProfileTx(tx, {
      userId: user.id,
      ...(providerStatus ? { identityStatus: providerStatus.identityStatus } : {}),
      ...(providerStatus ? { adultStatus: providerStatus.adultStatus } : {}),
      ...(parsed.data.identityStatus ? { identityStatus: parsed.data.identityStatus } : {}),
      ...(parsed.data.adultStatus ? { adultStatus: parsed.data.adultStatus } : {}),
      ...(parsed.data.providerReference
        ? { providerReference: parsed.data.providerReference }
        : {}),
    })
    await tx.auditEvent.create({
      data: {
        eventName: "verification.profile.reconciled",
        actorType: "verification_provider",
        entityType: "verification_profile",
        entityId: user.id,
        metadata: { provider: "stripe_identity" },
      },
    })
  })
  return actionSuccess(await getVerificationStatus(user.id))
}

export async function markVerificationRequiresAction(): Promise<
  ActionResult<VerificationStatusReadModel>
> {
  const user = await requireActiveUser()
  await prisma.$transaction((tx) => markVerificationRequiresActionTx(tx, { userId: user.id }))
  return actionSuccess(await getVerificationStatus(user.id))
}

export async function markVerificationRejected(): Promise<
  ActionResult<VerificationStatusReadModel>
> {
  const user = await requireActiveUser()
  await prisma.$transaction((tx) => markVerificationRejectedTx(tx, { userId: user.id }))
  return actionSuccess(await getVerificationStatus(user.id))
}

export async function markVerificationVerified(): Promise<
  ActionResult<VerificationStatusReadModel>
> {
  const user = await requireActiveUser()
  await prisma.$transaction((tx) => markVerificationVerifiedTx(tx, { userId: user.id }))
  return actionSuccess(await getVerificationStatus(user.id))
}

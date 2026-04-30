"use server"

import type Stripe from "stripe"

import { requireActiveUser } from "@/lib/fetchers/authFetchers"
import { prisma } from "@/lib/db/prisma"
import {
  createStripeIdentitySession,
  refreshStripeIdentityStatus,
} from "@/lib/integrations/stripe/identity"
import {
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
import {
  markProviderWebhookFailed,
  markProviderWebhookIgnored,
  markProviderWebhookProcessed,
  recordProviderWebhookReceived,
} from "@/lib/actions/paymentActions"

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

export async function processStripeIdentityWebhookEvent(event: Stripe.Event) {
  const ledger = await recordProviderWebhookReceived({
    provider: "stripe_identity",
    providerEventId: event.id,
    eventType: event.type,
    safeMetadata: { livemode: event.livemode },
  })

  if (ledger.processed) {
    return { ok: true as const, ignored: true as const, reason: "Already processed." }
  }

  try {
    if (!event.type.startsWith("identity.verification_session.")) {
      await markProviderWebhookIgnored(ledger.id, "Unsupported Stripe Identity event type.")
      return { ok: true as const, ignored: true as const, reason: "Unsupported event type." }
    }

    const session = event.data.object as Stripe.Identity.VerificationSession
    const userId =
      typeof session.metadata?.user_id === "string" ? session.metadata.user_id : undefined

    if (!userId) {
      await markProviderWebhookIgnored(
        ledger.id,
        "Verification session has no local user metadata."
      )
      return { ok: true as const, ignored: true as const, reason: "Missing user metadata." }
    }

    const status = mapStripeIdentityStatus(session.status)

    await prisma.verificationProfile.update({
      where: { userId },
      data: {
        identityStatus: status,
        adultStatus: status === "verified" ? "verified" : status,
        provider: "stripe_identity",
        providerReference: session.id,
      },
    })

    await markProviderWebhookProcessed(ledger.id)
    return { ok: true as const, ignored: false as const }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Stripe Identity webhook processing failed."
    await markProviderWebhookFailed(ledger.id, message)
    return { ok: false as const, message }
  }
}

function mapStripeIdentityStatus(status: Stripe.Identity.VerificationSession["status"]) {
  switch (status) {
    case "verified":
      return "verified" as const
    case "requires_input":
      return "requires_action" as const
    case "processing":
      return "pending" as const
    case "canceled":
      return "expired" as const
    default:
      return "pending" as const
  }
}

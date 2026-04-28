"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { requireActiveUser } from "@/lib/auth/current-user"
import { prisma } from "@/lib/db/prisma"
import { updateUserPrivateAccountInfoTx } from "@/lib/db/transactions/userTransactions"
import { acceptTermsTx } from "@/lib/db/transactions/setupTransactions"
import { CURRENT_TERMS_VERSION } from "@/lib/constants/terms"
import { settingsSearchParamsSchema, updateProfileBasicsInputSchema } from "@/schemas/settings"
import { acceptTermsSchema } from "@/schemas/setup"
import { actionFailure, actionSuccess, type ActionResult } from "@/types/action-result"
import type { PrivateAccountInfo } from "@/types/user"

type FieldErrors = Record<string, string[]>

type AccountReadinessResult = {
  userId: string
  accountStatus: "active" | "disabled"
  identityStatus: "unstarted" | "pending" | "verified" | "rejected" | "requires_action" | "expired"
  adultStatus: "unstarted" | "pending" | "verified" | "rejected" | "requires_action" | "expired"
  paymentReadiness: "not_started" | "requires_action" | "ready" | "failed"
  payoutReadiness: "not_started" | "requires_action" | "ready" | "restricted" | "failed"
  termsAccepted: boolean
  canCreateVouch: boolean
  canAcceptVouch: boolean
}

type SettingsRedirectResult = {
  redirectTo: string
}

type TermsAcceptanceResult = {
  acceptedAt: string
  termsVersion: string
}

const settingsStartFlowSchema = z.object({
  returnTo: z.string().trim().startsWith("/").max(256).optional(),
})

function getFieldErrors(error: {
  issues: Array<{ path: PropertyKey[]; message: string }>
}): FieldErrors {
  const fieldErrors: FieldErrors = {}

  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "form")
    fieldErrors[field] ??= []
    fieldErrors[field].push(issue.message)
  }

  return fieldErrors
}

function normalizeInternalReturnTo(value: string | undefined, fallback: string): string {
  if (!value) return fallback
  if (!value.startsWith("/")) return fallback
  if (value.startsWith("//")) return fallback
  if (value.includes("://")) return fallback
  return value
}

function toPrivateAccountInfo(user: PrivateAccountInfo): PrivateAccountInfo {
  return {
    userId: user.userId,
    status: user.status,
    ...(user.email ? { email: user.email } : {}),
    ...(user.phone ? { phone: user.phone } : {}),
    ...(user.displayName ? { displayName: user.displayName } : {}),
  }
}

export async function updateProfileBasics(
  input: unknown
): Promise<ActionResult<PrivateAccountInfo>> {
  const user = await requireActiveUser()
  const parsed = updateProfileBasicsInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the profile fields.",
      getFieldErrors(parsed.error)
    )
  }

  const updated = await prisma.$transaction(async (tx) => {
    const account = await updateUserPrivateAccountInfoTx(tx, {
      clerkUserId: user.clerkUserId,
      ...(parsed.data.displayName ? { displayName: parsed.data.displayName } : {}),
      ...(parsed.data.phone ? { phone: parsed.data.phone } : {}),
    })

    await tx.auditEvent.create({
      data: {
        eventName: "user.updated",
        actorType: "user",
        actorUserId: user.id,
        entityType: "User",
        entityId: user.id,
        participantSafe: false,
        metadata: {
          updated_fields: Object.keys(parsed.data),
          source: "settings",
        },
      },
    })

    return account
  })

  revalidatePath("/settings")
  revalidatePath("/setup")
  revalidatePath("/dashboard")

  return actionSuccess(toPrivateAccountInfo(updated))
}

export async function refreshAccountReadiness(
  input?: unknown
): Promise<ActionResult<AccountReadinessResult>> {
  const user = await requireActiveUser()
  const parsed = settingsSearchParamsSchema.safeParse(input ?? {})

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the settings refresh fields.",
      getFieldErrors(parsed.error)
    )
  }

  const account = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      status: true,
      verificationProfile: {
        select: {
          identityStatus: true,
          adultStatus: true,
          paymentReadiness: true,
          payoutReadiness: true,
        },
      },
      termsAcceptances: {
        where: {
          termsVersion: CURRENT_TERMS_VERSION,
        },
        select: {
          id: true,
        },
        take: 1,
      },
    },
  })

  if (!account) {
    return actionFailure("NOT_FOUND", "Account not found.")
  }

  const identityStatus = account.verificationProfile?.identityStatus ?? "unstarted"
  const adultStatus = account.verificationProfile?.adultStatus ?? "unstarted"
  const paymentReadiness = account.verificationProfile?.paymentReadiness ?? "not_started"
  const payoutReadiness = account.verificationProfile?.payoutReadiness ?? "not_started"
  const termsAccepted = account.termsAcceptances.length > 0
  const active = account.status === "active"
  const verified = identityStatus === "verified" && adultStatus === "verified"

  revalidatePath("/settings")
  revalidatePath("/setup")

  return actionSuccess({
    userId: account.id,
    accountStatus: account.status,
    identityStatus,
    adultStatus,
    paymentReadiness,
    payoutReadiness,
    termsAccepted,
    canCreateVouch: active && verified && paymentReadiness === "ready" && termsAccepted,
    canAcceptVouch: active && verified && payoutReadiness === "ready" && termsAccepted,
  })
}

export async function startSettingsPaymentSetup(
  input?: unknown
): Promise<ActionResult<SettingsRedirectResult>> {
  const user = await requireActiveUser()
  const parsed = settingsStartFlowSchema.safeParse(input ?? {})

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the payment setup fields.",
      getFieldErrors(parsed.error)
    )
  }

  await prisma.auditEvent.create({
    data: {
      eventName: "setup.payment_started",
      actorType: "user",
      actorUserId: user.id,
      entityType: "PaymentCustomer",
      entityId: user.id,
      participantSafe: false,
      metadata: {
        provider: "stripe",
        source: "settings",
      },
    },
  })

  revalidatePath("/settings")
  revalidatePath("/settings/payment")
  revalidatePath("/setup")

  const returnTo = normalizeInternalReturnTo(parsed.data.returnTo, "/settings/payment")
  redirect(`/settings/payment?returnTo=${encodeURIComponent(returnTo)}`)
}

export async function startSettingsPayoutSetup(
  input?: unknown
): Promise<ActionResult<SettingsRedirectResult>> {
  const user = await requireActiveUser()
  const parsed = settingsStartFlowSchema.safeParse(input ?? {})

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the payout setup fields.",
      getFieldErrors(parsed.error)
    )
  }

  await prisma.auditEvent.create({
    data: {
      eventName: "setup.payout_started",
      actorType: "user",
      actorUserId: user.id,
      entityType: "ConnectedAccount",
      entityId: user.id,
      participantSafe: false,
      metadata: {
        provider: "stripe",
        source: "settings",
      },
    },
  })

  revalidatePath("/settings")
  revalidatePath("/settings/payout")
  revalidatePath("/setup")

  const returnTo = normalizeInternalReturnTo(parsed.data.returnTo, "/settings/payout")
  redirect(`/settings/payout?returnTo=${encodeURIComponent(returnTo)}`)
}

export async function startSettingsVerification(
  input?: unknown
): Promise<ActionResult<SettingsRedirectResult>> {
  const user = await requireActiveUser()
  const parsed = settingsStartFlowSchema.safeParse(input ?? {})

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the verification setup fields.",
      getFieldErrors(parsed.error)
    )
  }

  await prisma.$transaction(async (tx) => {
    await tx.verificationProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        identityStatus: "pending",
        adultStatus: "pending",
      },
      update: {
        identityStatus: "pending",
        adultStatus: "pending",
      },
    })

    await tx.auditEvent.create({
      data: {
        eventName: "setup.verification_started",
        actorType: "user",
        actorUserId: user.id,
        entityType: "VerificationProfile",
        entityId: user.id,
        participantSafe: false,
        metadata: {
          provider: "stripe_identity",
          source: "settings",
        },
      },
    })
  })

  revalidatePath("/settings")
  revalidatePath("/settings/verification")
  revalidatePath("/setup")

  const returnTo = normalizeInternalReturnTo(parsed.data.returnTo, "/settings/verification")
  redirect(`/settings/verification?returnTo=${encodeURIComponent(returnTo)}`)
}

export async function acceptSettingsTerms(
  input: unknown
): Promise<ActionResult<TermsAcceptanceResult>> {
  const user = await requireActiveUser()
  const parsed = acceptTermsSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the terms acceptance fields.",
      getFieldErrors(parsed.error)
    )
  }

  if (parsed.data.termsVersion !== CURRENT_TERMS_VERSION) {
    return actionFailure("TERMS_VERSION_MISMATCH", "Refresh and accept the current terms.")
  }

  const acceptance = await prisma.$transaction(async (tx) => {
    const terms = await acceptTermsTx(tx, {
      userId: user.id,
      termsVersion: parsed.data.termsVersion,
    })

    await tx.auditEvent.create({
      data: {
        eventName: "terms.accepted",
        actorType: "user",
        actorUserId: user.id,
        entityType: "TermsAcceptance",
        entityId: terms.id,
        participantSafe: true,
        metadata: {
          terms_version: parsed.data.termsVersion,
          source: "settings",
        },
      },
    })

    return terms
  })

  revalidatePath("/settings")
  revalidatePath("/setup")
  revalidatePath("/dashboard")
  revalidatePath("/vouches/new")

  return actionSuccess({
    acceptedAt: acceptance.acceptedAt.toISOString(),
    termsVersion: acceptance.termsVersion,
  })
}

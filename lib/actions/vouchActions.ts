"use server"

import { revalidatePath } from "next/cache"

import { getParticipantRoleForVouch } from "@/lib/authz/participants"
import { VOUCH_LIMITS } from "@/lib/constants/limits"
import { prisma } from "@/lib/db/prisma"
import {
  createPresenceConfirmationTx,
  getAggregateConfirmationStatusTx,
} from "@/lib/db/transactions/confirmationTransactions"
import { createVouchTx, updateVouchArchiveStatusTx } from "@/lib/db/transactions/vouchTransactions"
import { getCurrentUserPaymentCustomer, requireActiveUser } from "@/lib/fetchers/authFetchers"
import { assertCreateVouchReadinessReady } from "@/lib/fetchers/readinessFetchers"
import { getVouchParticipantActionState } from "@/lib/fetchers/vouchFetchers"
import { createStripeMerchantCreationFeeCheckout } from "@/lib/integrations/stripe/checkout-sessions"
import { verifyConfirmationCode } from "@/lib/vouch/confirmation-codes"
import { calculateVouchPricing } from "@/lib/vouch/fees"
import {
  archiveVouchSchema,
  confirmCreateVouchInputSchema,
  confirmPresenceInputSchema,
  createVouchDraftInputSchema,
  feePreviewInputSchema,
} from "@/schemas/vouchSchemas"
import { actionFailure, actionSuccess, type ActionResult } from "@/types/action-resultTypes"
import { type VouchPricing } from "@/types/vouchTypes"

type FieldErrorsSource = {
  flatten(): { fieldErrors: Record<string, string[]> }
}

type FeePreview = {
  amountCents: number
  currency: "usd"
  protectedAmountCents: number
  merchantReceivesCents: number
  vouchServiceFeeCents: number
  processingFeeOffsetCents: number
  applicationFeeAmountCents: number
  customerTotalCents: number
  totalCents: number
}

type CreatedVouchResult = {
  vouchId: string
  detailPath: string
  checkoutUrl?: string
}

function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  )
}

function getFieldErrors(error: FieldErrorsSource) {
  return error.flatten().fieldErrors
}

function calculatePricing(amountCents: number): VouchPricing {
  return calculateVouchPricing({ protectedAmountCents: amountCents })
}

function toFeePreview(amountCents: number, currency: "usd"): FeePreview {
  const pricing = amountCents > 0 ? calculatePricing(amountCents) : null

  return {
    amountCents,
    currency,
    protectedAmountCents: pricing?.protectedAmountCents ?? amountCents,
    merchantReceivesCents: pricing?.merchantReceivesCents ?? amountCents,
    vouchServiceFeeCents: pricing?.vouchServiceFeeCents ?? 0,
    processingFeeOffsetCents: pricing?.processingFeeOffsetCents ?? 0,
    applicationFeeAmountCents: pricing?.applicationFeeAmountCents ?? 0,
    customerTotalCents: pricing?.customerTotalCents ?? amountCents,
    totalCents: pricing?.customerTotalCents ?? amountCents,
  }
}

async function mapReadinessFailure(
  assertion: Promise<unknown>
): Promise<ActionResult<never> | null> {
  try {
    await assertion
    return null
  } catch (error) {
    if (!(error instanceof Error)) throw error
    if (error.message.startsWith("READINESS_BLOCKED:")) {
      return actionFailure("READINESS_BLOCKED", "Required account readiness is incomplete.")
    }
    throw error
  }
}

function revalidateVouchSurfaces(vouchId: string): void {
  revalidatePath("/dashboard")
  revalidatePath("/vouches/new")
  revalidatePath(`/vouches/${vouchId}`)
}

export async function calculatePlatformFee(input: unknown): Promise<ActionResult<FeePreview>> {
  const parsed = feePreviewInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure("VALIDATION_FAILED", "Check the amount.", getFieldErrors(parsed.error))
  }

  return actionSuccess(toFeePreview(parsed.data.amountCents, "usd"))
}

export async function validateCreateVouchDraft(input: unknown): Promise<ActionResult<FeePreview>> {
  const parsed = createVouchDraftInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the draft fields.",
      getFieldErrors(parsed.error)
    )
  }

  return actionSuccess(toFeePreview(parsed.data.amountCents, parsed.data.currency))
}

export async function createVouch(input: unknown): Promise<ActionResult<CreatedVouchResult>> {
  const user = await requireActiveUser()
  const readinessFailure = await mapReadinessFailure(assertCreateVouchReadinessReady(user.id))
  if (readinessFailure) return readinessFailure

  const parsed = confirmCreateVouchInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the Vouch fields.",
      getFieldErrors(parsed.error)
    )
  }

  const amountCents = parsed.data.amountCents
  if (amountCents < VOUCH_LIMITS.minAmountCents || amountCents > VOUCH_LIMITS.maxAmountCents) {
    return actionFailure(
      "AMOUNT_OUT_OF_RANGE",
      `Amount must be between ${VOUCH_LIMITS.minAmountCents} and ${VOUCH_LIMITS.maxAmountCents} cents.`
    )
  }

  const pricing = calculatePricing(amountCents)
  const merchantFeeCents = pricing.vouchServiceFeeCents + pricing.processingFeeOffsetCents
  const paymentCustomer = await getCurrentUserPaymentCustomer()

  const vouch = await prisma.$transaction(async (tx) => {
    const created = await createVouchTx(tx, {
      merchantId: user.id,
      currency: parsed.data.currency,
      protectedAmountCents: pricing.protectedAmountCents,
      appointmentStartsAt: parsed.data.appointmentStartsAt,
      confirmationOpensAt: parsed.data.confirmationOpensAt,
      confirmationExpiresAt: parsed.data.confirmationExpiresAt,
      createAsDraft: true,
    })

    await tx.auditEvent.create({
      data: {
        eventName: "vouch.creation_fee_checkout_required",
        actorType: "user",
        actorUserId: user.id,
        entityType: "Vouch",
        entityId: created.id,
        participantSafe: true,
        metadata: {
          protected_amount_cents: pricing.protectedAmountCents,
          merchant_receives_cents: pricing.merchantReceivesCents,
          vouch_service_fee_cents: pricing.vouchServiceFeeCents,
          processing_fee_offset_cents: pricing.processingFeeOffsetCents,
          application_fee_amount_cents: pricing.applicationFeeAmountCents,
          customer_total_cents: pricing.customerTotalCents,
        },
      },
    })

    return created
  })

  const appUrl = getAppUrl()
  const checkout = await createStripeMerchantCreationFeeCheckout({
    vouchId: vouch.id,
    merchantUserId: user.id,
    feeAmountCents: merchantFeeCents,
    protectedAmountCents: pricing.protectedAmountCents,
    currency: parsed.data.currency,
    successUrl: `${appUrl}/vouches/${vouch.id}?merchant_fee=paid`,
    cancelUrl: `${appUrl}/vouches/new?merchant_fee=cancelled`,
    idempotencyKey: `vouch:${vouch.id}:merchant-fee-checkout`,
    ...(paymentCustomer?.stripeCustomerId ? { providerCustomerId: paymentCustomer.stripeCustomerId } : {}),
  })

  revalidateVouchSurfaces(vouch.id)

  return actionSuccess({
    vouchId: vouch.id,
    detailPath: `/vouches/${vouch.id}`,
    ...(checkout.url ? { checkoutUrl: checkout.url } : {}),
  })
}

export async function confirmPresence(input: unknown): Promise<ActionResult<{ vouchId: string }>> {
  const user = await requireActiveUser()
  const parsed = confirmPresenceInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the confirmation fields.",
      getFieldErrors(parsed.error)
    )
  }

  const vouch = await getVouchParticipantActionState(parsed.data.vouchId)

  if (!vouch) return actionFailure("NOT_FOUND", "Vouch not found.")

  const participantRole = getParticipantRoleForVouch({
    userId: user.id,
    merchantId: vouch.merchantId,
    customerId: vouch.customerId,
  })

  if (!participantRole) return actionFailure("AUTHZ_DENIED", "Participant access required.")
  if (!vouch.customerId) return actionFailure("CUSTOMER_REQUIRED", "Customer is required.")

  const counterpartyRole = participantRole === "merchant" ? "customer" : "merchant"
  const counterpartyUserId = participantRole === "merchant" ? vouch.customerId : vouch.merchantId
  const validCode = verifyConfirmationCode({
    vouchId: vouch.id,
    publicId: vouch.publicId,
    participantRole: counterpartyRole,
    participantUserId: counterpartyUserId,
    submittedCode: parsed.data.submittedCode,
    allowedBucketSkew: parsed.data.method === "offline_code_exchange" ? 1 : 0,
  })

  if (!validCode) {
    return actionFailure("INVALID_CONFIRMATION_CODE", "Confirmation code is not valid.")
  }

  try {
    await prisma.$transaction(async (tx) => {
      await createPresenceConfirmationTx(tx, {
        vouchId: parsed.data.vouchId,
        userId: user.id,
        participantRole,
        method: parsed.data.method,
        serverReceivedAt: new Date(),
      })

      const aggregateStatus = await getAggregateConfirmationStatusTx(tx, {
        vouchId: parsed.data.vouchId,
      })

      await tx.auditEvent.create({
        data: {
          eventName: "vouch.presence_confirmed",
          actorType: "user",
          actorUserId: user.id,
          entityType: "Vouch",
          entityId: parsed.data.vouchId,
          participantSafe: true,
          metadata: {
            participant_role: participantRole,
            aggregate_status: aggregateStatus,
          },
        },
      })
    })
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "DUPLICATE_PRESENCE_CONFIRMATION":
          return actionFailure("DUPLICATE_CONFIRMATION", "This participant already confirmed.")
        case "CONFIRMATION_WINDOW_NOT_OPEN":
          return actionFailure("CONFIRMATION_WINDOW_NOT_OPEN", "Confirmation is not open yet.")
        case "CONFIRMATION_WINDOW_CLOSED":
          return actionFailure("CONFIRMATION_WINDOW_CLOSED", "Confirmation window has closed.")
        case "UNAUTHORIZED_CONFIRMATION_PARTICIPANT":
          return actionFailure("AUTHZ_DENIED", "Participant access required.")
        case "VOUCH_NOT_CONFIRMABLE":
          return actionFailure("INVALID_VOUCH_STATE", "This Vouch is not confirmable.")
      }
    }
    throw error
  }

  revalidateVouchSurfaces(parsed.data.vouchId)
  return actionSuccess({ vouchId: parsed.data.vouchId })
}

export async function confirmPresenceFormAction(formData: FormData): Promise<void> {
  await confirmPresence({
    vouchId: String(formData.get("vouchId") ?? ""),
    submittedCode: String(formData.get("submittedCode") ?? ""),
    method: "code_exchange",
  })
}

export async function archiveVouch(input: unknown): Promise<ActionResult<{ vouchId: string }>> {
  const user = await requireActiveUser()
  const parsed = archiveVouchSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure("VALIDATION_FAILED", "Check the Vouch ID.", getFieldErrors(parsed.error))
  }

  const vouch = await getVouchParticipantActionState(parsed.data.vouchId)

  if (!vouch) return actionFailure("NOT_FOUND", "Vouch not found.")

  const participantRole = getParticipantRoleForVouch({
    userId: user.id,
    merchantId: vouch.merchantId,
    customerId: vouch.customerId,
  })

  if (!participantRole) return actionFailure("AUTHZ_DENIED", "Participant access required.")

  await prisma.$transaction(async (tx) => {
    await updateVouchArchiveStatusTx(tx, {
      vouchId: parsed.data.vouchId,
      archiveStatus: "archived",
    })

    await tx.auditEvent.create({
      data: {
        eventName: "vouch.archived",
        actorType: "user",
        actorUserId: user.id,
        entityType: "Vouch",
        entityId: parsed.data.vouchId,
        participantSafe: false,
      },
    })
  })

  revalidateVouchSurfaces(parsed.data.vouchId)
  return actionSuccess({ vouchId: parsed.data.vouchId })
}

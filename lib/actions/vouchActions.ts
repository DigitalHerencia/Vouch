"use server"

import { revalidatePath } from "next/cache"

import { requireActiveUser } from "@/lib/fetchers/authFetchers"
import {
  assertCreateVouchReadinessReady,
  assertAcceptVouchReadinessReady,
} from "@/lib/fetchers/readinessFetchers"
import { getParticipantRoleForVouch } from "@/lib/authz/participants"
import { VOUCH_LIMITS } from "@/lib/constants/limits"
import { prisma } from "@/lib/db/prisma"
import {
  createPresenceConfirmationTx,
  getAggregateConfirmationStatusTx,
} from "@/lib/db/transactions/confirmationTransactions"
import {
  createInvitationTx,
  invalidateInvitationTx,
  markInvitationAcceptedTx,
  markInvitationDeclinedTx,
  markInvitationOpenedTx,
  markInvitationSentTx,
  rotateInvitationTokenHashTx,
} from "@/lib/db/transactions/invitationTransactions"
import {
  bindCustomerToVouchTx,
  createVouchTx,
  expireVouchWithoutCaptureTx,
  markVouchAuthorizedTx,
  markVouchSentTx,
  updateVouchArchiveStatusTx,
} from "@/lib/db/transactions/vouchTransactions"
import { createInvitationToken, hashInvitationToken } from "@/lib/invitations/tokens"
import {
  authorizeVouchPayment,
  captureConfirmedVouchPayment,
  startStripeConnectOnboarding,
  startStripePaymentManagement,
} from "@/lib/actions/paymentActions"
import { calculateVouchPricing, type VouchPricing } from "@/lib/vouch/fees"
import {
  archiveVouchSchema,
  confirmCreateVouchInputSchema,
  confirmPresenceInputSchema,
  createVouchDraftInputSchema,
  feePreviewInputSchema,
} from "@/schemas/vouch"
import { actionFailure, actionSuccess, type ActionResult } from "@/types/action-result"

const INVITATION_TTL_DAYS = 14

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
  invitationId: string
  detailPath: string
}

function invitationExpiresAt(): Date {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + INVITATION_TTL_DAYS)
  return expiresAt
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

    if (
      error.message.startsWith("READINESS_BLOCKED:") ||
      error.message.startsWith("SETUP_BLOCKED:")
    ) {
      return actionFailure("READINESS_BLOCKED", "Required account readiness is incomplete.")
    }

    throw error
  }
}

async function revalidateVouchSurfaces(
  vouchId: string,
  userIds: Array<string | null | undefined> = []
): Promise<void> {
  revalidatePath("/dashboard")
  revalidatePath("/vouches/new")
  revalidatePath(`/vouches/${vouchId}`)

  for (const userId of userIds) {
    if (userId) revalidatePath(`/dashboard?user=${userId}`)
  }
}

async function getInvitationByToken(token: string) {
  return prisma.invitation.findUnique({
    where: { tokenHash: await hashInvitationToken(token) },
    select: {
      id: true,
      vouchId: true,
      recipientEmail: true,
      status: true,
      expiresAt: true,
      vouch: {
        select: {
          id: true,
          merchantId: true,
          customerId: true,
          status: true,
          protectedAmountCents: true,
          currency: true,
          merchantReceivesCents: true,
          vouchServiceFeeCents: true,
          processingFeeOffsetCents: true,
          applicationFeeAmountCents: true,
          customerTotalCents: true,
          paymentRecord: {
            select: {
              id: true,
              status: true,
              settlementStatus: true,
            },
          },
        },
      },
    },
  })
}

type InvitationByToken = Awaited<ReturnType<typeof getInvitationByToken>>
type UsableInvitation = NonNullable<InvitationByToken>

function assertInvitationUsable(
  invitation: InvitationByToken
): asserts invitation is UsableInvitation {
  if (!invitation) throw new Error("INVITATION_NOT_FOUND")
  if (invitation.expiresAt <= new Date()) throw new Error("INVITATION_EXPIRED")
  if (!["created", "sent", "opened"].includes(invitation.status)) {
    throw new Error("INVITATION_NOT_USABLE")
  }
  if (invitation.vouch.status !== "sent" && invitation.vouch.status !== "committed") {
    throw new Error("VOUCH_NOT_ACCEPTABLE")
  }
}

function mapInvitationError(error: unknown): ActionResult<never> | null {
  if (!(error instanceof Error)) return null

  switch (error.message) {
    case "INVITATION_NOT_FOUND":
      return actionFailure("NOT_FOUND", "Invitation not found.")
    case "INVITATION_EXPIRED":
      return actionFailure("INVITATION_EXPIRED", "Invitation expired.")
    case "INVITATION_NOT_USABLE":
      return actionFailure("INVITATION_NOT_USABLE", "Invitation is no longer usable.")
    case "VOUCH_NOT_ACCEPTABLE":
      return actionFailure("INVALID_VOUCH_STATE", "Vouch is not available to accept.")
    default:
      return null
  }
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
  const inviteToken = await createInvitationToken(VOUCH_LIMITS.inviteTokenBytes)
  const tokenHash = await hashInvitationToken(inviteToken)

  const created = await prisma.$transaction(async (tx) => {
    const vouch = await createVouchTx(tx, {
      merchantId: user.id,
      currency: parsed.data.currency,
      protectedAmountCents: pricing.protectedAmountCents,
      merchantReceivesCents: pricing.merchantReceivesCents,
      vouchServiceFeeCents: pricing.vouchServiceFeeCents,
      processingFeeOffsetCents: pricing.processingFeeOffsetCents,
      applicationFeeAmountCents: pricing.applicationFeeAmountCents,
      customerTotalCents: pricing.customerTotalCents,
      appointmentStartsAt: parsed.data.appointmentStartsAt,
      confirmationOpensAt: parsed.data.confirmationOpensAt,
      confirmationExpiresAt: parsed.data.confirmationExpiresAt,
      createAsSent: true,
    })

    const invitation = await createInvitationTx(tx, {
      vouchId: vouch.id,
      recipientEmail: null,
      tokenHash,
      expiresAt: invitationExpiresAt(),
    })

    await markInvitationSentTx(tx, { invitationId: invitation.id })

    await tx.auditEvent.create({
      data: {
        eventName: "vouch.created",
        actorType: "user",
        actorUserId: user.id,
        entityType: "Vouch",
        entityId: vouch.id,
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

    return { vouch, invitation }
  })

  await revalidateVouchSurfaces(created.vouch.id, [user.id])

  return actionSuccess({
    vouchId: created.vouch.id,
    invitationId: created.invitation.id,
    detailPath: `/vouches/${created.vouch.id}`,
  })
}

export async function acceptVouch(input: unknown): Promise<ActionResult<{ vouchId: string }>> {
  const user = await requireActiveUser()
  const readinessFailure = await mapReadinessFailure(assertAcceptVouchReadinessReady(user.id))
  if (readinessFailure) return readinessFailure

  const token = typeof input === "object" && input && "token" in input ? String(input.token) : ""
  const disclaimerAccepted =
    typeof input === "object" && input && "disclaimerAccepted" in input
      ? input.disclaimerAccepted === true
      : false

  if (!token || !disclaimerAccepted) {
    return actionFailure("VALIDATION_FAILED", "Accepting a Vouch requires valid terms acceptance.")
  }

  const invitation = await getInvitationByToken(token)

  try {
    assertInvitationUsable(invitation)
  } catch (error) {
    return (
      mapInvitationError(error) ?? actionFailure("INVALID_INVITATION", "Invitation is not usable.")
    )
  }

  if (invitation.vouch.merchantId === user.id) {
    return actionFailure("SELF_ACCEPT_BLOCKED", "Merchant cannot accept their own Vouch.")
  }

  if (invitation.vouch.customerId) {
    return actionFailure("VOUCH_ALREADY_ACCEPTED", "Vouch already has a customer.")
  }

  const accepted = await prisma.$transaction(async (tx) => {
    const vouch = await bindCustomerToVouchTx(tx, {
      vouchId: invitation.vouch.id,
      customerId: user.id,
    })

    await markInvitationAcceptedTx(tx, { invitationId: invitation.id })

    await tx.auditEvent.create({
      data: {
        eventName: "vouch.accepted",
        actorType: "user",
        actorUserId: user.id,
        entityType: "Vouch",
        entityId: vouch.id,
        participantSafe: true,
      },
    })

    return vouch
  })

  const payment = await authorizeVouchPayment({
    vouchId: accepted.id,
    idempotencyKey: `vouch:${accepted.id}:payment_authorization`,
  })

  if (!payment.ok) {
    await prisma.$transaction(async (tx) => {
      await tx.vouch.update({
        where: { id: accepted.id },
        data: { recoveryStatus: "recovery_required" },
        select: { id: true },
      })

      await tx.auditEvent.create({
        data: {
          eventName: "payment.authorization_failed",
          actorType: "system",
          entityType: "Vouch",
          entityId: accepted.id,
          participantSafe: true,
          metadata: { code: payment.code },
        },
      })
    })

    await revalidateVouchSurfaces(accepted.id, [accepted.merchantId, user.id])
    return actionFailure(
      payment.code ?? "PAYMENT_AUTHORIZATION_FAILED",
      payment.formError ?? "Payment authorization failed."
    )
  }

  await prisma.$transaction(async (tx) => {
    await markVouchAuthorizedTx(tx, { vouchId: accepted.id })

    await tx.auditEvent.create({
      data: {
        eventName: "vouch.authorized",
        actorType: "system",
        entityType: "Vouch",
        entityId: accepted.id,
        participantSafe: true,
      },
    })
  })

  await revalidateVouchSurfaces(accepted.id, [accepted.merchantId, user.id])
  return actionSuccess({ vouchId: accepted.id })
}

export async function declineVouch(input: unknown): Promise<ActionResult<{ vouchId: string }>> {
  const user = await requireActiveUser()
  const token = typeof input === "object" && input && "token" in input ? String(input.token) : ""

  if (!token) return actionFailure("VALIDATION_FAILED", "Invite token is required.")

  const invitation = await getInvitationByToken(token)

  try {
    assertInvitationUsable(invitation)
  } catch (error) {
    return (
      mapInvitationError(error) ?? actionFailure("INVALID_INVITATION", "Invitation is not usable.")
    )
  }

  if (invitation.vouch.merchantId === user.id) {
    return actionFailure("SELF_DECLINE_BLOCKED", "Merchant cannot decline their own Vouch invite.")
  }

  await prisma.$transaction(async (tx) => {
    await markInvitationDeclinedTx(tx, { invitationId: invitation.id })
    await expireVouchWithoutCaptureTx(tx, { vouchId: invitation.vouch.id })

    await tx.auditEvent.create({
      data: {
        eventName: "vouch.declined",
        actorType: "user",
        actorUserId: user.id,
        entityType: "Vouch",
        entityId: invitation.vouch.id,
        participantSafe: true,
      },
    })

  })

  await revalidateVouchSurfaces(invitation.vouch.id, [invitation.vouch.merchantId, user.id])
  return actionSuccess({ vouchId: invitation.vouch.id })
}

export async function markInviteOpened(
  input: unknown
): Promise<ActionResult<{ invitationId: string }>> {
  const token = typeof input === "object" && input && "token" in input ? String(input.token) : ""

  if (!token) return actionFailure("VALIDATION_FAILED", "Invite token is required.")

  const invitation = await getInvitationByToken(token)

  try {
    assertInvitationUsable(invitation)
  } catch (error) {
    return (
      mapInvitationError(error) ?? actionFailure("INVALID_INVITATION", "Invitation is not usable.")
    )
  }

  await prisma.$transaction(async (tx) => {
    await markInvitationOpenedTx(tx, { invitationId: invitation.id })

    await tx.auditEvent.create({
      data: {
        eventName: "vouch.invite.opened",
        actorType: "user",
        entityType: "Invitation",
        entityId: invitation.id,
        participantSafe: true,
      },
    })
  })

  await revalidateVouchSurfaces(invitation.vouchId, [invitation.vouch.merchantId])
  return actionSuccess({ invitationId: invitation.id })
}

export async function confirmPresence(input: unknown): Promise<ActionResult<{ vouchId: string }>> {
  const user = await requireActiveUser()
  const parsed = confirmPresenceInputSchema.safeParse(input)
  let shouldCapture = false

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the confirmation fields.",
      getFieldErrors(parsed.error)
    )
  }

  const vouch = await prisma.vouch.findUnique({
    where: { id: parsed.data.vouchId },
    select: {
      id: true,
      merchantId: true,
      customerId: true,
      status: true,
      confirmationOpensAt: true,
      confirmationExpiresAt: true,
    },
  })

  if (!vouch) return actionFailure("NOT_FOUND", "Vouch not found.")

  const participantRole = getParticipantRoleForVouch({
    userId: user.id,
    merchantId: vouch.merchantId,
    customerId: vouch.customerId,
  })

  if (!participantRole) return actionFailure("AUTHZ_DENIED", "Participant access required.")

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

      if (aggregateStatus === "both_confirmed") {
        shouldCapture = true

        await tx.auditEvent.create({
          data: {
            eventName: "vouch.confirmation_complete",
            actorType: "system",
            entityType: "Vouch",
            entityId: parsed.data.vouchId,
            participantSafe: true,
          },
        })
      }
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
        case "INVALID_CONFIRMATION_METHOD":
          return actionFailure("INVALID_CONFIRMATION_METHOD", "Confirmation method is not valid.")
        case "VOUCH_NOT_CONFIRMABLE":
          return actionFailure("INVALID_VOUCH_STATE", "This Vouch is not confirmable.")
      }
    }

    throw error
  }

  if (shouldCapture) {
    let capture: Awaited<ReturnType<typeof captureConfirmedVouchPayment>>

    try {
      capture = await captureConfirmedVouchPayment({
        vouchId: parsed.data.vouchId,
        idempotencyKey: `vouch:${parsed.data.vouchId}:capture`,
      })
    } catch (error) {
      await revalidateVouchSurfaces(parsed.data.vouchId, [vouch.merchantId, vouch.customerId])
      return actionFailure(
        "PAYMENT_CAPTURE_FAILED",
        error instanceof Error ? error.message : "Payment capture failed."
      )
    }

    if (!capture.ok) {
      await revalidateVouchSurfaces(parsed.data.vouchId, [vouch.merchantId, vouch.customerId])
      return capture
    }
  }

  await revalidateVouchSurfaces(parsed.data.vouchId, [vouch.merchantId, vouch.customerId])
  return actionSuccess({ vouchId: parsed.data.vouchId })
}

export async function archiveVouch(input: unknown): Promise<ActionResult<{ vouchId: string }>> {
  const user = await requireActiveUser()
  const parsed = archiveVouchSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure("VALIDATION_FAILED", "Check the Vouch ID.", getFieldErrors(parsed.error))
  }

  const vouch = await prisma.vouch.findUnique({
    where: { id: parsed.data.vouchId },
    select: {
      id: true,
      merchantId: true,
      customerId: true,
    },
  })

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

  await revalidateVouchSurfaces(parsed.data.vouchId, [vouch.merchantId, vouch.customerId])
  return actionSuccess({ vouchId: parsed.data.vouchId })
}

export async function startConnectRedirect(input?: unknown) {
  return startStripeConnectOnboarding(input)
}

export async function startPaymentRedirect(input?: unknown) {
  return startStripePaymentManagement(input)
}

/**
 * Compatibility aliases retained temporarily for old imports.
 */
export const createVouchAction = createVouch
export const acceptVouchAction = acceptVouch
export const declineVouchAction = declineVouch
export const cancelPendingVouch = archiveVouch
export const preventDuplicateConfirmation = async () => actionSuccess({ ok: true as const })

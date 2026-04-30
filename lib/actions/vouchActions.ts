"use server"

import { revalidatePath } from "next/cache"
import type Stripe from "stripe"

import { requireActiveUser } from "@/lib/fetchers/authFetchers"
import { assertAcceptVouchSetupReady, assertCreateVouchSetupReady } from "@/lib/fetchers/setupFetchers"
import { getParticipantRoleForVouch } from "@/lib/auth/authorization/participants"
import { VOUCH_LIMITS } from "@/lib/constants/limits"
import { prisma } from "@/lib/db/prisma"
import {
  assertNoDuplicateConfirmationTx,
  createPresenceConfirmationTx,
  getAggregateConfirmationStatusTx,
} from "@/lib/actions/transactions/confirmationTransactions"
import {
  createInvitationTx,
  invalidateInvitationTx,
  markInvitationAcceptedTx,
  markInvitationDeclinedTx,
  markInvitationOpenedTx,
  markInvitationSentTx,
  rotateInvitationTokenHashTx,
} from "@/lib/actions/transactions/invitationTransactions"
import { queueNotificationTx } from "@/lib/actions/transactions/notificationTransactions"
import {
  bindPayeeToVouchTx,
  cancelPendingVouchTx,
  createVouchTx,
  markVouchCompletedTx,
  markVouchExpiredTx,
  markVouchFailedTx,
} from "@/lib/actions/transactions/vouchTransactions"
import { createInvitationToken, hashInvitationToken } from "@/lib/invitations/tokens"
import { getStripeServerClient } from "@/lib/integrations/stripe/client"
import {
  initializeStripePaymentForVouch,
  refundOrVoidStripePaymentForVouch,
  releaseStripePaymentForCompletedVouch,
} from "@/lib/actions/stripePaymentActions"
import { calculatePlatformFeeCents } from "@/lib/vouch/fees"
import {
  acceptVouchInputSchema,
  cancelPendingVouchInputSchema,
  confirmPresenceInputSchema,
  createVouchDraftInputSchema,
  createVouchInputSchema,
  declineVouchInputSchema,
  feePreviewInputSchema,
  resendVouchInvitationInputSchema,
  sendVouchInvitationInputSchema,
} from "@/schemas/vouch"
import { actionFailure, actionSuccess, type ActionResult } from "@/types/action-result"

const INVITATION_TTL_DAYS = 14

type FieldErrorsSource = {
  flatten(): { fieldErrors: Record<string, string[]> }
}

type FeePreview = {
  amountCents: number
  currency: "usd"
  platformFeeCents: number
  totalCents: number
}

type CreatedVouchResult = {
  vouchId: string
  invitationId: string
  inviteToken: string
  invitePath: string
  clientSecret: string | null
}

type AggregateConfirmationStatus =
  | "none_confirmed"
  | "payer_confirmed"
  | "payee_confirmed"
  | "both_confirmed"

type InvitationByToken = Awaited<ReturnType<typeof getInvitationByToken>>
type UsableInvitation = NonNullable<InvitationByToken>

function invitationExpiresAt(): Date {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + INVITATION_TTL_DAYS)
  return expiresAt
}

function getFieldErrors(error: FieldErrorsSource) {
  return error.flatten().fieldErrors
}

function calculateFee(amountCents: number): number {
  return calculatePlatformFeeCents({ amountCents })
}

function getDefaultPaymentMethodId(
  customer: Stripe.Response<Stripe.Customer | Stripe.DeletedCustomer>
): string | null {
  if ("deleted" in customer && customer.deleted) return null

  const paymentMethod = customer.invoice_settings.default_payment_method
  if (typeof paymentMethod === "string") return paymentMethod
  return paymentMethod?.id ?? null
}

async function getSetupBlockedFailure(
  assertion: Promise<unknown>
): Promise<ActionResult<never> | null> {
  try {
    await assertion
    return null
  } catch (error) {
    if (!(error instanceof Error)) throw error

    if (error.message.startsWith("SETUP_BLOCKED:")) {
      return actionFailure("SETUP_BLOCKED", "Finish setup before continuing.")
    }

    throw error
  }
}

function isConfirmationWindowOpen(input: { opensAt: Date; expiresAt: Date; now?: Date }): boolean {
  const now = input.now ?? new Date()
  return now >= input.opensAt && now <= input.expiresAt
}

async function revalidateVouchSurfaces(
  vouchId: string,
  userIds: Array<string | null | undefined> = []
): Promise<void> {
  revalidatePath("/dashboard")
  revalidatePath("/vouches")
  revalidatePath(`/vouches/${vouchId}`)
  revalidatePath(`/vouches/${vouchId}/confirm`)

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
          payerId: true,
          payeeId: true,
          status: true,
          amountCents: true,
          currency: true,
          platformFeeCents: true,
          paymentRecord: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      },
    },
  })
}

function assertInvitationUsable(
  invitation: InvitationByToken
): asserts invitation is UsableInvitation {
  if (!invitation) {
    throw new Error("INVITATION_NOT_FOUND")
  }

  if (invitation.expiresAt <= new Date()) {
    throw new Error("INVITATION_EXPIRED")
  }

  if (!["created", "sent", "opened"].includes(invitation.status)) {
    throw new Error("INVITATION_NOT_USABLE")
  }

  if (invitation.vouch.status !== "pending") {
    throw new Error("VOUCH_NOT_PENDING")
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
    case "VOUCH_NOT_PENDING":
      return actionFailure("INVALID_VOUCH_STATE", "Vouch is not pending.")
    default:
      return null
  }
}

export async function calculatePlatformFee(input: unknown): Promise<ActionResult<FeePreview>> {
  const parsed = feePreviewInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure("VALIDATION_FAILED", "Check the amount.", getFieldErrors(parsed.error))
  }

  const amountCents = parsed.data.amountCents
  const platformFeeCents = calculateFee(amountCents)

  return actionSuccess({
    amountCents,
    currency: "usd",
    platformFeeCents,
    totalCents: amountCents + platformFeeCents,
  })
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

  const amountCents = parsed.data.amountCents ?? 0
  const platformFeeCents = amountCents > 0 ? calculateFee(amountCents) : 0

  return actionSuccess({
    amountCents,
    currency: parsed.data.currency,
    platformFeeCents,
    totalCents: amountCents + platformFeeCents,
  })
}

export async function createVouch(input: unknown): Promise<ActionResult<CreatedVouchResult>> {
  const user = await requireActiveUser()
  const setupFailure = await getSetupBlockedFailure(assertCreateVouchSetupReady(user.id))
  if (setupFailure) return setupFailure

  const parsed = createVouchInputSchema.safeParse(input)

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

  const platformFeeCents = calculateFee(amountCents)
  const inviteToken = await createInvitationToken(VOUCH_LIMITS.inviteTokenBytes)
  const tokenHash = await hashInvitationToken(inviteToken)

  const created = await prisma.$transaction(async (tx) => {
    const vouch = await createVouchTx(tx, {
      payerId: user.id,
      amountCents,
      currency: parsed.data.currency,
      platformFeeCents,
      label: parsed.data.label ?? null,
      meetingStartsAt: parsed.data.meetingStartsAt,
      confirmationOpensAt: parsed.data.confirmationOpensAt,
      confirmationExpiresAt: parsed.data.confirmationExpiresAt,
    })

    const invitation = await createInvitationTx(tx, {
      vouchId: vouch.id,
      recipientEmail: parsed.data.recipientEmail ?? null,
      tokenHash,
      expiresAt: invitationExpiresAt(),
    })

    await tx.auditEvent.create({
      data: {
        eventName: "vouch.created",
        actorType: "user",
        actorUserId: user.id,
        entityType: "Vouch",
        entityId: vouch.id,
        participantSafe: true,
        metadata: {
          amount_cents: amountCents,
          currency: parsed.data.currency,
          platform_fee_cents: platformFeeCents,
        },
      },
    })

    return { vouch, invitation }
  })

  await revalidateVouchSurfaces(created.vouch.id, [user.id])

  return actionSuccess({
    vouchId: created.vouch.id,
    invitationId: created.invitation.id,
    inviteToken,
    invitePath: `/vouches/invite/${inviteToken}`,
    clientSecret: null,
  })
}

export async function createVouchInvitation(
  input: unknown
): Promise<ActionResult<{ invitationId: string; inviteToken: string; invitePath: string }>> {
  const user = await requireActiveUser()
  const parsed = sendVouchInvitationInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the invitation fields.",
      getFieldErrors(parsed.error)
    )
  }

  const vouch = await prisma.vouch.findUnique({
    where: { id: parsed.data.vouchId },
    select: { id: true, payerId: true, status: true },
  })

  if (!vouch) return actionFailure("NOT_FOUND", "Vouch not found.")
  if (vouch.payerId !== user.id) return actionFailure("AUTHZ_DENIED", "Payer access required.")
  if (vouch.status !== "pending") {
    return actionFailure("INVALID_VOUCH_STATE", "Only pending Vouches can be invited.")
  }

  const inviteToken = await createInvitationToken(VOUCH_LIMITS.inviteTokenBytes)
  const tokenHash = await hashInvitationToken(inviteToken)

  const invitation = await prisma.$transaction(async (tx) => {
    const created = await createInvitationTx(tx, {
      vouchId: vouch.id,
      recipientEmail: parsed.data.recipientEmail ?? null,
      tokenHash,
      expiresAt: invitationExpiresAt(),
    })

    await tx.auditEvent.create({
      data: {
        eventName: "vouch.invite.sent",
        actorType: "user",
        actorUserId: user.id,
        entityType: "Invitation",
        entityId: created.id,
        participantSafe: true,
      },
    })

    return created
  })

  await revalidateVouchSurfaces(vouch.id, [user.id])

  return actionSuccess({
    invitationId: invitation.id,
    inviteToken,
    invitePath: `/vouches/invite/${inviteToken}`,
  })
}

export async function sendVouchInvitation(
  input: unknown
): Promise<ActionResult<{ invitationId: string }>> {
  const user = await requireActiveUser()
  const parsed = sendVouchInvitationInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the invitation fields.",
      getFieldErrors(parsed.error)
    )
  }

  const invitation = await prisma.invitation.findFirst({
    where: { vouchId: parsed.data.vouchId },
    select: {
      id: true,
      vouch: { select: { id: true, payerId: true, status: true } },
    },
  })

  if (!invitation) return actionFailure("NOT_FOUND", "Invitation not found.")
  if (invitation.vouch.payerId !== user.id)
    return actionFailure("AUTHZ_DENIED", "Payer access required.")
  if (invitation.vouch.status !== "pending") {
    return actionFailure("INVALID_VOUCH_STATE", "Only pending Vouches can be sent.")
  }

  await prisma.$transaction(async (tx) => {
    await markInvitationSentTx(tx, { invitationId: invitation.id })

    await tx.auditEvent.create({
      data: {
        eventName: "vouch.invite.sent",
        actorType: "user",
        actorUserId: user.id,
        entityType: "Invitation",
        entityId: invitation.id,
        participantSafe: true,
      },
    })
  })

  await revalidateVouchSurfaces(parsed.data.vouchId, [user.id])
  return actionSuccess({ invitationId: invitation.id })
}

export async function resendVouchInvitation(
  input: unknown
): Promise<ActionResult<{ invitationId: string; inviteToken: string; invitePath: string }>> {
  const user = await requireActiveUser()
  const parsed = resendVouchInvitationInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the invitation fields.",
      getFieldErrors(parsed.error)
    )
  }

  const invitation = await prisma.invitation.findUnique({
    where: { id: parsed.data.invitationId },
    select: {
      id: true,
      vouchId: true,
      recipientEmail: true,
      vouch: { select: { payerId: true, status: true } },
    },
  })

  if (!invitation) return actionFailure("NOT_FOUND", "Invitation not found.")
  if (invitation.vouch.payerId !== user.id)
    return actionFailure("AUTHZ_DENIED", "Payer access required.")
  if (invitation.vouch.status !== "pending") {
    return actionFailure("INVALID_VOUCH_STATE", "Only pending Vouches can be resent.")
  }

  const inviteToken = await createInvitationToken(VOUCH_LIMITS.inviteTokenBytes)
  const tokenHash = await hashInvitationToken(inviteToken)

  await prisma.$transaction(async (tx) => {
    await rotateInvitationTokenHashTx(tx, {
      invitationId: invitation.id,
      tokenHash,
      expiresAt: invitationExpiresAt(),
    })

    await markInvitationSentTx(tx, { invitationId: invitation.id })

    await tx.auditEvent.create({
      data: {
        eventName: "vouch.invite.sent",
        actorType: "user",
        actorUserId: user.id,
        entityType: "Invitation",
        entityId: invitation.id,
        participantSafe: true,
      },
    })
  })

  await revalidateVouchSurfaces(invitation.vouchId, [user.id])

  return actionSuccess({
    invitationId: invitation.id,
    inviteToken,
    invitePath: `/vouches/invite/${inviteToken}`,
  })
}

export async function invalidateVouchInvitation(
  input: unknown
): Promise<ActionResult<{ invitationId: string }>> {
  const user = await requireActiveUser()
  const parsed = resendVouchInvitationInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the invitation fields.",
      getFieldErrors(parsed.error)
    )
  }

  const invitation = await prisma.invitation.findUnique({
    where: { id: parsed.data.invitationId },
    select: {
      id: true,
      vouchId: true,
      vouch: { select: { payerId: true, status: true } },
    },
  })

  if (!invitation) return actionFailure("NOT_FOUND", "Invitation not found.")
  if (invitation.vouch.payerId !== user.id)
    return actionFailure("AUTHZ_DENIED", "Payer access required.")
  if (invitation.vouch.status !== "pending") {
    return actionFailure(
      "INVALID_VOUCH_STATE",
      "Only pending Vouch invitations can be invalidated."
    )
  }

  await prisma.$transaction(async (tx) => {
    await invalidateInvitationTx(tx, { invitationId: invitation.id })

    await tx.auditEvent.create({
      data: {
        eventName: "vouch.canceled",
        actorType: "user",
        actorUserId: user.id,
        entityType: "Invitation",
        entityId: invitation.id,
        participantSafe: true,
      },
    })
  })

  await revalidateVouchSurfaces(invitation.vouchId, [user.id])
  return actionSuccess({ invitationId: invitation.id })
}

export async function markInviteOpened(
  input: unknown
): Promise<ActionResult<{ invitationId: string }>> {
  const parsed = acceptVouchInputSchema.pick({ token: true }).safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the invite token.",
      getFieldErrors(parsed.error)
    )
  }

  const invitation = await getInvitationByToken(parsed.data.token)

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

  await revalidateVouchSurfaces(invitation.vouchId, [invitation.vouch.payerId])
  return actionSuccess({ invitationId: invitation.id })
}

export async function acceptVouch(input: unknown): Promise<ActionResult<{ vouchId: string }>> {
  const user = await requireActiveUser()
  const setupFailure = await getSetupBlockedFailure(assertAcceptVouchSetupReady(user.id))
  if (setupFailure) return setupFailure

  const parsed = acceptVouchInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the acceptance fields.",
      getFieldErrors(parsed.error)
    )
  }

  const invitation = await getInvitationByToken(parsed.data.token)

  try {
    assertInvitationUsable(invitation)
  } catch (error) {
    return (
      mapInvitationError(error) ?? actionFailure("INVALID_INVITATION", "Invitation is not usable.")
    )
  }

  if (invitation.vouch.payerId === user.id) {
    return actionFailure("SELF_ACCEPT_BLOCKED", "Payer cannot accept their own Vouch.")
  }

  if (invitation.vouch.payeeId) {
    return actionFailure("VOUCH_ALREADY_ACCEPTED", "Vouch already has a payee.")
  }

  let vouch: Awaited<ReturnType<typeof bindPayeeToVouchTx>>

  try {
    vouch = await prisma.$transaction(async (tx) => {
      const accepted = await bindPayeeToVouchTx(tx, {
        vouchId: invitation.vouch.id,
        payeeId: user.id,
      })

      await markInvitationAcceptedTx(tx, { invitationId: invitation.id })

      await tx.auditEvent.create({
        data: {
          eventName: "vouch.accepted",
          actorType: "user",
          actorUserId: user.id,
          entityType: "Vouch",
          entityId: accepted.id,
          participantSafe: true,
        },
      })

      await queueNotificationTx(tx, {
        type: "vouch_accepted",
        channel: "email",
        recipientUserId: accepted.payerId,
        vouchId: accepted.id,
      })

      return accepted
    })
  } catch (error) {
    if (error instanceof Error && error.message === "VOUCH_ACCEPTANCE_CONFLICT") {
      return actionFailure(
        "VOUCH_ACCEPTANCE_CONFLICT",
        "This Vouch is no longer available to accept."
      )
    }

    throw error
  }

  const paymentContext = await prisma.vouch.findUnique({
    where: { id: vouch.id },
    select: {
      id: true,
      amountCents: true,
      currency: true,
      platformFeeCents: true,
      payer: {
        select: {
          paymentCustomer: {
            select: {
              providerCustomerId: true,
            },
          },
        },
      },
      payee: {
        select: {
          connectedAccount: {
            select: {
              providerAccountId: true,
            },
          },
        },
      },
    },
  })

  const providerCustomerId = paymentContext?.payer.paymentCustomer?.providerCustomerId
  const connectedAccountId = paymentContext?.payee?.connectedAccount?.providerAccountId

  if (!paymentContext || !providerCustomerId || !connectedAccountId) {
    await markVouchFailed({ vouchId: vouch.id })
    return actionFailure(
      "PAYMENT_SETUP_INCOMPLETE",
      "Both payment setup and payout setup are required before acceptance can complete."
    )
  }

  const stripeCustomer = await getStripeServerClient().customers.retrieve(providerCustomerId, {
    expand: ["invoice_settings.default_payment_method"],
  })
  const providerPaymentMethodId = getDefaultPaymentMethodId(stripeCustomer)

  if (!providerPaymentMethodId) {
    await markVouchFailed({ vouchId: vouch.id })
    return actionFailure(
      "PAYMENT_METHOD_REQUIRED",
      "Payer payment method must be ready before acceptance can complete."
    )
  }

  const payment = await initializeStripePaymentForVouch({
    vouchId: paymentContext.id,
    amountCents: paymentContext.amountCents,
    currency: paymentContext.currency,
    platformFeeCents: paymentContext.platformFeeCents,
    providerCustomerId,
    providerPaymentMethodId,
    connectedAccountId,
    confirmOffSession: true,
  })

  if (!payment.ok) {
    await prisma.$transaction(async (tx) => {
      await markVouchFailedTx(tx, { vouchId: vouch.id })

      await tx.auditEvent.create({
        data: {
          eventName: "payment.failed",
          actorType: "system",
          entityType: "PaymentRecord",
          entityId: vouch.id,
          participantSafe: true,
          metadata: {
            code: payment.code,
            stage: "accept",
          },
        },
      })
    })

    await revalidateVouchSurfaces(vouch.id, [vouch.payerId, user.id])
    return actionFailure(payment.code, payment.message)
  }

  await revalidateVouchSurfaces(vouch.id, [vouch.payerId, user.id])
  return actionSuccess({ vouchId: vouch.id })
}

export async function declineVouch(input: unknown): Promise<ActionResult<{ vouchId: string }>> {
  const user = await requireActiveUser()
  const parsed = declineVouchInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the decline fields.",
      getFieldErrors(parsed.error)
    )
  }

  const invitation = await getInvitationByToken(parsed.data.token)

  try {
    assertInvitationUsable(invitation)
  } catch (error) {
    return (
      mapInvitationError(error) ?? actionFailure("INVALID_INVITATION", "Invitation is not usable.")
    )
  }

  if (invitation.vouch.payerId === user.id) {
    return actionFailure("SELF_DECLINE_BLOCKED", "Payer cannot decline their own Vouch invite.")
  }

  await prisma.$transaction(async (tx) => {
    await markInvitationDeclinedTx(tx, { invitationId: invitation.id })

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

    await queueNotificationTx(tx, {
      type: "vouch_expired_refunded",
      channel: "email",
      recipientUserId: invitation.vouch.payerId,
      vouchId: invitation.vouch.id,
    })
  })

  await revalidateVouchSurfaces(invitation.vouch.id, [invitation.vouch.payerId, user.id])
  return actionSuccess({ vouchId: invitation.vouch.id })
}

export async function cancelPendingVouch(
  input: unknown
): Promise<ActionResult<{ vouchId: string }>> {
  const user = await requireActiveUser()
  const parsed = cancelPendingVouchInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the cancellation fields.",
      getFieldErrors(parsed.error)
    )
  }

  const vouch = await prisma.vouch.findUnique({
    where: { id: parsed.data.vouchId },
    select: {
      id: true,
      payerId: true,
      payeeId: true,
      status: true,
      paymentRecord: { select: { id: true } },
    },
  })

  if (!vouch) return actionFailure("NOT_FOUND", "Vouch not found.")
  if (vouch.payerId !== user.id) return actionFailure("AUTHZ_DENIED", "Payer access required.")
  if (vouch.status !== "pending") {
    return actionFailure("INVALID_VOUCH_STATE", "Only pending Vouches can be canceled.")
  }

  const refundResult = vouch.paymentRecord
    ? await refundOrVoidStripePaymentForVouch({
        paymentRecordId: vouch.paymentRecord.id,
        reason: "canceled_before_acceptance",
      })
    : { ok: true as const }

  if (!refundResult.ok) {
    return actionFailure(refundResult.code, refundResult.message)
  }

  await prisma.$transaction(async (tx) => {
    await cancelPendingVouchTx(tx, { vouchId: vouch.id })

    await tx.auditEvent.create({
      data: {
        eventName: "vouch.canceled",
        actorType: "user",
        actorUserId: user.id,
        entityType: "Vouch",
        entityId: vouch.id,
        participantSafe: true,
      },
    })
  })

  await revalidateVouchSurfaces(vouch.id, [vouch.payerId, vouch.payeeId])
  return actionSuccess({ vouchId: vouch.id })
}

export async function preventDuplicateConfirmation(
  input: unknown
): Promise<ActionResult<{ ok: true }>> {
  const user = await requireActiveUser()
  const parsed = confirmPresenceInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the confirmation fields.",
      getFieldErrors(parsed.error)
    )
  }

  const vouch = await prisma.vouch.findUnique({
    where: { id: parsed.data.vouchId },
    select: { payerId: true, payeeId: true },
  })

  if (!vouch) return actionFailure("NOT_FOUND", "Vouch not found.")

  const participantRole = getParticipantRoleForVouch({
    userId: user.id,
    payerId: vouch.payerId,
    payeeId: vouch.payeeId,
  })

  if (!participantRole) return actionFailure("AUTHZ_DENIED", "Participant access required.")

  try {
    await prisma.$transaction((tx) =>
      assertNoDuplicateConfirmationTx(tx, {
        vouchId: parsed.data.vouchId,
        userId: user.id,
        participantRole,
      })
    )
  } catch (error) {
    if (error instanceof Error && error.message === "DUPLICATE_PRESENCE_CONFIRMATION") {
      return actionFailure("DUPLICATE_CONFIRMATION", "Presence has already been confirmed.")
    }

    throw error
  }

  return actionSuccess({ ok: true })
}

export async function recordPresenceConfirmation(
  input: unknown
): Promise<ActionResult<{ confirmationId: string }>> {
  const user = await requireActiveUser()
  const parsed = confirmPresenceInputSchema.safeParse(input)

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
      payerId: true,
      payeeId: true,
      status: true,
      confirmationOpensAt: true,
      confirmationExpiresAt: true,
    },
  })

  if (!vouch) return actionFailure("NOT_FOUND", "Vouch not found.")
  if (vouch.status !== "active") return actionFailure("INVALID_VOUCH_STATE", "Vouch is not active.")

  const participantRole = getParticipantRoleForVouch({
    userId: user.id,
    payerId: vouch.payerId,
    payeeId: vouch.payeeId,
  })

  if (!participantRole) return actionFailure("AUTHZ_DENIED", "Participant access required.")

  if (
    !isConfirmationWindowOpen({
      opensAt: vouch.confirmationOpensAt,
      expiresAt: vouch.confirmationExpiresAt,
    })
  ) {
    return actionFailure("CONFIRMATION_WINDOW_CLOSED", "Confirmation window is not open.")
  }

  try {
    const confirmation = await prisma.$transaction(async (tx) => {
      const created = await createPresenceConfirmationTx(tx, {
        vouchId: vouch.id,
        userId: user.id,
        participantRole,
        method: parsed.data.method,
      })

      await tx.auditEvent.create({
        data: {
          eventName:
            participantRole === "payer" ? "vouch.payer_confirmed" : "vouch.payee_confirmed",
          actorType: "user",
          actorUserId: user.id,
          entityType: "PresenceConfirmation",
          entityId: created.id,
          participantSafe: true,
        },
      })

      return created
    })

    await revalidateVouchSurfaces(vouch.id, [vouch.payerId, vouch.payeeId])
    return actionSuccess({ confirmationId: confirmation.id })
  } catch (error) {
    if (error instanceof Error && error.message === "DUPLICATE_PRESENCE_CONFIRMATION") {
      return actionFailure("DUPLICATE_CONFIRMATION", "Presence has already been confirmed.")
    }

    if (error instanceof Error && error.message === "CONFIRMATION_WINDOW_NOT_OPEN") {
      return actionFailure("CONFIRMATION_WINDOW_NOT_OPEN", "Confirmation window is not open yet.")
    }

    if (error instanceof Error && error.message === "CONFIRMATION_WINDOW_CLOSED") {
      return actionFailure("CONFIRMATION_WINDOW_CLOSED", "Confirmation window is closed.")
    }

    throw error
  }
}

export async function evaluateAggregateConfirmation(
  input: unknown
): Promise<ActionResult<{ vouchId: string; aggregateStatus: AggregateConfirmationStatus }>> {
  const parsed = cancelPendingVouchInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the Vouch fields.",
      getFieldErrors(parsed.error)
    )
  }

  const aggregateStatus = await prisma.$transaction((tx) =>
    getAggregateConfirmationStatusTx(tx, { vouchId: parsed.data.vouchId })
  )

  return actionSuccess({ vouchId: parsed.data.vouchId, aggregateStatus })
}

export async function completeVouchIfBothConfirmed(
  input: unknown
): Promise<ActionResult<{ vouchId: string }>> {
  const parsed = cancelPendingVouchInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the Vouch fields.",
      getFieldErrors(parsed.error)
    )
  }

  const vouch = await prisma.vouch.findUnique({
    where: { id: parsed.data.vouchId },
    select: {
      id: true,
      payerId: true,
      payeeId: true,
      status: true,
      paymentRecord: { select: { id: true } },
    },
  })

  if (!vouch) return actionFailure("NOT_FOUND", "Vouch not found.")
  if (vouch.status !== "active") return actionFailure("INVALID_VOUCH_STATE", "Vouch is not active.")
  if (!vouch.paymentRecord)
    return actionFailure("PAYMENT_RECORD_NOT_READY", "Payment record is not ready.")

  const aggregateStatus = await prisma.$transaction((tx) =>
    getAggregateConfirmationStatusTx(tx, { vouchId: vouch.id })
  )

  if (aggregateStatus !== "both_confirmed") {
    return actionFailure(
      "DUAL_CONFIRMATION_REQUIRED",
      "Both parties must confirm before funds release."
    )
  }

  const release = await releaseStripePaymentForCompletedVouch({
    paymentRecordId: vouch.paymentRecord.id,
  })

  if (!release.ok) {
    await markVouchFailed({ vouchId: vouch.id })
    return actionFailure(release.code, release.message)
  }

  const completed = await prisma.$transaction(async (tx) => {
    const updated = await markVouchCompletedTx(tx, { vouchId: vouch.id })

    await tx.auditEvent.create({
      data: {
        eventName: "vouch.completed",
        actorType: "system",
        entityType: "Vouch",
        entityId: vouch.id,
        participantSafe: true,
      },
    })

    await queueNotificationTx(tx, {
      type: "vouch_completed",
      channel: "email",
      recipientUserId: vouch.payerId,
      vouchId: vouch.id,
    })

    if (vouch.payeeId) {
      await queueNotificationTx(tx, {
        type: "vouch_completed",
        channel: "email",
        recipientUserId: vouch.payeeId,
        vouchId: vouch.id,
      })
    }

    return updated
  })

  await revalidateVouchSurfaces(completed.id, [completed.payerId, completed.payeeId])
  return actionSuccess({ vouchId: completed.id })
}

export async function confirmPresence(
  input: unknown
): Promise<ActionResult<{ vouchId: string; completed: boolean }>> {
  const confirmation = await recordPresenceConfirmation(input)

  if (!confirmation.ok) {
    return actionFailure(
      confirmation.code ?? "CONFIRMATION_FAILED",
      confirmation.formError ?? "Presence confirmation failed.",
      confirmation.fieldErrors
    )
  }

  const parsed = confirmPresenceInputSchema.parse(input)
  const completion = await completeVouchIfBothConfirmed({ vouchId: parsed.vouchId })

  if (!completion.ok && completion.code !== "DUAL_CONFIRMATION_REQUIRED") {
    return actionFailure(
      completion.code ?? "CONFIRMATION_RECORDED_RESOLUTION_FAILED",
      completion.formError ?? "Confirmation was recorded, but resolution failed.",
      completion.fieldErrors
    )
  }

  return actionSuccess({ vouchId: parsed.vouchId, completed: completion.ok })
}

export async function expireVouch(input: unknown): Promise<ActionResult<{ vouchId: string }>> {
  const parsed = cancelPendingVouchInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the Vouch fields.",
      getFieldErrors(parsed.error)
    )
  }

  const vouch = await prisma.vouch.findUnique({
    where: { id: parsed.data.vouchId },
    select: {
      id: true,
      payerId: true,
      payeeId: true,
      status: true,
      confirmationExpiresAt: true,
      paymentRecord: { select: { id: true } },
    },
  })

  if (!vouch) return actionFailure("NOT_FOUND", "Vouch not found.")

  if (!["pending", "active"].includes(vouch.status)) {
    return actionFailure("INVALID_VOUCH_STATE", "Only unresolved Vouches can expire.")
  }

  if (vouch.confirmationExpiresAt > new Date()) {
    return actionFailure("CONFIRMATION_WINDOW_OPEN", "Vouch has not reached expiration.")
  }

  const aggregateStatus = await prisma.$transaction((tx) =>
    getAggregateConfirmationStatusTx(tx, { vouchId: vouch.id })
  )

  if (aggregateStatus === "both_confirmed") {
    return completeVouchIfBothConfirmed({ vouchId: vouch.id })
  }

  if (vouch.paymentRecord) {
    const refund = await refundOrVoidStripePaymentForVouch({
      paymentRecordId: vouch.paymentRecord.id,
      reason: vouch.status === "pending" ? "not_accepted" : "confirmation_incomplete",
    })

    if (!refund.ok) {
      await markVouchFailed({ vouchId: vouch.id })
      return actionFailure(refund.code, refund.message)
    }
  }

  const expired = await prisma.$transaction(async (tx) => {
    const updated = await markVouchExpiredTx(tx, { vouchId: vouch.id })

    await tx.auditEvent.create({
      data: {
        eventName: "vouch.expired",
        actorType: "system",
        entityType: "Vouch",
        entityId: vouch.id,
        participantSafe: true,
        metadata: { aggregate_confirmation_status: aggregateStatus },
      },
    })

    await tx.auditEvent.create({
      data: {
        eventName: "vouch.refunded",
        actorType: "system",
        entityType: "Vouch",
        entityId: vouch.id,
        participantSafe: true,
      },
    })

    await queueNotificationTx(tx, {
      type: "vouch_expired_refunded",
      channel: "email",
      recipientUserId: vouch.payerId,
      vouchId: vouch.id,
    })

    if (vouch.payeeId) {
      await queueNotificationTx(tx, {
        type: "vouch_expired_refunded",
        channel: "email",
        recipientUserId: vouch.payeeId,
        vouchId: vouch.id,
      })
    }

    return updated
  })

  await revalidateVouchSurfaces(expired.id, [expired.payerId, expired.payeeId])
  return actionSuccess({ vouchId: expired.id })
}

export async function expireUnresolvedVouches(): Promise<ActionResult<{ expiredCount: number }>> {
  const candidates = await prisma.vouch.findMany({
    where: {
      status: { in: ["pending", "active"] },
      confirmationExpiresAt: { lte: new Date() },
    },
    select: { id: true },
    take: 50,
    orderBy: { confirmationExpiresAt: "asc" },
  })

  let expiredCount = 0

  for (const candidate of candidates) {
    const result = await expireVouch({ vouchId: candidate.id })
    if (result.ok) expiredCount += 1
  }

  return actionSuccess({ expiredCount })
}

export async function refundExpiredVouch(
  input: unknown
): Promise<ActionResult<{ vouchId: string }>> {
  return expireVouch(input)
}

export async function markVouchFailed(input: unknown): Promise<ActionResult<{ vouchId: string }>> {
  const parsed = cancelPendingVouchInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the Vouch fields.",
      getFieldErrors(parsed.error)
    )
  }

  const failed = await prisma.$transaction(async (tx) => {
    const updated = await markVouchFailedTx(tx, { vouchId: parsed.data.vouchId })

    await tx.auditEvent.create({
      data: {
        eventName: "vouch.failed",
        actorType: "system",
        entityType: "Vouch",
        entityId: updated.id,
        participantSafe: true,
      },
    })

    return updated
  })

  await revalidateVouchSurfaces(failed.id, [failed.payerId, failed.payeeId])
  return actionSuccess({ vouchId: failed.id })
}

export async function retryFailedVouchResolution(
  input: unknown
): Promise<ActionResult<{ vouchId: string }>> {
  const parsed = cancelPendingVouchInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the Vouch fields.",
      getFieldErrors(parsed.error)
    )
  }

  const vouch = await prisma.vouch.findUnique({
    where: { id: parsed.data.vouchId },
    select: {
      id: true,
      status: true,
      confirmationExpiresAt: true,
    },
  })

  if (!vouch) return actionFailure("NOT_FOUND", "Vouch not found.")
  if (vouch.status !== "failed")
    return actionFailure("INVALID_VOUCH_STATE", "Only failed Vouches can be retried.")

  if (vouch.confirmationExpiresAt <= new Date()) {
    return expireVouch({ vouchId: vouch.id })
  }

  return completeVouchIfBothConfirmed({ vouchId: vouch.id })
}

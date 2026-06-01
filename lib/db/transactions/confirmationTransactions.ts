import "server-only"

import type { ParticipantRole, PrismaClient } from "@/prisma/generated/prisma/client"

type Tx = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">

type ConfirmationMethod = "code_exchange" | "offline_code_exchange"
type AggregateConfirmationStatus =
  | "none_confirmed"
  | "merchant_confirmed"
  | "customer_confirmed"
  | "both_confirmed"

type VouchIdTxInput = {
  vouchId: string
}

type AssertNoDuplicateConfirmationTxInput = VouchIdTxInput & {
  userId: string
  participantRole: ParticipantRole
}

type CreatePresenceConfirmationTxInput = AssertNoDuplicateConfirmationTxInput & {
  method: ConfirmationMethod
  confirmedAt?: Date
  serverReceivedAt?: Date
  timeBucket?: number | null
  clockSkewAccepted?: boolean
  offlinePayloadHash?: string | null
}

const PRESENCE_CONFIRMATION_SELECT = {
  id: true,
  vouchId: true,
  status: true,
  windowOpensAt: true,
  windowClosesAt: true,
  merchantConfirmedAt: true,
  customerConfirmedAt: true,
  canCaptureAt: true,
  voidedAt: true,
  createdAt: true,
  updatedAt: true,
} as const

function assertNonEmptyString(value: string, fieldName: string): string {
  const trimmed = value.trim()
  if (!trimmed) throw new Error(`INVALID_CONFIRMATION_TX_INPUT: ${fieldName} is required`)
  return trimmed
}

export async function assertNoDuplicateConfirmationTx(
  tx: Tx,
  input: AssertNoDuplicateConfirmationTxInput
): Promise<void> {
  const vouchId = assertNonEmptyString(input.vouchId, "vouchId")
  const presence = await tx.presenceConfirmation.findUnique({
    where: { vouchId },
    select: {
      merchantConfirmedAt: true,
      customerConfirmedAt: true,
    },
  })

  if (!presence) return
  if (input.participantRole === "merchant" && presence.merchantConfirmedAt) {
    throw new Error("DUPLICATE_PRESENCE_CONFIRMATION")
  }
  if (input.participantRole === "customer" && presence.customerConfirmedAt) {
    throw new Error("DUPLICATE_PRESENCE_CONFIRMATION")
  }
}

export async function createPresenceConfirmationTx(
  tx: Tx,
  input: CreatePresenceConfirmationTxInput
) {
  const vouchId = assertNonEmptyString(input.vouchId, "vouchId")
  const userId = assertNonEmptyString(input.userId, "userId")
  const serverReceivedAt = input.serverReceivedAt ?? new Date()
  const confirmedAt = input.confirmedAt ?? serverReceivedAt

  const vouch = await tx.vouch.findUnique({
    where: { id: vouchId },
    select: {
      id: true,
      merchantId: true,
      customerId: true,
      status: true,
      confirmationOpensAt: true,
      confirmationExpiresAt: true,
    },
  })

  if (!vouch) throw new Error("VOUCH_NOT_FOUND")
  if (vouch.status !== "authorized" && vouch.status !== "can_capture") {
    throw new Error("VOUCH_NOT_CONFIRMABLE")
  }
  if (serverReceivedAt < vouch.confirmationOpensAt) throw new Error("CONFIRMATION_WINDOW_NOT_OPEN")
  if (serverReceivedAt > vouch.confirmationExpiresAt) throw new Error("CONFIRMATION_WINDOW_CLOSED")

  const expectedUserId = input.participantRole === "merchant" ? vouch.merchantId : vouch.customerId
  if (!expectedUserId || expectedUserId !== userId) {
    throw new Error("UNAUTHORIZED_CONFIRMATION_PARTICIPANT")
  }

  await assertNoDuplicateConfirmationTx(tx, {
    vouchId,
    userId,
    participantRole: input.participantRole,
  })

  const data =
    input.participantRole === "merchant"
      ? { merchantConfirmedAt: confirmedAt, merchantCodeVerified: true }
      : { customerConfirmedAt: confirmedAt, customerCodeVerified: true }

  const presence = await tx.presenceConfirmation.upsert({
    where: { vouchId },
    create: {
      vouchId,
      status: input.participantRole === "merchant" ? "merchant_confirmed" : "customer_confirmed",
      windowOpensAt: vouch.confirmationOpensAt,
      windowClosesAt: vouch.confirmationExpiresAt,
      ...data,
    },
    update: data,
    select: PRESENCE_CONFIRMATION_SELECT,
  })

  await tx.presenceConfirmationAttempt.create({
    data: {
      presenceConfirmationId: presence.id,
      participantRole: input.participantRole,
      confirmedAt,
      submissionMode: input.method === "offline_code_exchange" ? "offline_sync" : "online",
      payloadHash: input.offlinePayloadHash ?? null,
      nonce: `${input.participantRole}:${serverReceivedAt.getTime()}`,
      accepted: true,
    },
  })

  const aggregate = await getAggregateConfirmationStatusTx(tx, { vouchId })
  if (aggregate === "both_confirmed") {
    return tx.presenceConfirmation.update({
      where: { vouchId },
      data: { status: "can_capture", canCaptureAt: new Date() },
      select: PRESENCE_CONFIRMATION_SELECT,
    })
  }

  return presence
}

export async function getAggregateConfirmationStatusTx(
  tx: Tx,
  input: VouchIdTxInput
): Promise<AggregateConfirmationStatus> {
  const presence = await tx.presenceConfirmation.findUnique({
    where: { vouchId: assertNonEmptyString(input.vouchId, "vouchId") },
    select: {
      merchantConfirmedAt: true,
      customerConfirmedAt: true,
    },
  })

  const merchantConfirmed = Boolean(presence?.merchantConfirmedAt)
  const customerConfirmed = Boolean(presence?.customerConfirmedAt)

  if (merchantConfirmed && customerConfirmed) return "both_confirmed"
  if (merchantConfirmed) return "merchant_confirmed"
  if (customerConfirmed) return "customer_confirmed"
  return "none_confirmed"
}

export async function markConfirmationWindowOpenedTx(tx: Tx, input: VouchIdTxInput): Promise<void> {
  await tx.vouch.updateMany({
    where: {
      id: assertNonEmptyString(input.vouchId, "vouchId"),
      status: "authorized",
      confirmationOpensAt: { lte: new Date() },
      confirmationExpiresAt: { gt: new Date() },
    },
    data: { status: "can_capture" },
  })
}

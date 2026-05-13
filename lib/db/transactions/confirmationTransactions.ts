import "server-only"

import type {
  ConfirmationMethod,
  ConfirmationStatus,
  ParticipantRole,
  PrismaClient,
} from "@/prisma/generated/prisma/client"

type Tx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>

type AggregateConfirmationStatus =
  | "none_confirmed"
  | "merchant_confirmed"
  | "customer_confirmed"
  | "both_confirmed"

type CreatePresenceConfirmationTxInput = {
  vouchId: string
  userId: string
  participantRole: ParticipantRole
  method: ConfirmationMethod
  confirmedAt?: Date
  serverReceivedAt?: Date
  timeBucket?: number | null
  clockSkewAccepted?: boolean
  offlinePayloadHash?: string | null
}

type AssertNoDuplicateConfirmationTxInput = {
  vouchId: string
  userId: string
  participantRole: ParticipantRole
}

type VouchIdTxInput = {
  vouchId: string
}

type PresenceConfirmationResult = {
  id: string
  vouchId: string
  userId: string
  participantRole: ParticipantRole
  status: ConfirmationStatus
  method: ConfirmationMethod
  confirmedAt: Date | null
  serverReceivedAt: Date
  timeBucket: number | null
  clockSkewAccepted: boolean
  offlinePayloadHash: string | null
  createdAt: Date
}

const PRESENCE_CONFIRMATION_SELECT = {
  id: true,
  vouchId: true,
  userId: true,
  participantRole: true,
  status: true,
  method: true,
  confirmedAt: true,
  serverReceivedAt: true,
  timeBucket: true,
  clockSkewAccepted: true,
  offlinePayloadHash: true,
  createdAt: true,
} as const

function assertNonEmptyString(value: string, fieldName: string): string {
  const trimmed = value.trim()

  if (!trimmed) {
    throw new Error(`INVALID_CONFIRMATION_TX_INPUT: ${fieldName} is required`)
  }

  return trimmed
}

function assertCanonicalConfirmationMethod(method: ConfirmationMethod): void {
  if (method !== "code_exchange" && method !== "offline_code_exchange") {
    throw new Error("INVALID_CONFIRMATION_METHOD")
  }
}

export async function assertNoDuplicateConfirmationTx(
  tx: Tx,
  input: AssertNoDuplicateConfirmationTxInput
): Promise<void> {
  const vouchId = assertNonEmptyString(input.vouchId, "vouchId")
  const userId = assertNonEmptyString(input.userId, "userId")

  const existing = await tx.presenceConfirmation.findFirst({
    where: {
      vouchId,
      OR: [{ userId }, { participantRole: input.participantRole }],
    },
    select: { id: true },
  })

  if (existing) {
    throw new Error("DUPLICATE_PRESENCE_CONFIRMATION")
  }
}

export async function createPresenceConfirmationTx(
  tx: Tx,
  input: CreatePresenceConfirmationTxInput
): Promise<PresenceConfirmationResult> {
  const vouchId = assertNonEmptyString(input.vouchId, "vouchId")
  const userId = assertNonEmptyString(input.userId, "userId")
  const serverReceivedAt = input.serverReceivedAt ?? new Date()
  const confirmedAt = input.confirmedAt ?? serverReceivedAt

  assertCanonicalConfirmationMethod(input.method)

  await assertNoDuplicateConfirmationTx(tx, {
    vouchId,
    userId,
    participantRole: input.participantRole,
  })

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

  if (vouch.status !== "confirmable" && vouch.status !== "authorized") {
    throw new Error("VOUCH_NOT_CONFIRMABLE")
  }

  if (serverReceivedAt < vouch.confirmationOpensAt) {
    throw new Error("CONFIRMATION_WINDOW_NOT_OPEN")
  }

  if (serverReceivedAt > vouch.confirmationExpiresAt) {
    throw new Error("CONFIRMATION_WINDOW_CLOSED")
  }

  const expectedUserId = input.participantRole === "merchant" ? vouch.merchantId : vouch.customerId

  if (!expectedUserId || expectedUserId !== userId) {
    throw new Error("UNAUTHORIZED_CONFIRMATION_PARTICIPANT")
  }

  if (vouch.status === "authorized") {
    await tx.vouch.update({
      where: { id: vouchId },
      data: {
        status: "confirmable",
        confirmableAt: serverReceivedAt,
      },
      select: { id: true },
    })
  }

  return tx.presenceConfirmation.create({
    data: {
      vouchId,
      userId,
      participantRole: input.participantRole,
      status: "confirmed",
      method: input.method,
      confirmedAt,
      serverReceivedAt,
      timeBucket: input.timeBucket ?? null,
      clockSkewAccepted: input.clockSkewAccepted ?? false,
      offlinePayloadHash: input.offlinePayloadHash ?? null,
    },
    select: PRESENCE_CONFIRMATION_SELECT,
  })
}

export async function getAggregateConfirmationStatusTx(
  tx: Tx,
  input: VouchIdTxInput
): Promise<AggregateConfirmationStatus> {
  const vouchId = assertNonEmptyString(input.vouchId, "vouchId")

  const confirmations = await tx.presenceConfirmation.findMany({
    where: {
      vouchId,
      status: "confirmed",
    },
    select: { participantRole: true },
  })

  const merchantConfirmed = confirmations.some(
    (confirmation) => confirmation.participantRole === "merchant"
  )
  const customerConfirmed = confirmations.some(
    (confirmation) => confirmation.participantRole === "customer"
  )

  if (merchantConfirmed && customerConfirmed) return "both_confirmed"
  if (merchantConfirmed) return "merchant_confirmed"
  if (customerConfirmed) return "customer_confirmed"

  return "none_confirmed"
}

export async function markConfirmationWindowOpenedTx(tx: Tx, input: VouchIdTxInput): Promise<void> {
  const vouchId = assertNonEmptyString(input.vouchId, "vouchId")

  await tx.vouch.updateMany({
    where: {
      id: vouchId,
      status: "authorized",
      confirmationOpensAt: { lte: new Date() },
      confirmationExpiresAt: { gt: new Date() },
    },
    data: {
      status: "confirmable",
      confirmableAt: new Date(),
    },
  })
}

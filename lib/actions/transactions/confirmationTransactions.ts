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
  | "payer_confirmed"
  | "payee_confirmed"
  | "both_confirmed"

type CreatePresenceConfirmationTxInput = {
  vouchId: string
  userId: string
  participantRole: ParticipantRole
  method?: ConfirmationMethod
  confirmedAt?: Date
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
  confirmedAt: Date
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
  createdAt: true,
} as const

function assertNonEmptyString(value: string, fieldName: string): string {
  const trimmed = value.trim()

  if (!trimmed) {
    throw new Error(`INVALID_CONFIRMATION_TX_INPUT: ${fieldName} is required`)
  }

  return trimmed
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
    select: {
      id: true,
    },
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
  const confirmedAt = input.confirmedAt ?? new Date()

  await assertNoDuplicateConfirmationTx(tx, {
    vouchId,
    userId,
    participantRole: input.participantRole,
  })

  const vouch = await tx.vouch.findUnique({
    where: {
      id: vouchId,
    },
    select: {
      id: true,
      payerId: true,
      payeeId: true,
      confirmationOpensAt: true,
      confirmationExpiresAt: true,
    },
  })

  if (!vouch) {
    throw new Error("VOUCH_NOT_FOUND")
  }

  if (confirmedAt < vouch.confirmationOpensAt) {
    throw new Error("CONFIRMATION_WINDOW_NOT_OPEN")
  }

  if (confirmedAt > vouch.confirmationExpiresAt) {
    throw new Error("CONFIRMATION_WINDOW_CLOSED")
  }

  const expectedUserId = input.participantRole === "payer" ? vouch.payerId : vouch.payeeId

  if (!expectedUserId || expectedUserId !== userId) {
    throw new Error("UNAUTHORIZED_CONFIRMATION_PARTICIPANT")
  }

  return tx.presenceConfirmation.create({
    data: {
      vouchId,
      userId,
      participantRole: input.participantRole,
      status: "confirmed",
      method: input.method ?? "manual",
      confirmedAt,
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
    select: {
      participantRole: true,
    },
  })

  const payerConfirmed = confirmations.some(
    (confirmation) => confirmation.participantRole === "payer"
  )

  const payeeConfirmed = confirmations.some(
    (confirmation) => confirmation.participantRole === "payee"
  )

  if (payerConfirmed && payeeConfirmed) return "both_confirmed"
  if (payerConfirmed) return "payer_confirmed"
  if (payeeConfirmed) return "payee_confirmed"

  return "none_confirmed"
}

export async function markConfirmationWindowOpenedTx(tx: Tx, input: VouchIdTxInput): Promise<void> {
  const vouchId = assertNonEmptyString(input.vouchId, "vouchId")

  await tx.vouch.findUniqueOrThrow({
    where: {
      id: vouchId,
    },
    select: {
      id: true,
    },
  })
}

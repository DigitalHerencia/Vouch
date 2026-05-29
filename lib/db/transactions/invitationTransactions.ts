import "server-only"

import type { InvitationStatus, PrismaClient } from "@/prisma/generated/prisma/client"

type Tx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>

type CreateInvitationTxInput = {
  vouchId: string
  recipientEmail?: string | null
  tokenHash: string
  expiresAt: Date
}

type InvitationIdTxInput = {
  invitationId: string
}

type RotateInvitationTokenHashTxInput = {
  invitationId: string
  tokenHash: string
  expiresAt?: Date
}

type InvitationResult = {
  id: string
  vouchId: string
  tokenHash: string
  recipientEmail: string | null
  status: InvitationStatus
  expiresAt: Date
  openedAt: Date | null
  acceptedAt: Date | null
  declinedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const INVITATION_SELECT = {
  id: true,
  vouchId: true,
  tokenHash: true,
  recipientEmail: true,
  status: true,
  expiresAt: true,
  openedAt: true,
  acceptedAt: true,
  declinedAt: true,
  createdAt: true,
  updatedAt: true,
} as const

function assertNonEmptyString(value: string, fieldName: string): string {
  const trimmed = value.trim()

  if (!trimmed) {
    throw new Error(`INVALID_INVITATION_TX_INPUT: ${fieldName} is required`)
  }

  return trimmed
}

async function updateInvitationStatus(
  tx: Tx,
  invitationId: string,
  status: InvitationStatus,
  data: Record<string, unknown> = {}
): Promise<InvitationResult> {
  return tx.invitation.update({
    where: {
      id: assertNonEmptyString(invitationId, "invitationId"),
    },
    data: {
      status,
      ...data,
    },
    select: INVITATION_SELECT,
  })
}

export async function createInvitationTx(
  tx: Tx,
  input: CreateInvitationTxInput
): Promise<InvitationResult> {
  return tx.invitation.create({
    data: {
      vouchId: assertNonEmptyString(input.vouchId, "vouchId"),
      tokenHash: assertNonEmptyString(input.tokenHash, "tokenHash"),
      recipientEmail: input.recipientEmail ?? null,
      expiresAt: input.expiresAt,
      status: "created",
    },
    select: INVITATION_SELECT,
  })
}

export async function markInvitationSentTx(
  tx: Tx,
  input: InvitationIdTxInput
): Promise<InvitationResult> {
  return updateInvitationStatus(tx, input.invitationId, "sent")
}

export async function markInvitationOpenedTx(
  tx: Tx,
  input: InvitationIdTxInput
): Promise<InvitationResult> {
  return updateInvitationStatus(tx, input.invitationId, "opened", {
    openedAt: new Date(),
  })
}

export async function markInvitationAcceptedTx(
  tx: Tx,
  input: InvitationIdTxInput
): Promise<InvitationResult> {
  return updateInvitationStatus(tx, input.invitationId, "accepted", {
    acceptedAt: new Date(),
  })
}

export async function markInvitationDeclinedTx(
  tx: Tx,
  input: InvitationIdTxInput
): Promise<InvitationResult> {
  return updateInvitationStatus(tx, input.invitationId, "declined", {
    declinedAt: new Date(),
  })
}

export async function markInvitationExpiredTx(
  tx: Tx,
  input: InvitationIdTxInput
): Promise<InvitationResult> {
  return updateInvitationStatus(tx, input.invitationId, "expired")
}

export async function invalidateInvitationTx(
  tx: Tx,
  input: InvitationIdTxInput
): Promise<InvitationResult> {
  return updateInvitationStatus(tx, input.invitationId, "expired")
}

export async function rotateInvitationTokenHashTx(
  tx: Tx,
  input: RotateInvitationTokenHashTxInput
): Promise<InvitationResult> {
  return tx.invitation.update({
    where: {
      id: assertNonEmptyString(input.invitationId, "invitationId"),
    },
    data: {
      tokenHash: assertNonEmptyString(input.tokenHash, "tokenHash"),
      ...(input.expiresAt !== undefined ? { expiresAt: input.expiresAt } : {}),
    },
    select: INVITATION_SELECT,
  })
}

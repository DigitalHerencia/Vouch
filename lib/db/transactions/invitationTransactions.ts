import "server-only"

import type { PrismaClient } from "@/prisma/generated/prisma/client"

type Tx = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">

type InvitationTxInput = {
  vouchId: string
  tokenHash?: string
  recipientEmail?: string | null
  expiresAt?: Date
}

type InvitationIdTxInput = {
  invitationId?: string
  vouchId?: string
}

function assertVouchId(input: InvitationIdTxInput): string {
  const vouchId = input.vouchId ?? input.invitationId
  if (!vouchId?.trim()) throw new Error("INVALID_INVITATION_TX_INPUT: vouchId is required")
  return vouchId
}

export async function createInvitationTx(tx: Tx, input: InvitationTxInput) {
  return tx.vouch.findUniqueOrThrow({
    where: { id: input.vouchId },
    select: {
      id: true,
      publicId: true,
      merchantId: true,
      customerId: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export async function markInvitationSentTx(tx: Tx, input: InvitationIdTxInput) {
  return tx.vouch.findUniqueOrThrow({
    where: { id: assertVouchId(input) },
    select: { id: true, publicId: true, status: true, updatedAt: true },
  })
}

export async function markInvitationOpenedTx(tx: Tx, input: InvitationIdTxInput) {
  return markInvitationSentTx(tx, input)
}

export async function markInvitationAcceptedTx(tx: Tx, input: InvitationIdTxInput) {
  return markInvitationSentTx(tx, input)
}

export async function markInvitationDeclinedTx(tx: Tx, input: InvitationIdTxInput) {
  return markInvitationSentTx(tx, input)
}

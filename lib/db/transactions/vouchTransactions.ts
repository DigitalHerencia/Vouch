import "server-only"

import { randomUUID } from "node:crypto"

import type { PrismaClient, VouchStatus } from "@/prisma/generated/prisma/client"

type Tx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>

type VouchResult = {
  id: string
  publicId: string
  payerId: string
  payeeId: string | null
  amountCents: number
  currency: string
  platformFeeCents: number
  status: VouchStatus
  label: string | null
  meetingStartsAt: Date
  confirmationOpensAt: Date
  confirmationExpiresAt: Date
  acceptedAt: Date | null
  completedAt: Date | null
  expiredAt: Date | null
  canceledAt: Date | null
  failedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

type CreateVouchTxInput = {
  payerId: string
  payeeId?: string | null
  publicId?: string
  amountCents: number
  currency?: string
  platformFeeCents?: number
  label?: string | null
  meetingStartsAt: Date
  confirmationOpensAt: Date
  confirmationExpiresAt: Date
}

type VouchIdTxInput = {
  vouchId: string
}

type VouchStatusTxInput = {
  vouchId: string
  status: VouchStatus
}

type BindPayeeToVouchTxInput = {
  vouchId: string
  payeeId: string
}

type VouchResolutionFailureTxInput = {
  vouchId: string
}

const VOUCH_SELECT = {
  id: true,
  publicId: true,
  payerId: true,
  payeeId: true,
  amountCents: true,
  currency: true,
  platformFeeCents: true,
  status: true,
  label: true,
  meetingStartsAt: true,
  confirmationOpensAt: true,
  confirmationExpiresAt: true,
  acceptedAt: true,
  completedAt: true,
  expiredAt: true,
  canceledAt: true,
  failedAt: true,
  createdAt: true,
  updatedAt: true,
} as const

function assertNonEmptyString(value: string, fieldName: string): string {
  const trimmed = value.trim()

  if (!trimmed) {
    throw new Error(`INVALID_VOUCH_TX_INPUT: ${fieldName} is required`)
  }

  return trimmed
}

function createPublicId(): string {
  return `vch_${randomUUID().replaceAll("-", "")}`
}

export async function createVouchTx(tx: Tx, input: CreateVouchTxInput): Promise<VouchResult> {
  if (input.confirmationOpensAt >= input.confirmationExpiresAt) {
    throw new Error("INVALID_VOUCH_CONFIRMATION_WINDOW")
  }

  if (input.meetingStartsAt > input.confirmationExpiresAt) {
    throw new Error("INVALID_VOUCH_MEETING_TIME")
  }

  return tx.vouch.create({
    data: {
      publicId: input.publicId ?? createPublicId(),
      payerId: assertNonEmptyString(input.payerId, "payerId"),
      ...(input.payeeId !== undefined ? { payeeId: input.payeeId } : {}),
      amountCents: input.amountCents,
      currency: input.currency ?? "usd",
      platformFeeCents: input.platformFeeCents ?? 0,
      status: "pending",
      ...(input.label !== undefined ? { label: input.label } : {}),
      meetingStartsAt: input.meetingStartsAt,
      confirmationOpensAt: input.confirmationOpensAt,
      confirmationExpiresAt: input.confirmationExpiresAt,
    },
    select: VOUCH_SELECT,
  })
}

export async function updateVouchStatusTx(tx: Tx, input: VouchStatusTxInput): Promise<VouchResult> {
  return tx.vouch.update({
    where: {
      id: assertNonEmptyString(input.vouchId, "vouchId"),
    },
    data: {
      status: input.status,
    },
    select: VOUCH_SELECT,
  })
}

export async function bindPayeeToVouchTx(
  tx: Tx,
  input: BindPayeeToVouchTxInput
): Promise<VouchResult> {
  const now = new Date()
  const vouchId = assertNonEmptyString(input.vouchId, "vouchId")
  const payeeId = assertNonEmptyString(input.payeeId, "payeeId")

  const updated = await tx.vouch.updateMany({
    where: {
      id: vouchId,
      status: "pending",
      payeeId: null,
      payerId: {
        not: payeeId,
      },
    },
    data: {
      payeeId,
      status: "active",
      acceptedAt: now,
    },
  })

  if (updated.count !== 1) {
    throw new Error("VOUCH_ACCEPTANCE_CONFLICT")
  }

  return tx.vouch.findUniqueOrThrow({
    where: {
      id: vouchId,
    },
    select: VOUCH_SELECT,
  })
}

export async function cancelPendingVouchTx(tx: Tx, input: VouchIdTxInput): Promise<VouchResult> {
  return tx.vouch.update({
    where: {
      id: assertNonEmptyString(input.vouchId, "vouchId"),
    },
    data: {
      status: "canceled",
      canceledAt: new Date(),
    },
    select: VOUCH_SELECT,
  })
}

export async function markVouchActiveTx(tx: Tx, input: VouchIdTxInput): Promise<VouchResult> {
  return tx.vouch.update({
    where: {
      id: assertNonEmptyString(input.vouchId, "vouchId"),
    },
    data: {
      status: "active",
      acceptedAt: new Date(),
    },
    select: VOUCH_SELECT,
  })
}

export async function markVouchCompletedTx(tx: Tx, input: VouchIdTxInput): Promise<VouchResult> {
  return tx.vouch.update({
    where: {
      id: assertNonEmptyString(input.vouchId, "vouchId"),
    },
    data: {
      status: "completed",
      completedAt: new Date(),
    },
    select: VOUCH_SELECT,
  })
}

export async function markVouchExpiredTx(tx: Tx, input: VouchIdTxInput): Promise<VouchResult> {
  return tx.vouch.update({
    where: {
      id: assertNonEmptyString(input.vouchId, "vouchId"),
    },
    data: {
      status: "expired",
      expiredAt: new Date(),
    },
    select: VOUCH_SELECT,
  })
}

export async function markVouchRefundedTx(tx: Tx, input: VouchIdTxInput): Promise<VouchResult> {
  return tx.vouch.update({
    where: {
      id: assertNonEmptyString(input.vouchId, "vouchId"),
    },
    data: {
      status: "refunded",
    },
    select: VOUCH_SELECT,
  })
}

export async function markVouchCanceledTx(tx: Tx, input: VouchIdTxInput): Promise<VouchResult> {
  return tx.vouch.update({
    where: {
      id: assertNonEmptyString(input.vouchId, "vouchId"),
    },
    data: {
      status: "canceled",
      canceledAt: new Date(),
    },
    select: VOUCH_SELECT,
  })
}

export async function markVouchFailedTx(tx: Tx, input: VouchIdTxInput): Promise<VouchResult> {
  return tx.vouch.update({
    where: {
      id: assertNonEmptyString(input.vouchId, "vouchId"),
    },
    data: {
      status: "failed",
      failedAt: new Date(),
    },
    select: VOUCH_SELECT,
  })
}

export async function completeVouchWithPaymentReleaseTx(
  tx: Tx,
  input: VouchIdTxInput
): Promise<VouchResult> {
  return markVouchCompletedTx(tx, input)
}

export async function expireVouchWithRefundTx(tx: Tx, input: VouchIdTxInput): Promise<VouchResult> {
  return markVouchExpiredTx(tx, input)
}

export async function markResolutionFailureTx(
  tx: Tx,
  input: VouchResolutionFailureTxInput
): Promise<VouchResult> {
  return markVouchFailedTx(tx, input)
}

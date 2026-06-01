import "server-only"

import { createHash, randomUUID } from "node:crypto"

import type { Prisma, PrismaClient, VouchStatus } from "@/prisma/generated/prisma/client"

type Tx = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">

type CreateVouchTxInput = {
  merchantId: string
  customerId?: string | null
  publicId?: string
  currency?: string
  protectedAmountCents: number
  merchantReceivesCents?: number
  vouchServiceFeeCents?: number
  processingFeeOffsetCents?: number
  applicationFeeAmountCents?: number
  customerTotalCents?: number
  label?: string | null
  appointmentStartsAt: Date
  confirmationOpensAt: Date
  confirmationExpiresAt: Date
  createAsDraft?: boolean
  createAsSent?: boolean
}

type VouchIdTxInput = {
  vouchId: string
}

type BindCustomerToVouchTxInput = {
  vouchId: string
  customerId: string
}

type VouchArchiveStatusTxInput = {
  vouchId: string
  archiveStatus: boolean | string
}

type VouchRecoveryStatusTxInput = {
  vouchId: string
  recoveryStatus: string
}

const VOUCH_SELECT = {
  id: true,
  publicId: true,
  merchantId: true,
  customerId: true,
  amountCents: true,
  currency: true,
  appointmentAt: true,
  confirmationOpensAt: true,
  confirmationExpiresAt: true,
  status: true,
  protocolFeePaidAt: true,
  authorizedAt: true,
  capturedAt: true,
  voidedAt: true,
  expiredAt: true,
  archived: true,
  archivedAt: true,
  createdAt: true,
  updatedAt: true,
} as const

type VouchResult = Prisma.VouchGetPayload<{ select: typeof VOUCH_SELECT }>

function assertNonEmptyString(value: string, fieldName: string): string {
  const trimmed = value.trim()
  if (!trimmed) throw new Error(`INVALID_VOUCH_TX_INPUT: ${fieldName} is required`)
  return trimmed
}

function createPublicId(): string {
  return `vch_${randomUUID().replaceAll("-", "")}`
}

function hashConfirmationCode(seed: string): string {
  return createHash("sha256").update(seed).digest("hex")
}

function assertValidWindow(input: {
  appointmentStartsAt: Date
  confirmationOpensAt: Date
  confirmationExpiresAt: Date
}): void {
  if (input.confirmationOpensAt >= input.confirmationExpiresAt) {
    throw new Error("INVALID_VOUCH_CONFIRMATION_WINDOW")
  }

  if (input.appointmentStartsAt > input.confirmationExpiresAt) {
    throw new Error("INVALID_VOUCH_APPOINTMENT_TIME")
  }
}

async function transitionVouchStatusTx(
  tx: Tx,
  input: {
    vouchId: string
    from: VouchStatus[]
    data: {
      status: VouchStatus
      protocolFeePaidAt?: Date
      authorizedAt?: Date
      capturedAt?: Date
      voidedAt?: Date
      expiredAt?: Date
    }
    conflictCode: string
  }
): Promise<VouchResult> {
  const vouchId = assertNonEmptyString(input.vouchId, "vouchId")
  const updated = await tx.vouch.updateMany({
    where: {
      id: vouchId,
      status: { in: input.from },
    },
    data: input.data,
  })

  if (updated.count !== 1) throw new Error(input.conflictCode)

  return tx.vouch.findUniqueOrThrow({
    where: { id: vouchId },
    select: VOUCH_SELECT,
  })
}

export async function createVouchTx(tx: Tx, input: CreateVouchTxInput): Promise<VouchResult> {
  assertValidWindow(input)

  const publicId = input.publicId ?? createPublicId()
  const now = new Date()
  const status: VouchStatus = input.createAsDraft ? "draft" : "active"

  return tx.vouch.create({
    data: {
      publicId,
      merchantId: assertNonEmptyString(input.merchantId, "merchantId"),
      ...(input.customerId !== undefined ? { customerId: input.customerId } : {}),
      status,
      amountCents: input.protectedAmountCents,
      currency: input.currency ?? "usd",
      appointmentAt: input.appointmentStartsAt,
      confirmationOpensAt: input.confirmationOpensAt,
      confirmationExpiresAt: input.confirmationExpiresAt,
      merchantCodeHash: hashConfirmationCode(`${publicId}:merchant`),
      ...(input.customerId ? { customerCodeHash: hashConfirmationCode(`${publicId}:customer`) } : {}),
      ...(input.createAsDraft ? {} : { protocolFeePaidAt: now }),
    },
    select: VOUCH_SELECT,
  })
}

export async function markVouchSentTx(tx: Tx, input: VouchIdTxInput): Promise<VouchResult> {
  return transitionVouchStatusTx(tx, {
    vouchId: input.vouchId,
    from: ["draft", "active"],
    data: { status: "active", protocolFeePaidAt: new Date() },
    conflictCode: "VOUCH_SENT_TRANSITION_CONFLICT",
  })
}

export async function bindCustomerToVouchTx(
  tx: Tx,
  input: BindCustomerToVouchTxInput
): Promise<VouchResult> {
  const vouchId = assertNonEmptyString(input.vouchId, "vouchId")
  const customerId = assertNonEmptyString(input.customerId, "customerId")

  const updated = await tx.vouch.updateMany({
    where: {
      id: vouchId,
      status: { in: ["draft", "active"] },
      customerId: null,
      merchantId: { not: customerId },
    },
    data: {
      customerId,
      status: "active",
    },
  })

  if (updated.count !== 1) throw new Error("VOUCH_ACCEPTANCE_CONFLICT")

  return tx.vouch.findUniqueOrThrow({
    where: { id: vouchId },
    select: VOUCH_SELECT,
  })
}

export async function markVouchAuthorizedTx(tx: Tx, input: VouchIdTxInput): Promise<VouchResult> {
  return transitionVouchStatusTx(tx, {
    vouchId: input.vouchId,
    from: ["active"],
    data: { status: "authorized", authorizedAt: new Date() },
    conflictCode: "VOUCH_AUTHORIZATION_TRANSITION_CONFLICT",
  })
}

export async function markVouchConfirmableTx(tx: Tx, input: VouchIdTxInput): Promise<VouchResult> {
  return transitionVouchStatusTx(tx, {
    vouchId: input.vouchId,
    from: ["authorized"],
    data: { status: "can_capture" },
    conflictCode: "VOUCH_CONFIRMABLE_TRANSITION_CONFLICT",
  })
}

export async function markVouchCompletedTx(tx: Tx, input: VouchIdTxInput): Promise<VouchResult> {
  return transitionVouchStatusTx(tx, {
    vouchId: input.vouchId,
    from: ["authorized", "can_capture"],
    data: { status: "captured", capturedAt: new Date() },
    conflictCode: "VOUCH_COMPLETION_TRANSITION_CONFLICT",
  })
}

export async function markVouchExpiredTx(tx: Tx, input: VouchIdTxInput): Promise<VouchResult> {
  return transitionVouchStatusTx(tx, {
    vouchId: input.vouchId,
    from: ["draft", "active", "authorized", "can_capture"],
    data: { status: "expired", expiredAt: new Date() },
    conflictCode: "VOUCH_EXPIRATION_TRANSITION_CONFLICT",
  })
}

export async function updateVouchArchiveStatusTx(
  tx: Tx,
  input: VouchArchiveStatusTxInput
): Promise<VouchResult> {
  const archived = input.archiveStatus === true || input.archiveStatus === "archived"

  return tx.vouch.update({
    where: { id: assertNonEmptyString(input.vouchId, "vouchId") },
    data: {
      archived,
      archivedAt: archived ? new Date() : null,
      status: archived ? "archived" : undefined,
    },
    select: VOUCH_SELECT,
  })
}

export async function updateVouchRecoveryStatusTx(
  tx: Tx,
  input: VouchRecoveryStatusTxInput
): Promise<VouchResult> {
  return tx.vouch.findUniqueOrThrow({
    where: { id: assertNonEmptyString(input.vouchId, "vouchId") },
    select: VOUCH_SELECT,
  })
}

export async function completeVouchWithPaymentCaptureTx(
  tx: Tx,
  input: VouchIdTxInput
): Promise<VouchResult> {
  return markVouchCompletedTx(tx, input)
}

export async function expireVouchWithoutCaptureTx(
  tx: Tx,
  input: VouchIdTxInput
): Promise<VouchResult> {
  return markVouchExpiredTx(tx, input)
}

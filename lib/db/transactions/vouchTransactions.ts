import "server-only"

import { randomUUID } from "node:crypto"

import type {
  ArchiveStatus,
  PrismaClient,
  RecoveryStatus,
  VouchStatus,
} from "@/prisma/generated/prisma/client"

type Tx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>

type VouchResult = {
  id: string
  publicId: string
  merchantId: string
  customerId: string | null
  status: VouchStatus
  archiveStatus: ArchiveStatus
  recoveryStatus: RecoveryStatus
  currency: string
  protectedAmountCents: number
  merchantReceivesCents: number
  vouchServiceFeeCents: number
  processingFeeOffsetCents: number
  applicationFeeAmountCents: number
  customerTotalCents: number
  label: string | null
  appointmentStartsAt: Date
  confirmationOpensAt: Date
  confirmationExpiresAt: Date
  committedAt: Date | null
  sentAt: Date | null
  acceptedAt: Date | null
  authorizedAt: Date | null
  confirmableAt: Date | null
  completedAt: Date | null
  expiredAt: Date | null
  createdAt: Date
  updatedAt: Date
}

type CreateVouchTxInput = {
  merchantId: string
  customerId?: string | null
  publicId?: string
  currency?: string
  protectedAmountCents: number
  merchantReceivesCents: number
  vouchServiceFeeCents: number
  processingFeeOffsetCents: number
  applicationFeeAmountCents: number
  customerTotalCents: number
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

type VouchStatusTxInput = {
  vouchId: string
  status: VouchStatus
}

type BindCustomerToVouchTxInput = {
  vouchId: string
  customerId: string
}

type VouchRecoveryStatusTxInput = {
  vouchId: string
  recoveryStatus: RecoveryStatus
}

type VouchArchiveStatusTxInput = {
  vouchId: string
  archiveStatus: ArchiveStatus
}

const VOUCH_SELECT = {
  id: true,
  publicId: true,
  merchantId: true,
  customerId: true,
  status: true,
  archiveStatus: true,
  recoveryStatus: true,
  currency: true,
  protectedAmountCents: true,
  merchantReceivesCents: true,
  vouchServiceFeeCents: true,
  processingFeeOffsetCents: true,
  applicationFeeAmountCents: true,
  customerTotalCents: true,
  label: true,
  appointmentStartsAt: true,
  confirmationOpensAt: true,
  confirmationExpiresAt: true,
  committedAt: true,
  sentAt: true,
  acceptedAt: true,
  authorizedAt: true,
  confirmableAt: true,
  completedAt: true,
  expiredAt: true,
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

export async function createVouchTx(tx: Tx, input: CreateVouchTxInput): Promise<VouchResult> {
  assertValidWindow(input)

  const now = new Date()
  const status: VouchStatus = input.createAsDraft
    ? "draft"
    : input.createAsSent
      ? "sent"
      : "committed"

  return tx.vouch.create({
    data: {
      publicId: input.publicId ?? createPublicId(),
      merchantId: assertNonEmptyString(input.merchantId, "merchantId"),
      ...(input.customerId !== undefined ? { customerId: input.customerId } : {}),
      status,
      currency: input.currency ?? "usd",
      protectedAmountCents: input.protectedAmountCents,
      merchantReceivesCents: input.merchantReceivesCents,
      vouchServiceFeeCents: input.vouchServiceFeeCents,
      processingFeeOffsetCents: input.processingFeeOffsetCents,
      applicationFeeAmountCents: input.applicationFeeAmountCents,
      customerTotalCents: input.customerTotalCents,
      ...(input.label !== undefined ? { label: input.label } : {}),
      appointmentStartsAt: input.appointmentStartsAt,
      confirmationOpensAt: input.confirmationOpensAt,
      confirmationExpiresAt: input.confirmationExpiresAt,
      ...(input.createAsDraft ? {} : { committedAt: now }),
      ...(input.createAsSent ? { sentAt: now } : {}),
    },
    select: VOUCH_SELECT,
  })
}

export async function updateVouchStatusTx(tx: Tx, input: VouchStatusTxInput): Promise<VouchResult> {
  return tx.vouch.update({
    where: { id: assertNonEmptyString(input.vouchId, "vouchId") },
    data: { status: input.status },
    select: VOUCH_SELECT,
  })
}

export async function markVouchSentTx(tx: Tx, input: VouchIdTxInput): Promise<VouchResult> {
  const now = new Date()

  return tx.vouch.update({
    where: { id: assertNonEmptyString(input.vouchId, "vouchId") },
    data: {
      status: "sent",
      committedAt: now,
      sentAt: now,
    },
    select: VOUCH_SELECT,
  })
}

export async function bindCustomerToVouchTx(
  tx: Tx,
  input: BindCustomerToVouchTxInput
): Promise<VouchResult> {
  const now = new Date()
  const vouchId = assertNonEmptyString(input.vouchId, "vouchId")
  const customerId = assertNonEmptyString(input.customerId, "customerId")

  const updated = await tx.vouch.updateMany({
    where: {
      id: vouchId,
      status: { in: ["committed", "sent"] },
      customerId: null,
      merchantId: { not: customerId },
    },
    data: {
      customerId,
      status: "accepted",
      acceptedAt: now,
    },
  })

  if (updated.count !== 1) {
    throw new Error("VOUCH_ACCEPTANCE_CONFLICT")
  }

  return tx.vouch.findUniqueOrThrow({
    where: { id: vouchId },
    select: VOUCH_SELECT,
  })
}

export async function markVouchAuthorizedTx(tx: Tx, input: VouchIdTxInput): Promise<VouchResult> {
  return tx.vouch.update({
    where: { id: assertNonEmptyString(input.vouchId, "vouchId") },
    data: {
      status: "authorized",
      authorizedAt: new Date(),
    },
    select: VOUCH_SELECT,
  })
}

export async function markVouchConfirmableTx(tx: Tx, input: VouchIdTxInput): Promise<VouchResult> {
  return tx.vouch.update({
    where: { id: assertNonEmptyString(input.vouchId, "vouchId") },
    data: {
      status: "confirmable",
      confirmableAt: new Date(),
    },
    select: VOUCH_SELECT,
  })
}

export async function markVouchCompletedTx(tx: Tx, input: VouchIdTxInput): Promise<VouchResult> {
  return tx.vouch.update({
    where: { id: assertNonEmptyString(input.vouchId, "vouchId") },
    data: {
      status: "completed",
      completedAt: new Date(),
    },
    select: VOUCH_SELECT,
  })
}

export async function markVouchExpiredTx(tx: Tx, input: VouchIdTxInput): Promise<VouchResult> {
  return tx.vouch.update({
    where: { id: assertNonEmptyString(input.vouchId, "vouchId") },
    data: {
      status: "expired",
      expiredAt: new Date(),
    },
    select: VOUCH_SELECT,
  })
}

export async function updateVouchArchiveStatusTx(
  tx: Tx,
  input: VouchArchiveStatusTxInput
): Promise<VouchResult> {
  return tx.vouch.update({
    where: { id: assertNonEmptyString(input.vouchId, "vouchId") },
    data: { archiveStatus: input.archiveStatus },
    select: VOUCH_SELECT,
  })
}

export async function updateVouchRecoveryStatusTx(
  tx: Tx,
  input: VouchRecoveryStatusTxInput
): Promise<VouchResult> {
  return tx.vouch.update({
    where: { id: assertNonEmptyString(input.vouchId, "vouchId") },
    data: { recoveryStatus: input.recoveryStatus },
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

/**
 * Compatibility aliases retained only for old imports during Pass 6.
 * Later passes should remove these names.
 */
export const bindPayeeToVouchTx = bindCustomerToVouchTx
export const cancelPendingVouchTx = markVouchExpiredTx
export const markVouchActiveTx = markVouchAuthorizedTx
export const markResolutionFailureTx = updateVouchRecoveryStatusTx

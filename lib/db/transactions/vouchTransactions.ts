import "server-only"

import { createHash, randomUUID } from "node:crypto"

import type { Prisma, VouchStatus } from "@/prisma/generated/prisma/client"
import type { PrismaTransactionClient as Tx } from "@/types/commonTypes"

type CreateVouchTxInput = {
  merchantId: string
  customerId?: string | null
  publicId?: string
  currency?: string
  protectedAmountCents: number
  merchantReceivesCents?: number
  vouchServiceFeeCents?: number
  customerTotalCents?: number
  label?: string | null
  appointmentStartsAt: Date
  disclaimerAcceptedAt?: Date
  createAsDraft?: boolean
}

type BindCustomerToVouchTxInput = {
  vouchId: string
  customerId: string
}

type VouchArchiveStatusTxInput = {
  vouchId: string
  archiveStatus: boolean | string
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
  disclaimerAcceptedAt: true,
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

function getConfirmationWindow(appointmentStartsAt: Date): {
  confirmationOpensAt: Date
  confirmationExpiresAt: Date
} {
  if (Number.isNaN(appointmentStartsAt.getTime())) {
    throw new Error("INVALID_VOUCH_APPOINTMENT_TIME")
  }

  return {
    confirmationOpensAt: new Date(appointmentStartsAt.getTime() - 60 * 60 * 1000),
    confirmationExpiresAt: new Date(appointmentStartsAt.getTime() + 60 * 60 * 1000),
  }
}

export async function createVouchTx(tx: Tx, input: CreateVouchTxInput): Promise<VouchResult> {
  const publicId = input.publicId ?? createPublicId()
  const now = new Date()
  const status: VouchStatus = input.createAsDraft ? "draft" : "protocol_fee_paid"
  const { confirmationOpensAt, confirmationExpiresAt } = getConfirmationWindow(
    input.appointmentStartsAt
  )

  return tx.vouch.create({
    data: {
      publicId,
      merchantId: assertNonEmptyString(input.merchantId, "merchantId"),
      ...(input.customerId !== undefined ? { customerId: input.customerId } : {}),
      status,
      amountCents: input.protectedAmountCents,
      currency: input.currency ?? "usd",
      appointmentAt: input.appointmentStartsAt,
      confirmationOpensAt,
      confirmationExpiresAt,
      disclaimerAcceptedAt: input.disclaimerAcceptedAt ?? now,
      merchantCodeHash: hashConfirmationCode(`${publicId}:merchant`),
      ...(input.customerId
        ? { customerCodeHash: hashConfirmationCode(`${publicId}:customer`) }
        : {}),
      ...(input.createAsDraft ? {} : { protocolFeePaidAt: now }),
    },
    select: VOUCH_SELECT,
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
      status: { in: ["protocol_fee_paid", "authorized"] },
      customerId: null,
      merchantId: { not: customerId },
    },
    data: {
      customerId,
    },
  })

  if (updated.count !== 1) throw new Error("VOUCH_ACCEPTANCE_CONFLICT")

  return tx.vouch.findUniqueOrThrow({
    where: { id: vouchId },
    select: VOUCH_SELECT,
  })
}

export async function updateVouchArchiveStatusTx(
  tx: Tx,
  input: VouchArchiveStatusTxInput
): Promise<VouchResult> {
  const archived = input.archiveStatus === true || input.archiveStatus === "archived"

  const data = {
    archived,
    archivedAt: archived ? new Date() : null,
  }

  return tx.vouch.update({
    where: { id: assertNonEmptyString(input.vouchId, "vouchId") },
    data,
    select: VOUCH_SELECT,
  })
}

import type { AggregateConfirmationStatus, VouchStatus } from "@/types/vouch-status.types"

import { deriveAggregateConfirmationStatus, type ConfirmationStateInput } from "./state"
import { isConfirmationWindowClosed, type DateLike } from "./time-windows"

export type ResolutionPaymentStatus =
  | "not_started"
  | "requires_payment_method"
  | "authorized"
  | "captured"
  | "release_pending"
  | "released"
  | "refund_pending"
  | "refunded"
  | "voided"
  | "failed"

export type ReleaseResolutionInput = ConfirmationStateInput & {
  vouchStatus: VouchStatus
  paymentStatus?: ResolutionPaymentStatus
}

export type ExpirationResolutionInput = ConfirmationStateInput & {
  vouchStatus: VouchStatus
  now?: DateLike
  confirmationExpiresAt: DateLike
}

export type RefundOrVoidResolutionInput = ConfirmationStateInput & {
  vouchStatus: VouchStatus
  paymentStatus: ResolutionPaymentStatus
  now?: DateLike
  confirmationExpiresAt?: DateLike
}

const REFUND_OR_VOID_PAYMENT_STATUSES = new Set<ResolutionPaymentStatus>([
  "authorized",
  "captured",
  "release_pending",
  "failed",
])

function buildExpirationWindowInput(input: {
  now?: DateLike | undefined
  confirmationExpiresAt: DateLike
}) {
  const windowInput = {
    confirmationOpensAt: input.confirmationExpiresAt,
    confirmationExpiresAt: input.confirmationExpiresAt,
  }

  return input.now === undefined
    ? windowInput
    : {
        ...windowInput,
        now: input.now,
      }
}

function buildExpirationResolutionInput(input: {
  vouchStatus: VouchStatus
  payerConfirmed: boolean
  payeeConfirmed: boolean
  now?: DateLike | undefined
  confirmationExpiresAt: DateLike
}): ExpirationResolutionInput {
  const baseInput = {
    vouchStatus: input.vouchStatus,
    payerConfirmed: input.payerConfirmed,
    payeeConfirmed: input.payeeConfirmed,
    confirmationExpiresAt: input.confirmationExpiresAt,
  }

  return input.now === undefined
    ? baseInput
    : {
        ...baseInput,
        now: input.now,
      }
}

export function shouldReleaseFunds(input: ReleaseResolutionInput): boolean {
  return (
    input.vouchStatus === "active" &&
    deriveAggregateConfirmationStatus(input) === "both_confirmed" &&
    input.paymentStatus !== "released" &&
    input.paymentStatus !== "refunded" &&
    input.paymentStatus !== "voided" &&
    input.paymentStatus !== "failed"
  )
}

export function shouldExpireVouch(input: ExpirationResolutionInput): boolean {
  if (input.vouchStatus !== "pending" && input.vouchStatus !== "active") return false

  const aggregateStatus: AggregateConfirmationStatus = deriveAggregateConfirmationStatus(input)

  return (
    aggregateStatus !== "both_confirmed" &&
    isConfirmationWindowClosed(
      buildExpirationWindowInput({
        now: input.now,
        confirmationExpiresAt: input.confirmationExpiresAt,
      })
    )
  )
}

export function shouldRefundOrVoid(input: RefundOrVoidResolutionInput): boolean {
  if (input.vouchStatus === "completed") return false
  if (input.paymentStatus === "refunded" || input.paymentStatus === "voided") return false
  if (!REFUND_OR_VOID_PAYMENT_STATUSES.has(input.paymentStatus)) return false

  if (input.vouchStatus === "canceled" || input.vouchStatus === "expired") return true

  if (input.confirmationExpiresAt === undefined) return false

  return shouldExpireVouch(
    buildExpirationResolutionInput({
      vouchStatus: input.vouchStatus,
      payerConfirmed: input.payerConfirmed,
      payeeConfirmed: input.payeeConfirmed,
      now: input.now,
      confirmationExpiresAt: input.confirmationExpiresAt,
    })
  )
}

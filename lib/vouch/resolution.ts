import type { AggregateConfirmationStatus, VouchStatus } from "@/types/vouch"

import { deriveAggregateConfirmationStatus, type ConfirmationStateInput } from "./state"
import { isConfirmationWindowClosed, type DateLike } from "./time-windows"

export type ResolutionPaymentStatus =
  | "not_started"
  | "requires_payment_method"
  | "authorized"
  | "captured"
  | "capture_pending"
  | "captured_settlement"
  | "refund_pending"
  | "refunded"
  | "canceled"
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

const REFUND_OR_CANCEL_PAYMENT_STATUSES = new Set<ResolutionPaymentStatus>([
  "authorized",
  "captured",
  "capture_pending",
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

  return input.now === undefined ? windowInput : { ...windowInput, now: input.now }
}

function buildExpirationResolutionInput(input: {
  vouchStatus: VouchStatus
  merchantConfirmed: boolean
  customerConfirmed: boolean
  now?: DateLike | undefined
  confirmationExpiresAt: DateLike
}): ExpirationResolutionInput {
  const baseInput = {
    vouchStatus: input.vouchStatus,
    merchantConfirmed: input.merchantConfirmed,
    customerConfirmed: input.customerConfirmed,
    confirmationExpiresAt: input.confirmationExpiresAt,
  }

  return input.now === undefined ? baseInput : { ...baseInput, now: input.now }
}

export function shouldReleaseFunds(input: ReleaseResolutionInput): boolean {
  return (
    input.vouchStatus === "confirmable" &&
    deriveAggregateConfirmationStatus(input) === "both_confirmed" &&
    input.paymentStatus !== "captured_settlement" &&
    input.paymentStatus !== "refunded" &&
    input.paymentStatus !== "canceled" &&
    input.paymentStatus !== "failed"
  )
}

export function shouldExpireVouch(input: ExpirationResolutionInput): boolean {
  if (
    input.vouchStatus === "draft" ||
    input.vouchStatus === "completed" ||
    input.vouchStatus === "expired"
  ) {
    return false
  }

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
  if (input.paymentStatus === "refunded" || input.paymentStatus === "canceled") return false
  if (!REFUND_OR_CANCEL_PAYMENT_STATUSES.has(input.paymentStatus)) return false

  if (input.vouchStatus === "expired") return true

  if (input.confirmationExpiresAt === undefined) return false

  return shouldExpireVouch(
    buildExpirationResolutionInput({
      vouchStatus: input.vouchStatus,
      merchantConfirmed: input.merchantConfirmed,
      customerConfirmed: input.customerConfirmed,
      now: input.now,
      confirmationExpiresAt: input.confirmationExpiresAt,
    })
  )
}

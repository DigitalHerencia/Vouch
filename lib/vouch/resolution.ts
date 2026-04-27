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
        isConfirmationWindowClosed({
            now: input.now,
            confirmationOpensAt: input.confirmationExpiresAt,
            confirmationExpiresAt: input.confirmationExpiresAt,
        })
    )
}

export function shouldRefundOrVoid(input: RefundOrVoidResolutionInput): boolean {
    if (input.vouchStatus === "completed") return false
    if (input.paymentStatus === "refunded" || input.paymentStatus === "voided") return false
    if (!REFUND_OR_VOID_PAYMENT_STATUSES.has(input.paymentStatus)) return false

    if (input.vouchStatus === "canceled" || input.vouchStatus === "expired") return true

    if (input.confirmationExpiresAt === undefined) return false

    return shouldExpireVouch({
        vouchStatus: input.vouchStatus,
        payerConfirmed: input.payerConfirmed,
        payeeConfirmed: input.payeeConfirmed,
        now: input.now,
        confirmationExpiresAt: input.confirmationExpiresAt,
    })
}

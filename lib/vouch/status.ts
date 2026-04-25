import type {
    AggregateConfirmationStatus,
    ConfirmationStatus,
    ParticipantRole,
    VouchStatus,
} from "@/types/vouch-status.types"

export type ConfirmationStateInput = {
    payerConfirmed: boolean
    payeeConfirmed: boolean
}

export function getAggregateConfirmationStatus(
    input: ConfirmationStateInput,
): AggregateConfirmationStatus {
    if (input.payerConfirmed && input.payeeConfirmed) return "both_confirmed"
    if (input.payerConfirmed) return "payer_confirmed"
    if (input.payeeConfirmed) return "payee_confirmed"
    return "none_confirmed"
}

export function canReleaseFunds(input: {
    vouchStatus: VouchStatus
    payerConfirmed: boolean
    payeeConfirmed: boolean
}): boolean {
    return (
        input.vouchStatus === "active" &&
        getAggregateConfirmationStatus(input) === "both_confirmed"
    )
}

export function getParticipantConfirmationStatus(input: {
    role: ParticipantRole
    payerConfirmed: boolean
    payeeConfirmed: boolean
    now: Date
    confirmationOpensAt: Date
    confirmationExpiresAt: Date
    vouchStatus: VouchStatus
}): ConfirmationStatus {
    if (input.vouchStatus !== "active") return "ineligible"
    if (input.now < input.confirmationOpensAt) return "window_not_open"
    if (input.now > input.confirmationExpiresAt) return "window_closed"

    if (input.role === "payer" && input.payerConfirmed) return "confirmed"
    if (input.role === "payee" && input.payeeConfirmed) return "confirmed"

    return "not_confirmed"
}

export function isFinalVouchStatus(status: VouchStatus): boolean {
    return ["completed", "expired", "refunded", "canceled", "failed"].includes(status)
}

export function getVouchStatusLabel(status: VouchStatus): string {
    switch (status) {
        case "pending":
            return "Pending"
        case "active":
            return "Active"
        case "completed":
            return "Completed"
        case "expired":
            return "Expired"
        case "refunded":
            return "Refunded"
        case "canceled":
            return "Canceled"
        case "failed":
            return "Failed"
    }
}

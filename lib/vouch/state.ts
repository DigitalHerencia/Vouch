import type {
    AggregateConfirmationStatus,
    ParticipantRole,
    VouchStatus,
} from "@/types/vouch-status.types"

import {
    isConfirmationWindowClosed,
    isConfirmationWindowOpen,
    type DateLike,
} from "./time-windows"

export type ConfirmationStateInput = {
    payerConfirmed: boolean
    payeeConfirmed: boolean
}

export type VouchDetailVariant =
    | "pending"
    | "active_before_window"
    | "active_window_open"
    | "payer_confirmed"
    | "payee_confirmed"
    | "processing_release"
    | "completed"
    | "expired"
    | "refunded"
    | "canceled"
    | "failed"

export type VouchTransition = {
    from: VouchStatus
    to: VouchStatus
}

export type NextVouchActionKind =
    | "accept"
    | "cancel"
    | "confirm_presence"
    | "waiting"
    | "setup_required"
    | "view_outcome"
    | "none"

export type NextVouchAction = {
    kind: NextVouchActionKind
    label: string
    href?: string
}

export type DeriveDetailVariantInput = ConfirmationStateInput & {
    status: VouchStatus
    now?: DateLike
    confirmationOpensAt?: DateLike
    confirmationExpiresAt?: DateLike
    paymentReleasePending?: boolean
}

export type DeriveNextVouchActionInput = ConfirmationStateInput & {
    vouchId?: string
    status: VouchStatus
    role: ParticipantRole
    now?: DateLike
    confirmationOpensAt?: DateLike
    confirmationExpiresAt?: DateLike
    setupBlocked?: boolean
}

const ALLOWED_TRANSITIONS: ReadonlyMap<VouchStatus, readonly VouchStatus[]> = new Map([
    ["pending", ["active", "canceled", "expired", "refunded", "failed"]],
    ["active", ["completed", "expired", "refunded", "failed"]],
    ["expired", ["refunded", "failed"]],
    ["completed", []],
    ["refunded", []],
    ["canceled", []],
    ["failed", []],
])

export function deriveAggregateConfirmationStatus(
    input: ConfirmationStateInput,
): AggregateConfirmationStatus {
    if (input.payerConfirmed && input.payeeConfirmed) return "both_confirmed"
    if (input.payerConfirmed) return "payer_confirmed"
    if (input.payeeConfirmed) return "payee_confirmed"
    return "none_confirmed"
}

export function assertValidVouchTransition({ from, to }: VouchTransition): void {
    if (from === to) return

    const allowedTargets = ALLOWED_TRANSITIONS.get(from) ?? []

    if (!allowedTargets.includes(to)) {
        throw new Error(`Invalid Vouch transition: ${from} -> ${to}.`)
    }
}

export function deriveVouchDetailVariant(input: DeriveDetailVariantInput): VouchDetailVariant {
    switch (input.status) {
        case "pending":
        case "completed":
        case "expired":
        case "refunded":
        case "canceled":
        case "failed":
            return input.status
        case "active": {
            if (input.paymentReleasePending) return "processing_release"

            const aggregateStatus = deriveAggregateConfirmationStatus(input)

            if (aggregateStatus === "both_confirmed") return "processing_release"
            if (aggregateStatus === "payer_confirmed") return "payer_confirmed"
            if (aggregateStatus === "payee_confirmed") return "payee_confirmed"

            if (
                input.confirmationOpensAt !== undefined &&
                input.confirmationExpiresAt !== undefined &&
                isConfirmationWindowOpen({
                    now: input.now,
                    confirmationOpensAt: input.confirmationOpensAt,
                    confirmationExpiresAt: input.confirmationExpiresAt,
                })
            ) {
                return "active_window_open"
            }

            return "active_before_window"
        }
    }
}

export function deriveNextVouchAction(input: DeriveNextVouchActionInput): NextVouchAction {
    if (input.setupBlocked) {
        return {
            kind: "setup_required",
            label: "Finish setup",
            href: "/setup",
        }
    }

    if (input.status === "pending") {
        if (input.role === "payer") {
            return {
                kind: "cancel",
                label: "Cancel pending Vouch",
                href: input.vouchId ? `/vouches/${input.vouchId}` : undefined,
            }
        }

        return {
            kind: "accept",
            label: "Review and accept Vouch",
            href: input.vouchId ? `/vouches/${input.vouchId}` : undefined,
        }
    }

    if (input.status === "active") {
        const currentUserConfirmed =
            input.role === "payer" ? input.payerConfirmed : input.payeeConfirmed

        if (currentUserConfirmed) {
            return {
                kind: "waiting",
                label: "Waiting for the other party",
            }
        }

        if (
            input.confirmationOpensAt !== undefined &&
            input.confirmationExpiresAt !== undefined &&
            isConfirmationWindowOpen({
                now: input.now,
                confirmationOpensAt: input.confirmationOpensAt,
                confirmationExpiresAt: input.confirmationExpiresAt,
            })
        ) {
            return {
                kind: "confirm_presence",
                label: "Confirm presence",
                href: input.vouchId ? `/vouches/${input.vouchId}/confirm` : undefined,
            }
        }

        if (
            input.confirmationOpensAt !== undefined &&
            input.confirmationExpiresAt !== undefined &&
            isConfirmationWindowClosed({
                now: input.now,
                confirmationOpensAt: input.confirmationOpensAt,
                confirmationExpiresAt: input.confirmationExpiresAt,
            })
        ) {
            return {
                kind: "view_outcome",
                label: "View expiration outcome",
                href: input.vouchId ? `/vouches/${input.vouchId}` : undefined,
            }
        }

        return {
            kind: "waiting",
            label: "Waiting for confirmation window",
        }
    }

    return {
        kind: "view_outcome",
        label: "View final outcome",
        href: input.vouchId ? `/vouches/${input.vouchId}` : undefined,
    }
}

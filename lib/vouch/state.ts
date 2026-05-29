import type { AggregateConfirmationStatus, ParticipantRole, VouchStatus } from "@/types/vouch"

import { isConfirmationWindowClosed, isConfirmationWindowOpen, type DateLike } from "./time-windows"

export type ConfirmationStateInput = {
  merchantConfirmed: boolean
  customerConfirmed: boolean
}

export type VouchDetailVariant =
  | "draft"
  | "committed"
  | "sent"
  | "accepted"
  | "authorized"
  | "confirmable_before_window"
  | "confirmable_window_open"
  | "merchant_confirmed_waiting_for_customer"
  | "customer_confirmed_waiting_for_merchant"
  | "both_confirmed_processing_capture"
  | "completed"
  | "expired"

export type VouchTransition = {
  from: VouchStatus
  to: VouchStatus
}

export type NextVouchActionKind =
  | "commit"
  | "accept"
  | "authorize"
  | "confirm_presence"
  | "waiting"
  | "readiness_required"
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
  paymentCapturePending?: boolean
}

export type DeriveNextVouchActionInput = ConfirmationStateInput & {
  vouchId?: string
  status: VouchStatus
  role: ParticipantRole
  now?: DateLike
  confirmationOpensAt?: DateLike
  confirmationExpiresAt?: DateLike
  readinessBlocked?: boolean
}

const ALLOWED_TRANSITIONS: ReadonlyMap<VouchStatus, readonly VouchStatus[]> = new Map([
  ["draft", ["committed", "sent", "expired"]],
  ["committed", ["sent", "accepted", "expired"]],
  ["sent", ["accepted", "expired"]],
  ["accepted", ["authorized", "expired"]],
  ["authorized", ["confirmable", "completed", "expired"]],
  ["confirmable", ["completed", "expired"]],
  ["completed", []],
  ["expired", []],
])

function withOptionalHref(action: Omit<NextVouchAction, "href">, href?: string): NextVouchAction {
  return href === undefined ? action : { ...action, href }
}

function buildWindowInput(input: {
  now?: DateLike
  confirmationOpensAt: DateLike
  confirmationExpiresAt: DateLike
}) {
  const windowInput = {
    confirmationOpensAt: input.confirmationOpensAt,
    confirmationExpiresAt: input.confirmationExpiresAt,
  }

  return input.now === undefined ? windowInput : { ...windowInput, now: input.now }
}

export function deriveAggregateConfirmationStatus(
  input: ConfirmationStateInput
): AggregateConfirmationStatus {
  if (input.merchantConfirmed && input.customerConfirmed) return "both_confirmed"
  if (input.merchantConfirmed) return "merchant_confirmed"
  if (input.customerConfirmed) return "customer_confirmed"
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
  if (input.status === "completed" || input.status === "expired") return input.status

  if (input.status === "confirmable") {
    if (input.paymentCapturePending) return "both_confirmed_processing_capture"

    const aggregateStatus = deriveAggregateConfirmationStatus(input)

    if (aggregateStatus === "both_confirmed") return "both_confirmed_processing_capture"
    if (aggregateStatus === "merchant_confirmed") return "merchant_confirmed_waiting_for_customer"
    if (aggregateStatus === "customer_confirmed") return "customer_confirmed_waiting_for_merchant"

    if (
      input.confirmationOpensAt !== undefined &&
      input.confirmationExpiresAt !== undefined &&
      isConfirmationWindowOpen(
        buildWindowInput({
          now: input.now ?? new Date(),
          confirmationOpensAt: input.confirmationOpensAt,
          confirmationExpiresAt: input.confirmationExpiresAt,
        })
      )
    ) {
      return "confirmable_window_open"
    }

    return "confirmable_before_window"
  }

  return input.status
}

export function deriveNextVouchAction(input: DeriveNextVouchActionInput): NextVouchAction {
  if (input.readinessBlocked) {
    return {
      kind: "readiness_required",
      label: "Complete readiness",
      href: "/dashboard",
    }
  }

  if (input.status === "sent" || input.status === "committed") {
    if (input.role === "customer") {
      return withOptionalHref(
        { kind: "accept", label: "Review and accept Vouch" },
        input.vouchId ? `/vouches/${input.vouchId}` : undefined
      )
    }

    return { kind: "waiting", label: "Waiting for customer authorization" }
  }

  if (input.status === "accepted" || input.status === "authorized") {
    return { kind: "waiting", label: "Waiting for confirmation window" }
  }

  if (input.status === "confirmable") {
    const currentUserConfirmed =
      input.role === "merchant" ? input.merchantConfirmed : input.customerConfirmed

    if (currentUserConfirmed) {
      return { kind: "waiting", label: "Waiting for the other participant" }
    }

    if (
      input.confirmationOpensAt !== undefined &&
      input.confirmationExpiresAt !== undefined &&
      isConfirmationWindowOpen(
        buildWindowInput({
          now: input.now ?? new Date(),
          confirmationOpensAt: input.confirmationOpensAt,
          confirmationExpiresAt: input.confirmationExpiresAt,
        })
      )
    ) {
      return withOptionalHref(
        { kind: "confirm_presence", label: "Confirm presence" },
        input.vouchId ? `/vouches/${input.vouchId}` : undefined
      )
    }

    if (
      input.confirmationOpensAt !== undefined &&
      input.confirmationExpiresAt !== undefined &&
      isConfirmationWindowClosed(
        buildWindowInput({
          now: input.now ?? new Date(),
          confirmationOpensAt: input.confirmationOpensAt,
          confirmationExpiresAt: input.confirmationExpiresAt,
        })
      )
    ) {
      return withOptionalHref(
        { kind: "view_outcome", label: "View expiration outcome" },
        input.vouchId ? `/vouches/${input.vouchId}` : undefined
      )
    }

    return { kind: "waiting", label: "Waiting for confirmation window" }
  }

  return withOptionalHref(
    { kind: "view_outcome", label: "View final outcome" },
    input.vouchId ? `/vouches/${input.vouchId}` : undefined
  )
}

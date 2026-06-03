import type {
  AggregateConfirmationStatus,
  ConfirmationStateInput,
  DateLike,
  DeriveNextVouchActionInput,
  NextVouchAction,
  VouchStatus,
  VouchTransition,
} from "@/types/vouchTypes"

import { isConfirmationWindowClosed, isConfirmationWindowOpen } from "./time-windows"

const ALLOWED_TRANSITIONS: ReadonlyMap<VouchStatus, readonly VouchStatus[]> = new Map([
  ["draft", ["active", "expired", "archived"]],
  ["active", ["authorized", "expired", "archived"]],
  ["authorized", ["can_capture", "captured", "expired", "archived"]],
  ["can_capture", ["captured", "expired", "archived"]],
  ["captured", ["archived"]],
  ["expired", []],
  ["archived", []],
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

export function deriveNextVouchAction(input: DeriveNextVouchActionInput): NextVouchAction {
  if (input.readinessBlocked) {
    return {
      kind: "readiness_required",
      label: "Complete readiness",
      href: "/dashboard",
    }
  }

  if (input.status === "active" || input.status === "authorized") {
    return { kind: "waiting", label: "Waiting for confirmation window" }
  }

  if (input.status === "can_capture") {
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

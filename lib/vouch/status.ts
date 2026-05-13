import type {
  AggregateConfirmationStatus,
  ConfirmationStatus,
  ParticipantRole,
  VouchStatus,
} from "@/types/vouch"

export type ConfirmationStateInput = {
  merchantConfirmed: boolean
  customerConfirmed: boolean
}

export function getAggregateConfirmationStatus(
  input: ConfirmationStateInput
): AggregateConfirmationStatus {
  if (input.merchantConfirmed && input.customerConfirmed) return "both_confirmed"
  if (input.merchantConfirmed) return "merchant_confirmed"
  if (input.customerConfirmed) return "customer_confirmed"
  return "none_confirmed"
}

export function canReleaseFunds(input: {
  vouchStatus: VouchStatus
  merchantConfirmed: boolean
  customerConfirmed: boolean
}): boolean {
  return (
    input.vouchStatus === "confirmable" &&
    getAggregateConfirmationStatus(input) === "both_confirmed"
  )
}

export function getParticipantConfirmationStatus(input: {
  role: ParticipantRole
  merchantConfirmed: boolean
  customerConfirmed: boolean
  now: Date
  confirmationOpensAt: Date
  confirmationExpiresAt: Date
  vouchStatus: VouchStatus
}): ConfirmationStatus {
  if (input.vouchStatus !== "confirmable") return "rejected"
  if (input.now < input.confirmationOpensAt) return "pending"
  if (input.now > input.confirmationExpiresAt) return "rejected"

  if (input.role === "merchant" && input.merchantConfirmed) return "confirmed"
  if (input.role === "customer" && input.customerConfirmed) return "confirmed"

  return "pending"
}

export function isFinalVouchStatus(status: VouchStatus): boolean {
  return status === "completed" || status === "expired"
}

export function getVouchStatusLabel(status: VouchStatus): string {
  switch (status) {
    case "draft":
      return "Draft"
    case "committed":
      return "Committed"
    case "sent":
      return "Sent"
    case "accepted":
      return "Accepted"
    case "authorized":
      return "Authorized"
    case "confirmable":
      return "Confirmable"
    case "completed":
      return "Completed"
    case "expired":
      return "Expired"
  }
}

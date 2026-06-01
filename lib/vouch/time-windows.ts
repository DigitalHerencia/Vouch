
import type {
  ConfirmationWindowInput,
  DateLike,
} from "@/types/vouchTypes"


export function toDate(value: DateLike): Date {
  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date value.")
  }

  return date
}

export function isConfirmationWindowOpen(input: ConfirmationWindowInput): boolean {
  const now = input.now === undefined ? new Date() : toDate(input.now)
  const opensAt = toDate(input.confirmationOpensAt)
  const expiresAt = toDate(input.confirmationExpiresAt)

  return now >= opensAt && now <= expiresAt
}

export function isConfirmationWindowClosed(input: ConfirmationWindowInput): boolean {
  const now = input.now === undefined ? new Date() : toDate(input.now)
  const expiresAt = toDate(input.confirmationExpiresAt)

  return now > expiresAt
}

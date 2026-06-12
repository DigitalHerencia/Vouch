// lib/utils/dashboardUtils.ts

import type { VouchCardDTO } from "@/lib/db/dto/vouch.mappers"
import type { VouchStatusTone } from "@/types/vouchTypes"

const FALLBACK_DEADLINE_LABEL = "No deadline"
const FALLBACK_PARTICIPANT_LABEL = "Participant"

function toValidDate(value: string | null | undefined): Date | null {
  if (!value) return null

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDateTime(value: string | null | undefined): string {
  const date = toValidDate(value)
  if (!date) return FALLBACK_DEADLINE_LABEL

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

export function formatParticipantName(vouch: VouchCardDTO): string {
  return (
    vouch.customer?.displayName ??
    vouch.customer?.email ??
    vouch.merchant?.displayName ??
    vouch.merchant?.email ??
    FALLBACK_PARTICIPANT_LABEL
  )
}

export function formatCurrency(cents: number, currency: string): string {
  const normalizedCurrency = currency.trim().toUpperCase() || "USD"

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: normalizedCurrency,
    }).format(cents / 100)
  } catch {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100)
  }
}

export function mapStatusTone(status: VouchCardDTO["status"]): VouchStatusTone {
  if (status === "captured") return "complete"
  if (status === "expired") return "expired"
  if (status === "archived") return "offline"

  if (status === "protocol_fee_paid" || status === "authorized" || status === "can_capture") {
    return "active"
  }

  return "pending"
}

export function getPercentRemaining(vouch: VouchCardDTO): number {
  const expiresAt = toValidDate(vouch.confirmationExpiresAt ?? vouch.appointmentAt)
  if (!expiresAt) return 0

  const startsAt =
    toValidDate(vouch.confirmationOpensAt) ?? toValidDate(vouch.createdAt) ?? new Date()

  const totalMs = Math.max(expiresAt.getTime() - startsAt.getTime(), 1)
  const remainingMs = expiresAt.getTime() - Date.now()

  return Math.max(0, Math.min(100, (remainingMs / totalMs) * 100))
}

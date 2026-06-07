// lib/utils/dashboardUtils.ts

import { dashboardContent } from "@/content/dashboard"
import type { VouchCardDTO } from "../dto/vouch.mappers"

export function formatDateTime(value: string | null | undefined) {
  if (!value) return dashboardContent.fallbackDeadline

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value))
}

export function formatParticipantName(vouch: VouchCardDTO) {
  return (
    vouch.customer?.displayName ??
    vouch.customer?.email ??
    vouch.merchant?.displayName ??
    vouch.merchant?.email ??
    "Participant"
  )
}

export function formatCurrency(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100)
}

export function getStatusLabel(status: VouchCardDTO["status"]) {
  return status.replace(/_/g, " ")
}

export function mapStatusTone(status: VouchCardDTO["status"]): VouchStatusTone {
  if (status === "captured") return "complete"
  if (status === "expired") return "expired"
  if (status === "protocol_fee_paid" || status === "authorized" || status === "can_capture") {
    return "active"
  }

  return "pending"
}

export function getRemainingLabel(value: string | null | undefined) {
  if (!value) return "No deadline"

  const remaining = new Date(value).getTime() - Date.now()

  if (remaining <= 0) return "Due now"

  const hours = Math.ceil(remaining / 3_600_000)

  if (hours < 48) {
    return new Intl.RelativeTimeFormat("en-US", { numeric: "auto" }).format(hours, "hour")
  }

  return new Intl.RelativeTimeFormat("en-US", { numeric: "auto" }).format(
    Math.ceil(hours / 24),
    "day"
  )
}

export function getPercentRemaining(vouch: VouchCardDTO) {
  const expiresAt = vouch.confirmationExpiresAt ?? vouch.appointmentAt

  if (!expiresAt) return 0

  const now = Date.now()
  const createdAt = vouch.createdAt ? new Date(vouch.createdAt).getTime() : now
  const expiresAtMs = new Date(expiresAt).getTime()
  const total = Math.max(expiresAtMs - createdAt, 1)
  const remaining = expiresAtMs - now

  return Math.max(0, Math.min(100, (remaining / total) * 100))
}

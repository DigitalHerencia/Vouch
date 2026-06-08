export function parseAmountCents(value: string | undefined) {
  const amount = Number((value ?? "").trim().replace(/[$,\s]/g, ""))
  if (!Number.isFinite(amount)) return 0

  return Math.round(amount * 100)
}

export function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100)
}

export function calculateProtocolFeeCents(amountCents: number) {
  if (amountCents <= 0) return 0

  return Math.max(Math.ceil(amountCents * 0.05), 500)
}

export function toIsoFromLocalDateTime(value: string | undefined) {
  if (!value) return ""

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "" : date.toISOString()
}

export function formatDateTime(value: string | undefined) {
  if (!value) return "Select an appointment"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Select an appointment"

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

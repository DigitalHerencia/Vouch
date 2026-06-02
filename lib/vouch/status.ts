import type { VouchStatus } from "@/types/vouchTypes"

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

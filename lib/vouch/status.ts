import type { VouchStatus } from "@/types/vouchTypes"

export function isFinalVouchStatus(status: VouchStatus): boolean {
  return status === "captured" || status === "expired" || status === "archived"
}

export function getVouchStatusLabel(status: VouchStatus): string {
  switch (status) {
    case "draft":
      return "Draft"
    case "active":
      return "Active"
    case "authorized":
      return "Authorized"
    case "can_capture":
      return "Can capture"
    case "captured":
      return "Captured"
    case "expired":
      return "Expired"
    case "archived":
      return "Archived"
  }
}

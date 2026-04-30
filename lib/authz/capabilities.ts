import "server-only"

import type { CurrentUser } from "@/lib/auth/current-user"
import { deny } from "@/lib/authz/assertions"
import type { AdminCapability } from "@/types/auth"

const ADMIN_CAPABILITIES: AdminCapability[] = [
  "view_admin_dashboard",
  "view_users_operational",
  "view_vouches_operational",
  "view_payment_records_operational",
  "view_audit_events_operational",
  "view_webhook_events_operational",
  "retry_safe_technical_operation",
  "disable_user_account",
]

export function getUserCapabilities(
  user: Pick<CurrentUser, "isAdmin" | "status">
): AdminCapability[] {
  if (user.status !== "active" || !user.isAdmin) {
    return []
  }

  return ADMIN_CAPABILITIES
}

export function hasCapability(
  user: Pick<CurrentUser, "isAdmin" | "status">,
  capability: AdminCapability
): boolean {
  return getUserCapabilities(user).includes(capability)
}

export function assertCapability(
  user: Pick<CurrentUser, "isAdmin" | "status">,
  capability: AdminCapability
): void {
  if (!hasCapability(user, capability)) {
    deny("Required capability missing")
  }
}

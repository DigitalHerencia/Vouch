import "server-only"

import { requireActiveUser, type CurrentUser } from "@/lib/auth/current-user"
import { assertCapability } from "@/lib/authz/capabilities"

export async function assertAdmin(): Promise<CurrentUser> {
  const user = await requireActiveUser()
  assertCapability(user, "view_admin_dashboard")
  return user
}

export function canViewOperationalState(user: Pick<CurrentUser, "isAdmin" | "status">): boolean {
  return user.status === "active" && user.isAdmin
}

export function canRunSafeRetry(user: Pick<CurrentUser, "isAdmin" | "status">): boolean {
  return canViewOperationalState(user)
}

export function canDisableUserOperationally(
  user: Pick<CurrentUser, "id" | "isAdmin" | "status">,
  targetUserId: string
): boolean {
  return canViewOperationalState(user) && user.id !== targetUserId
}

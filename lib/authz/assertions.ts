import "server-only"

import type { CurrentUser } from "@/lib/auth/current-user"

export class AuthzError extends Error {
  constructor(
    message: string,
    readonly code: "UNAUTHENTICATED" | "FORBIDDEN" | "DISABLED" = "FORBIDDEN"
  ) {
    super(message)
    this.name = "AuthzError"
  }
}

export function deny(
  message = "Forbidden",
  code: "UNAUTHENTICATED" | "FORBIDDEN" | "DISABLED" = "FORBIDDEN"
): never {
  throw new AuthzError(message, code)
}

export function assertAllowed(allowed: boolean, message = "Forbidden"): asserts allowed {
  if (!allowed) {
    deny(message)
  }
}

export function assertActiveAccount(user: Pick<CurrentUser, "status">): void {
  if (user.status !== "active") {
    deny("Active user required", "DISABLED")
  }
}

export function assertNotSelfAcceptance(input: { userId: string; payerId: string }): void {
  if (input.userId === input.payerId) {
    deny("Payer may not accept their own Vouch")
  }
}

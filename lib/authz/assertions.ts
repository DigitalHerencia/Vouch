import "server-only"

import type { CurrentUser } from "@/lib/fetchers/authFetchers"

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

export function assertNotSelfAcceptance(input: { userId: string; merchantId: string }): void {
  if (input.userId === input.merchantId) {
    deny("Merchant may not accept their own Vouch")
  }
}

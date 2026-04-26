import { describe, expect, it } from "vitest"

import {
  getCreateReadiness,
  getAcceptReadiness,
  getConfirmPresenceReadiness,
  getReturnState,
  getSetupBlockers,
} from "@/lib/setup/status"

const readyStatus = {
  accountActive: true,
  identityVerified: true,
  adultVerified: true,
  paymentReady: true,
  payoutReady: true,
  termsAccepted: true,
}

describe("setup status helpers", () => {
  it("allows create when payer readiness is complete", () => {
    expect(getCreateReadiness(readyStatus).ok).toBe(true)
  })

  it("allows accept when payee readiness is complete", () => {
    expect(getAcceptReadiness(readyStatus).ok).toBe(true)
  })

  it("blocks create when payment method is missing", () => {
    const status = { ...readyStatus, paymentReady: false }

    expect(getCreateReadiness(status).ok).toBe(false)
    expect(getSetupBlockers(status)).toContain("payment_method_required")
  })

  it("blocks accept when payout setup is missing", () => {
    const status = { ...readyStatus, payoutReady: false }

    expect(getAcceptReadiness(status).ok).toBe(false)
    expect(getSetupBlockers(status)).toContain("payout_setup_required")
  })

  it("reports verification-specific blocked state", () => {
    const status = { ...readyStatus, identityVerified: false, identityStatus: "pending" as const }

    expect(getCreateReadiness(status).status).toBe("blocked_by_verification")
    expect(getAcceptReadiness(status).status).toBe("blocked_by_verification")
  })

  it("blocks duplicate or out-of-window confirmations", () => {
    const gate = getConfirmPresenceReadiness({
      userStatus: "active",
      currentUserId: "user_1",
      payerId: "user_1",
      payeeId: "user_2",
      vouchStatus: "active",
      confirmationOpensAt: new Date("2026-04-25T10:00:00.000Z"),
      confirmationExpiresAt: new Date("2026-04-25T11:00:00.000Z"),
      existingConfirmationUserIds: ["user_1"],
      now: new Date("2026-04-25T12:00:00.000Z"),
    })

    expect(gate.ok).toBe(false)
    expect(gate.blockers).toContain("duplicate_confirmation")
    expect(gate.blockers).toContain("confirmation_window_closed")
  })

  it("classifies setup return context", () => {
    expect(getReturnState("/vouches/invite/token_123")).toBe("return_from_invite")
    expect(getReturnState("/vouches/new")).toBe("return_from_create")
    expect(getReturnState("/dashboard")).toBe("incomplete")
  })
})

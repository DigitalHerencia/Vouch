import { describe, expect, it } from "vitest"

import {
  getCreateReadiness,
  getAcceptReadiness,
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
})

import { describe, expect, it } from "vitest"

import {
  canAccessVouch,
  canAcceptVouch,
  canConfirmVouch,
} from "@/lib/authz/policies"

describe("authz policies", () => {
  it("allows payer to access own Vouch", () => {
    expect(
      canAccessVouch({
        userId: "user_payer",
        payerId: "user_payer",
        payeeId: "user_payee",
        isAdmin: false,
      })
    ).toBe(true)
  })

  it("blocks unrelated users", () => {
    expect(
      canAccessVouch({
        userId: "unrelated",
        payerId: "user_payer",
        payeeId: "user_payee",
        isAdmin: false,
      })
    ).toBe(false)
  })

  it("blocks self-acceptance", () => {
    expect(
      canAcceptVouch({
        userId: "user_payer",
        payerId: "user_payer",
        existingPayeeId: null,
        status: "pending",
        inviteValid: true,
        eligible: true,
      })
    ).toBe(false)
  })

  it("requires active participant for confirmation", () => {
    expect(
      canConfirmVouch({
        userId: "user_payee",
        payerId: "user_payer",
        payeeId: "user_payee",
        status: "active",
        windowOpen: true,
        alreadyConfirmed: false,
      })
    ).toBe(true)
  })
})

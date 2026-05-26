import { describe, expect, it } from "vitest"

import { canAccessVouch, canAcceptVouch, canConfirmVouch } from "@/lib/authz/policies"

describe("authz policies", () => {
  it("allows merchant to access own Vouch", () => {
    expect(
      canAccessVouch({
        userId: "user_merchant",
        merchantId: "user_merchant",
        customerId: "user_customer",
        isAdmin: false,
      })
    ).toBe(true)
  })

  it("blocks unrelated users", () => {
    expect(
      canAccessVouch({
        userId: "unrelated",
        merchantId: "user_merchant",
        customerId: "user_customer",
        isAdmin: false,
      })
    ).toBe(false)
  })

  it("denies unauthenticated users", () => {
    expect(
      canAccessVouch({
        userId: null,
        merchantId: "user_merchant",
        customerId: "user_customer",
        isAdmin: false,
      })
    ).toBe(false)
  })

  it("blocks self-acceptance", () => {
    expect(
      canAcceptVouch({
        userId: "user_merchant",
        merchantId: "user_merchant",
        existingCustomerId: null,
        status: "sent",
        inviteValid: true,
        eligible: true,
      })
    ).toBe(false)
  })

  it("blocks disabled users", () => {
    expect(
      canAcceptVouch({
        userId: "user_customer",
        merchantId: "user_merchant",
        existingCustomerId: null,
        status: "sent",
        inviteValid: true,
        eligible: true,
        userStatus: "disabled",
      })
    ).toBe(false)
  })

  it("requires active participant for confirmation", () => {
    expect(
      canConfirmVouch({
        userId: "user_customer",
        merchantId: "user_merchant",
        customerId: "user_customer",
        status: "confirmable",
        windowOpen: true,
        alreadyConfirmed: false,
      })
    ).toBe(true)
  })

  it("requires admin capability for admin views", async () => {
    const { canViewAdmin } = await import("@/lib/authz/policies")

    expect(canViewAdmin({ status: "active", isAdmin: false })).toBe(false)
    expect(canViewAdmin({ status: "disabled", isAdmin: true })).toBe(false)
    expect(canViewAdmin({ status: "active", isAdmin: true })).toBe(true)
  })
})

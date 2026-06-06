import { describe, expect, it } from "vitest"

import { canAccessVouch, canAcceptVouch, canConfirmVouch } from "@/lib/authz/policies"

describe("authz policies", () => {
  it("allows merchant to access own Vouch", () => {
    expect(
      canAccessVouch({
        userId: "user_merchant",
        merchantId: "user_merchant",
        customerId: "user_customer",
      })
    ).toBe(true)
  })

  it("blocks unrelated users", () => {
    expect(
      canAccessVouch({
        userId: "unrelated",
        merchantId: "user_merchant",
        customerId: "user_customer",
      })
    ).toBe(false)
  })

  it("denies unauthenticated users", () => {
    expect(
      canAccessVouch({
        userId: null,
        merchantId: "user_merchant",
        customerId: "user_customer",
      })
    ).toBe(false)
  })

  it("blocks self-acceptance", () => {
    expect(
      canAcceptVouch({
        userId: "user_merchant",
        merchantId: "user_merchant",
        existingCustomerId: null,
        status: "protocol_fee_paid",
        paymentMethodReady: "ready",
      })
    ).toBe(false)
  })

  it("blocks disabled users", () => {
    expect(
      canAcceptVouch({
        userId: "user_customer",
        merchantId: "user_merchant",
        existingCustomerId: null,
        status: "protocol_fee_paid",
        paymentMethodReady: "ready",
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
        status: "authorized",
        windowOpen: true,
        alreadyConfirmed: false,
      })
    ).toBe(true)
  })
})

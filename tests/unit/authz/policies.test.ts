import { describe, expect, it } from "vitest"

import { canAcceptVouch, canConfirmPresence, canViewVouch } from "@/lib/authz/policies"

describe("authz policies", () => {
  it("allows merchant to access own Vouch", () => {
    expect(
      canViewVouch({
        userId: "user_merchant",
        merchantId: "user_merchant",
        customerId: "user_customer",
      })
    ).toBe(true)
  })

  it("blocks unrelated users", () => {
    expect(
      canViewVouch({
        userId: "unrelated",
        merchantId: "user_merchant",
        customerId: "user_customer",
      })
    ).toBe(false)
  })

  it("denies unauthenticated users", () => {
    expect(
      canViewVouch({
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
        userStatus: "disabled",
      })
    ).toBe(false)
  })

  it("requires active participant for confirmation", () => {
    expect(
      canConfirmPresence({
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

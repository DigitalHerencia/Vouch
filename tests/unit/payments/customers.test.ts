import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

const retrieveCustomer = vi.fn()
const listPaymentMethods = vi.fn()

vi.mock("@/lib/integrations/stripe/client", () => ({
  getStripeServerClient: () => ({
    customers: {
      retrieve: retrieveCustomer,
    },
    paymentMethods: {
      list: listPaymentMethods,
    },
  }),
}))

describe("Stripe customer readiness", () => {
  beforeEach(() => {
    retrieveCustomer.mockReset()
    listPaymentMethods.mockReset()
  })

  it("accepts a reusable Link payment method saved by Setup Checkout", async () => {
    retrieveCustomer.mockResolvedValue({
      id: "cus_test",
      invoice_settings: { default_payment_method: null },
    })
    listPaymentMethods.mockResolvedValue({
      data: [{ id: "pm_link", type: "link" }],
    })

    const { getStripeCustomerPaymentMethodReady } =
      await import("@/lib/integrations/stripe/customers")

    await expect(getStripeCustomerPaymentMethodReady("cus_test")).resolves.toEqual({
      readiness: "ready",
      defaultPaymentMethodId: "pm_link",
    })
    expect(listPaymentMethods).toHaveBeenCalledWith({
      customer: "cus_test",
      limit: 1,
    })
  })
})
